import { FiTruck, FiShield, FiStar, FiRefreshCw } from 'react-icons/fi';

const badges = [
  {
    icon: <FiTruck size={24} />,
    title: 'Free Shipping',
    desc: 'Free delivery on orders over ৳2,000',
    iconBg: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    icon: <FiShield size={24} />,
    title: 'Secure Checkout',
    desc: 'Protected with 256-bit encryption',
    iconBg: 'bg-blue-500/10 text-blue-600',
  },
  {
    icon: <FiStar size={24} />,
    title: '5.0 Star Rating',
    desc: 'Over 10,000+ satisfied customers',
    iconBg: 'bg-amber-500/10 text-amber-600',
  },
  {
    icon: <FiRefreshCw size={24} />,
    title: '30-Day Returns',
    desc: 'Simple, hassle-free return policy',
    iconBg: 'bg-rose-500/10 text-rose-600',
  },
];

export default function TrustBadges() {
  return (
    <section className="relative z-20 -mt-8 sm:-mt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-150 p-6 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-gray-100">
          {badges.map((b) => (
            <div
              key={b.title}
              className="flex items-center gap-4 lg:px-6 first:lg:pl-2 last:lg:pr-2"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${b.iconBg}`}
              >
                {b.icon}
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-dark text-sm sm:text-base tracking-tight truncate">
                  {b.title}
                </h4>
                <p className="text-gray-500 text-xs sm:text-sm line-clamp-1 font-normal">
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
