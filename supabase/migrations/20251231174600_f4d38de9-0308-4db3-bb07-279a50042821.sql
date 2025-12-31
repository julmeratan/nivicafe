-- Add phone number format constraint to customers table
-- Format: Optional + followed by 10-15 digits
ALTER TABLE public.customers 
ADD CONSTRAINT customers_phone_format 
CHECK (phone_number ~ '^\+?[0-9]{10,15}$');

-- Add email format constraint to customers table (nullable field)
ALTER TABLE public.customers 
ADD CONSTRAINT customers_email_format 
CHECK (email IS NULL OR email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');

-- Add email length constraint
ALTER TABLE public.customers 
ADD CONSTRAINT customers_email_length 
CHECK (email IS NULL OR length(email) <= 255);

-- Add address length constraint
ALTER TABLE public.customers 
ADD CONSTRAINT customers_address_length 
CHECK (address IS NULL OR length(address) <= 500);

-- Add name length constraint
ALTER TABLE public.customers 
ADD CONSTRAINT customers_name_length 
CHECK (name IS NULL OR length(name) <= 100);

-- Add phone number format constraint to orders table
ALTER TABLE public.orders 
ADD CONSTRAINT orders_phone_format 
CHECK (phone_number ~ '^\+?[0-9]{10,15}$');

-- Add special instructions length constraint to orders
ALTER TABLE public.orders 
ADD CONSTRAINT orders_special_instructions_length 
CHECK (special_instructions IS NULL OR length(special_instructions) <= 500);

-- Add delivery address length constraint to orders
ALTER TABLE public.orders 
ADD CONSTRAINT orders_delivery_address_length 
CHECK (delivery_address IS NULL OR length(delivery_address) <= 500);

-- Add feedback length constraint to orders
ALTER TABLE public.orders 
ADD CONSTRAINT orders_feedback_length 
CHECK (feedback IS NULL OR length(feedback) <= 1000);

-- Add special instructions length constraint to order_items
ALTER TABLE public.order_items 
ADD CONSTRAINT order_items_special_instructions_length 
CHECK (special_instructions IS NULL OR length(special_instructions) <= 500);

-- Add item name length constraint to order_items
ALTER TABLE public.order_items 
ADD CONSTRAINT order_items_item_name_length 
CHECK (length(item_name) <= 200);

-- Add menu item constraints
ALTER TABLE public.menu_items 
ADD CONSTRAINT menu_items_name_length 
CHECK (length(name) <= 200);

ALTER TABLE public.menu_items 
ADD CONSTRAINT menu_items_description_length 
CHECK (description IS NULL OR length(description) <= 1000);

ALTER TABLE public.menu_items 
ADD CONSTRAINT menu_items_price_positive 
CHECK (price > 0 AND price <= 100000);