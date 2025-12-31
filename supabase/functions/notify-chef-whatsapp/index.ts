import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation schema for order notification
const OrderItemSchema = z.object({
  name: z.string().min(1).max(200),
  quantity: z.number().int().min(1).max(100),
  specialInstructions: z.string().max(500).optional().nullable(),
});

const OrderNotificationSchema = z.object({
  orderId: z.string().uuid(),
  orderNumber: z.string().min(1).max(50),
  items: z.array(OrderItemSchema).min(1).max(50),
  tableNumber: z.number().int().min(1).max(999).optional().nullable(),
  deliveryType: z.enum(['dine_in', 'takeaway', 'delivery']),
  total: z.number().positive().max(1000000),
  phoneNumber: z.string().regex(/^\+?[0-9]{10,15}$/),
});

type OrderNotification = z.infer<typeof OrderNotificationSchema>;

// Sanitize text for WhatsApp message (remove control characters, limit length)
function sanitizeForMessage(text: string | null | undefined, maxLength: number = 200): string {
  if (!text) return '';
  return text
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, maxLength)
    .trim();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_WHATSAPP_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM");
    const CHEF_WHATSAPP_NUMBER = Deno.env.get("CHEF_WHATSAPP_NUMBER");

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM || !CHEF_WHATSAPP_NUMBER) {
      console.error("Missing Twilio configuration");
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate incoming data
    let rawData: unknown;
    try {
      rawData = await req.json();
    } catch {
      console.error("Invalid JSON body");
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate with Zod schema
    const parseResult = OrderNotificationSchema.safeParse(rawData);
    if (!parseResult.success) {
      console.error("Validation error:", parseResult.error.errors);
      return new Response(
        JSON.stringify({ error: "Invalid input data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const notification: OrderNotification = parseResult.data;
    console.log("Validated order notification for order:", notification.orderId);

    // Format the message with sanitized content
    const itemsList = notification.items
      .slice(0, 20) // Limit to 20 items in message
      .map((item) => {
        let line = `• ${item.quantity}x ${sanitizeForMessage(item.name, 100)}`;
        if (item.specialInstructions) {
          line += ` (Note: ${sanitizeForMessage(item.specialInstructions, 100)})`;
        }
        return line;
      })
      .join("\n");

    const deliveryTypeMap: Record<string, string> = {
      dine_in: "Dine In",
      takeaway: "Takeaway",
      delivery: "Delivery",
    };

    const message = `🔔 *NEW ORDER #${sanitizeForMessage(notification.orderNumber, 30)}*

📋 *Items:*
${itemsList}

📍 *Type:* ${deliveryTypeMap[notification.deliveryType] || notification.deliveryType}
${notification.tableNumber ? `🪑 *Table:* ${notification.tableNumber}` : ""}
💰 *Total:* ₹${notification.total.toFixed(2)}
📞 *Customer:* ${notification.phoneNumber}

Please prepare this order!`;

    console.log("Sending WhatsApp message to chef");

    // Send WhatsApp message via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    const formData = new URLSearchParams();
    formData.append("To", `whatsapp:${CHEF_WHATSAPP_NUMBER}`);
    formData.append("From", `whatsapp:${TWILIO_WHATSAPP_FROM}`);
    formData.append("Body", message);

    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const twilioResult = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error("Twilio API error:", twilioResult.code, twilioResult.message);
      return new Response(
        JSON.stringify({ error: "Failed to send notification" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("WhatsApp message sent successfully, SID:", twilioResult.sid);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Chef notified via WhatsApp" 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error in notify-chef-whatsapp:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
