import "./Hero.css";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__grid">
        <div className="hero__main-image" style={{ backgroundImage: "url('/images/hero1.jpg')" }} />
        <div className="hero__secondary-image" style={{ backgroundImage: "url('/images/hero2.jpg')" }} />
        <div className="hero__tertiary-image" style={{ backgroundImage: "url('/images/hero3.jpg')" }} />
      </div>
      
      <div className="hero__content">
        <h1>Transform Your Hair</h1>
        <p>Professional products for salon-quality results at home</p>
        <button>Explore Now →</button>
      </div>
    </section>
  );
}