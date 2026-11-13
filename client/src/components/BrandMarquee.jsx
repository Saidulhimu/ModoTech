import { Link } from 'react-router-dom';
import { FiCheckCircle, FiShield, FiArrowRight } from 'react-icons/fi';

const BRANDS = [
  { name: 'Apple', logo: ' Apple', sub: 'Authorized Reseller', search: 'Apple' },
  { name: 'Sony', logo: 'SONY', sub: 'Hi-Res Audio & Imaging', search: 'Sony' },
  { name: 'Anker', logo: 'ANKER', sub: 'GaNPrime Charging', search: 'Anker' },
  { name: 'Keychron', logo: 'KEYCHRON', sub: 'Custom Keyboards', search: 'Keychron' },
  { name: 'Logitech', logo: 'logitech G', sub: 'Desk & Gaming Gear', search: 'Logitech' },
  { name: 'Samsung', logo: 'SAMSUNG', sub: 'Galaxy Ecosystem', search: 'Samsung' },
  { name: 'Belkin', logo: 'belkin', sub: 'Apple MFi Certified', search: 'Belkin' },
  { name: 'Ugreen', logo: 'UGREEN', sub: 'Nexode GaN Chargers', search: 'Ugreen' },
  { name: 'Marshall', logo: 'Marshall', sub: 'Iconic Sound Amplifiers', search: 'Marshall' },
  { name: 'SanDisk', logo: 'SanDisk', sub: 'Extreme PRO Storage', search: 'SanDisk' },
  { name: 'Nothing', logo: '(NOTHING)', sub: 'Ear & Phone Hardware', search: 'Nothing' },
  { name: 'DJI', logo: 'DJI', sub: 'Wireless Audio & Mics', search: 'DJI' },
];

export default function BrandMarquee() {
  // Duplicate list to achieve infinite seamless loop
  const marqueeItems = [...BRANDS, ...BRANDS];

  return (
    <section className="py-10 bg-gradient-to-b from-white to-gray-50/70 border-b border-gray-150 overflow-hidden select-none">
      <div className="container-custom mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-neutral-800">
              Authorized Direct Importers & Global Partners
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
            <FiShield size={13} className="text-primary" />
            <span>100% Genuine Tech • Sealed Factory Boxes • Official BD Warranty</span>
          </div>
        </div>
      </div>

      {/* Infinite Seamless Marquee Ticker with Edge Gradient Fades */}
      <div className="relative w-full overflow-hidden">
        {/* Left Fade Mask */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />

        {/* Right Fade Mask */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

        {/* Scrolling Track */}
        <div className="animate-marquee-infinite flex gap-4 sm:gap-6 py-2">
          {marqueeItems.map((brand, idx) => (
            <Link
              key={`${brand.name}-${idx}`}
              to={`/shop?search=${encodeURIComponent(brand.search)}`}
              className="group flex-shrink-0 flex flex-col items-center justify-center w-48 sm:w-56 px-5 py-4 rounded-2xl bg-white border border-gray-150 shadow-xs hover:border-gray-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <span className="font-black text-gray-800 group-hover:text-primary text-base sm:text-lg tracking-wider transition-colors duration-200">
                {brand.logo}
              </span>
              <span className="text-[10px] text-gray-400 group-hover:text-dark transition-colors font-semibold mt-1">
                {brand.sub}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
