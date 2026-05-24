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
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Reviews State
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

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

          const getCategoryId = (cat: any) => {
            if (!cat) return '';
            return typeof cat === 'object' ? (cat._id || cat) : cat;
          };
          const recs = catalog.filter((p) => p._id !== productId && getCategoryId(p.category) === getCategoryId(targetProduct.category));
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

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await API.get(`/reviews/product/${productId}`);
        if (res.data?.success) {
          setReviews(res.data.reviews);
        }
      } catch (err) {
        console.warn('Could not load reviews from API. Falling back to mock localStorage reviews.');
        const saved = localStorage.getItem(`reviews-${productId}`);
        if (saved) {
          setReviews(JSON.parse(saved));
        } else {
          const mockReviews = [
            {
              _id: 'mock-rev-1',
              name: 'Aanya Sharma',
              rating: 5,
              comment: 'Absolutely love the fabric quality and fits like a dream! Highly recommended.',
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              _id: 'mock-rev-2',
              name: 'Pooja Patel',
              rating: 4,
              comment: 'Super soft material and gorgeous color. Took 4 days to deliver, otherwise 5 stars.',
              createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            }
          ];
          localStorage.setItem(`reviews-${productId}`, JSON.stringify(mockReviews));
          setReviews(mockReviews);
        }
      }
    };

    if (product) {
      fetchReviews();
    }
  }, [productId, product]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewEmail || !reviewComment) {
      setReviewError('Please fill in all review fields.');
      return;
    }
    setSubmittingReview(true);
    setReviewError('');
    try {
      const res = await API.post(`/reviews/product/${productId}`, {
        name: reviewName,
        email: reviewEmail,
        rating: reviewRating,
        comment: reviewComment,
      });

      if (res.data?.success) {
        setReviews((prev) => [res.data.review, ...prev]);
        
        setProduct((prev: any) => {
          if (!prev) return prev;
          const newNumReviews = (prev.numReviews || 0) + 1;
          const currentTotalRating = (prev.rating || 0) * (prev.numReviews || 0);
          const newRating = Math.round(((currentTotalRating + reviewRating) / newNumReviews) * 10) / 10;
          return {
            ...prev,
            rating: newRating,
            numReviews: newNumReviews,
          };
        });

        setReviewName('');
        setReviewEmail('');
        setReviewRating(5);
        setReviewComment('');
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 5000);
      }
    } catch (err: any) {
      console.warn('API review submit failed. Simulating locally in localStorage.');
      const newReview = {
        _id: 'mock-rev-' + Math.floor(Math.random() * 100000),
        name: reviewName,
        email: reviewEmail,
        rating: reviewRating,
        comment: reviewComment,
        createdAt: new Date().toISOString(),
      };

      const currentReviews = [newReview, ...reviews];
      setReviews(currentReviews);
      localStorage.setItem(`reviews-${productId}`, JSON.stringify(currentReviews));

      setProduct((prev: any) => {
        if (!prev) return prev;
        const newNumReviews = (prev.numReviews || 0) + 1;
        const currentTotalRating = (prev.rating || 0) * (prev.numReviews || 0);
        const newRating = Math.round(((currentTotalRating + reviewRating) / newNumReviews) * 10) / 10;
        return {
          ...prev,
          rating: newRating,
          numReviews: newNumReviews,
        };
      });

      setReviewName('');
      setReviewEmail('');
      setReviewRating(5);
      setReviewComment('');
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
    } finally {
      setSubmittingReview(false);
    }
  };

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
        <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">
          
          {/* Thumbnails list (vertical on desktop, horizontal on mobile) */}
          {product.images && product.images.length > 1 && (
            <div className="flex flex-row md:flex-col gap-2 order-2 md:order-1 overflow-x-auto md:overflow-x-visible md:overflow-y-auto max-h-[500px] py-1 no-scrollbar">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImgIndex(idx)}
                  className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                    activeImgIndex === idx
                      ? 'border-rose shadow-md scale-105'
                      : 'border-border-custom/40 hover:border-rose/50'
                  }`}
                >
                  <img
                    src={getImageUrl(img)}
                    alt={`${product.name}-thumb-${idx}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main image container */}
          <div className="flex-1 bg-cream/40 rounded-2xl p-2 border border-border-custom/30 overflow-hidden relative order-1 md:order-2">
            {product.images && product.images.length > 0 ? (
              <div className="aspect-[3/4] w-full rounded-xl overflow-hidden relative group">
                <img
                  src={getImageUrl(product.images[activeImgIndex])}
                  alt={`${product.name}-main`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="aspect-[3/4] w-full rounded-xl bg-cream flex items-center justify-center text-xs text-light-brown">
                No images uploaded
              </div>
            )}

            {/* Custom overlays */}
            {product.isNewIn && (
              <span className="absolute top-6 right-6 bg-rose text-white text-[9px] tracking-widest font-bold px-3 py-1 rounded-full uppercase z-10 shadow-sm">
                New In
              </span>
            )}
            {product.isBestseller && (
              <span className="absolute top-6 right-6 bg-mid text-white text-[9px] tracking-widest font-bold px-3 py-1 rounded-full uppercase z-10 shadow-sm">
                Best Seller
              </span>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: INFORMATION & CART CONTROL */}
        <div className="lg:col-span-5 space-y-8 flex flex-col justify-start">
          <div>
            <p className="text-[10px] tracking-widest text-light-brown uppercase mb-1 font-bold">
              {typeof product.category === 'object' && product.category
                ? product.category.name
                : product.category}
            </p>
            <h1 className="font-playfair text-3xl md:text-4xl font-bold tracking-wide text-foreground">
              {product.name}
            </h1>

            {/* Stars rating summary */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-500 text-sm">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star}>
                    {star <= Math.round(product.rating || 0) ? '★' : '☆'}
                  </span>
                ))}
              </div>
              <span className="text-[11px] font-bold text-foreground">
                {product.rating ? `${product.rating.toFixed(1)}` : '0.0'}
              </span>
              <span className="text-[10px] text-light-brown font-medium">
                ({product.numReviews || 0} customer reviews)
              </span>
            </div>
            
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
                      {typeof prod.category === 'object' && prod.category
                        ? prod.category.name
                        : prod.category}
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

      {/* REVIEWS & RATINGS SECTION */}
      <section className="border-t border-border-custom/30 pt-16 mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: Stats Summary and write review form */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h2 className="font-playfair text-2xl font-bold text-foreground">Customer Reviews</h2>
              
              <div className="flex items-center gap-4 mt-4">
                <div className="text-4xl font-bold text-rose font-playfair">
                  {product.rating ? product.rating.toFixed(1) : '0.0'}
                </div>
                <div>
                  <div className="flex items-center text-amber-500 text-lg">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>
                        {star <= Math.round(product.rating || 0) ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-light-brown uppercase font-bold tracking-wider mt-0.5">
                    Based on {product.numReviews || 0} customer reviews
                  </p>
                </div>
              </div>
            </div>

            {/* Submit review Form */}
            <div className="bg-cream/20 border border-border-custom/40 rounded-2xl p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">Write a Review</h3>
              
              {submitSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-[11px] font-bold">
                  Thank you! Your review has been submitted successfully.
                </div>
              )}
              {reviewError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-[11px] font-bold">
                  {reviewError}
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-foreground mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="e.g. Priyan"
                      className="w-full px-3 py-2 border border-border-custom rounded-lg bg-background focus:outline-none focus:border-rose text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">Your Email</label>
                    <input
                      type="email"
                      required
                      value={reviewEmail}
                      onChange={(e) => setReviewEmail(e.target.value)}
                      placeholder="priya@example.com"
                      className="w-full px-3 py-2 border border-border-custom rounded-lg bg-background focus:outline-none focus:border-rose text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">Rating</label>
                  <div className="flex gap-1.5 text-xl text-amber-500 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="hover:scale-115 transition-transform cursor-pointer"
                      >
                        {star <= reviewRating ? '★' : '☆'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">Review Comments</label>
                  <textarea
                    rows={4}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience about fabric quality, sizing, and details..."
                    className="w-full px-3 py-2 border border-border-custom rounded-lg bg-background focus:outline-none focus:border-rose text-foreground"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-rose text-white text-[10px] tracking-widest font-semibold py-2.5 rounded-lg hover:bg-mid transition-all cursor-pointer uppercase"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: Reviews List */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Reviews List ({reviews.length})
            </h3>
            
            {reviews.length === 0 ? (
              <div className="text-center py-16 bg-cream/10 border border-dashed border-border-custom/40 rounded-2xl">
                <p className="text-xs text-light-brown">No reviews have been written for this product yet.</p>
                <p className="text-[10px] text-light-brown mt-1">Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {reviews.map((rev) => (
                  <div key={rev._id} className="bg-cream/10 border border-border-custom/40 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-foreground text-xs">{rev.name}</div>
                      <div className="text-[10px] text-light-brown">
                        {new Date(rev.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    
                    <div className="flex text-amber-500 text-xs">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star}>
                          {star <= rev.rating ? '★' : '☆'}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-mid leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
