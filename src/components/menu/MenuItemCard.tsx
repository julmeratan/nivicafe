import React from 'react';
import { Plus, Clock, Users, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MenuItem } from '@/types/menu';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  onViewDetails: (item: MenuItem) => void;
  delay?: number;
}

const spiceLevelColors = {
  mild: 'text-green-400',
  medium: 'text-yellow-400',
  hot: 'text-orange-400',
  'extra-hot': 'text-red-400',
};

const spiceLevelLabels = {
  mild: 'Mild',
  medium: 'Medium',
  hot: 'Hot',
  'extra-hot': 'Extra Hot',
};

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onAddToCart,
  onViewDetails,
  delay = 0,
}) => {
  return (
    <div
      className={cn(
        "group relative bg-gradient-to-br from-card to-card/80 rounded-2xl overflow-hidden",
        "border border-border/50 hover:border-gold/30 transition-all duration-500",
        "hover:shadow-xl hover:shadow-gold/10 hover:-translate-y-1",
        "animate-slide-up opacity-0"
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {/* Image */}
      <div
        className="relative h-48 cursor-pointer overflow-hidden"
        onClick={() => onViewDetails(item)}
      >
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {item.isSpecial && (
            <span className="px-2.5 py-1 bg-gold/90 text-primary-foreground text-xs font-semibold rounded-full">
              Chef's Special
            </span>
          )}
          {item.isVegetarian && (
            <span className="px-2.5 py-1 bg-green-500/90 text-primary-foreground text-xs font-semibold rounded-full">
              Veg
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <h3
            className="font-display text-lg font-semibold text-foreground cursor-pointer hover:text-gold transition-colors"
            onClick={() => onViewDetails(item)}
          >
            {item.name}
          </h3>
          <span className="text-xl font-bold text-gold whitespace-nowrap">
            ₹{item.price}
          </span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {item.servings}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {item.preparationTime}
          </span>
          <span className={cn("flex items-center gap-1", spiceLevelColors[item.spiceLevel])}>
            <Flame className="w-3.5 h-3.5" />
            {spiceLevelLabels[item.spiceLevel]}
          </span>
        </div>

        {/* Add Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={() => onAddToCart(item)}
        >
          <Plus className="w-4 h-4" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default MenuItemCard;
