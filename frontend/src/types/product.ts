// types/product.ts

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  slug: string;
  images: string[];
  videos?: string[];
  stock_quantity?: number; // for in-stock display
  rating?: number;         // used in Home.tsx & ProductDetails
  reviewCount?: number;    // used in ProductDetails
  tags?: string[];         // used in ProductDetails & filter
  features?: string[];     // used in ProductDetails
  created_at: string;

  category: {
    id: number;
    name: string;
    slug: string;
  };
}
