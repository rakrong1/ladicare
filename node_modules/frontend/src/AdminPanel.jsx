import { useState, useEffect } from "react";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} from "./api";

const PAGE_SIZE = 5;

export default function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingPrice, setEditingPrice] = useState("");
  const [editingImage, setEditingImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        return <div>Please log in to view your products.</div>;
      }
      const response = await fetch(`/api/products/user/${userId}`);
      if (!response.ok) {
        setError("Failed to load products.");
        setProducts([]);
        setLoading(false);
        return;
      }
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!name.trim() || !price || isNaN(price)) {
      setError("Please enter a valid name and price.");
      return;
    }
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("No user ID found. Please log in again.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let imageUrl = "";
      if (image) {
        imageUrl = await uploadImage(image);
      }
      const newProduct = await createProduct({
        name,
        price: Number(price),
        image: imageUrl,
        userId,
      });
      setProducts((prev) => [...prev, newProduct]);
      setName("");
      setPrice("");
      setImage(null);
      setSuccess("Product added!");
      setTimeout(() => setSuccess(""), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setSuccess("Product deleted!");
      setTimeout(() => setSuccess(""), 1500);
    } catch (err) {
      setError("Failed to delete product.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditingName(product.name);
    setEditingPrice(product.price);
    setEditingImage(null);
  };

  const handleEdit = async (id) => {
    if (!editingName.trim() || !editingPrice || isNaN(editingPrice)) {
      setError("Please enter a valid name and price.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let imageUrl = "";
      if (editingImage) {
        imageUrl = await uploadImage(editingImage);
      }
      const updatedFields = {
        name: editingName,
        price: Number(editingPrice),
        ...(imageUrl && { image: imageUrl }),
      };
      await updateProduct(id, updatedFields);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
      );
      setEditingId(null);
      setSuccess("Product updated!");
      setTimeout(() => setSuccess(""), 1500);
    } catch (err) {
      setError("Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  // Search and Sort
  const filteredProducts = products
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <div className="admin-controls">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product Name"
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          type="number"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <button onClick={handleAdd} disabled={loading}>
          Add Product
        </button>
      </div>

      <div className="admin-search-sort">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
        </select>
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          {sortOrder === "asc" ? "Asc" : "Desc"}
        </button>
        <button onClick={loadProducts}>Refresh</button>
      </div>

      <ul className="admin-product-list">
        {paginatedProducts.map((p) => (
          <li key={p.id}>
            {editingId === p.id ? (
              <>
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                />
                <input
                  value={editingPrice}
                  onChange={(e) => setEditingPrice(e.target.value)}
                  type="number"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditingImage(e.target.files[0])}
                />
                <button onClick={() => handleEdit(p.id)} disabled={loading}>
                  Save
                </button>
                <button onClick={() => setEditingId(null)} disabled={loading}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.name}
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: "cover",
                      marginRight: 8,
                    }}
                  />
                )}
                <span>
                  {p.name} - ${p.price}
                </span>
                <button onClick={() => startEdit(p)} style={{ marginLeft: 8 }}>
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={loading}
                  style={{ marginLeft: 4 }}
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      <div className="admin-pagination">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Prev
        </button>
        <span>
          {" "}
          Page {page} of {totalPages}{" "}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
