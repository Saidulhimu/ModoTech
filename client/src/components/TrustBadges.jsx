import { FiTruck, FiShield, FiCheckCircle, FiRotateCcw } from 'react-icons/fi';

const badges = [
  {
    icon: <FiTruck size={22} />,
    title: 'Free BD Shipping',
    desc: 'Doorstep delivery on orders ৳2,000+',
    badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
  },
  {
    icon: <FiShield size={22} />,
    title: 'Official Warranty',
    desc: '100% Factory sealed genuine tech',
    badgeColor: 'bg-blue-50 text-blue-600 border-blue-200/60',
  },
  {
    icon: <FiCheckCircle size={22} />,
    title: 'Secure Checkout',
    desc: 'Cash on delivery & bKash verified',
    badgeColor: 'bg-purple-50 text-purple-600 border-purple-200/60',
  },
  {
    icon: <FiRotateCcw size={22} />,
    title: '7-Day Replacement',
    desc: 'Hassle-free instant claim support',
    badgeColor: 'bg-rose-50 text-rose-600 border-rose-200/60',
  },
];

export default function TrustBadges() {
  return (
    <section className="relative z-30 -mt-8 sm:-mt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-6">
      <div className="bg-white rounded-3xl shadow-[0_15px_45px_rgba(0,0,0,0.06)] border border-gray-150 p-5 sm:p-7 backdrop-blur-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-0 lg:divide-x lg:divide-gray-150">
          {badges.map((b) => (
            <div
              key={b.title}
              className="flex items-center gap-3.5 lg:px-6 first:lg:pl-2 last:lg:pr-2 group transition-transform duration-300 hover:translate-x-1"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border transition-all duration-300 group-hover:scale-105 shadow-xs ${b.badgeColor}`}
              >
                {b.icon}
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="font-black text-dark text-sm tracking-tight text-neutral-900">
                  {b.title}
                </h4>
                <p className="text-gray-500 text-xs mt-0.5 font-medium leading-relaxed">
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
