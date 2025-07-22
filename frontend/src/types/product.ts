// types/product.ts

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  slug: string;
  images: string[];
  thumbnail: string;          // ✅ Added this
  videos?: string[];
  stock_quantity?: number;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  features?: string[];
  created_at: string;

  category: {
    id: number;
    name: string;
    slug: string;
  };
}
