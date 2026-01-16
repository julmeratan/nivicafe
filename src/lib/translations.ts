export type Language = 'en' | 'hi' | 'es' | 'fr';

export interface Translations {
  // Header
  fineDiningExperience: string;
  rateUs: string;
  settings: string;
  
  // Settings
  appearance: string;
  light: string;
  dark: string;
  auto: string;
  feedback: string;
  soundEffects: string;
  playSoundsForActions: string;
  hapticFeedback: string;
  vibrationOnMobile: string;
  hapticInfo: string;
  language: string;
  
  // Menu
  menu: string;
  addToCart: string;
  viewDetails: string;
  servings: string;
  prepTime: string;
  vegetarian: string;
  chefsSpecial: string;
  pairsWith: string;
  specialInstructions: string;
  
  // Cart
  cart: string;
  yourCart: string;
  emptyCart: string;
  emptyCartMessage: string;
  subtotal: string;
  taxes: string;
  deliveryFee: string;
  total: string;
  checkout: string;
  clearCart: string;
  
  // Checkout
  howWouldYouLikeYourOrder: string;
  dineIn: string;
  takeaway: string;
  delivery: string;
  phoneNumber: string;
  tableNumber: string;
  deliveryAddress: string;
  specialRequests: string;
  optional: string;
  orderSummary: string;
  placeOrder: string;
  placingOrder: string;
  
  // Order Confirmation
  orderConfirmed: string;
  thankYouForOrder: string;
  orderNumber: string;
  totalPaid: string;
  estimated: string;
  orderServedAtTable: string;
  orderReadyForPickup: string;
  orderDelivered: string;
  notifyViaWhatsApp: string;
  continueBrowsing: string;
  copied: string;
  
  // Spice Levels
  mild: string;
  medium: string;
  hot: string;
  extraHot: string;
  
  // Categories
  chefsSpecials: string;
  gourmetStartersVeg: string;
  gourmetStartersNonVeg: string;
  internationalMainsVeg: string;
  internationalMainsNonVeg: string;
  liveCounters: string;
  breadsSides: string;
  globalDesserts: string;
  beverages: string;
  
  // Time
  minutes: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Header
    fineDiningExperience: 'Fine Dining Experience',
    rateUs: 'Rate Us',
    settings: 'Settings',
    
    // Settings
    appearance: 'Appearance',
    light: 'Light',
    dark: 'Dark',
    auto: 'Auto',
    feedback: 'Feedback',
    soundEffects: 'Sound Effects',
    playSoundsForActions: 'Play sounds for actions',
    hapticFeedback: 'Haptic Feedback',
    vibrationOnMobile: 'Vibration on mobile',
    hapticInfo: '💡 Haptic feedback works on supported mobile devices only.',
    language: 'Language',
    
    // Menu
    menu: 'Menu',
    addToCart: 'Add to Cart',
    viewDetails: 'View Details',
    servings: 'Servings',
    prepTime: 'Prep Time',
    vegetarian: 'Vegetarian',
    chefsSpecial: "Chef's Special",
    pairsWith: 'Pairs with',
    specialInstructions: 'Special Instructions',
    
    // Cart
    cart: 'Cart',
    yourCart: 'Your Cart',
    emptyCart: 'Your cart is empty',
    emptyCartMessage: 'Add some delicious items to get started!',
    subtotal: 'Subtotal',
    taxes: 'Taxes (5%)',
    deliveryFee: 'Delivery Fee',
    total: 'Total',
    checkout: 'Checkout',
    clearCart: 'Clear Cart',
    
    // Checkout
    howWouldYouLikeYourOrder: 'How would you like your order?',
    dineIn: 'Dine-in',
    takeaway: 'Takeaway',
    delivery: 'Delivery',
    phoneNumber: 'Phone Number (WhatsApp)',
    tableNumber: 'Table Number',
    deliveryAddress: 'Delivery Address',
    specialRequests: 'Special Requests',
    optional: 'Optional',
    orderSummary: 'Order Summary',
    placeOrder: 'Place Order via WhatsApp',
    placingOrder: 'Placing Order...',
    
