import React, { useState, useMemo } from 'react';
import Header from '@/components/layout/Header';
import CategoryTabs from '@/components/menu/CategoryTabs';
import MenuItemCard from '@/components/menu/MenuItemCard';
import ItemDetailsSheet from '@/components/menu/ItemDetailsSheet';
import CartSheet from '@/components/cart/CartSheet';
import FloatingCartButton from '@/components/cart/FloatingCartButton';
import CheckoutDialog from '@/components/checkout/CheckoutDialog';
import RatingDialog from '@/components/rating/RatingDialog';
import { categories, menuItems, getSpecialItems } from '@/data/menuData';
import { useCart } from '@/context/CartContext';
import type { MenuItem } from '@/types/menu';
import { toast } from 'sonner';

const MenuPage: React.FC = () => {
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState('specials');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'specials') {
      return getSpecialItems();
    }
    return menuItems.filter(item => item.category === activeCategory);
  }, [activeCategory]);

  const handleAddToCart = (item: MenuItem) => {
    addItem(item, 1);
    toast.success(`${item.name} added to cart`);
  };

  const handleViewDetails = (item: MenuItem) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderComplete = () => {
    setIsCheckoutOpen(false);
    setTimeout(() => {
      setIsRatingOpen(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header onRatingClick={() => setIsRatingOpen(true)} />

      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Hero Section for Specials */}
      {activeCategory === 'specials' && (
        <div className="px-4 py-6">
          <div className="text-center mb-6">
            <h2 className="font-display text-3xl font-bold text-gradient-gold mb-2">
              Chef's Specials
            </h2>
            <p className="text-muted-foreground">
              Signature dishes crafted with passion
            </p>
          </div>
        </div>
      )}

      {/* Menu Grid */}
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onAddToCart={handleAddToCart}
              onViewDetails={handleViewDetails}
              delay={index * 100}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items in this category</p>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      <FloatingCartButton onClick={() => setIsCartOpen(true)} />

      {/* Sheets & Dialogs */}
      <ItemDetailsSheet
        item={selectedItem}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />

      <CartSheet
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />

      <CheckoutDialog
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onComplete={handleOrderComplete}
      />

      <RatingDialog
        isOpen={isRatingOpen}
        onClose={() => setIsRatingOpen(false)}
      />
    </div>
  );
};

export default MenuPage;
