// types/product.ts
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  slug: string;
  images: string[];
  category: {
    id: number;
    name: string;
    slug: string;
  };
  created_at: string;
}
