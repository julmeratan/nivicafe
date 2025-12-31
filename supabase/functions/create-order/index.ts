import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting storage (in-memory, resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Rate limit: 10 orders per phone number per hour
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(phoneNumber: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(phoneNumber);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(phoneNumber, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  entry.count++;
  return true;
}

// Validation schemas
const OrderItemSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().positive().max(100000),
  quantity: z.number().int().min(1).max(99),
  specialInstructions: z.string().max(500).optional().nullable(),
});

const CreateOrderSchema = z.object({
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid phone number format"),
  deliveryType: z.enum(['dine_in', 'takeaway', 'delivery']),
  tableNumber: z.string().regex(/^[0-9]{1,3}$/).optional().nullable(),
  address: z.string().min(10).max(500).optional().nullable(),
  specialRequests: z.string().max(500).optional().nullable(),
  items: z.array(OrderItemSchema).min(1).max(50),
  subtotal: z.number().positive().max(1000000),
  tax: z.number().min(0).max(100000),
  deliveryFee: z.number().min(0).max(1000),
  total: z.number().positive().max(1000000),
}).refine(
  (data) => {
    if (data.deliveryType === 'dine_in') {
      return !!data.tableNumber;
    }
    return true;
  },
  { message: "Table number required for dine-in orders" }
).refine(
  (data) => {
    if (data.deliveryType === 'delivery') {
      return data.address && data.address.trim().length >= 10;
    }
    return true;
  },
  { message: "Valid address required for delivery orders" }
);

type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

// Sanitize text for database storage
function sanitizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Use service role to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    const parseResult = CreateOrderSchema.safeParse(rawData);
    if (!parseResult.success) {
      console.error("Validation error:", parseResult.error.errors);
      return new Response(
        JSON.stringify({ 
          error: "Invalid input data", 
          details: parseResult.error.errors.map(e => e.message) 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const input: CreateOrderInput = parseResult.data;
    console.log("Processing order for phone:", input.phone.substring(0, 5) + "***");

    // Rate limiting check
    if (!checkRateLimit(input.phone)) {
      console.warn("Rate limit exceeded for phone:", input.phone.substring(0, 5) + "***");
      return new Response(
        JSON.stringify({ error: "Too many orders. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify prices against menu items
    const itemNames = input.items.map(item => item.name);
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('name, price, is_available')
      .in('name', itemNames);

    if (menuError) {
      console.error("Error fetching menu items:", menuError);
      return new Response(
        JSON.stringify({ error: "Failed to verify order items" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a map for quick lookup
    const menuPriceMap = new Map<string, { price: number; available: boolean }>();
    for (const item of menuItems || []) {
      menuPriceMap.set(item.name, { price: Number(item.price), available: item.is_available !== false });
    }

    // Validate each item
    let calculatedSubtotal = 0;
    for (const item of input.items) {
      const menuItem = menuPriceMap.get(item.name);
      
      if (!menuItem) {
        console.error("Item not found:", item.name);
        return new Response(
          JSON.stringify({ error: `Item "${item.name}" is not available` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!menuItem.available) {
        console.error("Item not available:", item.name);
        return new Response(
          JSON.stringify({ error: `"${item.name}" is currently unavailable` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify price matches (allow small rounding differences)
      if (Math.abs(menuItem.price - item.price) > 0.01) {
        console.error("Price mismatch for", item.name, "Expected:", menuItem.price, "Got:", item.price);
        return new Response(
          JSON.stringify({ error: "Price verification failed. Please refresh and try again." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      calculatedSubtotal += menuItem.price * item.quantity;
    }

    // Verify subtotal matches
    if (Math.abs(calculatedSubtotal - input.subtotal) > 1) {
      console.error("Subtotal mismatch. Expected:", calculatedSubtotal, "Got:", input.subtotal);
      return new Response(
        JSON.stringify({ error: "Order total verification failed. Please refresh and try again." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify tax calculation (5%)
    const expectedTax = Math.round(calculatedSubtotal * 0.05);
    if (Math.abs(expectedTax - input.tax) > 1) {
      console.error("Tax mismatch. Expected:", expectedTax, "Got:", input.tax);
      return new Response(
        JSON.stringify({ error: "Tax calculation error. Please refresh and try again." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify delivery fee
    const expectedDeliveryFee = input.deliveryType === 'delivery' ? 50 : 0;
    if (input.deliveryFee !== expectedDeliveryFee) {
      console.error("Delivery fee mismatch. Expected:", expectedDeliveryFee, "Got:", input.deliveryFee);
      return new Response(
        JSON.stringify({ error: "Delivery fee calculation error" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify total
    const expectedTotal = calculatedSubtotal + expectedTax + expectedDeliveryFee;
    if (Math.abs(expectedTotal - input.total) > 1) {
      console.error("Total mismatch. Expected:", expectedTotal, "Got:", input.total);
      return new Response(
        JSON.stringify({ error: "Order total verification failed. Please refresh and try again." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate table number exists (for dine-in)
    let tableId: string | null = null;
    if (input.deliveryType === 'dine_in' && input.tableNumber) {
      const { data: tableData, error: tableError } = await supabase
        .from('tables')
        .select('id, is_active')
        .eq('table_number', parseInt(input.tableNumber))
        .maybeSingle();

      if (tableError || !tableData) {
        console.error("Table not found:", input.tableNumber);
        return new Response(
          JSON.stringify({ error: "Invalid table number" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!tableData.is_active) {
        return new Response(
          JSON.stringify({ error: "This table is not currently active" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      tableId = tableData.id;
    }

    // Create or get customer
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone_number', input.phone)
      .maybeSingle();

    let customerId = existingCustomer?.id;

    if (!customerId) {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({ phone_number: input.phone })
        .select('id')
        .single();

      if (customerError) {
        console.error("Error creating customer:", customerError);
        return new Response(
          JSON.stringify({ error: "Failed to create customer record" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      customerId = newCustomer.id;
    }

    // Create order with sanitized inputs
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: `ORD-${Date.now()}`, // Will be overwritten by trigger
        customer_id: customerId,
        table_id: tableId,
        delivery_type: input.deliveryType,
        subtotal: calculatedSubtotal,
        tax: expectedTax,
        delivery_fee: expectedDeliveryFee,
        total: expectedTotal,
        special_instructions: input.specialRequests ? sanitizeText(input.specialRequests) : null,
        delivery_address: input.deliveryType === 'delivery' ? sanitizeText(input.address) : null,
        phone_number: input.phone,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return new Response(
        JSON.stringify({ error: "Failed to create order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create order items with sanitized instructions
    const orderItems = input.items.map((item) => ({
      order_id: order.id,
      item_name: sanitizeText(item.name),
      item_price: menuPriceMap.get(item.name)?.price || item.price,
      quantity: item.quantity,
      special_instructions: item.specialInstructions ? sanitizeText(item.specialInstructions) : null,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      // Attempt to delete the order since items failed
      await supabase.from('orders').delete().eq('id', order.id);
      return new Response(
        JSON.stringify({ error: "Failed to create order items" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Order created successfully:", order.id);

    // Return success with order details
    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: order.id,
          orderNumber: order.order_number,
          total: expectedTotal,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in create-order:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
