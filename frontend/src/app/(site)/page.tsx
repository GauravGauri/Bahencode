'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Heart, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import API from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { getImageUrl } from '@/lib/utils';

// Import swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Load Canvas3D dynamically to prevent SSR issues (WebGL relies on browser APIs)
const Canvas3D = dynamic(() => import('@/components/Canvas3D'), { ssr: false });

// Mock products fallback when API fails or DB is not connected
const MOCK_PRODUCTS = [
  {
    _id: 'mock-1',
    name: 'Lilac Breeze Peplum Top',
    price: 1299,
    discountPrice: 1099,
    category: 'Tops',
    images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop'],
    isNewIn: true,
    isBestseller: false,
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    _id: 'mock-2',
    name: 'Seventies Blush Bell Bottoms',
    price: 2199,
    category: 'Bottoms',
    images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop'],
    isNewIn: true,
    isBestseller: true,
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    _id: 'mock-3',
    name: 'Ethereal Dream Sage Maxi',
    price: 3299,
    discountPrice: 2899,
    category: 'Dresses',
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop'],
    isNewIn: false,
    isBestseller: true,
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    _id: 'mock-4',
    name: 'Sunset Boulevard Linen Coord',
    price: 3899,
    category: 'Coord Sets',
    images: ['https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=600&auto=format&fit=crop'],
    isNewIn: true,
    isBestseller: false,
    inStock: true,
    sizes: ['S', 'M', 'L'],
  },
  {
    _id: 'mock-5',
    name: 'Cinnamon Cable Knit Sweater',
    price: 2799,
    category: 'Winter Collection',
    images: ['https://images.unsplash.com/photo-1574164904299-3a102b110380?q=80&w=600&auto=format&fit=crop'],
    isNewIn: true,
    isBestseller: false,
    inStock: true,
    sizes: ['M', 'L', 'XL'],
  },
  {
    _id: 'mock-6',
    name: 'Rosewood Satin Cowl Midi',
    price: 2899,
    category: 'Dresses',
    images: ['https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop'],
    isNewIn: false,
    isBestseller: true,
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L'],
  },
];

