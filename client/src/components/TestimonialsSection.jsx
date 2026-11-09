import { FiStar, FiCheckCircle, FiShield, FiHeart } from 'react-icons/fi';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Tanvir Hasan',
    role: 'Full-Stack Developer',
    location: 'Gulshan, Dhaka',
    avatar: 'T',
    rating: 5,
    gadget: 'Keychron K2 Pro Mechanical Keyboard',
    quote:
      'Got my Keychron keyboard delivered within 18 hours inside Dhaka. Sealed original box and the serial number verified instantly on the official site. ModoTech is now my primary tech store.',
  },
  {
    id: 2,
    name: 'Sumaiya Noor',
    role: 'Digital Content Creator',
    location: 'Dhanmondi, Dhaka',
    avatar: 'S',
    rating: 5,
    gadget: 'Sony WH-1000XM5 ANC Headphones',
    quote:
      'Bought the Sony XM5 with the WELCOME10 promo code. The active noise cancelling helps me focus during long video editing marathons. Outstanding sound quality and authentic warranty!',
  },
  {
    id: 3,
    name: 'Mahin Chowdhury',
    role: 'Tech Lead',
    location: 'Agrabad, Chattogram',
    avatar: 'M',
    rating: 5,
    gadget: 'Anker 735 GaN 65W Fast Charger',
    quote:
      'Charges my M3 MacBook Pro, iPad and phone simultaneously without heating up. Outside Dhaka delivery was super smooth via courier with realtime tracking. Highly satisfied!',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-white border-t border-gray-150">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
            <FiHeart size={12} /> Real Community Feedback
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-dark tracking-tight">
            Loved by 15,000+ Tech Enthusiasts Across Bangladesh
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-3">
            Read verified reviews from developers, creators, and audiophiles who trust ModoTech for authentic gadgets.
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {TESTIMONIALS.map((item) => (
            <div
              key={item.id}
              className="bg-gray-50/70 hover:bg-white rounded-3xl p-6 sm:p-8 border border-gray-150 hover:border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Stars */}
                <div className="flex text-amber-400 gap-1 text-sm mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <FiStar key={i} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-6 italic">
                  "{item.quote}"
                </p>
              </div>

              <div>
                {/* Purchased product tag */}
                <div className="text-[11px] font-semibold text-primary bg-primary/5 px-2.5 py-1 rounded-lg mb-4 inline-block">
                  Verified Purchase: {item.gadget}
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3 pt-3 border-t border-gray-200/60">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-rose-500 text-white font-black text-sm flex items-center justify-center shadow-sm">
                    {item.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-dark text-sm">{item.name}</h4>
                      <FiCheckCircle className="text-emerald-500" size={13} title="Verified Buyer" />
                    </div>
                    <p className="text-xs text-gray-400">
                      {item.role} • {item.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Metric Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl bg-dark text-white shadow-2xl">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-black text-primary">15,000+</div>
            <div className="text-xs sm:text-sm text-gray-400 mt-1">Orders Delivered</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-black text-white">4.9 / 5.0</div>
            <div className="text-xs sm:text-sm text-gray-400 mt-1">Customer Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-black text-white">100%</div>
            <div className="text-xs sm:text-sm text-gray-400 mt-1">Authentic Products</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-black text-primary">24 Hours</div>
            <div className="text-xs sm:text-sm text-gray-400 mt-1">Dhaka Fast Dispatch</div>
          </div>
        </div>

      </div>
    </section>
  );
}

