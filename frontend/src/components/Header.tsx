'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Search, User, Sun, Moon, Menu, X, ChevronDown } from 'lucide-react';
import { useTheme } from '@teispace/next-themes';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import API from '@/lib/api';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { cartCount, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  
  // Category states
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [activeMobileCat, setActiveMobileCat] = useState<string | null>(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await API.get('/categories');
        if (res.data?.success) {
          setDbCategories(res.data.categories);
        }
      } catch (err) {
        console.warn('API error loading header categories.');
      }
    };
    fetchCats();
  }, []);

  const buildCategoryTree = () => {
    const level1 = dbCategories.filter(c => !c.parent);
    if (level1.length === 0) {
      // Fallback default structure
      return [
        {
          _id: 'Men', name: 'Men',
          subCategories: [
            { _id: 'Men-Tops', name: 'Tops', subSubCategories: [] },
            { _id: 'Men-Bottoms', name: 'Bottoms', subSubCategories: [] },
            { _id: 'Men-Shoes', name: 'Shoes', subSubCategories: [] }
          ]
        },
        {
          _id: 'Women', name: 'Women',
          subCategories: [
            { _id: 'Women-Tops', name: 'Tops', subSubCategories: [] },
            { _id: 'Women-Bottoms', name: 'Bottoms', subSubCategories: [] },
            { _id: 'Women-Shoes', name: 'Shoes', subSubCategories: [] }
          ]
        },
        {
          _id: 'Child', name: 'Child',
          subCategories: [
            { _id: 'Child-Tops', name: 'Tops', subSubCategories: [] },
            { _id: 'Child-Bottoms', name: 'Bottoms', subSubCategories: [] },
            { _id: 'Child-Shoes', name: 'Shoes', subSubCategories: [] }
          ]
        }
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

  const categoryTree = buildCategoryTree();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* ANNOUNCEMENT BAR */}
      <div className="w-full bg-blush text-mid text-center py-2 px-4 text-xs tracking-[0.12em] font-medium z-50 relative select-none">
        FREE SHIPPING ON ORDERS ABOVE ₹199 <span className="mx-2 text-rose">✦</span> USE CODE BEHEN10 FOR 10% OFF
      </div>

      {/* HEADER NAV */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 border-b border-border-custom/50 w-full ${
          isScrolled
            ? 'bg-background/85 backdrop-blur-md py-3 shadow-sm'
            : 'bg-background py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between relative">
          
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              href="/shop"
              className={`text-xs tracking-widest font-semibold hover:text-rose transition-colors duration-200 ${
                pathname === '/shop' && !router ? 'text-rose' : 'text-foreground'
              }`}
            >
              SHOP ALL
            </Link>

            {/* Render Category hierarchy dynamically */}
            {categoryTree.map(l1 => (
              <div key={l1._id} className="relative group py-2">
                <Link
                  href={`/shop?category=${l1._id}`}
                  className="text-xs tracking-widest font-semibold hover:text-rose text-foreground transition-colors duration-200 uppercase flex items-center gap-1 cursor-pointer"
                >
                  {l1.name} <ChevronDown size={10} className="text-light-brown group-hover:text-rose transition-colors" />
                </Link>
                
                {l1.subCategories && l1.subCategories.length > 0 && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-[480px] bg-background border border-border-custom p-6 rounded-2xl shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 grid grid-cols-3 gap-6">
                    {l1.subCategories.map((l2: any) => (
                      <div key={l2._id} className="space-y-2 text-left">
                        <Link 
                          href={`/shop?category=${l2._id}`}
                          className="font-bold text-xs uppercase text-foreground hover:text-rose transition-colors block border-b border-border-custom/30 pb-1"
                        >
                          {l2.name}
                        </Link>
                        {l2.subSubCategories && l2.subSubCategories.length > 0 && (
                          <div className="space-y-1.5">
                            {l2.subSubCategories.map((l3: any) => (
                              <Link
                                key={l3._id}
                                href={`/shop?category=${l3._id}`}
                                className="block text-[11px] text-mid hover:text-rose font-medium transition-colors"
                              >
                                {l3.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <Link
              href="/shop?isNewIn=true"
              className="text-xs tracking-widest font-semibold hover:text-rose transition-colors duration-200 text-foreground"
            >
              NEW IN
            </Link>
            <Link
              href="/shop?isBestseller=true"
              className="text-xs tracking-widest font-semibold hover:text-rose transition-colors duration-200 text-foreground"
            >
              BESTSELLERS
            </Link>
            <Link
              href="/about"
              className={`text-xs tracking-widest font-semibold hover:text-rose transition-colors duration-200 ${
                pathname === '/about' ? 'text-rose' : 'text-foreground'
              }`}
            >
              ABOUT
            </Link>
          </nav>

          {/* MOBILE BURGER (Left) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-foreground hover:text-rose transition-colors cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* LOGO (Center) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center select-none">
            <Link href="/" className="group block">
              <h1 className="font-playfair text-2xl md:text-3xl font-bold tracking-wide text-foreground leading-none">
                behencode<span className="text-rose inline-block group-hover:scale-125 transition-transform duration-300 ml-0.5">♡</span>
              </h1>
              <p className="text-[8px] md:text-[9px] tracking-[0.2em] uppercase text-light-brown mt-1">
                where she is free to be all of her
              </p>
            </Link>
          </div>

          {/* NAV RIGHT */}
          <div className="flex items-center gap-4 md:gap-5">
            {/* Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-foreground hover:text-rose transition-colors p-1 cursor-pointer"
              title="Search"
            >
              <Search size={18} />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-foreground hover:text-rose transition-colors p-1 cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User Dropdown / Login link */}
            <div className="relative">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="w-7 h-7 rounded-full bg-rose/15 text-rose flex items-center justify-center font-bold text-[10px] uppercase border border-rose/25 cursor-pointer hover:bg-rose hover:text-white transition-all select-none"
                    title={user.username}
                  >
                    {user.username.slice(0, 2)}
                  </button>
                  {isUserDropdownOpen && (
                    <>
                      {/* Backdrop to close dropdown on click outside */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsUserDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2.5 w-48 bg-background border border-border-custom p-2 rounded-2xl shadow-xl z-50 animate-fadeIn">
                        <div className="px-3 py-2 border-b border-border-custom/50 mb-1 select-none">
                          <p className="text-[10px] font-bold text-light-brown uppercase tracking-wider">Signed in as</p>
                          <p className="text-xs font-bold text-foreground truncate">{user.username}</p>
                          <p className="text-[9px] text-light-brown truncate mt-0.5">{user.email}</p>
                        </div>
                        {user.role === 'admin' && (
                          <Link
                            href="/admin/dashboard"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex w-full items-center px-3 py-2 text-xs font-semibold text-foreground hover:bg-cream/45 hover:text-rose rounded-xl transition-colors"
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            setIsUserDropdownOpen(false);
                            router.push('/');
                          }}
                          className="flex w-full items-center text-left px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50/50 rounded-xl transition-colors cursor-pointer"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-foreground hover:text-rose transition-colors p-1 flex items-center justify-center"
                  title="Sign In"
                >
                  <User size={18} />
                </Link>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="text-foreground hover:text-rose transition-colors p-1 relative cursor-pointer"
              title="Cart"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose text-white text-[9px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* SEARCH BAR PANEL */}
      {isSearchOpen && (
        <div className="bg-background/95 border-b border-border-custom z-30 sticky top-[72px] md:top-[84px] py-4 px-4 w-full shadow-inner animate-fadeIn duration-200">
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex gap-3">
            <input
              type="text"
              placeholder="Search tops, bottoms, dresses, coord sets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-border-custom bg-cream rounded-full text-sm focus:outline-none focus:border-rose text-foreground"
              autoFocus
            />
            <button
              type="submit"
              className="bg-rose text-white px-6 py-2 rounded-full text-xs font-semibold hover:bg-mid transition-colors duration-200 cursor-pointer"
            >
              SEARCH
            </button>
          </form>
        </div>
      )}

      {/* MOBILE NAV OVERLAY */}
      {isMobileMenuOpen && (
        <div className={`lg:hidden fixed inset-0 bg-background/95 z-40 backdrop-blur-sm animate-fadeIn ${isScrolled ? 'top-[96px]' : 'top-[112px]'}`}>
          <nav className="flex flex-col items-center gap-6 py-12 px-6">
            <Link
              href="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm tracking-widest font-semibold hover:text-rose text-foreground uppercase border-b border-border-custom/30 w-full text-center pb-2"
            >
              SHOP ALL
            </Link>

            {/* Mobile dynamic categories */}
            {categoryTree.map(l1 => {
              const isOpen = activeMobileCat === l1._id;
              return (
                <div key={l1._id} className="w-full text-center">
                  <button
                    onClick={() => setActiveMobileCat(isOpen ? null : l1._id)}
                    className="w-full text-sm tracking-widest font-semibold text-foreground uppercase flex items-center justify-center gap-1 py-1"
                  >
                    {l1.name} <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isOpen && l1.subCategories && (
                    <div className="bg-cream/20 py-2.5 my-1.5 rounded-xl border border-border-custom/25 space-y-3 animate-fadeIn">
                      {l1.subCategories.map((l2: any) => (
                        <div key={l2._id} className="space-y-1">
                          <Link
                            href={`/shop?category=${l2._id}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-xs font-bold text-foreground block hover:text-rose"
                          >
                            — {l2.name} —
                          </Link>
                          {l2.subSubCategories && (
                            <div className="flex flex-wrap justify-center gap-2 px-4 py-1">
                              {l2.subSubCategories.map((l3: any) => (
                                <Link
                                  key={l3._id}
                                  href={`/shop?category=${l3._id}`}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="text-[10px] bg-cream text-mid px-2 py-0.5 rounded-full border border-border-custom/30 hover:text-rose hover:border-rose"
                                >
                                  {l3.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <Link
              href="/shop?isNewIn=true"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg tracking-widest font-semibold hover:text-rose text-foreground"
            >
              NEW IN
            </Link>
            <Link
              href="/shop?isBestseller=true"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg tracking-widest font-semibold hover:text-rose text-foreground"
            >
              BESTSELLERS
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg tracking-widest font-semibold hover:text-rose text-foreground"
            >
              ABOUT US
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg tracking-widest font-semibold hover:text-rose text-foreground"
            >
              CONTACT
            </Link>

            {/* Mobile Auth Sections */}
            {user ? (
              <div className="flex flex-col items-center gap-4 mt-6 pt-6 border-t border-border-custom/50 w-full max-w-[240px]">
                <p className="text-xs text-light-brown font-bold uppercase select-none">Hi, {user.username}</p>
                {user.role === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm tracking-widest font-semibold hover:text-rose text-foreground uppercase"
                  >
                    Admin panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                    router.push('/');
                  }}
                  className="text-sm tracking-widest font-semibold text-red-500 hover:text-red-400 uppercase cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm tracking-widest font-semibold hover:text-rose text-foreground uppercase mt-6 pt-6 border-t border-border-custom/50 w-full text-center"
              >
                Sign In / Sign Up
              </Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
