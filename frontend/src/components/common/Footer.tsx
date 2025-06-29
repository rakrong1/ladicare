import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';

type FooterData = {
  description: string;
  socialLinks: { name: string; url: string; icon: string }[];
  quickLinks: { label: string; href: string }[];
  serviceLinks: { label: string; href: string }[];
  copyright: string;
};

const Footer = () => {
  const [footer, setFooter] = useState<FooterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchFooter = async () => {
  try {
    const res = await api.get('/footer?t=' + Date.now());
    console.log('✅ Footer data:', res.data);
    setFooter(res.data); // <- FIXED HERE
  } catch (err) {
    console.error('❌ Failed to load footer content', err);
  } finally {
    setLoading(false);
  }
};


  fetchFooter();
}, []);


  if (loading) return null;
  if (!footer) {
    return (
      <footer className="py-12 text-center text-white/70">
        Footer content unavailable
      </footer>
    );
  }

  return (
    <footer className="glass-footer mt-20 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-display text-2xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Ladicare
              </span>
            </h3>
            <p className="text-white/80 mb-6 max-w-md">{footer.description}</p>
            <div className="flex space-x-4">
              {footer.socialLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-button p-2 hover-lift text-lg"
                  aria-label={link.name}
                >
                  <span aria-hidden>{link.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {footer.quickLinks.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-purple-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-white mb-4">Customer Service</h4>
            <ul className="space-y-2">
              {footer.serviceLinks.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-purple-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/60 text-sm">{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
