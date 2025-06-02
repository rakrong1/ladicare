import { useState } from "react";

export default function AuthForm({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const url =
        mode === "login"
          ? "http://localhost:5000/api/auth/login"
          : "http://localhost:5000/api/auth/signup";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Auth failed");
      if (mode === "login") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", data.username);
        localStorage.setItem("userId", data.userId); // This should now be a real MongoDB _id
        onAuth && onAuth(data);
      } else {
        setMode("login");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>{mode === "login" ? "Login" : "Sign Up"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          id="username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          required
        />
        <button type="submit">{mode === "login" ? "Login" : "Sign Up"}</button>
      </form>
      <button onClick={() => setMode(mode === "login" ? "signup" : "login")}>
        {mode === "login"
          ? "Need an account? Sign Up"
          : "Have an account? Login"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
