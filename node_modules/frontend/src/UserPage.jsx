import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function UserPage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/profile/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setProducts(data.products);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found.</div>;

  return (
    <div>
      <h2>User: {user.username}</h2>
      <h3>Products:</h3>
      <ul>
        {products.map((p) => (
          <li key={p._id}>
            {p.name} - ${p.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
