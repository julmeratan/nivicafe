import heroBiryani from '@/assets/hero-biryani.jpg';
import butterChicken from '@/assets/butter-chicken.jpg';
import paneerTikka from '@/assets/paneer-tikka.jpg';
import dalMakhani from '@/assets/dal-makhani.jpg';
import naanBread from '@/assets/naan-bread.jpg';
import gulabJamun from '@/assets/gulab-jamun.jpg';

import type { MenuItem, Category } from '@/types/menu';

export const categories: Category[] = [
  { id: 'specials', name: 'Chef\'s Specials', icon: '⭐' },
  { id: 'starters', name: 'Starters', icon: '🥗' },
  { id: 'mains', name: 'Main Course', icon: '🍛' },
  { id: 'breads', name: 'Breads', icon: '🫓' },
  { id: 'desserts', name: 'Desserts', icon: '🍮' },
  { id: 'beverages', name: 'Beverages', icon: '🥤' },
];

export const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Royal Hyderabadi Biryani',
    description: 'Fragrant basmati rice layered with succulent lamb, saffron, and aromatic spices. Slow-cooked in our signature dum style.',
    price: 450,
    image: heroBiryani,
    category: 'specials',
    servings: 'Serves 2-3',
    spiceLevel: 'medium',
    isVegetarian: false,
    isSpecial: true,
    pairsWith: ['9', '10'],
    preparationTime: '30-40 mins',
  },
  {
    id: '2',
    name: 'Butter Chicken',
    description: 'Tender chicken tikka in a rich, creamy tomato-based gravy with a touch of honey and kasuri methi.',
    price: 380,
    image: butterChicken,
    category: 'mains',
    servings: 'Serves 2',
    spiceLevel: 'mild',
    isVegetarian: false,
    isSpecial: true,
    pairsWith: ['6', '9'],
    preparationTime: '20-25 mins',
  },
  {
    id: '3',
    name: 'Paneer Tikka',
    description: 'Cottage cheese cubes marinated in spiced yogurt, chargrilled to perfection in our tandoor.',
    price: 280,
    image: paneerTikka,
    category: 'starters',
    servings: 'Serves 2',
    spiceLevel: 'medium',
    isVegetarian: true,
    isSpecial: false,
    pairsWith: ['9', '10'],
    preparationTime: '15-20 mins',
  },
  {
    id: '4',
    name: 'Dal Makhani',
    description: 'Black lentils slow-cooked overnight with butter, cream, and traditional spices. A true North Indian classic.',
    price: 240,
    image: dalMakhani,
    category: 'mains',
    servings: 'Serves 2',
    spiceLevel: 'mild',
    isVegetarian: true,
    isSpecial: false,
    pairsWith: ['6', '7'],
    preparationTime: '15 mins',
  },
  {
    id: '5',
    name: 'Chicken Tikka',
    description: 'Juicy chicken pieces marinated in aromatic spices and yogurt, grilled in our clay tandoor.',
    price: 320,
    image: paneerTikka,
    category: 'starters',
    servings: 'Serves 2',
    spiceLevel: 'hot',
    isVegetarian: false,
    isSpecial: false,
    pairsWith: ['9', '10'],
    preparationTime: '15-20 mins',
  },
  {
    id: '6',
    name: 'Butter Naan',
    description: 'Soft, fluffy leavened bread brushed with pure butter, baked in our tandoor.',
    price: 60,
    image: naanBread,
    category: 'breads',
    servings: '1 piece',
    spiceLevel: 'mild',
    isVegetarian: true,
    isSpecial: false,
    pairsWith: ['2', '4'],
    preparationTime: '5 mins',
  },
  {
    id: '7',
    name: 'Garlic Naan',
    description: 'Fresh naan topped with minced garlic and coriander, baked to golden perfection.',
    price: 80,
    image: naanBread,
    category: 'breads',
    servings: '1 piece',
    spiceLevel: 'mild',
    isVegetarian: true,
    isSpecial: false,
    pairsWith: ['2', '4'],
    preparationTime: '5 mins',
  },
  {
    id: '8',
    name: 'Gulab Jamun',
    description: 'Soft milk solids dumplings soaked in rose-scented sugar syrup, served warm.',
    price: 120,
    image: gulabJamun,
    category: 'desserts',
    servings: '4 pieces',
    spiceLevel: 'mild',
    isVegetarian: true,
    isSpecial: false,
    pairsWith: [],
    preparationTime: '5 mins',
  },
  {
    id: '9',
    name: 'Coca-Cola',
    description: 'Chilled classic Coca-Cola to complement your meal.',
    price: 60,
    image: gulabJamun,
    category: 'beverages',
    servings: '330ml',
    spiceLevel: 'mild',
    isVegetarian: true,
    isSpecial: false,
    pairsWith: ['1', '2'],
    preparationTime: 'Instant',
  },
  {
    id: '10',
    name: 'Mango Lassi',
    description: 'Creamy yogurt drink blended with fresh Alphonso mangoes.',
    price: 100,
    image: gulabJamun,
    category: 'beverages',
    servings: '300ml',
    spiceLevel: 'mild',
    isVegetarian: true,
    isSpecial: false,
    pairsWith: ['1', '3'],
    preparationTime: '5 mins',
  },
];

export const getItemById = (id: string): MenuItem | undefined => {
  return menuItems.find(item => item.id === id);
};

export const getItemsByCategory = (categoryId: string): MenuItem[] => {
  return menuItems.filter(item => item.category === categoryId);
};

export const getPairedItems = (itemId: string): MenuItem[] => {
  const item = getItemById(itemId);
  if (!item) return [];
  return item.pairsWith
    .map(id => getItemById(id))
    .filter((item): item is MenuItem => item !== undefined);
};

export const getSpecialItems = (): MenuItem[] => {
  return menuItems.filter(item => item.isSpecial);
};
