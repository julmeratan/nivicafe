import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

interface FloatingCartButtonProps {
  onClick: () => void;
}

const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ onClick }) => {
  const { totalItems, totalPrice } = useCart();

  if (totalItems === 0) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-4 px-6 py-4 rounded-2xl",
        "bg-gradient-to-r from-gold to-gold-dark text-primary-foreground",
        "shadow-xl shadow-gold/30 hover:shadow-2xl hover:shadow-gold/40",
        "transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
        "animate-slide-up"
      )}
    >
      <div className="relative">
        <ShoppingBag className="w-6 h-6" />
        <span className="absolute -top-2 -right-2 w-5 h-5 bg-background text-foreground text-xs font-bold rounded-full flex items-center justify-center">
          {totalItems}
        </span>
      </div>
      <div className="text-left">
        <span className="text-sm opacity-90 block">View Cart</span>
        <span className="font-bold">₹{totalPrice}</span>
      </div>
    </button>
  );
};

export default FloatingCartButton;
