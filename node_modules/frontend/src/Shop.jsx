import { useEffect, useState } from "react";
import "./Shop.css";

export default function Shop() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  return (
    <div className="shop-container">
      <h1>Hair Product Store</h1>
      <div className="product-grid">
        {products.map((p) => (
          <div className="product-card" key={p._id}>
            <button className="wishlist-btn" title="Add to wishlist">
              ♥
            </button>
            {p.image && (
              <img
                className="product-image"
                src={`http://localhost:5000${p.image}`}
                alt={p.name}
              />
            )}
            <div className="product-info">
              <span className="product-price">${p.price}</span>
              <span className="product-name">{p.name}</span>
            </div>
            <button className="add-to-cart-btn">Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}
