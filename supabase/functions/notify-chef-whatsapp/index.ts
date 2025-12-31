import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderNotification {
  orderId: string;
  orderNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    specialInstructions?: string;
  }>;
  tableNumber?: number;
  deliveryType: string;
  total: number;
  phoneNumber: string;
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
      throw new Error("Missing Twilio configuration");
    }

    const notification: OrderNotification = await req.json();
    console.log("Received order notification:", notification);

    // Format the message
    const itemsList = notification.items
      .map((item) => {
        let line = `• ${item.quantity}x ${item.name}`;
        if (item.specialInstructions) {
          line += ` (Note: ${item.specialInstructions})`;
        }
        return line;
      })
      .join("\n");

    const deliveryTypeMap: Record<string, string> = {
      dine_in: "Dine In",
      takeaway: "Takeaway",
      delivery: "Delivery",
    };

    const message = `🔔 *NEW ORDER #${notification.orderNumber}*

📋 *Items:*
${itemsList}

📍 *Type:* ${deliveryTypeMap[notification.deliveryType] || notification.deliveryType}
${notification.tableNumber ? `🪑 *Table:* ${notification.tableNumber}` : ""}
💰 *Total:* ₹${notification.total.toFixed(2)}
📞 *Customer:* ${notification.phoneNumber}

Please prepare this order!`;

    console.log("Sending WhatsApp message to chef:", CHEF_WHATSAPP_NUMBER);

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
    console.log("Twilio response:", twilioResult);

    if (!twilioResponse.ok) {
      console.error("Twilio error:", twilioResult);
      throw new Error(`Twilio error: ${twilioResult.message || "Unknown error"}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageSid: twilioResult.sid,
        message: "Chef notified via WhatsApp" 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in notify-chef-whatsapp:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
