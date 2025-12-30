import React, { useState } from 'react';
import { X, Minus, Plus, Clock, Users, Flame, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { MenuItem } from '@/types/menu';
import { getPairedItems } from '@/data/menuData';
import { useCart } from '@/context/CartContext';

interface ItemDetailsSheetProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const spiceLevelColors = {
  mild: 'bg-green-500',
  medium: 'bg-yellow-500',
  hot: 'bg-orange-500',
  'extra-hot': 'bg-red-500',
};

const ItemDetailsSheet: React.FC<ItemDetailsSheetProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');

  if (!item) return null;

  const pairedItems = getPairedItems(item.id);

  const handleAddToCart = () => {
    addItem(item, quantity, instructions);
    setQuantity(1);
    setInstructions('');
    onClose();
  };

  const handleAddPairedItem = (pairedItem: MenuItem) => {
    addItem(pairedItem, 1);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg p-0 bg-background border-border overflow-y-auto">
        {/* Image Header */}
        <div className="relative h-64 sm:h-80">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            {item.isSpecial && (
              <span className="px-3 py-1.5 bg-gold text-primary-foreground text-sm font-semibold rounded-full flex items-center gap-1">
                <ChefHat className="w-4 h-4" />
                Chef's Special
              </span>
            )}
            {item.isVegetarian && (
              <span className="px-3 py-1.5 bg-green-500 text-primary-foreground text-sm font-semibold rounded-full">
                Vegetarian
              </span>
            )}
          </div>
        </div>

        <SheetHeader className="px-6 pt-4">
          <div className="flex justify-between items-start">
            <SheetTitle className="font-display text-2xl text-foreground">
              {item.name}
            </SheetTitle>
            <span className="text-2xl font-bold text-gold">₹{item.price}</span>
          </div>
        </SheetHeader>

        <div className="px-6 py-4 space-y-6">
          <p className="text-muted-foreground">{item.description}</p>

          {/* Info Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-secondary rounded-xl p-3 text-center">
              <Users className="w-5 h-5 mx-auto mb-1 text-gold" />
              <span className="text-xs text-muted-foreground block">Serves</span>
              <span className="text-sm font-medium">{item.servings}</span>
            </div>
            <div className="bg-secondary rounded-xl p-3 text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 text-gold" />
              <span className="text-xs text-muted-foreground block">Time</span>
              <span className="text-sm font-medium">{item.preparationTime}</span>
            </div>
            <div className="bg-secondary rounded-xl p-3 text-center">
              <Flame className="w-5 h-5 mx-auto mb-1 text-gold" />
              <span className="text-xs text-muted-foreground block">Spice</span>
              <div className="flex items-center justify-center gap-1 mt-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      "w-2 h-2 rounded-full",
                      level <= ['mild', 'medium', 'hot', 'extra-hot'].indexOf(item.spiceLevel) + 1
                        ? spiceLevelColors[item.spiceLevel]
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Special Instructions
            </label>
            <Textarea
              placeholder="E.g., Less spicy, extra sauce, no onions..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="bg-secondary border-border resize-none"
              rows={3}
            />
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between bg-secondary rounded-xl p-4">
            <span className="font-medium">Quantity</span>
            <div className="flex items-center gap-4">
              <Button
                variant="icon"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-xl font-bold w-8 text-center">{quantity}</span>
              <Button
                variant="icon"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Frequently Bought Together */}
          {pairedItems.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Frequently Bought Together</h4>
              <div className="space-y-2">
                {pairedItems.map((pairedItem) => (
                  <div
                    key={pairedItem.id}
                    className="flex items-center justify-between bg-secondary rounded-xl p-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={pairedItem.image}
                        alt={pairedItem.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <span className="text-sm font-medium">{pairedItem.name}</span>
                        <span className="text-sm text-gold block">₹{pairedItem.price}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddPairedItem(pairedItem)}
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <Button
            variant="gold"
            size="xl"
            className="w-full"
            onClick={handleAddToCart}
          >
            Add to Cart - ₹{item.price * quantity}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ItemDetailsSheet;
