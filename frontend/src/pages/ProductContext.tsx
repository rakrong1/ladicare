import React, { createContext, useContext } from 'react';

// This context is now obsolete as data is fetched from backend
// Retained structure only if needed for category caching or global state

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  videos?: string[];
  stock: number;
  status: 'pending_review' | 'approved' | 'rejected' | 'active' | 'inactive';
  rating: number;
  reviewCount: number;
  tags: string[];
  features: string[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

interface ProductContextType {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
  searchProducts: (query: string) => Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

const ProductContext = createContext<ProductContextType | null>(null);

// Temporary placeholder provider
export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProductContext.Provider value={{
      products: [],
      categories: [],
      loading: false,
      error: null,
      getProductById: () => undefined,
      getProductsByCategory: () => [],
      searchProducts: () => [],
      addProduct: () => {},
      updateProduct: () => {},
      deleteProduct: () => {},
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
