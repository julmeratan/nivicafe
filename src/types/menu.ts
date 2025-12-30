export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  servings: string;
  spiceLevel: 'mild' | 'medium' | 'hot' | 'extra-hot';
  isVegetarian: boolean;
  isSpecial: boolean;
  pairsWith: string[];
  preparationTime: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
  specialInstructions?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface OrderDetails {
  items: CartItem[];
  total: number;
  deliveryType: 'dine-in' | 'takeaway' | 'delivery';
  tableNumber?: string;
  address?: string;
  phone: string;
  specialRequests?: string;
}
