import React from 'react';

const About = () => {
  return (
    <div className="pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
            About Ladicare
          </h1>
          <p className="text-xl text-white/80 animate-fade-in">
            Empowering natural beauty through premium skincare and cosmetics
          </p>
        </div>

        {/* Story Section */}
        <div className="glass-card p-8 mb-12 animate-fade-in-scale">
          <h2 className="font-display text-3xl font-semibold text-white mb-6">Our Story</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-white/80 text-lg leading-relaxed mb-6">
              Founded with a passion for enhancing natural beauty, Ladicare began as a vision to create 
              premium skincare and cosmetic products that truly make a difference. Our journey started 
              when our founder recognized the need for high-quality, effective beauty products that 
              celebrate and enhance every individual's unique beauty.
            </p>
            <p className="text-white/80 text-lg leading-relaxed">
              Today, we're proud to offer a carefully curated selection of premium beauty products, 
              each chosen for its exceptional quality, effectiveness, and commitment to using the 
              finest ingredients available.
            </p>
          </div>
        </div>

        {/* Mission & Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="glass-card p-8 hover-lift animate-slide-in-left">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-2xl">
              🎯
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4 text-center">Our Mission</h3>
            <p className="text-white/80 text-center">
              To empower individuals to feel confident and beautiful by providing access to 
              premium beauty products that enhance natural radiance and promote self-expression.
            </p>
          </div>

          <div className="glass-card p-8 hover-lift animate-slide-in-right">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-2xl">
              💎
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4 text-center">Our Values</h3>
            <p className="text-white/80 text-center">
              Quality, authenticity, and customer satisfaction are at the heart of everything we do. 
              We believe that beauty comes in all forms and should be accessible to everyone.
            </p>
          </div>
        </div>

        {/* What Sets Us Apart */}
        <div className="glass-card p-8 mb-12 animate-fade-in">
          <h2 className="font-display text-3xl font-semibold text-white mb-8 text-center">
            What Sets Us Apart
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-xl">
                ✨
              </div>
              <h4 className="font-semibold text-white mb-2">Premium Quality</h4>
              <p className="text-white/70 text-sm">
                Every product is carefully selected and tested to meet our high standards
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-xl">
                🌿
              </div>
              <h4 className="font-semibold text-white mb-2">Natural Ingredients</h4>
              <p className="text-white/70 text-sm">
                We prioritize products with natural, sustainable, and ethical ingredients
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-xl">
                🤝
              </div>
              <h4 className="font-semibold text-white mb-2">Expert Curation</h4>
              <p className="text-white/70 text-sm">
                Our beauty experts handpick each product for effectiveness and quality
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="glass-card p-8 animate-fade-in">
          <h2 className="font-display text-3xl font-semibold text-white mb-8 text-center">
            Meet Our Team
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-3xl">
                👩‍💼
              </div>
              <h4 className="font-semibold text-white mb-1">Sarah Johnson</h4>
              <p className="text-purple-300 text-sm mb-2">Founder & CEO</p>
              <p className="text-white/70 text-sm">
                Beauty industry veteran with 15+ years of experience in product development
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-3xl">
                👨‍🔬
              </div>
              <h4 className="font-semibold text-white mb-1">Dr. Michael Chen</h4>
              <p className="text-purple-300 text-sm mb-2">Head of Product Research</p>
              <p className="text-white/70 text-sm">
                Dermatologist and cosmetic scientist specializing in skincare formulation
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-3xl">
                👩‍🎨
              </div>
              <h4 className="font-semibold text-white mb-1">Emma Rodriguez</h4>
              <p className="text-purple-300 text-sm mb-2">Creative Director</p>
              <p className="text-white/70 text-sm">
                Award-winning makeup artist and beauty trend forecaster
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
