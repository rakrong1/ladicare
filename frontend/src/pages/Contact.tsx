import React, { useState } from 'react';
import api from '@/services/api';
import { toast } from '@/components/ui/use-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post('/contact', formData);
      toast({ title: 'Message Sent!', description: "We'll get back to you shortly." });

      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send message. Please try again later.' });
    }
  };

  return (
    <div className="pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
            Contact Us
          </h1>
          <p className="text-xl text-white/80 animate-fade-in">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="glass-card p-8 animate-slide-in-left">
            <h2 className="text-2xl font-semibold text-white mb-6">Send us a Message</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-white font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="glass-input w-full"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-white font-medium mb-2">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="glass-input w-full"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-white font-medium mb-2">Subject *</label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="glass-input w-full"
                  value={formData.subject}
                  onChange={handleChange}
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="product">Product Question</option>
                  <option value="order">Order Support</option>
                  <option value="partnership">Partnership</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-white font-medium mb-2">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="glass-input w-full resize-none"
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="glass-button-primary w-full py-4 font-semibold hover-lift">
                Send Message
              </button>
            </form>
          </div>

          {/* Right Column: Get in Touch + FAQs */}
          <div className="animate-slide-in-right">
            <div className="glass-card p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Get in Touch</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-xl">
                    📍
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Our Location</h3>
                    <p className="text-white/70">
                      123 Beauty Boulevard<br />Suite 456<br />Los Angeles, CA 90210
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-xl">
                    📞
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Phone</h3>
                    <p className="text-white/70">+1 (555) 123-4567</p>
                    <p className="text-white/60 text-sm">Mon-Fri: 9AM-6PM PST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-xl">
                    ✉️
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Email</h3>
                    <p className="text-white/70">hello@ladicare.com</p>
                    <p className="text-white/70">support@ladicare.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-xl">
                    🌐
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Follow Us</h3>
                    <div className="flex gap-3 mt-2">
                      <a href="#" className="glass-button p-2 hover-lift">📘</a>
                      <a href="#" className="glass-button p-2 hover-lift">📷</a>
                      <a href="#" className="glass-button p-2 hover-lift">🐦</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="glass-card p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Frequently Asked Questions</h2>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">How long does shipping take?</h4>
                  <p className="text-white/70 text-sm">Standard shipping takes 3-5 business days. Express is 1-2 days.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">Do you offer returns?</h4>
                  <p className="text-white/70 text-sm">Yes, within 30 days on unopened products with original packaging.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">Are your products cruelty-free?</h4>
                  <p className="text-white/70 text-sm">Absolutely! All products are cruelty-free and many are vegan-friendly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
