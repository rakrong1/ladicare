import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Shop from "./Shop";
import AdminPanel from "./AdminPanel";
import AuthForm from "./AuthForm";
import UserPage from "./UserPage";
import { useState } from "react";
import MobileFooterNav from "./MobileFooterNav";
import Header from "./Header";
import Hero from "./Hero";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  const handleAuth = () => setIsAuthenticated(true);

  return (
    <>
      <Header />
      <Hero />
      <Header />
      <Router>
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route
            path="/admin"
            element={
              isAuthenticated ? (
                <AdminPanel />
              ) : (
                <AuthForm onAuth={handleAuth} />
              )
            }
          />
          <Route path="/user/:userId" element={<UserPage />} />
        </Routes>
        <MobileFooterNav />
      </Router>
    </>
  );
}

export default App;
