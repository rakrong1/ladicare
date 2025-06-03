import "./Header.css";

export default function Header() {
  return (
    <header className="neumorphic-header">
      <div className="header-content">
        <img
          src="/images/logo.jpg" // Change to your logo path if needed
          alt="Logo"
          className="header-logo"
        />
        <h1 className="header-title">Hair Product Store</h1>
      </div>
    </header>
  );
}
