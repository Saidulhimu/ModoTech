import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import HeroSlider from '../components/HeroSlider';
import BrandMarquee from '../components/BrandMarquee';
import CategoryGrid from '../components/CategoryGrid';
import TrustBadges from '../components/TrustBadges';
import PromoBanner from '../components/PromoBanner';
import ProductCard from '../components/ProductCard';
import TestimonialsSection from '../components/TestimonialsSection';
import productService from '../services/productService';
import { demoProducts } from '../data/demoProducts';

export default function Home() {
  // Instant Initial State (Zero layout shift & 0ms instant display)
  const [featuredProducts, setFeaturedProducts] = useState(() =>
    demoProducts.filter((p) => p.isFeatured).slice(0, 8)
  );

  useEffect(() => {
    let isMounted = true;
    productService.getFeaturedProducts(8).then((products) => {
      if (isMounted && products?.length > 0) {
        setFeaturedProducts(products);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full">
      {/* 1. Hero Showcase Carousel */}
      <HeroSlider />

      {/* 2. Floating Trust Badges & Customer Guarantees */}
      <TrustBadges />

      {/* 3. Top Tech Brands Monochromatic Infinite Marquee */}
      <BrandMarquee />

      {/* 4. Category Grid */}
      <CategoryGrid />

      {/* 5. Promotional Split Banner */}
      <PromoBanner />

      {/* 6. Curated Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-primary font-bold uppercase tracking-widest text-xs mb-2">Curated For You</p>
              <h2 className="section-title">Shop the Look</h2>
            </div>
            <Link to="/shop" className="btn-outline hidden md:inline-flex">
              View All <FiArrowRight />
            </Link>
          </div>

          {/* Instant Grid - Never blocks or hangs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <div className="text-center mt-10 md:hidden">
            <Link to="/shop" className="btn-outline">
              View All Products <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Verified Customer Reviews & Community Testimonials */}
      <TestimonialsSection />
    </div>
  );
}
