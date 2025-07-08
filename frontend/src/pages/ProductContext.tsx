import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import api from '@/services/api';

// ---------- Interfaces ----------
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category_id: number;
  category?: Category;
  images: string[];
  videos?: string[];
  stock_quantity?: number;
  stock?: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  features?: string[];
  createdAt: string;
  sellerId?: number;
  sales?: number;
  thumbnail?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  slug?: string;
  is_active?: boolean;
  image?: string;
  productCount?: number;
}

// ---------- Context Type ----------
interface ProductContextType {
  products: Product[];
  visibleProducts: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (categoryId: number) => Product[];
  refetchProducts: () => Promise<void>;
  searchProducts: (query: string) => Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

// ---------- Context Setup ----------
const ProductContext = createContext<ProductContextType | null>(null);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
  try {
    setLoading(true);

    const categoryParam = new URLSearchParams(window.location.search).get('category');
    const productUrl = categoryParam
      ? `/products?category=${categoryParam}`
      : `/products`;

    const [productRes, categoryRes] = await Promise.all([
      api.get<Product[]>(productUrl),
      api.get<Category[]>('/categories'),
    ]);

    setProducts(Array.isArray(productRes) ? productRes : []);
    setCategories(Array.isArray(categoryRes) ? categoryRes : []);
    setError(null);
  } catch (err) {
    console.error('❌ Fetch error in ProductContext:', err);
    setError('Failed to fetch products or categories.');
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchData();
  }, []);

  const visibleProducts = useMemo(() => {
    return products.filter(
      (p) => p.status === 'approved' || p.status === 'active'
    );
  }, [products]);

  const getProductById = (id: string) => products.find((p) => p.id === id);

  const getProductsByCategory = (categoryId: number) =>
    visibleProducts.filter((p) => p.category_id === categoryId);

  const searchProducts = (query: string) =>
    visibleProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
    );

  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('❌ Failed to delete product:', err);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        visibleProducts,
        categories,
        loading,
        error,
        getProductById,
        getProductsByCategory,
        refetchProducts: fetchData,
        searchProducts,
        addProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
