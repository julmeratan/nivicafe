import React from 'react';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/menu';

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-lg border-b border-border py-4">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 text-sm font-medium",
              activeCategory === category.id
                ? "bg-gradient-to-r from-gold to-gold-dark text-primary-foreground shadow-lg"
                : "bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;
