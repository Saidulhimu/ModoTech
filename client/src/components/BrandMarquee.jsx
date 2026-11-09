import { FiCheckCircle } from 'react-icons/fi';

const BRANDS = [
  { name: 'Apple', tag: 'Official Ecosystem', logoText: ' Apple' },
  { name: 'Sony', tag: 'Audio & Imaging', logoText: 'SONY' },
  { name: 'Anker', tag: 'Charging Tech', logoText: 'ANKER' },
  { name: 'Keychron', tag: 'Custom Keyboards', logoText: 'KEYCHRON' },
  { name: 'Logitech', tag: 'Desk Gear', logoText: 'logitech' },
  { name: 'SanDisk', tag: 'High-speed Storage', logoText: 'SanDisk' },
  { name: 'Belkin', tag: 'MagSafe Tech', logoText: 'belkin' },
  { name: 'Samsung', tag: 'Galaxy Tech', logoText: 'SAMSUNG' },
  { name: 'UGREEN', tag: 'GaN Fast Chargers', logoText: 'UGREEN' },
  { name: 'Marshall', tag: 'Iconic Sound', logoText: 'Marshall' },
];

export default function BrandMarquee() {
  return (
    <section className="py-8 bg-white border-y border-gray-150 overflow-hidden">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <FiCheckCircle className="text-emerald-500" size={14} />
            <span>Authorized Partner & Direct Importer</span>
          </div>
          <span className="text-xs text-gray-400 font-medium">
            100% Genuine Global Warranty • Sealed Factory Boxes
          </span>
        </div>

        {/* Brand Logos Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 lg:gap-6">
          {BRANDS.map((brand) => (
            <div
              key={brand.name}
              className="group p-4 rounded-2xl bg-gray-50/60 hover:bg-white border border-gray-150 hover:border-gray-300 hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer"
            >
              <span className="font-black text-gray-700 group-hover:text-dark text-lg sm:text-xl tracking-wider transition-colors">
                {brand.logoText}
              </span>
              <span className="text-[10px] text-gray-400 group-hover:text-primary transition-colors mt-0.5 font-medium">
                {brand.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