const CATEGORIES = [
  { name: 'Tops', count: '12 Items', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Tops' },
  { name: 'Bottoms', count: '8 Items', img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Bottoms' },
  { name: 'Dresses', count: '15 Items', img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Dresses' },
  { name: 'Coord Sets', count: '6 Items', img: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Coord Sets' },
  { name: 'Winter Collection', count: '9 Items', img: 'https://images.unsplash.com/photo-1574164904299-3a102b110380?q=80&w=600&auto=format&fit=crop', link: '/shop?category=Winter Collection' },
];

export default function HomePage() {
  const [products, setProducts] = useState<any[]>(MOCK_PRODUCTS);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await API.get('/products');
        if (response.data && response.data.length > 0) {
          setProducts(response.data);
        }
      } catch (err) {
        console.warn('Backend server not responding. Falling back to high-fidelity mock data.');
      }
    };
    fetchProducts();
  }, []);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const newInProducts = products.filter((p) => p.isNewIn);
  const bestsellerProducts = products.filter((p) => p.isBestseller);

  return (
    <div className="w-full relative overflow-x-hidden">
      
      {/* HERO SECTION */}
      <section className="relative w-full min-h-[90vh] bg-gradient-to-b from-soft-pink/50 via-cream/30 to-background flex flex-col justify-center items-center px-6 py-12 md:py-24">
        {/* 3D Blossoms Canvas Background */}
        <div className="absolute inset-0 z-0 pointer-events-none md:pointer-events-auto">
          <Canvas3D />
        </div>

        {/* Hero Text Content */}
        <div className="relative z-10 text-center max-w-4xl flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-4 inline-block px-4 py-1.5 bg-blush/60 rounded-full border border-border-custom/50 text-xs tracking-[0.2em] font-semibold text-mid uppercase"
          >
            Spring / Summer Collection &apos;26
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.2 }}
            className="font-playfair text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1] mb-6"
          >
            Where she is free <br />
            <span className="font-caveat text-rose text-5xl sm:text-7xl md:text-8xl normal-case font-normal inline-block mt-2">
              to be all of her
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="text-sm sm:text-base text-mid max-w-lg leading-relaxed mb-10 font-medium"
          >
            Effortless, premium clothing built on sisterhood, comfort, and unmatched quality. Designed for every mood of the Indian girl.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/shop"
              className="bg-rose text-white text-xs tracking-widest font-semibold px-8 py-4 rounded-full hover:bg-mid hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 group cursor-pointer"
            >
              EXPLORE SHOP
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/about"
              className="border border-border-custom bg-white/70 hover:bg-cream text-foreground text-xs tracking-widest font-semibold px-8 py-4 rounded-full transition-all duration-300 cursor-pointer"
            >
              OUR STORY
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="py-20 max-w-7xl mx-auto px-4 md:px-8 border-t border-border-custom/30">
        <div className="text-center mb-16">
          <p className="font-caveat text-2xl text-rose mb-2">Beautifully Tailored</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold tracking-wide text-foreground">
            Shop by Category
          </h2>
          <div className="w-16 h-0.5 bg-rose mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Link href={cat.link} className="group block text-center">
                <div className="relative aspect-[3/4] bg-cream rounded-2xl overflow-hidden mb-4 border border-border-custom/30 shadow-sm transition-all duration-500 group-hover:shadow-md group-hover:-translate-y-1">
                  <Image
                    src={cat.img}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                </div>
                <h3 className="font-playfair text-base font-bold text-foreground group-hover:text-rose transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[10px] uppercase tracking-wider text-light-brown mt-0.5">
                  {cat.count}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* NEW IN SECTION (Swiper Carousel) */}
      <section className="py-20 bg-cream/40 border-t border-b border-border-custom/30">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <p className="font-caveat text-2xl text-rose mb-1">Aesthetic Additions</p>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold tracking-wide text-foreground">
                The New In Collection
              </h2>
            </div>
            <Link
              href="/shop?isNewIn=true"
              className="text-xs font-bold tracking-wider text-rose hover:text-mid flex items-center gap-1.5 mt-4 md:mt-0 transition-colors uppercase"
            >
              View All Arrivals <ArrowRight size={14} />
            </Link>
          </div>

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            className="pb-12"
          >
            {newInProducts.map((product) => (
              <SwiperSlide key={product._id}>
                <div className="group relative bg-background rounded-2xl p-3 border border-border-custom/40 transition-all duration-300 hover:shadow-lg">
                  {/* Image wrapper */}
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-cream mb-4">
                    <img
                      src={getImageUrl(product.images?.[0])}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* Badge */}
                    <span className="absolute top-3 left-3 bg-rose text-white text-[9px] tracking-widest font-bold px-2.5 py-1 rounded-full uppercase">
                      New
                    </span>

                    {/* Wishlist Button */}
                    <button
                      onClick={() => toggleWishlist(product._id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center hover:bg-white hover:text-rose transition-colors duration-200 cursor-pointer"
                    >
                      <Heart
                        size={14}
                        className={wishlist.includes(product._id) ? 'fill-rose text-rose' : 'text-foreground'}
                      />
                    </button>

                    {/* Quick Add */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[85%] translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => addToCart(product, product.sizes?.[0] || 'S')}
                        className="w-full bg-white text-foreground hover:bg-rose hover:text-white text-[10px] tracking-wider font-bold py-2.5 rounded-lg shadow-md transition-all cursor-pointer"
                      >
                        QUICK ADD
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="px-1 text-center">
                    <p className="text-[10px] tracking-widest text-light-brown uppercase mb-1">
                      {product.category}
                    </p>
                    <Link href={`/products/${product._id}`}>
                      <h3 className="font-playfair text-sm font-bold text-foreground hover:text-rose transition-colors truncate">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      {product.discountPrice ? (
                        <>
                          <span className="text-xs line-through text-light-brown">₹{product.price}</span>
                          <span className="text-sm font-bold text-rose">₹{product.discountPrice}</span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-foreground">₹{product.price}</span>
                      )}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="py-20 max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <p className="font-caveat text-2xl text-rose mb-2">Most Loved Outfits</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold tracking-wide text-foreground">
            Bestsellers
          </h2>
          <div className="w-16 h-0.5 bg-rose mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {bestsellerProducts.slice(0, 4).map((product) => (
            <div
              key={product._id}
              className="group relative bg-background rounded-2xl p-3 border border-border-custom/30 transition-all duration-300 hover:shadow-lg"
            >
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-cream mb-4">
                <img
                  src={getImageUrl(product.images?.[0])}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Badge */}
                <span className="absolute top-3 left-3 bg-mid text-white text-[9px] tracking-widest font-bold px-2.5 py-1 rounded-full uppercase">
                  Best
                </span>

                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product._id)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center hover:bg-white hover:text-rose transition-colors duration-200 cursor-pointer"
                >
                  <Heart
                    size={14}
                    className={wishlist.includes(product._id) ? 'fill-rose text-rose' : 'text-foreground'}
                  />
                </button>

                {/* Quick Add */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[85%] translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    onClick={() => addToCart(product, product.sizes?.[0] || 'S')}
                    className="w-full bg-white text-foreground hover:bg-rose hover:text-white text-[10px] tracking-wider font-bold py-2.5 rounded-lg shadow-md transition-all cursor-pointer"
                  >
                    QUICK ADD
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="px-1 text-center">
                <p className="text-[10px] tracking-widest text-light-brown uppercase mb-1">
                  {product.category}
                </p>
                <Link href={`/products/${product._id}`}>
                  <h3 className="font-playfair text-sm font-bold text-foreground hover:text-rose transition-colors truncate">
                    {product.name}
                  </h3>
                </Link>
                <div className="mt-2 flex items-center justify-center gap-2">
                  {product.discountPrice ? (
                    <>
                      <span className="text-xs line-through text-light-brown">₹{product.price}</span>
                      <span className="text-sm font-bold text-rose">₹{product.discountPrice}</span>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-foreground">₹{product.price}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PARALLAX / POLAROID STORY SECTION */}
      <section className="py-24 bg-soft-pink/30 border-t border-border-custom/25 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Story Text */}
          <div className="space-y-6 max-w-xl">
            <p className="font-caveat text-3xl text-rose">Sisterhood, Stories & Styles</p>
            <h2 className="font-playfair text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Crafted with Love for the Modern Indian Girl.
            </h2>
            <p className="text-sm text-mid leading-relaxed">
              At **behencode**, we believe clothes are more than just fabrics—they represent comfort, sisterly advice, and the freedom to express every facet of yourself. Every design is built to let you navigate life gracefully, boldy, and effortlessly.
            </p>
            <div className="h-px bg-border-custom/50 w-full" />
            
            <div className="flex gap-8">
              <div>
                <p className="font-playfair text-2xl font-bold text-rose">100%</p>
                <p className="text-[10px] uppercase tracking-wider text-light-brown mt-1">Premium Cottons & Linens</p>
              </div>
              <div>
                <p className="font-playfair text-2xl font-bold text-rose">10k+</p>
                <p className="text-[10px] uppercase tracking-wider text-light-brown mt-1">Happy Sisters (Behens)</p>
              </div>
              <div>
                <p className="font-playfair text-2xl font-bold text-rose">Made in</p>
                <p className="text-[10px] uppercase tracking-wider text-light-brown mt-1">Ethical Indian Boutiques</p>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-rose hover:text-mid transition-colors uppercase border-b-2 border-rose pb-1"
              >
                Read Our Story <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Polaroid collage */}
          <div className="relative h-[480px] md:h-[550px] w-full flex items-center justify-center">
            {/* Card 1 */}
            <motion.div
              initial={{ rotate: -8, x: -40, y: -20 }}
              whileHover={{ rotate: -2, zIndex: 30, scale: 1.05 }}
              className="polaroid-card absolute w-56 md:w-64 z-10"
            >
              <div className="relative aspect-square w-full mb-3 rounded-xs overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=400&auto=format&fit=crop"
                  alt="Behen story"
                  className="object-cover w-full h-full"
                />
              </div>
              <p className="font-caveat text-lg text-center text-foreground font-semibold">
                lazy sundays in lilac ♡
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ rotate: 10, x: 50, y: 30 }}
              whileHover={{ rotate: 3, zIndex: 30, scale: 1.05 }}
              className="polaroid-card absolute w-56 md:w-64 z-20"
            >
              <div className="relative aspect-square w-full mb-3 rounded-xs overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=400&auto=format&fit=crop"
                  alt="Behen story"
                  className="object-cover w-full h-full"
                />
              </div>
              <p className="font-caveat text-lg text-center text-foreground font-semibold">
                matching coord sets, matching energy ✦
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ rotate: -3, x: 10, y: -110 }}
              whileHover={{ rotate: 0, zIndex: 30, scale: 1.05 }}
              className="polaroid-card absolute w-48 md:w-56 z-0 opacity-80"
            >
              <div className="relative aspect-square w-full mb-3 rounded-xs overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=400&auto=format&fit=crop"
                  alt="Behen story"
                  className="object-cover w-full h-full"
                />
              </div>
              <p className="font-caveat text-base text-center text-foreground font-semibold">
                details that matter
              </p>
            </motion.div>
          </div>

        </div>
      </section>

      {/* TRUST BAR / BRAND VALUES */}
      <section className="bg-dark text-cream py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4 justify-center text-center md:text-left">
            <div className="p-3 bg-rose/20 rounded-full text-rose">
              <Truck size={24} />
            </div>
            <div>
              <h3 className="font-playfair text-sm md:text-base font-bold tracking-wide">
                Pan-India Free Shipping
              </h3>
              <p className="text-[11px] text-cream/70 mt-0.5">
                Free standard delivery on all orders above ₹199
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center text-center md:text-left">
            <div className="p-3 bg-rose/20 rounded-full text-rose">
              <RefreshCw size={24} />
            </div>
            <div>
              <h3 className="font-playfair text-sm md:text-base font-bold tracking-wide">
                Easy Exchanges
              </h3>
              <p className="text-[11px] text-cream/70 mt-0.5">
                7-day hassle-free size exchange policy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center text-center md:text-left">
            <div className="p-3 bg-rose/20 rounded-full text-rose">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-playfair text-sm md:text-base font-bold tracking-wide">
                Premium Fabrics Only
              </h3>
              <p className="text-[11px] text-cream/70 mt-0.5">
                Breathable, durable, skin-friendly cottons & knits
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
