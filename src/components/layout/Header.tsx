import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  restaurantName?: string;
  onRatingClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  restaurantName = "Saffron Palace",
  onRatingClick 
}) => {
  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-gradient-gold">
              {restaurantName}
            </h1>
            <p className="text-xs text-muted-foreground">Fine Indian Cuisine</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className="w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRatingClick}
              className="gap-1"
            >
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Rate Us</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              asChild
            >
              <Link to="/admin/login">
                <Settings className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
