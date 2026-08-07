export type HomeProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string;
  rating?: number;
  isDemo?: boolean;
};

export const FALLBACK_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85";

export const DEMO_PRODUCTS: readonly HomeProduct[] = [
  { id: "demo-wireless-mouse", name: "Wireless Mouse", price: 1299, rating: 4.7, category: "Accessories", stock: 42, description: "Ergonomic precision mouse with silent clicks and all-day battery.", isDemo: true },
  { id: "demo-mechanical-keyboard", name: "Mechanical Keyboard", price: 4499, rating: 4.8, category: "Accessories", stock: 18, description: "Tactile mechanical switches in a compact, premium aluminium frame.", isDemo: true },
  { id: "demo-gaming-headset", name: "Gaming Headset", price: 3799, rating: 4.6, category: "Electronics", stock: 25, description: "Immersive surround sound, plush cushions, and a clear detachable mic.", isDemo: true },
  { id: "demo-laptop", name: "Pro Laptop 14", price: 89999, rating: 4.9, category: "Electronics", stock: 9, description: "A powerful 14-inch laptop for focused work and creative projects.", isDemo: true },
  { id: "demo-gaming-chair", name: "Gaming Chair", price: 14999, rating: 4.7, category: "Accessories", stock: 14, description: "Supportive racing-style chair with adjustable lumbar and arm support.", isDemo: true },
  { id: "demo-monitor", name: "UltraWide Monitor", price: 28999, rating: 4.8, category: "Electronics", stock: 11, description: "A crisp panoramic display with rich colour and smooth refresh rates.", isDemo: true },
  { id: "demo-speaker", name: "Bluetooth Speaker", price: 3499, rating: 4.6, category: "Electronics", stock: 37, description: "Room-filling portable sound with deep bass and splash-resistant design.", isDemo: true },
  { id: "demo-usb-hub", name: "USB Hub", price: 2199, rating: 4.5, category: "Accessories", stock: 31, description: "Seven essential ports in a slim hub for every work-from-anywhere setup.", isDemo: true },
  { id: "demo-portable-ssd", name: "Portable SSD", price: 6799, rating: 4.8, category: "Electronics", stock: 22, description: "Pocket-sized high-speed storage built to carry your important work.", isDemo: true },
  { id: "demo-smart-watch", name: "Smart Watch", price: 9999, rating: 4.6, category: "Fashion", stock: 19, description: "A refined fitness companion with a bright display and health insights.", isDemo: true },
  { id: "demo-earbuds", name: "Earbuds", price: 4999, rating: 4.7, category: "Electronics", stock: 44, description: "True wireless earbuds with clear calls, balanced sound, and a compact case.", isDemo: true },
  { id: "demo-webcam", name: "Webcam", price: 3299, rating: 4.5, category: "Accessories", stock: 28, description: "Sharp 1080p video and natural colour for clearer calls and streams.", isDemo: true },
];

export const TRENDING_CATEGORIES = [
  { title: "Electronics", count: "120+ products", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=85" },
  { title: "Accessories", count: "80+ products", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=900&q=85" },
  { title: "Fashion", count: "60+ products", image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=85" },
  { title: "Books", count: "250+ products", image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=85" },
] as const;
