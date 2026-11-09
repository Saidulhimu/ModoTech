import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube, FiArrowRight, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Thanks for subscribing! 🎉', {
      style: { borderRadius: '12px' },
    });
    setEmail('');
  };

  return (
    <footer className="bg-[#121316] text-white pt-12 pb-8 border-t border-white/5">
      <div className="container-custom">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-white/10 items-start">

          {/* Brand Info (Col 1) */}
          <div className="md:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img src="/logo.svg" alt="ModoTech" className="w-8 h-8 rounded-xl shadow-sm" />
              <span className="text-2xl font-black tracking-tight">
                Modo<span className="text-primary">Tech</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Your curated destination for premium electronics, audio gear, and precision-engineered tech accessories.
            </p>
            <div className="flex gap-2.5 pt-1">
              {[
                { icon: <FiInstagram size={16} />, href: '#' },
                { icon: <FiFacebook size={16} />, href: '#' },
                { icon: <FiTwitter size={16} />, href: '#' },
                { icon: <FiYoutube size={16} />, href: '#' },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="w-9 h-9 bg-white/5 hover:bg-primary text-gray-300 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 border border-white/10 hover:border-transparent hover:scale-105"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links (Col 2) */}
          <div className="md:col-span-4 grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-white mb-3">Explore</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><Link to="/shop" className="hover:text-primary transition-colors">All Products</Link></li>
                <li><Link to="/shop?category=AMP Zone" className="hover:text-primary transition-colors">Audio Gear</Link></li>
                <li><Link to="/shop?category=Cable Core" className="hover:text-primary transition-colors">Fast Chargers</Link></li>
                <li><Link to="/shop?category=Smart Hold" className="hover:text-primary transition-colors">Phone Mounts</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-white mb-3">Support</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><Link to="/track-order" className="hover:text-primary transition-colors">Track Order</Link></li>
                <li><Link to="/cart" className="hover:text-primary transition-colors">Shopping Cart</Link></li>
                <li><Link to="/wishlist" className="hover:text-primary transition-colors">My Wishlist</Link></li>
                <li><Link to="/login" className="hover:text-primary transition-colors">Account Login</Link></li>
              </ul>
            </div>
          </div>

          {/* Newsletter (Col 3) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-bold text-sm uppercase tracking-wider text-white mb-2">Stay in the Loop</h4>
            <p className="text-gray-400 text-xs sm:text-sm">
              Get 10% off your first order plus early access to limited gadget drops.
            </p>
            <form onSubmit={handleSubscribe} className="flex relative max-w-sm pt-1">
              <input
                type="email"
                placeholder="Enter your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/15 text-white placeholder-gray-500 text-xs sm:text-sm px-4 py-3 rounded-full focus:outline-none focus:border-primary transition-all pr-12"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-2.5 w-8 h-8 bg-primary hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105"
                title="Subscribe"
              >
                <FiArrowRight size={14} />
              </button>
            </form>
            <div className="flex items-center gap-2 text-[11px] text-gray-500 pt-1">
              <FiShield size={12} className="text-emerald-400" />
              <span>No spam. Unsubscribe anytime.</span>
            </div>
          </div>

        </div>

        {/* Minimal Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} ModoTech Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="#" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
            <Link to="/track-order" className="hover:text-primary transition-colors">Order Status</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
