'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Grid, Search, Heart, ShoppingBag, X } from 'lucide-react';
import API from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { getImageUrl } from '@/lib/utils';

// Mock catalog fallback
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
  {
    _id: 'mock-7',
    name: 'Peachy Keen Cropped Shirt',
    description: 'Button-down short-sleeve crop shirt in soft pastel peach. Looks adorable paired with high-waist denim.',
    price: 1199,
    category: 'Tops',
    images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop'],
    isNewIn: false,
    isBestseller: false,
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    _id: 'mock-8',
    name: 'Ice Blue Bell Crop Shirt',
    description: 'A structural cropped shirt in an icy blue cotton blend, featuring bell sleeves for added flair.',
    price: 1499,
    category: 'Tops',
    images: ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop'],
    isNewIn: false,
    isBestseller: false,
    inStock: false,
    sizes: ['S', 'M', 'L'],
  },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

function ShopContent() {
  const searchParams = useSearchParams();
  const { addToCart } = useCart();

  // State Management
  const [products, setProducts] = useState<any[]>(MOCK_CATALOG);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>(MOCK_CATALOG);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedSize, setSelectedSize] = useState('');
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sortBy, setSortBy] = useState('newest');
  
  // Wishlist state
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Load products from API or fallback
  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        const res = await API.get('/products');
        if (res.data && res.data.products && res.data.products.length > 0) {
          setProducts(res.data.products);
        }
      } catch (err) {
        console.warn('API error fetching products. Using fallback mock catalog.');
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, []);

  // Load categories from API or fallback
  useEffect(() => {
    const getCategories = async () => {
      try {
        const res = await API.get('/categories');
        if (res.data && res.data.categories) {
          setDbCategories(res.data.categories);
        }
      } catch (err) {
        console.warn('API error fetching categories.');
      }
    };
    getCategories();
  }, []);

  // Update initial filters from search parameters
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);

    const q = searchParams.get('search');
    if (q) setSearchQuery(q);

    const isNew = searchParams.get('isNewIn');
    if (isNew === 'true') setSortBy('newin');

    const isBest = searchParams.get('isBestseller');
    if (isBest === 'true') setSortBy('bestseller');
  }, [searchParams]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];

    // Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter((p) => {
        if (p.category && typeof p.category === 'object') {
          const catId = p.category._id;
          const parentId = p.category.parent?._id;
          const grandParentId = p.category.parent?.parent?._id;
          return (
            catId === selectedCategory ||
            parentId === selectedCategory ||
            grandParentId === selectedCategory ||
            p.category.name === selectedCategory
          );
        }
        return p.category === selectedCategory;
      });
    }

    // Search Query Filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          (p.category && typeof p.category === 'object' 
            ? p.category.name.toLowerCase().includes(query) 
            : p.category.toLowerCase().includes(query))
      );
    }

    // Size Filter
    if (selectedSize !== '') {
      result = result.filter((p) => p.sizes?.includes(selectedSize));
    }

    // Price Filter
    result = result.filter((p) => {
      const price = p.discountPrice || p.price;
      return price <= maxPrice;
    });

    // Sorting Logic
    if (sortBy === 'price-low') {
      result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (sortBy === 'bestseller') {
      result = result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    } else if (sortBy === 'newin') {
      result = result.sort((a, b) => (b.isNewIn ? 1 : 0) - (a.isNewIn ? 1 : 0));
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, searchQuery, selectedSize, maxPrice, sortBy]);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedSize('');
    setMaxPrice(5000);
    setSortBy('newest');
  };

  const buildSidebarCategories = () => {
    const level1 = dbCategories.filter(c => !c.parent);
    if (level1.length === 0) {
      // Mock categories for shop catalog fallback
      return [
        { _id: 'Tops', name: 'Tops' },
        { _id: 'Bottoms', name: 'Bottoms' },
        { _id: 'Dresses', name: 'Dresses' },
        { _id: 'Coord Sets', name: 'Coord Sets' },
        { _id: 'Winter Collection', name: 'Winter Collection' }
      ];
    }
    return level1.map(l1 => {
      const level2 = dbCategories.filter(c => c.parent && c.parent._id === l1._id);
      const subCategories = level2.map(l2 => {
        const level3 = dbCategories.filter(c => c.parent && c.parent._id === l2._id);
        return { ...l2, subSubCategories: level3 };
      });
      return { ...l1, subCategories };
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      
      {/* PAGE HEADER */}
      <div className="text-center mb-12">
        <h2 className="font-playfair text-3xl md:text-5xl font-bold tracking-wide text-foreground">
          {selectedCategory === 'All' ? 'Our Collection' : selectedCategory}
        </h2>
        <p className="font-caveat text-xl text-rose mt-2">
          Sisterhood approved, effortlessly gorgeous
        </p>
      </div>

      {/* FILTER CONTROL BAR */}
      <div className="flex flex-wrap items-center justify-between border-b border-border-custom pb-6 mb-8 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 border border-border-custom px-4 py-2 rounded-full text-xs font-semibold hover:border-rose cursor-pointer"
          >
            <SlidersHorizontal size={14} /> FILTERS
          </button>
          <span className="text-xs text-light-brown font-medium">
            Showing {filteredProducts.length} beautiful items
          </span>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-light-brown font-medium hidden sm:inline">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-border-custom px-4 py-2 rounded-full text-xs font-semibold focus:outline-none focus:border-rose bg-cream text-foreground cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="newin">Arrivals</option>
            <option value="bestseller">Bestsellers</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="w-64 flex-shrink-0 hidden lg:block space-y-8 bg-cream/30 p-6 rounded-2xl border border-border-custom/50">
          
          {/* Search bar */}
          <div>
            <h3 className="text-xs tracking-wider font-bold text-foreground mb-3 uppercase">Search</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Find outfits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-border-custom rounded-full bg-cream text-xs focus:outline-none focus:border-rose text-foreground"
              />
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-light-brown" />
            </div>
          </div>

          {/* Categories list */}
          <div>
            <h3 className="text-xs tracking-wider font-bold text-foreground mb-3 uppercase">Category</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`block text-xs font-medium cursor-pointer transition-colors text-left ${
                  selectedCategory === 'All'
                    ? 'text-rose font-bold'
                    : 'text-mid hover:text-rose'
                }`}
              >
                All Collection
              </button>
              {buildSidebarCategories().map((cat) => (
                <div key={cat._id} className="space-y-1 pl-0.5">
                  <button
                    onClick={() => setSelectedCategory(cat._id)}
                    className={`block text-xs font-bold cursor-pointer transition-colors text-left ${
                      selectedCategory === cat._id ? 'text-rose' : 'text-foreground hover:text-rose'
                    }`}
                  >
                    {cat.name}
                  </button>
                  {cat.subCategories && (
                    <div className="pl-2.5 space-y-1 border-l border-border-custom/30 ml-1">
                      {cat.subCategories.map((sub: any) => (
                        <div key={sub._id}>
                          <button
                            onClick={() => setSelectedCategory(sub._id)}
                            className={`block text-[11px] font-semibold cursor-pointer transition-colors text-left ${
                              selectedCategory === sub._id ? 'text-rose' : 'text-mid hover:text-rose'
                            }`}
                          >
                            {sub.name}
                          </button>
                          {sub.subSubCategories && (
                            <div className="pl-2.5 space-y-0.5 border-l border-border-custom/10 ml-0.5">
                              {sub.subSubCategories.map((subSub: any) => (
                                <button
                                  key={subSub._id}
                                  onClick={() => setSelectedCategory(subSub._id)}
                                  className={`block text-[10px] font-medium cursor-pointer transition-colors text-left ${
                                    selectedCategory === subSub._id ? 'text-rose font-bold' : 'text-light-brown hover:text-rose'
                                  }`}
                                >
                                  {subSub.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sizes filter */}
          <div>
            <h3 className="text-xs tracking-wider font-bold text-foreground mb-3 uppercase">Filter by Size</h3>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                  className={`w-8 h-8 rounded-full border text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                    selectedSize === size
                      ? 'bg-rose border-rose text-white shadow-sm'
                      : 'border-border-custom bg-cream hover:border-rose text-foreground'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Price slider */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs tracking-wider font-bold text-foreground uppercase">Max Price</h3>
              <span className="text-xs font-bold text-rose">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="500"
              max="5000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-rose cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-light-brown mt-1">
              <span>₹500</span>
              <span>₹5,000</span>
            </div>
          </div>

          {/* Clear filters */}
          <button
            onClick={clearFilters}
            className="w-full bg-cream text-foreground border border-border-custom hover:border-rose hover:text-rose text-xs tracking-widest font-semibold py-2.5 rounded-full transition-colors cursor-pointer"
          >
            RESET ALL
          </button>
        </aside>

        {/* PRODUCTS GRID */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-cream rounded-2xl" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-cream/10 rounded-2xl border border-dashed border-border-custom">
              <span className="text-4xl">🍃</span>
              <h3 className="font-playfair text-xl font-bold mt-4 text-foreground">No Outfits Found</h3>
              <p className="text-xs text-light-brown mt-2">
                Try widening your search filters or resetting them to start fresh.
              </p>
              <button
                onClick={clearFilters}
                className="mt-6 bg-rose text-white text-xs tracking-widest font-semibold px-6 py-2.5 rounded-full hover:bg-mid transition-all"
              >
                RESET FILTERS
              </button>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <motion.div
                    layout
                    key={product._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="group relative bg-background rounded-2xl p-2.5 md:p-3.5 border border-border-custom/30 hover:border-border-custom transition-all duration-300 hover:shadow-lg"
                  >
                    {/* Image Wrapper */}
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-cream mb-4 border border-border-custom/10">
                      <img
                        src={getImageUrl(product.images?.[0])}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* Stock Check */}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="bg-dark text-cream text-[10px] tracking-widest font-bold px-3 py-1.5 rounded-full uppercase shadow-md">
                            Sold Out
                          </span>
                        </div>
                      )}

                      {/* Wishlist Button */}
                      <button
                        onClick={() => toggleWishlist(product._id)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 shadow-sm flex items-center justify-center hover:bg-white hover:text-rose transition-colors duration-200 cursor-pointer z-10"
                      >
                        <Heart
                          size={14}
                          className={wishlist.includes(product._id) ? 'fill-rose text-rose' : 'text-foreground'}
                        />
                      </button>

                      {/* Quick Add */}
                      {product.inStock && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[85%] translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                          <button
                            onClick={() => addToCart(product, product.sizes?.[0] || 'S')}
                            className="w-full bg-white text-foreground hover:bg-rose hover:text-white text-[10px] tracking-wider font-bold py-2.5 rounded-lg shadow-md transition-all cursor-pointer"
                          >
                            QUICK ADD
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="px-1 text-center">
                      <p className="text-[10px] tracking-widest text-light-brown uppercase mb-1">
                        {typeof product.category === 'object' && product.category
                          ? product.category.name
                          : product.category}
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

                      {/* Sizing indicators */}
                      <div className="mt-2.5 flex justify-center gap-1">
                        {product.sizes?.map((size: string) => (
                          <span
                            key={size}
                            className="text-[9px] font-bold text-light-brown bg-cream px-1.5 py-0.5 rounded-xs"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* MOBILE FILTERS SIDE DRAWER */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/40 z-50 cursor-pointer lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-80 max-w-full bg-background border-r border-border-custom p-6 z-50 overflow-y-auto lg:hidden"
            >
              <div className="flex justify-between items-center border-b border-border-custom pb-4 mb-6">
                <span className="font-playfair text-lg font-bold text-foreground">Filters</span>
                <button onClick={() => setIsMobileFiltersOpen(false)} className="text-foreground hover:text-rose cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Search */}
                <div>
                  <h3 className="text-xs tracking-wider font-bold text-foreground mb-3 uppercase">Search</h3>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Find outfits..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-border-custom rounded-full bg-cream text-xs focus:outline-none focus:border-rose text-foreground"
                    />
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-light-brown" />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="text-xs tracking-wider font-bold text-foreground mb-3 uppercase">Category</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedCategory('All');
                        setIsMobileFiltersOpen(false);
                      }}
                      className={`block text-xs font-medium cursor-pointer ${
                        selectedCategory === 'All' ? 'text-rose font-bold' : 'text-mid'
                      }`}
                    >
                      All Collection
                    </button>
                    {buildSidebarCategories().map((cat) => (
                      <div key={cat._id} className="pl-1 space-y-1">
                        <button
                          onClick={() => {
                            setSelectedCategory(cat._id);
                            setIsMobileFiltersOpen(false);
                          }}
                          className={`block text-xs font-bold cursor-pointer transition-colors text-left ${
                            selectedCategory === cat._id ? 'text-rose' : 'text-foreground'
                          }`}
                        >
                          {cat.name}
                        </button>
                        {cat.subCategories && (
                          <div className="pl-2 space-y-1 border-l border-border-custom/30">
                            {cat.subCategories.map((sub: any) => (
                              <div key={sub._id}>
                                <button
                                  onClick={() => {
                                    setSelectedCategory(sub._id);
                                    setIsMobileFiltersOpen(false);
                                  }}
                                  className={`block text-[11px] font-semibold cursor-pointer transition-colors text-left ${
                                    selectedCategory === sub._id ? 'text-rose' : 'text-mid'
                                  }`}
                                >
                                  {sub.name}
                                </button>
                                {sub.subSubCategories && (
                                  <div className="pl-2 space-y-0.5">
                                    {sub.subSubCategories.map((subSub: any) => (
                                      <button
                                        key={subSub._id}
                                        onClick={() => {
                                          setSelectedCategory(subSub._id);
                                          setIsMobileFiltersOpen(false);
                                        }}
                                        className={`block text-[10px] font-medium cursor-pointer transition-colors text-left ${
                                          selectedCategory === subSub._id ? 'text-rose font-bold' : 'text-light-brown'
                                        }`}
                                      >
                                        {subSub.name}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <h3 className="text-xs tracking-wider font-bold text-foreground mb-3 uppercase">Sizes</h3>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                        className={`w-8 h-8 rounded-full border text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                          selectedSize === size
                            ? 'bg-rose border-rose text-white shadow-sm'
                            : 'border-border-custom bg-cream text-foreground'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs tracking-wider font-bold text-foreground uppercase">Max Price</h3>
                    <span className="text-xs font-bold text-rose">₹{maxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="5000"
                    step="100"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-rose"
                  />
                </div>

                {/* Buttons */}
                <div className="pt-6 space-y-2">
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="w-full bg-rose text-white text-xs tracking-widest font-semibold py-3 rounded-full hover:bg-mid transition-all"
                  >
                    APPLY FILTERS
                  </button>
                  <button
                    onClick={() => {
                      clearFilters();
                      setIsMobileFiltersOpen(false);
                    }}
                    className="w-full bg-cream text-foreground border border-border-custom text-xs tracking-widest font-semibold py-3 rounded-full hover:border-rose hover:text-rose transition-all"
                  >
                    RESET ALL
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose mx-auto"></div>
        <p className="text-xs text-light-brown mt-4 tracking-widest">LOADING SHOP...</p>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
