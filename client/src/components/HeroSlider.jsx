import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const slides = [
  {
    id: 1,
    bg: '#6E8A7D', // Sage green from reference
    tag: 'New Arrival',
    title: 'Next-Gen\nSound Experience',
    subtitle: 'Premium wireless headphones engineered for audiophiles. Active noise cancellation with up to 40 hours of playtime.',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
    price: '৳37,500',
    originalPrice: '৳42,000',
    cta: 'Shop Now',
    ctaLink: '/shop?category=AMP Zone',
  },
  {
    id: 2,
    bg: '#8C7B6D', // Warm mocha/bronze
    tag: 'Best Seller',
    title: 'Fast Charging,\nAnywhere.',
    subtitle: 'High-speed 65W GaN wall chargers and durable braided cables built for your everyday laptops and smartphones.',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
    price: '৳7,200',
    originalPrice: '৳8,900',
    cta: 'Explore Cables',
    ctaLink: '/shop?category=Cable Core',
  },
  {
    id: 3,
    bg: '#252930', // Deep obsidian slate
    tag: 'Limited Edition',
    title: 'Smart Mounts\nfor Your Desk',
    subtitle: 'CNC-machined aluminum phone stands and MagSafe car vent mounts designed with 360° dual-axis rotation.',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
    price: '৳2,950',
    originalPrice: '৳3,800',
    cta: 'View Collection',
    ctaLink: '/shop?category=Smart Hold',
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = (index) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);
    setCurrent((index + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(() => goTo(current + 1), 6000);
    return () => clearInterval(timer);
  }, [current]);

  const slide = slides[current];

  return (
    <section
      className="relative w-full min-h-[560px] lg:h-[84vh] lg:max-h-[740px] flex items-center transition-colors duration-700 overflow-hidden pt-20 pb-12"
      style={{ backgroundColor: slide.bg }}
    >
      {/* Left Slider Arrow */}
      <button
        onClick={() => goTo(current - 1)}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 md:w-13 md:h-13 rounded-full bg-black/25 hover:bg-white text-white hover:text-dark backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-105"
        aria-label="Previous Slide"
      >
        <FiChevronLeft size={22} />
      </button>

      {/* Right Slider Arrow */}
      <button
        onClick={() => goTo(current + 1)}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 md:w-13 md:h-13 rounded-full bg-black/25 hover:bg-white text-white hover:text-dark backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-105"
        aria-label="Next Slide"
      >
        <FiChevronRight size={22} />
      </button>

      {/* Main Container */}
      <div className="container-custom w-full relative z-10 px-8 sm:px-12 md:px-16">
        <div className="grid md:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Text */}
          <div
            key={`text-${current}`}
            className={`md:col-span-6 lg:col-span-7 text-white transition-all duration-500 ${
              animating ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'
            }`}
          >
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3.5 py-1.5 rounded-full mb-4 uppercase tracking-widest">
              {slide.tag}
            </span>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4 whitespace-pre-line tracking-tight">
              {slide.title}
            </h1>

            <p className="text-white/85 text-sm sm:text-base lg:text-lg mb-8 max-w-lg leading-relaxed font-normal">
              {slide.subtitle}
            </p>

            <div className="flex items-center gap-3.5 flex-wrap">
              <Link
                to={slide.ctaLink}
                className="bg-white text-dark hover:bg-primary hover:text-white px-7 py-3.5 rounded-full font-bold text-sm tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center gap-2 group"
              >
                <span>{slide.cta}</span>
                <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/shop"
                className="border-2 border-white/60 text-white hover:bg-white/20 hover:border-white px-6 py-3.5 rounded-full font-bold text-sm tracking-wide transition-all duration-300 backdrop-blur-sm"
              >
                View All
              </Link>
            </div>
          </div>

          {/* Right Product Image */}
          <div
            key={`img-${current}`}
            className={`md:col-span-6 lg:col-span-5 flex justify-center transition-all duration-500 ${
              animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            <div className="relative w-full max-w-[420px] aspect-[4/3] sm:aspect-square rounded-3xl overflow-hidden shadow-2xl border-2 border-white/25 bg-black/10">
              <img
                src={slide.image}
                alt={slide.title.replace('\n', ' ')}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />

              {/* Price Pill */}
              <div className="absolute bottom-4 right-4 bg-dark/90 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-2xl shadow-xl flex items-baseline gap-2">
                <span className="text-lg font-black text-white">{slide.price}</span>
                <span className="text-xs text-white/60 line-through">{slide.originalPrice}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? 'bg-white w-7' : 'bg-white/40 hover:bg-white/70 w-2'
            }`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute top-24 right-8 text-white/70 text-xs font-mono tracking-widest hidden md:block bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
        0{current + 1} / 0{slides.length}
      </div>
    </section>
  );
}
