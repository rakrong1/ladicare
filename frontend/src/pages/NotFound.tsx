import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useProducts } from "./ProductContext";
import { Star, ShoppingCart } from "lucide-react";
import { useCart } from "./CartContext";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchProducts, getProductsByCategory, products } = useProducts();
  const { addItem } = useCart();
  const [searchParams] = useSearchParams();

  const query = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  useEffect(() => {
    console.error("404 Error: Page not found:", location.pathname);
  }, [location.pathname]);

  let fallbackProducts = [];

  if (query) {
    fallbackProducts = searchProducts(query);
  }

  if (fallbackProducts.length === 0 && category) {
    fallbackProducts = getProductsByCategory(category);
  }

  if (fallbackProducts.length === 0) {
    fallbackProducts = products.filter((p) => p.status === "approved").slice(0, 4);
  }

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white text-center pb-20">
      <h1 className="text-6xl font-bold mb-4">Oops!</h1>
      <p className="text-2xl mb-2">We couldn't find what you're looking for.</p>
      <p className="text-white/80 mb-6">
        But don’t worry — here are some suggestions you might like.
      </p>

      <button
        onClick={() => navigate("/products")}
        className="glass-button-primary px-6 py-3 mb-10"
      >
        Browse All Products
      </button>

      {/* Suggested Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl w-full mx-auto">
        {fallbackProducts.map((product) => (
          <div
            key={product.id}
            className="glass-card overflow-hidden hover-lift group"
          >
            <div className="aspect-w-16 aspect-h-12 bg-gradient-to-br from-purple-200 to-pink-200 rounded-t-2xl overflow-hidden">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-lg text-white mb-2 group-hover:text-purple-300 transition-colors line-clamp-1">
                {product.name}
              </h3>
              <p className="text-white/70 text-sm mb-3 line-clamp-2">
                {product.description}
              </p>

              <div className="flex items-center mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-400"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-white/60 text-sm ml-2">
                  ({product.reviewCount})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-white">
                  ${product.price}
                </span>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="glass-button-primary px-3 py-2 text-sm button-3d ripple flex items-center gap-1"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotFound;
