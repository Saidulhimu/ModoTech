import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const categories = [
  {
    name: 'AMP Zone',
    desc: 'Headphones, Earbuds & Speakers',
    itemsCount: '12 Products',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=700&auto=format&fit=crop&q=80',
    link: '/shop?category=AMP Zone',
  },
  {
    name: 'Cable Core',
    desc: 'Fast Chargers, Power Banks & Cables',
    itemsCount: '18 Products',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&auto=format&fit=crop&q=80',
    link: '/shop?category=Cable Core',
  },
  {
    name: 'Smart Hold',
    desc: 'Car Mounts, Desk Stands & Holders',
    itemsCount: '14 Products',
    image: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=700&auto=format&fit=crop&q=80',
    link: '/shop?category=Smart Hold',
  },
  {
    name: 'Smart Shells',
    desc: 'Protective Phone & Laptop Cases',
    itemsCount: '16 Products',
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=700&auto=format&fit=crop&q=80',
    link: '/shop?category=Smart Shells',
  },
];

export default function CategoryGrid() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <span className="text-primary text-xs font-bold uppercase tracking-wider mb-2 block">
              Categories
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-dark tracking-tight">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-sm font-bold text-dark hover:text-primary transition-colors inline-flex items-center gap-1.5 mt-3 sm:mt-0"
          >
            <span>View All Categories</span>
            <FiArrowRight size={15} />
          </Link>
        </div>

        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={cat.link}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-gray-900 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Product Background Image */}
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />

              {/* Natural Dark Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Bottom Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <span className="text-xs text-white/70 font-medium block mb-1">
                  {cat.itemsCount}
                </span>
                <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>{cat.name}</span>
                  <FiArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-xs text-white/80 line-clamp-1 font-normal">
                  {cat.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
