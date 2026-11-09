import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

export default function PromoBanner() {
  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="rounded-3xl overflow-hidden bg-[#18191c] text-white grid md:grid-cols-12 min-h-[440px] shadow-xl">

          {/* Left: Content */}
          <div className="md:col-span-6 lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
            <span className="text-primary text-xs font-bold uppercase tracking-wider mb-4 block">
              Special Promotion
            </span>
            <h2 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight mb-5">
              Big Sound,<br />
              <span className="text-white/90">Bigger Deals.</span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-8 max-w-md">
              Upgrade your audio setup with our top-tier noise-cancelling headphones and true wireless earbuds. Enjoy crystal-clear acoustic precision and all-day battery life.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/shop" className="btn-primary">
                <span>Shop All Products</span>
                <FiArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Right: Lifestyle Imagery */}
          <div className="md:col-span-6 lg:col-span-5 relative bg-[#22242a] min-h-[300px] md:min-h-full">
            <img
              src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80"
              alt="Premium Headphones Collection"
              loading="lazy"
              className="w-full h-full object-cover"
            />
            {/* Sale Tag */}
            <div className="absolute top-6 right-6 bg-primary text-white text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full shadow-lg">
              Up to 30% Off
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
