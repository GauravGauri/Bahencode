'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Plus, Minus, ShoppingBag, ArrowLeft, Shield, RotateCcw, Truck, ChevronDown } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import API from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { getImageUrl } from '@/lib/utils';

// Import swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Fallback product catalog
const MOCK_CATALOG = [
  {
    _id: 'mock-1',
    name: 'Lilac Breeze Peplum Top',
    description: 'A charming floral peplum top crafted from breathable cotton, featuring adjustable tie straps and a sweet sweetheart neckline.',
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
    description: 'High-waisted retro flared denim bell bottoms in a gorgeous blush wash. Extremely soft and stretchy for all-day comfort.',
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
    description: 'Flowy tired maxi dress in soft sage green. Perfect for beach strolls or casual brunch dates with your girls.',
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
    description: 'Matching lightweight printed linen set consisting of a relaxed-fit blazer and structured high-waist shorts.',
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
    description: 'Cozy and warm cable knit sweater in cinnamon brown. Features a slightly oversized fit and ribbed cuffs.',
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
    description: 'Elegant midi dress cut from premium rosewood satin. Has a flattering cowl neck and subtle thigh-high side slit.',
    price: 2899,
    category: 'Dresses',
    images: ['https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop'],
    isNewIn: false,
    isBestseller: true,
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L'],
  },
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  
  // Unwrap Next.js 16 params promise
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  // State Management
  const [product, setProduct] = useState<any>(null);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('details');
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        // Try getting target product
        let targetProduct = null;
        try {
          const res = await API.get(`/products/${productId}`);
          if (res.data && res.data.product) {
            targetProduct = res.data.product;
          }
        } catch (err) {
          console.warn('API error fetching product. Using mock catalog fallback.');
        }

        // Fallback to mock product
        if (!targetProduct) {
          targetProduct = MOCK_CATALOG.find((p) => p._id === productId);
        }

        if (targetProduct) {
          setProduct(targetProduct);
          setSelectedSize(targetProduct.sizes?.[0] || 'S');

          // Fetch recommended catalog
          let catalog = [...MOCK_CATALOG];
          try {
            const resAll = await API.get('/products');
            if (resAll.data && resAll.data.products && resAll.data.products.length > 0) {
              catalog = resAll.data.products;
            }
          } catch (e) {}

          const recs = catalog.filter((p) => p._id !== productId && p.category === targetProduct.category);
          setRecommended(recs.length > 0 ? recs : catalog.filter((p) => p._id !== productId).slice(0, 4));
        }
      } catch (err) {
        console.error('Fatal details loader error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose mx-auto"></div>
        <p className="text-xs text-light-brown mt-4 tracking-widest">LOADING PRODUCT DETAILS...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <span className="text-4xl">🌸</span>
        <h3 className="font-playfair text-xl font-bold mt-4">Product Not Found</h3>
        <p className="text-xs text-light-brown mt-2">The outfit you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => router.push('/shop')}
          className="mt-6 bg-rose text-white text-xs tracking-widest font-semibold px-6 py-2.5 rounded-full hover:bg-mid"
        >
          BACK TO SHOP
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity);
  };

  const hasDiscount = !!product.discountPrice;
  const currentPrice = hasDiscount ? product.discountPrice : product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      
      {/* Back to shop navigation */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-bold text-mid hover:text-rose mb-8 transition-colors uppercase tracking-wider cursor-pointer"
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-20">
        
        {/* LEFT COLUMN: IMAGES */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-cream/40 rounded-2xl p-2 border border-border-custom/30 overflow-hidden relative">
            
            {/* Main image gallery */}
            {product.images && product.images.length > 0 ? (
              <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                className="aspect-[3/4] w-full rounded-xl overflow-hidden"
              >
                {product.images.map((img: string, idx: number) => (
                  <SwiperSlide key={idx}>
                    <img
                      src={getImageUrl(img)}
                      alt={`${product.name}-${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="aspect-[3/4] w-full rounded-xl bg-cream flex items-center justify-center text-xs text-light-brown">
                No images uploaded
              </div>
            )}

            {/* Custom overlays */}
            {product.isNewIn && (
              <span className="absolute top-6 left-6 bg-rose text-white text-[9px] tracking-widest font-bold px-3 py-1 rounded-full uppercase z-10 shadow-sm">
                New In
              </span>
            )}
            {product.isBestseller && (
              <span className="absolute top-6 left-6 bg-mid text-white text-[9px] tracking-widest font-bold px-3 py-1 rounded-full uppercase z-10 shadow-sm">
                Best Seller
              </span>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: INFORMATION & CART CONTROL */}
        <div className="lg:col-span-5 space-y-8 flex flex-col justify-start">
          <div>
            <p className="text-[10px] tracking-widest text-light-brown uppercase mb-1 font-bold">
              {product.category}
            </p>
            <h1 className="font-playfair text-3xl md:text-4xl font-bold tracking-wide text-foreground">
              {product.name}
            </h1>
            
            {/* Price display */}
            <div className="mt-4 flex items-center gap-3">
              {hasDiscount ? (
                <>
                  <span className="text-sm line-through text-light-brown">₹{product.price}</span>
                  <span className="text-xl font-bold text-rose">₹{product.discountPrice}</span>
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-xs">
                    SAVE {Math.round(((product.price - product.discountPrice!) / product.price) * 100)}%
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-foreground">₹{product.price}</span>
              )}
            </div>
          </div>

          <div className="h-px bg-border-custom/50" />

          {/* SIZES SELECTOR */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs tracking-wider font-bold text-foreground uppercase">
                Select Size
              </span>
              <button
                onClick={() => setActiveAccordion('sizeguide')}
                className="text-[10px] font-bold text-rose hover:underline"
              >
                Size Guide
              </button>
            </div>
            <div className="flex gap-2">
              {['XS', 'S', 'M', 'L', 'XL'].map((size) => {
                const isAvailable = product.sizes?.includes(size);
                return (
                  <button
                    key={size}
                    disabled={!isAvailable}
                    onClick={() => setSelectedSize(size)}
                    className={`w-11 h-11 rounded-full border text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                      !isAvailable
                        ? 'border-border-custom/30 text-border-custom/50 bg-cream/10 cursor-not-allowed line-through'
                        : selectedSize === size
                        ? 'bg-rose border-rose text-white shadow-sm scale-105'
                        : 'border-border-custom bg-cream hover:border-rose text-foreground'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* QUANTITY & ACTIONS */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              
              {/* Quantity counter */}
              <div className="flex items-center border border-border-custom rounded-full w-28 justify-between bg-cream px-1">
                <button
                  onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
                  className="p-2 text-foreground hover:text-rose cursor-pointer"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-semibold text-foreground">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-foreground hover:text-rose cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add to wishlist */}
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="flex-1 max-w-[50px] aspect-square rounded-full border border-border-custom flex items-center justify-center bg-cream hover:border-rose hover:text-rose transition-colors cursor-pointer"
                title="Add to Wishlist"
              >
                <Heart size={18} className={isWishlisted ? 'fill-rose text-rose' : 'text-foreground'} />
              </button>
            </div>

            {/* Add to cart / Sold out button */}
            {product.inStock ? (
              <button
                onClick={handleAddToCart}
                className="w-full bg-rose text-white text-xs tracking-widest font-semibold py-4 rounded-full hover:bg-mid hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag size={16} /> ADD TO BAG
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-border-custom/50 text-light-brown text-xs tracking-widest font-semibold py-4 rounded-full cursor-not-allowed text-center uppercase"
              >
                Out of Stock
              </button>
            )}
          </div>

          <div className="h-px bg-border-custom/50" />

          {/* TRUST BADGES */}
          <div className="grid grid-cols-3 gap-4 text-center py-2 bg-cream/20 rounded-xl border border-border-custom/25">
            <div className="flex flex-col items-center p-2 text-foreground">
              <Truck size={18} className="text-rose mb-1.5" />
              <span className="text-[9px] font-bold tracking-wider uppercase">Free Delivery</span>
            </div>
            <div className="flex flex-col items-center p-2 text-foreground">
              <RotateCcw size={18} className="text-rose mb-1.5" />
              <span className="text-[9px] font-bold tracking-wider uppercase">7-Day Exchange</span>
            </div>
            <div className="flex flex-col items-center p-2 text-foreground">
              <Shield size={18} className="text-rose mb-1.5" />
              <span className="text-[9px] font-bold tracking-wider uppercase">Safe Checkout</span>
            </div>
          </div>

          {/* ACCORDION INFORMATION PANELS */}
          <div className="space-y-2.5">
            
            {/* Description Accordion */}
            <div className="border border-border-custom/50 rounded-lg overflow-hidden bg-cream/10">
              <button
                onClick={() => setActiveAccordion(activeAccordion === 'details' ? null : 'details')}
                className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold tracking-wider text-foreground hover:bg-cream/40 uppercase cursor-pointer"
              >
                <span>Product Details</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${activeAccordion === 'details' ? 'rotate-180' : ''}`} />
              </button>
              {activeAccordion === 'details' && (
                <div className="px-4 pb-4 pt-1 text-xs text-mid leading-relaxed space-y-2 animate-fadeIn">
                  <p>{product.description}</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Premium skin-friendly fabric</li>
                    <li>Crafted with flat-lock seams for pure comfort</li>
                    <li>Ethically sourced and stitched locally in India</li>
                    <li>Machine wash cold, air dry in shade</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Size Guide Accordion */}
            <div className="border border-border-custom/50 rounded-lg overflow-hidden bg-cream/10">
              <button
                onClick={() => setActiveAccordion(activeAccordion === 'sizeguide' ? null : 'sizeguide')}
                className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold tracking-wider text-foreground hover:bg-cream/40 uppercase cursor-pointer"
              >
                <span>Size Guide (inches)</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${activeAccordion === 'sizeguide' ? 'rotate-180' : ''}`} />
              </button>
              {activeAccordion === 'sizeguide' && (
                <div className="px-4 pb-4 pt-1 text-xs text-mid leading-relaxed animate-fadeIn">
                  <table className="w-full border-collapse border border-border-custom text-center">
                    <thead>
                      <tr className="bg-cream">
                        <th className="border border-border-custom p-1.5 font-bold">Size</th>
                        <th className="border border-border-custom p-1.5 font-bold">Bust</th>
                        <th className="border border-border-custom p-1.5 font-bold">Waist</th>
                        <th className="border border-border-custom p-1.5 font-bold">Hip</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-border-custom p-1.5 font-bold text-rose">XS</td>
                        <td className="border border-border-custom p-1.5">32</td>
                        <td className="border border-border-custom p-1.5">26</td>
                        <td className="border border-border-custom p-1.5">35</td>
                      </tr>
                      <tr className="bg-cream/20">
                        <td className="border border-border-custom p-1.5 font-bold text-rose">S</td>
                        <td className="border border-border-custom p-1.5">34</td>
                        <td className="border border-border-custom p-1.5">28</td>
                        <td className="border border-border-custom p-1.5">37</td>
                      </tr>
                      <tr>
                        <td className="border border-border-custom p-1.5 font-bold text-rose">M</td>
                        <td className="border border-border-custom p-1.5">36</td>
                        <td className="border border-border-custom p-1.5">30</td>
                        <td className="border border-border-custom p-1.5">39</td>
                      </tr>
                      <tr className="bg-cream/20">
                        <td className="border border-border-custom p-1.5 font-bold text-rose">L</td>
                        <td className="border border-border-custom p-1.5">38</td>
                        <td className="border border-border-custom p-1.5">32</td>
                        <td className="border border-border-custom p-1.5">41</td>
                      </tr>
                      <tr>
                        <td className="border border-border-custom p-1.5 font-bold text-rose">XL</td>
                        <td className="border border-border-custom p-1.5">40</td>
                        <td className="border border-border-custom p-1.5">34</td>
                        <td className="border border-border-custom p-1.5">43</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="mt-2.5 text-[10px] text-light-brown leading-relaxed text-center">
                    Note: Measure around the fullest part of your body. Standard sizes fit true to size.
                  </p>
                </div>
              )}
            </div>

            {/* Exchange Policy Accordion */}
            <div className="border border-border-custom/50 rounded-lg overflow-hidden bg-cream/10">
              <button
                onClick={() => setActiveAccordion(activeAccordion === 'returns' ? null : 'returns')}
                className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold tracking-wider text-foreground hover:bg-cream/40 uppercase cursor-pointer"
              >
                <span>Returns & Exchanges</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${activeAccordion === 'returns' ? 'rotate-180' : ''}`} />
              </button>
              {activeAccordion === 'returns' && (
                <div className="px-4 pb-4 pt-1 text-xs text-mid leading-relaxed space-y-1.5 animate-fadeIn">
                  <p>We want you to absolutely adore your outfits!</p>
                  <p>
                    <strong>Exchanges:</strong> We offer a 7-day size exchange from the date of delivery. Just drop us an email or use our Contact form, and we will schedule a return pickup.
                  </p>
                  <p>
                    <strong>Returns:</strong> Store credits are provided for any returns. Returns are processed within 3 business days of receiving the package at our warehouses.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* RECOMMENDED PRODUCTS SECTION */}
      {recommended.length > 0 && (
        <section className="border-t border-border-custom/30 pt-16">
          <div className="text-center mb-12">
            <p className="font-caveat text-2xl text-rose mb-1">Tailored for You</p>
            <h2 className="font-playfair text-3xl font-bold tracking-wide text-foreground">
              You May Also Like
            </h2>
          </div>

          <Swiper
            modules={[Navigation]}
            spaceBetween={24}
            slidesPerView={1}
            navigation
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
          >
            {recommended.map((prod) => (
              <SwiperSlide key={prod._id}>
                <div className="group relative bg-background rounded-2xl p-3 border border-border-custom/30 transition-all duration-300 hover:shadow-lg">
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-cream mb-4 border border-border-custom/10">
                    <img
                      src={getImageUrl(prod.images?.[0])}
                      alt={prod.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* Click trigger */}
                    <div className="absolute inset-0 z-0">
                      <Link href={`/products/${prod._id}`} className="absolute inset-0" />
                    </div>
                  </div>

                  <div className="text-center relative z-10">
                    <p className="text-[10px] tracking-widest text-light-brown uppercase mb-1">
                      {prod.category}
                    </p>
                    <Link href={`/products/${prod._id}`}>
                      <h3 className="font-playfair text-sm font-bold text-foreground hover:text-rose transition-colors truncate">
                        {prod.name}
                      </h3>
                    </Link>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      {prod.discountPrice ? (
                        <>
                          <span className="text-xs line-through text-light-brown">₹{prod.price}</span>
                          <span className="text-sm font-bold text-rose">₹{prod.discountPrice}</span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-foreground">₹{prod.price}</span>
                      )}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}

    </div>
  );
}