    // Order Confirmation
    orderConfirmed: 'Order Confirmed!',
    thankYouForOrder: 'Thank you for your order',
    orderNumber: 'Order Number',
    totalPaid: 'Total Paid',
    estimated: 'Estimated',
    orderServedAtTable: 'Your order will be served at Table',
    orderReadyForPickup: 'Your order will be ready for pickup shortly',
    orderDelivered: 'Your order will be delivered to your address',
    notifyViaWhatsApp: "We'll notify you via WhatsApp when ready",
    continueBrowsing: 'Continue Browsing',
    copied: 'Order number copied!',
    
    // Spice Levels
    mild: 'Mild',
    medium: 'Medium',
    hot: 'Hot',
    extraHot: 'Extra Hot',
    
    // Categories
    chefsSpecials: "Chef's Specials",
    gourmetStartersVeg: 'Gourmet Starters (Veg)',
    gourmetStartersNonVeg: 'Gourmet Starters (Non-Veg)',
    internationalMainsVeg: 'International Mains (Veg)',
    internationalMainsNonVeg: 'International Mains (Non-Veg)',
    liveCounters: 'Live Counters & Classics',
    breadsSides: 'Breads & Sides',
    globalDesserts: 'Global Desserts',
    beverages: 'Beverages',
    
    // Time
    minutes: 'minutes',
  },
  
  hi: {
    // Header
    fineDiningExperience: 'शानदार भोजन अनुभव',
    rateUs: 'रेटिंग दें',
    settings: 'सेटिंग्स',
    
    // Settings
    appearance: 'दिखावट',
    light: 'लाइट',
    dark: 'डार्क',
    auto: 'ऑटो',
    feedback: 'प्रतिक्रिया',
    soundEffects: 'ध्वनि प्रभाव',
    playSoundsForActions: 'क्रियाओं के लिए ध्वनि',
    hapticFeedback: 'हैप्टिक फीडबैक',
    vibrationOnMobile: 'मोबाइल पर कंपन',
    hapticInfo: '💡 हैप्टिक फीडबैक केवल समर्थित मोबाइल उपकरणों पर काम करता है।',
    language: 'भाषा',
    
    // Menu
    menu: 'मेन्यू',
    addToCart: 'कार्ट में जोड़ें',
    viewDetails: 'विवरण देखें',
    servings: 'परोसना',
    prepTime: 'तैयारी का समय',
    vegetarian: 'शाकाहारी',
    chefsSpecial: 'शेफ की विशेष',
    pairsWith: 'साथ में',
    specialInstructions: 'विशेष निर्देश',
    
    // Cart
    cart: 'कार्ट',
    yourCart: 'आपका कार्ट',
    emptyCart: 'आपका कार्ट खाली है',
    emptyCartMessage: 'शुरू करने के लिए कुछ स्वादिष्ट आइटम जोड़ें!',
    subtotal: 'उप-योग',
    taxes: 'कर (5%)',
    deliveryFee: 'डिलीवरी शुल्क',
    total: 'कुल',
    checkout: 'चेकआउट',
    clearCart: 'कार्ट खाली करें',
    
    // Checkout
    howWouldYouLikeYourOrder: 'आप अपना ऑर्डर कैसे चाहते हैं?',
    dineIn: 'यहीं खाएं',
    takeaway: 'पार्सल',
    delivery: 'डिलीवरी',
    phoneNumber: 'फोन नंबर (WhatsApp)',
    tableNumber: 'टेबल नंबर',
    deliveryAddress: 'डिलीवरी पता',
    specialRequests: 'विशेष अनुरोध',
    optional: 'वैकल्पिक',
    orderSummary: 'ऑर्डर सारांश',
    placeOrder: 'WhatsApp से ऑर्डर करें',
    placingOrder: 'ऑर्डर कर रहे हैं...',
    
    // Order Confirmation
    orderConfirmed: 'ऑर्डर पुष्टि!',
    thankYouForOrder: 'आपके ऑर्डर के लिए धन्यवाद',
    orderNumber: 'ऑर्डर नंबर',
    totalPaid: 'कुल भुगतान',
    estimated: 'अनुमानित',
    orderServedAtTable: 'आपका ऑर्डर टेबल पर परोसा जाएगा',
    orderReadyForPickup: 'आपका ऑर्डर जल्द ही पिकअप के लिए तैयार होगा',
    orderDelivered: 'आपका ऑर्डर आपके पते पर डिलीवर किया जाएगा',
    notifyViaWhatsApp: 'तैयार होने पर WhatsApp से सूचित करेंगे',
    continueBrowsing: 'ब्राउज़िंग जारी रखें',
    copied: 'ऑर्डर नंबर कॉपी हो गया!',
    
    // Spice Levels
    mild: 'कम मसाला',
    medium: 'मध्यम',
    hot: 'तीखा',
    extraHot: 'बहुत तीखा',
    
    // Categories
    chefsSpecials: 'शेफ की विशेष',
    gourmetStartersVeg: 'शाकाहारी स्टार्टर्स',
    gourmetStartersNonVeg: 'मांसाहारी स्टार्टर्स',
    internationalMainsVeg: 'शाकाहारी मेन कोर्स',
    internationalMainsNonVeg: 'मांसाहारी मेन कोर्स',
    liveCounters: 'लाइव काउंटर्स',
    breadsSides: 'ब्रेड और साइड्स',
    globalDesserts: 'मिठाई',
    beverages: 'पेय पदार्थ',
    
    // Time
    minutes: 'मिनट',
  },
  
  es: {
    // Header
    fineDiningExperience: 'Experiencia Gastronómica',
    rateUs: 'Califícanos',
    settings: 'Ajustes',
    
    // Settings
    appearance: 'Apariencia',
    light: 'Claro',
    dark: 'Oscuro',
    auto: 'Auto',
    feedback: 'Retroalimentación',
    soundEffects: 'Efectos de Sonido',
    playSoundsForActions: 'Reproducir sonidos',
    hapticFeedback: 'Vibración',
    vibrationOnMobile: 'Vibración en móvil',
    hapticInfo: '💡 La vibración solo funciona en dispositivos móviles compatibles.',
    language: 'Idioma',
    
    // Menu
    menu: 'Menú',
    addToCart: 'Añadir al Carrito',
    viewDetails: 'Ver Detalles',
    servings: 'Porciones',
    prepTime: 'Tiempo de Prep',
    vegetarian: 'Vegetariano',
    chefsSpecial: 'Especial del Chef',
    pairsWith: 'Combina con',
    specialInstructions: 'Instrucciones Especiales',
    
    // Cart
    cart: 'Carrito',
    yourCart: 'Tu Carrito',
    emptyCart: 'Tu carrito está vacío',
    emptyCartMessage: '¡Añade algunos platos deliciosos!',
    subtotal: 'Subtotal',
    taxes: 'Impuestos (5%)',
    deliveryFee: 'Envío',
    total: 'Total',
    checkout: 'Pagar',
    clearCart: 'Vaciar Carrito',
    
    // Checkout
    howWouldYouLikeYourOrder: '¿Cómo deseas tu pedido?',
    dineIn: 'Comer Aquí',
    takeaway: 'Para Llevar',
    delivery: 'Entrega',
    phoneNumber: 'Teléfono (WhatsApp)',
    tableNumber: 'Número de Mesa',
    deliveryAddress: 'Dirección de Entrega',
    specialRequests: 'Solicitudes Especiales',
    optional: 'Opcional',
    orderSummary: 'Resumen del Pedido',
    placeOrder: 'Pedir por WhatsApp',
    placingOrder: 'Procesando...',
    
    // Order Confirmation
    orderConfirmed: '¡Pedido Confirmado!',
    thankYouForOrder: 'Gracias por tu pedido',
    orderNumber: 'Número de Pedido',
    totalPaid: 'Total Pagado',
    estimated: 'Estimado',
    orderServedAtTable: 'Tu pedido será servido en la Mesa',
    orderReadyForPickup: 'Tu pedido estará listo pronto',
    orderDelivered: 'Tu pedido será entregado en tu dirección',
    notifyViaWhatsApp: 'Te notificaremos por WhatsApp',
    continueBrowsing: 'Seguir Explorando',
    copied: '¡Número de pedido copiado!',
    
    // Spice Levels
    mild: 'Suave',
    medium: 'Medio',
    hot: 'Picante',
    extraHot: 'Muy Picante',
    
    // Categories
    chefsSpecials: 'Especiales del Chef',
    gourmetStartersVeg: 'Entrantes Vegetarianos',
    gourmetStartersNonVeg: 'Entrantes No Vegetarianos',
    internationalMainsVeg: 'Platos Principales Veg',
    internationalMainsNonVeg: 'Platos Principales No Veg',
    liveCounters: 'Estaciones en Vivo',
    breadsSides: 'Panes y Acompañamientos',
    globalDesserts: 'Postres',
    beverages: 'Bebidas',
    
    // Time
    minutes: 'minutos',
  },
  
  fr: {
    // Header
    fineDiningExperience: 'Expérience Gastronomique',
    rateUs: 'Notez-nous',
    settings: 'Paramètres',
    
    // Settings
    appearance: 'Apparence',
    light: 'Clair',
    dark: 'Sombre',
    auto: 'Auto',
    feedback: 'Retour',
    soundEffects: 'Effets Sonores',
    playSoundsForActions: 'Sons pour les actions',
    hapticFeedback: 'Retour Haptique',
    vibrationOnMobile: 'Vibration mobile',
    hapticInfo: '💡 Le retour haptique fonctionne uniquement sur les appareils compatibles.',
    language: 'Langue',
    
    // Menu
    menu: 'Menu',
    addToCart: 'Ajouter au Panier',
    viewDetails: 'Voir Détails',
    servings: 'Portions',
    prepTime: 'Temps de Prép',
    vegetarian: 'Végétarien',
    chefsSpecial: 'Spécialité du Chef',
    pairsWith: 'Accompagne',
    specialInstructions: 'Instructions Spéciales',
    
    // Cart
    cart: 'Panier',
    yourCart: 'Votre Panier',
    emptyCart: 'Votre panier est vide',
    emptyCartMessage: 'Ajoutez des plats délicieux!',
    subtotal: 'Sous-total',
    taxes: 'Taxes (5%)',
    deliveryFee: 'Livraison',
    total: 'Total',
    checkout: 'Commander',
    clearCart: 'Vider le Panier',
    
    // Checkout
    howWouldYouLikeYourOrder: 'Comment souhaitez-vous votre commande?',
    dineIn: 'Sur Place',
    takeaway: 'À Emporter',
    delivery: 'Livraison',
    phoneNumber: 'Téléphone (WhatsApp)',
    tableNumber: 'Numéro de Table',
    deliveryAddress: 'Adresse de Livraison',
    specialRequests: 'Demandes Spéciales',
    optional: 'Optionnel',
    orderSummary: 'Résumé de Commande',
    placeOrder: 'Commander via WhatsApp',
    placingOrder: 'Commande en cours...',
    
    // Order Confirmation
    orderConfirmed: 'Commande Confirmée!',
    thankYouForOrder: 'Merci pour votre commande',
    orderNumber: 'Numéro de Commande',
    totalPaid: 'Total Payé',
    estimated: 'Estimé',
    orderServedAtTable: 'Votre commande sera servie à la Table',
    orderReadyForPickup: 'Votre commande sera prête bientôt',
    orderDelivered: 'Votre commande sera livrée',
    notifyViaWhatsApp: 'Nous vous notifierons via WhatsApp',
    continueBrowsing: 'Continuer',
    copied: 'Numéro de commande copié!',
    
    // Spice Levels
    mild: 'Doux',
    medium: 'Moyen',
    hot: 'Épicé',
    extraHot: 'Très Épicé',
    
    // Categories
    chefsSpecials: 'Spécialités du Chef',
    gourmetStartersVeg: 'Entrées Végétariennes',
    gourmetStartersNonVeg: 'Entrées Non Végétariennes',
    internationalMainsVeg: 'Plats Principaux Vég',
    internationalMainsNonVeg: 'Plats Principaux Non Vég',
    liveCounters: 'Comptoirs en Direct',
    breadsSides: 'Pains et Accompagnements',
    globalDesserts: 'Desserts',
    beverages: 'Boissons',
    
    // Time
    minutes: 'minutes',
  },
};

export const languageNames: Record<Language, string> = {
  en: 'English',
  hi: 'हिंदी',
  es: 'Español',
  fr: 'Français',
};

export const languageFlags: Record<Language, string> = {
  en: '🇬🇧',
  hi: '🇮🇳',
  es: '🇪🇸',
  fr: '🇫🇷',
};
