// src/api.js
const BASE_URL = "http://localhost:5000/api"; // adjust path based on your backend routes

export const fetchProducts = async () => {
  try {
    const response = await fetch(`${BASE_URL}/products`);
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    return await response.json();
  } catch (error) {
    console.error("API error:", error.message);
    return [];
  }
};

export const createProduct = async (product) => {
  try {
    const response = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    });
    if (!response.ok) {
      throw new Error("Failed to create product");
    }
    return await response.json();
  } catch (error) {
    console.error("API error:", error.message);
    throw error;
  }
};

export const updateProduct = async (id, product) => {
  const response = await fetch(`http://localhost:5000/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!response.ok) throw new Error("Failed to update product");
  return await response.json();
};

export const deleteProduct = async (id) => {
  const response = await fetch(`http://localhost:5000/api/products/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete product");
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await fetch("http://localhost:5000/api/upload", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Image upload failed");
  return (await response.json()).url;
};
