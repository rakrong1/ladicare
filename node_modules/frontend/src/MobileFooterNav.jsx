import { Link, useLocation } from "react-router-dom";
import { FaHome, FaUser, FaShoppingCart, FaCog } from 'react-icons/fa';
import { motion } from "framer-motion";
import "./MobileFooterNav.css";

export default function MobileFooterNav() {
  const location = useLocation();
  const navLinks = [
    { to: "/", icon: <FaHome />, label: "Shop" },
    { to: "/admin", icon: <FaCog />, label: "Admin" },
    { to: "/cart", icon: <FaShoppingCart />, label: "Cart" },
    {
      to: `/user/${localStorage.getItem("userId") || ""}`,
      icon: <FaUser />,
      label: "Profile",
    },
  ];

  return (
    <nav className="mobile-footer-nav neum">
      {navLinks.map(({ to, icon, label }) => {
        const isActive =
          location.pathname === to ||
          (to.startsWith("/user") && location.pathname.startsWith("/user"));

        return (
          <motion.div
            key={to}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: isActive ? "var(--bg-color)" : "transparent",
              boxShadow: isActive
                ? "inset 3px 3px 5px var(--shadow-dark), inset -3px -3px 5px var(--shadow-light)"
                : "none",
              borderRadius: "12px",
            }}
          >
            <Link to={to}>
              {icon}
              <span>{label}</span>
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}
