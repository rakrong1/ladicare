import "./Hero.css";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__grid">
        {/* Only this container changes */}
        <div className="hero__main-image">
          {/* Desktop: Shows image */}
          <div className="hero__main-img" style={{ backgroundImage: "url('/images/hero1.jpg')" }} />
          {/* Mobile: Shows video (hidden on desktop) */}
          <video 
            className="hero__main-vid"
            muted 
            loop 
            autoPlay 
            playsInline
          >
            <source src="/videos/hero-video.mp4" type="video/mp4" />
          </video>
        </div>
        
        {/* Everything below stays EXACTLY the same */}
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