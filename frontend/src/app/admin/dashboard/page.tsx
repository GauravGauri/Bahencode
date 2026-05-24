'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Mail,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Eye,
  Sliders,
  DollarSign,
  AlertTriangle,
  X,
  Upload,
  CheckCircle2,
  Inbox,
  Users,
  FolderTree
} from 'lucide-react';
import API from '@/lib/api';
import { getImageUrl } from '@/lib/utils';

// Mock DB seeds for offline preview
const PREVIEW_PRODUCTS = [
  {
    _id: 'mock-1',
    name: 'Lilac Breeze Peplum Top',
    description: 'A charming floral peplum top crafted from breathable cotton.',
    price: 1299,
    discountPrice: 1099,
    category: 'Tops',
    images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop'],
    isNewIn: true,
    isBestseller: false,
    inStock: true,
    stockQuantity: 24,
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    _id: 'mock-2',
    name: 'Seventies Blush Bell Bottoms',
    description: 'High-waisted retro flared denim bell bottoms in a gorgeous blush wash.',
    price: 2199,
    category: 'Bottoms',
    images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop'],
    isNewIn: true,
    isBestseller: true,
    inStock: true,
    stockQuantity: 12,
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    _id: 'mock-3',
    name: 'Ethereal Dream Sage Maxi',
    description: 'Flowy tired maxi dress in soft sage green.',
    price: 3299,
    discountPrice: 2899,
    category: 'Dresses',
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop'],
    isNewIn: false,
    isBestseller: true,
    inStock: true,
    stockQuantity: 8,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
];

const PREVIEW_MESSAGES = [
  {
    _id: 'msg-1',
    name: 'Pooja Hegde',
    email: 'pooja@gmail.com',
    subject: 'Exchange size request for Sage Maxi',
    message: 'Hey Behencode! I ordered the Sage Maxi in size M but it is slightly loose around my waist. Can I get a size S exchanged? Order id is BH-489012. Thank you!',
    createdAt: '2026-05-22T10:15:30Z',
  },
  {
    _id: 'msg-2',
    name: 'Ananya Roy',
    email: 'ananya.roy@outlook.com',
    subject: 'Restocking the Lilac Peplum Top',
    message: 'Hello, I wanted to ask when the Lilac Breeze Peplum Top in size XL will be restocked? It is currently sold out. Love your collection so much!',
    createdAt: '2026-05-21T18:42:00Z',
  },
];

const PREVIEW_CATEGORIES = [
  { _id: 'cat-1', name: 'Men', parent: null },
  { _id: 'cat-2', name: 'Women', parent: null },
  { _id: 'cat-3', name: 'T-shirt', parent: null },
  { _id: 'cat-4', name: 'Tops', parent: { _id: 'cat-2', name: 'Women' } },
  { _id: 'cat-5', name: 'Dresses', parent: { _id: 'cat-2', name: 'Women' } },
  { _id: 'cat-6', name: 'T-Shirts (Men)', parent: { _id: 'cat-1', name: 'Men' } },
];

const PREVIEW_USERS = [
  { _id: 'u-1', username: 'kareena_kapoor', email: 'kareena@behencode.co', role: 'admin', createdAt: '2026-05-01T12:00:00Z' },
  { _id: 'u-2', username: 'alia_bhatt', email: 'alia@gmail.com', role: 'user', createdAt: '2026-05-15T15:30:00Z' },
  { _id: 'u-3', username: 'shraddha_kapoor', email: 'shraddha@gmail.com', role: 'user', createdAt: '2026-05-20T09:45:00Z' },
];

const CATEGORIES_FALLBACK = ['Tops', 'Bottoms', 'Dresses', 'Coord Sets', 'Winter Collection'];

export default function AdminDashboard() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'messages' | 'users' | 'categories'>('overview');
  const [mounted, setMounted] = useState(false);

  const formatDate = (dateStr: string, options?: Intl.DateTimeFormatOptions) => {
    if (!mounted || !dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };
  
  // Data States
  const [products, setProducts] = useState<any[]>(PREVIEW_PRODUCTS);
  const [messages, setMessages] = useState<any[]>(PREVIEW_MESSAGES);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Success/Error Feedback Alerts
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Form Fields State
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDiscountPrice, setFormDiscountPrice] = useState('');
  const [formCategory, setFormCategory] = useState('Tops');
  const [formStock, setFormStock] = useState('10');
  const [formSizes, setFormSizes] = useState<string[]>(['S', 'M', 'L']);
  const [formIsNewIn, setFormIsNewIn] = useState(false);
  const [formIsBestseller, setFormIsBestseller] = useState(false);
  
  // Category Form States
  const [formCatName, setFormCatName] = useState('');
  const [formCatParent, setFormCatParent] = useState('');
  
  // Image handling: File Upload vs Text URL
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [imageUrlString, setImageUrlString] = useState('');

  // Auth Guard Verification
  useEffect(() => {
    const token = localStorage.getItem('behencode_admin_token');
    const userStr = localStorage.getItem('behencode_admin_user');
    
    if (!token || !userStr) {
      router.push('/admin/login');
    } else {
      try {
        setAdminUser(JSON.parse(userStr));
      } catch (e) {
        router.push('/admin/login');
      }
    }
  }, [router]);

  // Load all DB products, messages, users, and categories
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Products fetch
      try {
        const prodRes = await API.get('/products');
        if (prodRes.data && prodRes.data.products && prodRes.data.products.length > 0) {
          setProducts(prodRes.data.products);
        }
      } catch (err) {
        console.warn('API connection issue loading products. Using mock fallback list.');
      }

      // Messages fetch
      try {
        const msgRes = await API.get('/contact');
        if (msgRes.data && msgRes.data.messages && msgRes.data.messages.length > 0) {
          setMessages(msgRes.data.messages);
        }
      } catch (err) {
        console.warn('API connection issue loading contact messages. Using mock fallback inbox.');
      }

      // Users fetch
      try {
        const usersRes = await API.get('/auth/users');
        if (usersRes.data && usersRes.data.users) {
          setUsers(usersRes.data.users);
        }
      } catch (err) {
        console.warn('API connection issue loading users. Using mock users.');
        setUsers(PREVIEW_USERS);
      }

      // Categories fetch
      try {
        const catRes = await API.get('/categories');
        if (catRes.data && catRes.data.categories) {
          setCategories(catRes.data.categories);
        }
      } catch (err) {
        console.warn('API connection issue loading categories. Using mock categories.');
        setCategories(PREVIEW_CATEGORIES);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadDashboardData();
  }, []);

  const triggerAlert = (type: 'success' | 'error', text: string) => {
    setAlert({ type, text });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem('behencode_admin_token');
    localStorage.removeItem('behencode_admin_user');
    router.push('/admin/login');
  };

  // Toggle Size Checkbox
  const handleSizeToggle = (size: string) => {
    setFormSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // ADD Product Submit
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formName || !formPrice || !formDescription) {
      triggerAlert('error', 'Please fill in all required fields.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', formName);
      formData.append('description', formDescription);
      formData.append('price', formPrice);
      if (formDiscountPrice) formData.append('discountPrice', formDiscountPrice);
      formData.append('category', formCategory);
      formData.append('stockQuantity', formStock);
      formData.append('isNewIn', String(formIsNewIn));
      formData.append('isBestseller', String(formIsBestseller));
      formData.append('sizes', formSizes.join(','));

      // Attach file images or URL images
      if (imageFiles && imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          formData.append('images', imageFiles[i]);
        }
      } else if (imageUrlString) {
        formData.append('images', imageUrlString);
      } else {
        triggerAlert('error', 'Please supply a product image file or static URL.');
        return;
      }

      // POST product endpoint
      const response = await API.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.success) {
        triggerAlert('success', 'Product added successfully!');
        setIsAddModalOpen(false);
        resetForm();
        loadDashboardData();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message;
      console.warn('API error saving product. Simulating local addition.');
      
      // Simulating addition for preview
      const newMockItem = {
        _id: 'mock-' + Math.floor(Math.random() * 1000),
        name: formName,
        description: formDescription,
        price: Number(formPrice),
        discountPrice: formDiscountPrice ? Number(formDiscountPrice) : undefined,
        category: formCategory,
        sizes: formSizes,
        stockQuantity: Number(formStock),
        inStock: Number(formStock) > 0,
        isNewIn: formIsNewIn,
        isBestseller: formIsBestseller,
        images: [imageUrlString || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop'],
      };

      setProducts((prev) => [newMockItem, ...prev]);
      triggerAlert('success', 'Product simulated successfully (offline mode).');
      setIsAddModalOpen(false);
      resetForm();
    }
  };

  // Open Edit Modal
  const openEditModal = (product: any) => {
    setSelectedProduct(product);
    setFormName(product.name);
    setFormDescription(product.description || '');
    setFormPrice(String(product.price));
    setFormDiscountPrice(product.discountPrice ? String(product.discountPrice) : '');
    setFormCategory(product.category);
    setFormStock(String(product.stockQuantity || 10));
    setFormSizes(product.sizes || ['S', 'M', 'L']);
    setFormIsNewIn(product.isNewIn || false);
    setFormIsBestseller(product.isBestseller || false);
    setImageUrlString(product.images?.[0] || '');
    setImageFiles(null);
    setIsEditModalOpen(true);
  };

  // EDIT Product Submit
  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const formData = new FormData();
      formData.append('name', formName);
      formData.append('description', formDescription);
      formData.append('price', formPrice);
      formData.append('discountPrice', formDiscountPrice);
      formData.append('category', formCategory);
      formData.append('stockQuantity', formStock);
      formData.append('isNewIn', String(formIsNewIn));
      formData.append('isBestseller', String(formIsBestseller));
      formData.append('sizes', formSizes.join(','));

      if (imageFiles && imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          formData.append('images', imageFiles[i]);
        }
      } else {
        formData.append('images', imageUrlString);
      }

      const response = await API.put(`/products/${selectedProduct._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.success) {
        triggerAlert('success', 'Product updated successfully!');
        setIsEditModalOpen(false);
        resetForm();
        loadDashboardData();
      }
    } catch (err: any) {
      console.warn('API error updating product. Simulating local edit.');
      
      setProducts((prev) =>
        prev.map((p) =>
          p._id === selectedProduct._id
            ? {
                ...p,
                name: formName,
                description: formDescription,
                price: Number(formPrice),
                discountPrice: formDiscountPrice ? Number(formDiscountPrice) : undefined,
                category: formCategory,
                stockQuantity: Number(formStock),
                inStock: Number(formStock) > 0,
                isNewIn: formIsNewIn,
                isBestseller: formIsBestseller,
                sizes: formSizes,
                images: [imageUrlString || p.images[0]],
              }
            : p
        )
      );
      triggerAlert('success', 'Product edits simulated (offline mode).');
      setIsEditModalOpen(false);
      resetForm();
    }
  };

  // DELETE Product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await API.delete(`/products/${id}`);
      if (response.data?.success) {
        triggerAlert('success', 'Product deleted successfully!');
        loadDashboardData();
      }
    } catch (err: any) {
      console.warn('API deletion failed. Simulating deletion locally.');
      setProducts((prev) => prev.filter((p) => p._id !== id));
      triggerAlert('success', 'Product deletion simulated (offline mode).');
    }
  };

  // DELETE Contact Inquiry Message
  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Delete this contact inquiry?')) return;

    try {
      const response = await API.delete(`/contact/${id}`);
      if (response.data?.success) {
        triggerAlert('success', 'Message deleted from inbox.');
        loadDashboardData();
      }
    } catch (err: any) {
      console.warn('API contact deletion failed. Simulating deletion locally.');
      setMessages((prev) => prev.filter((m) => m._id !== id));
      triggerAlert('success', 'Message deleted from inbox (offline mode).');
    }
  };

  // Add Category Handler
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCatName.trim()) {
      triggerAlert('error', 'Category name is required.');
      return;
    }
    try {
      const response = await API.post('/categories', {
        name: formCatName,
        parent: formCatParent || null,
      });
      if (response.data?.success) {
        triggerAlert('success', 'Category added successfully!');
        setFormCatName('');
        setFormCatParent('');
        loadDashboardData();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message;
      triggerAlert('error', `Failed to add category: ${errorMsg}`);
    }
  };

  // Delete Category Handler
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? (Subcategories parent reference will be cleared)')) return;
    try {
      const response = await API.delete(`/categories/${id}`);
      if (response.data?.success) {
        triggerAlert('success', 'Category removed successfully!');
        loadDashboardData();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message;
      triggerAlert('error', `Failed to delete category: ${errorMsg}`);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormPrice('');
    setFormDiscountPrice('');
    setFormCategory(categories[0]?.name || 'Tops');
    setFormStock('10');
    setFormSizes(['S', 'M', 'L']);
    setFormIsNewIn(false);
    setFormIsBestseller(false);
    setImageFiles(null);
    setImageUrlString('');
    setSelectedProduct(null);
  };

  // Dashboard Stats Calculations
  const totalProducts = products.length;
  const outOfStockCount = products.filter((p) => !p.inStock || p.stockQuantity <= 0).length;
  const bestsellersCount = products.filter((p) => p.isBestseller).length;
  const newArrivalsCount = products.filter((p) => p.isNewIn).length;
  const messagesCount = messages.length;

  return (
    <div className="min-h-screen bg-cream/20 flex flex-col md:flex-row text-foreground">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-dark text-cream flex flex-col p-6 flex-shrink-0 border-r border-border-custom/20">
        
        {/* App Title */}
        <div className="mb-10 text-center md:text-left select-none">
          <h2 className="font-playfair text-xl font-bold tracking-wide">
            behencode<span className="text-rose">♡</span> CMS
          </h2>
          <p className="text-[8px] tracking-[0.2em] uppercase text-rose mt-1">
            Control Dashboard v1.0
          </p>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-2.5">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-rose text-white shadow-sm'
                : 'hover:bg-cream/10 text-cream/70 hover:text-cream'
            }`}
          >
            <LayoutDashboard size={15} /> Overview
          </button>
          
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-rose text-white shadow-sm'
                : 'hover:bg-cream/10 text-cream/70 hover:text-cream'
            }`}
          >
            <ShoppingBag size={15} /> Products Catalog
          </button>
          
          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === 'messages'
                ? 'bg-rose text-white shadow-sm'
                : 'hover:bg-cream/10 text-cream/70 hover:text-cream'
            }`}
          >
            <Mail size={15} /> Message Inbox
            {messagesCount > 0 && (
              <span className="ml-auto bg-rose text-white text-[9px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center">
                {messagesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-rose text-white shadow-sm'
                : 'hover:bg-cream/10 text-cream/70 hover:text-cream'
            }`}
          >
            <FolderTree size={15} /> Categories
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-rose text-white shadow-sm'
                : 'hover:bg-cream/10 text-cream/70 hover:text-cream'
            }`}
          >
            <Users size={15} /> Registered Users
            {users.length > 0 && (
              <span className="ml-auto bg-rose text-white text-[9px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center">
                {users.length}
              </span>
            )}
          </button>
        </nav>

        {/* User Info & Sign-out */}
        <div className="border-t border-border-custom/10 pt-6 mt-6 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-rose/25 text-rose flex items-center justify-center font-bold text-sm uppercase">
              {adminUser?.username?.slice(0, 1) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">{adminUser?.username || 'Administrator'}</p>
              <p className="text-[9px] text-cream/50 truncate">{adminUser?.email || 'admin@behencode.co'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-500/10 text-red-400 hover:text-red-300 text-xs font-bold rounded-xl tracking-wider uppercase transition-colors cursor-pointer"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        
        {/* HEADER AREA */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border-custom pb-6 mb-8 gap-4">
          <div>
            <h1 className="font-playfair text-3xl font-bold tracking-wide text-foreground">
              {activeTab === 'overview' && 'CMS Overview'}
              {activeTab === 'products' && 'Product Inventory'}
              {activeTab === 'messages' && 'Customer Inquiries'}
              {activeTab === 'categories' && 'Category Management'}
              {activeTab === 'users' && 'Registered Users'}
            </h1>
            <p className="text-xs text-light-brown font-medium mt-1">
              Store status: <span className="text-green-600 font-bold">Online</span> ✦ System operating normally
            </p>
          </div>

          {activeTab === 'products' && (
            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="bg-rose text-white text-xs tracking-widest font-semibold px-5 py-3 rounded-full hover:bg-mid transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={15} /> ADD PRODUCT
            </button>
          )}
        </div>

        {/* FEEDBACK ALERTS */}
        {alert && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border animate-fadeIn ${
            alert.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <CheckCircle2 size={18} />
            <span className="text-xs font-semibold">{alert.text}</span>
          </div>
        )}

        {/* OVERVIEW PANEL */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Widget cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1 */}
              <div className="bg-background border border-border-custom p-6 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="p-4 bg-blush/40 rounded-full text-rose">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-light-brown font-bold">Total Products</p>
                  <p className="font-playfair text-2xl font-bold mt-1">{totalProducts}</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-background border border-border-custom p-6 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="p-4 bg-rose/10 rounded-full text-mid">
                  <Inbox size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-light-brown font-bold">Inbox Messages</p>
                  <p className="font-playfair text-2xl font-bold mt-1">{messagesCount}</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-background border border-border-custom p-6 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="p-4 bg-orange-50 rounded-full text-orange-600">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-light-brown font-bold">Out of Stock</p>
                  <p className="font-playfair text-2xl font-bold mt-1">{outOfStockCount}</p>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-background border border-border-custom p-6 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="p-4 bg-green-50 rounded-full text-green-600">
                  <DollarSign size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-light-brown font-bold">Average Price</p>
                  <p className="font-playfair text-2xl font-bold mt-1">
                    ₹{Math.round(products.reduce((acc, p) => acc + p.price, 0) / (totalProducts || 1))}
                  </p>
                </div>
              </div>

            </div>

            {/* Quick overview lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
              
              {/* Product updates */}
              <div className="bg-background border border-border-custom p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="font-playfair text-base font-bold text-foreground">Recent Products</h3>
                <div className="divide-y divide-border-custom/50">
                  {products.slice(0, 3).map((p) => (
                    <div key={p._id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <img src={getImageUrl(p.images?.[0])} alt={p.name} className="w-10 h-12 object-cover rounded-md bg-cream" />
                        <div>
                          <p className="text-xs font-bold text-foreground truncate max-w-[150px]">{p.name}</p>
                          <p className="text-[9px] uppercase tracking-wider text-light-brown mt-0.5">{p.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-rose">₹{p.discountPrice || p.price}</p>
                        <p className="text-[9px] text-light-brown mt-0.5">Stock: {p.stockQuantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inquiries */}
              <div className="bg-background border border-border-custom p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="font-playfair text-base font-bold text-foreground">Recent Inquiries</h3>
                <div className="divide-y divide-border-custom/50">
                  {messages.slice(0, 2).map((m) => (
                    <div key={m._id} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-foreground">{m.name}</p>
                        <span className="text-[8px] text-light-brown">{formatDate(m.createdAt)}</span>
                      </div>
                      <p className="text-[10px] text-rose font-semibold truncate">{m.subject}</p>
                      <p className="text-[10px] text-mid truncate max-w-[320px]">{m.message}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* PRODUCTS INVENTORY */}
        {activeTab === 'products' && (
          <div className="bg-background border border-border-custom rounded-2xl overflow-hidden shadow-sm animate-fadeIn">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-cream/40 border-b border-border-custom text-foreground font-bold uppercase tracking-wider">
                    <th className="p-4">Outfit</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Original</th>
                    <th className="p-4">Discounted</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Sizes</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-custom/40">
                  {products.map((p) => (
                    <tr key={p._id} className="hover:bg-cream/10 transition-colors">
                      {/* Name & Image */}
                      <td className="p-4 flex items-center gap-3">
                        <img src={getImageUrl(p.images?.[0])} alt={p.name} className="w-10 h-13 object-cover rounded-md bg-cream border border-border-custom/20" />
                        <span className="font-bold text-foreground truncate max-w-[150px]">{p.name}</span>
                      </td>

                      {/* Category */}
                      <td className="p-4 font-semibold text-mid">{p.category}</td>

                      {/* Price */}
                      <td className="p-4 font-bold">₹{p.price}</td>

                      {/* Discount Price */}
                      <td className="p-4 font-bold text-rose">{p.discountPrice ? `₹${p.discountPrice}` : '-'}</td>

                      {/* Stock count & Badge */}
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                          p.stockQuantity > 5
                            ? 'bg-green-50 text-green-600'
                            : p.stockQuantity > 0
                            ? 'bg-yellow-50 text-yellow-600'
                            : 'bg-red-50 text-red-600'
                        }`}>
                          {p.stockQuantity} in stock
                        </span>
                      </td>

                      {/* Sizes */}
                      <td className="p-4">
                        <div className="flex gap-1">
                          {p.sizes?.map((size: string) => (
                            <span key={size} className="bg-cream text-[9px] font-bold px-1.5 py-0.5 rounded-xs text-light-brown">
                              {size}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-2 hover:bg-cream text-mid hover:text-rose rounded-lg transition-colors cursor-pointer"
                            title="Edit Outfit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p._id)}
                            className="p-2 hover:bg-red-50 text-mid hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                            title="Delete Outfit"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* INBOX INQUIRIES */}
        {activeTab === 'messages' && (
          <div className="space-y-6 animate-fadeIn">
            {messages.length === 0 ? (
              <div className="text-center py-20 bg-background rounded-2xl border border-dashed border-border-custom">
                <Mail size={32} className="mx-auto text-light-brown mb-4" />
                <h3 className="font-playfair text-lg font-bold">No Inquiries Found</h3>
                <p className="text-xs text-light-brown mt-1">Customer mailbox is currently empty.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {messages.map((m) => (
                  <div key={m._id} className="bg-background border border-border-custom p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div>
                      {/* Meta header */}
                      <div className="flex justify-between items-start mb-4 border-b border-border-custom/50 pb-3">
                        <div>
                          <h3 className="font-bold text-foreground">{m.name}</h3>
                          <a href={`mailto:${m.email}`} className="text-[10px] text-rose font-medium hover:underline block mt-0.5">
                            {m.email}
                          </a>
                        </div>
                        <span className="text-[9px] text-light-brown">{formatDate(m.createdAt)}</span>
                      </div>
                      
                      {/* Body subject & message */}
                      <p className="text-xs font-bold text-foreground uppercase tracking-wide">{m.subject}</p>
                      <p className="text-xs text-mid leading-relaxed mt-2 p-3 bg-cream/20 rounded-xl border border-border-custom/20 font-medium">
                        &quot;{m.message}&quot;
                      </p>
                    </div>

                    <div className="flex justify-end pt-4 mt-4 border-t border-border-custom/30">
                      <button
                        onClick={() => handleDeleteMessage(m._id)}
                        className="text-light-brown hover:text-red-500 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={13} /> Delete Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REGISTERED USERS */}
        {activeTab === 'users' && (
          <div className="bg-background border border-border-custom rounded-2xl overflow-hidden shadow-sm animate-fadeIn">
            <div className="overflow-x-auto">
              {users.length === 0 ? (
                <div className="text-center py-20 bg-background rounded-2xl border border-dashed border-border-custom">
                  <Users size={32} className="mx-auto text-light-brown mb-4" />
                  <h3 className="font-playfair text-lg font-bold">No Users Found</h3>
                  <p className="text-xs text-light-brown mt-1">There are no registered users on the system.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-cream/40 border-b border-border-custom text-foreground font-bold uppercase tracking-wider">
                      <th className="p-4">User</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-custom/40">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-cream/10 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-rose/10 text-rose flex items-center justify-center font-bold text-sm uppercase">
                            {u.username?.slice(0, 1) || 'U'}
                          </div>
                          <span className="font-bold text-foreground">{u.username}</span>
                        </td>
                        <td className="p-4 font-semibold text-mid">{u.email}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                            u.role === 'admin'
                              ? 'bg-rose/10 text-rose'
                              : 'bg-cream text-light-brown'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-light-brown font-medium">
                          {formatDate(u.createdAt, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn animate-duration-300">
            
            {/* LEFT COLUMN: Add Category Form */}
            <div className="lg:col-span-1 bg-background border border-border-custom p-6 rounded-2xl shadow-sm self-start">
              <h3 className="font-playfair text-lg font-bold text-foreground mb-4">Create Category</h3>
              <form onSubmit={handleAddCategory} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-foreground mb-1.5 uppercase tracking-wider">Category Name</label>
                  <input
                    type="text"
                    value={formCatName}
                    onChange={(e) => setFormCatName(e.target.value)}
                    placeholder="e.g. Tops, Winter Wear"
                    className="w-full px-4 py-2.5 border border-border-custom rounded-xl bg-cream/10 focus:outline-none focus:border-rose text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1.5 uppercase tracking-wider">Parent Category (Optional)</label>
                  <select
                    value={formCatParent}
                    onChange={(e) => setFormCatParent(e.target.value)}
                    className="w-full px-4 py-2.5 border border-border-custom rounded-xl bg-cream/10 focus:outline-none focus:border-rose text-foreground cursor-pointer"
                  >
                    <option value="">None (Top-Level Category)</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-rose text-white text-xs tracking-widest font-semibold py-3.5 rounded-xl hover:bg-mid hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  ADD CATEGORY
                </button>
              </form>
            </div>

            {/* RIGHT COLUMN: Categories List */}
            <div className="lg:col-span-2 bg-background border border-border-custom rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-border-custom/50 flex justify-between items-center">
                <h3 className="font-playfair text-lg font-bold text-foreground">Category List</h3>
                <span className="text-[10px] bg-rose/10 text-rose font-bold px-2.5 py-0.5 rounded-full">
                  {categories.length} Total
                </span>
              </div>
              <div className="overflow-x-auto text-xs">
                {categories.length === 0 ? (
                  <div className="text-center py-20">
                    <FolderTree size={32} className="mx-auto text-light-brown mb-4" />
                    <h3 className="font-playfair text-base font-bold">No Categories Configured</h3>
                    <p className="text-xs text-light-brown mt-1">Categories loaded from server will be shown here.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-cream/40 border-b border-border-custom text-foreground font-bold uppercase tracking-wider">
                        <th className="p-4">Category Name</th>
                        <th className="p-4">Hierarchy</th>
                        <th className="p-4">Level</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-custom/40">
                      {categories.map((cat) => {
                        const isSub = !!cat.parent;
                        const parentName = typeof cat.parent === 'object' && cat.parent ? cat.parent.name : (categories.find(c => c._id === cat.parent)?.name || null);
                        return (
                          <tr key={cat._id} className="hover:bg-cream/10 transition-colors">
                            <td className="p-4 font-bold text-foreground">{cat.name}</td>
                            <td className="p-4 text-mid font-medium">
                              {parentName ? `${parentName} > ${cat.name}` : cat.name}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                isSub ? 'bg-cream text-light-brown' : 'bg-rose/10 text-rose'
                              }`}>
                                {isSub ? 'Subcategory' : 'Top-Level'}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleDeleteCategory(cat._id)}
                                className="p-2 hover:bg-red-50 text-mid hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                                title="Delete Category"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ======================================================== */}
      {/* MODAL: ADD PRODUCT */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border-custom rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 animate-scaleIn">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-border-custom/50">
              <h3 className="font-playfair text-xl font-bold text-foreground">Add New Outfit</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-foreground hover:text-rose cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-5 text-xs">
              
              {/* Product Name */}
              <div>
                <label className="block font-bold text-foreground mb-1.5 uppercase tracking-wider">Outfit Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Vanilla Skies Wide Leg Jeans"
                  className="w-full px-4 py-2.5 border border-border-custom rounded-xl bg-cream/10 focus:outline-none focus:border-rose text-foreground"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-foreground mb-1.5 uppercase tracking-wider">Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Enter fabric composition, fit specs, styling recommendations..."
                  className="w-full px-4 py-2.5 border border-border-custom rounded-xl bg-cream/10 focus:outline-none focus:border-rose text-foreground"
                />
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-foreground mb-1.5 uppercase tracking-wider">Base Price (₹)</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="1999"
                    className="w-full px-4 py-2.5 border border-border-custom rounded-xl bg-cream/10 focus:outline-none focus:border-rose text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1.5 uppercase tracking-wider">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={formDiscountPrice}
                    onChange={(e) => setFormDiscountPrice(e.target.value)}
                    placeholder="1599"
                    className="w-full px-4 py-2.5 border border-border-custom rounded-xl bg-cream/10 focus:outline-none focus:border-rose text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1.5 uppercase tracking-wider">Stock Qty</label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    placeholder="25"
                    className="w-full px-4 py-2.5 border border-border-custom rounded-xl bg-cream/10 focus:outline-none focus:border-rose text-foreground"
                  />
                </div>
              </div>

              {/* Category & Sizes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-bold text-foreground mb-1.5 uppercase tracking-wider">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-2.5 border border-border-custom rounded-xl bg-cream/10 focus:outline-none focus:border-rose text-foreground cursor-pointer"
                  >
                    {categories.length > 0
                      ? categories.map((cat) => {
                          const parentName = typeof cat.parent === 'object' && cat.parent ? cat.parent.name : null;
                          return (
                            <option key={cat._id} value={cat.name}>
                              {parentName ? `${parentName} > ` : ''}{cat.name}
                            </option>
                          );
                        })
                      : CATEGORIES_FALLBACK.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                  </select>
                </div>
                
                <div>
                  <label className="block font-bold text-foreground mb-2 uppercase tracking-wider">Available Sizes</label>
                  <div className="flex gap-2">
                    {['XS', 'S', 'M', 'L', 'XL'].map((size) => {
                      const isChecked = formSizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleSizeToggle(size)}
                          className={`w-9 h-9 rounded-full border text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-rose border-rose text-white shadow-sm'
                              : 'border-border-custom bg-cream text-foreground'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Image upload selection */}
              <div className="border border-border-custom bg-cream/10 rounded-2xl p-4 space-y-4">
                <h4 className="font-bold text-foreground mb-1">Product Images</h4>
                
                {/* File input */}
                <div>
                  <label className="block text-[9px] font-bold text-light-brown mb-1.5 uppercase tracking-wider">Upload local files</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setImageFiles(e.target.files)}
                      className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-rose/10 file:text-rose hover:file:bg-rose/20 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-center my-1 text-light-brown font-bold">OR</div>

                {/* URL input */}
                <div>
                  <label className="block text-[9px] font-bold text-light-brown mb-1.5 uppercase tracking-wider">Link Image URL</label>
                  <input
                    type="text"
                    value={imageUrlString}
                    onChange={(e) => setImageUrlString(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-4 py-2 border border-border-custom rounded-xl bg-background focus:outline-none focus:border-rose text-foreground"
                  />
                </div>
              </div>

              {/* Badges selection */}
              <div className="flex gap-6 pt-2 font-bold text-foreground">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsNewIn}
                    onChange={(e) => setFormIsNewIn(e.target.checked)}
                    className="accent-rose w-4 h-4"
                  />
                  <span>Mark as New In</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsBestseller}
                    onChange={(e) => setFormIsBestseller(e.target.checked)}
                    className="accent-rose w-4 h-4"
                  />
                  <span>Mark as Bestseller</span>
                </label>
              </div>

              {/* Submit Add */}
              <button
                type="submit"
                className="w-full bg-rose text-white text-xs tracking-widest font-semibold py-3.5 rounded-xl hover:bg-mid hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                SUBMIT OUTFIT
              </button>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT PRODUCT */}
      {/* ======================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border-custom rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 animate-scaleIn">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-border-custom/50">
              <h3 className="font-playfair text-xl font-bold text-foreground">Edit Outfit details</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-foreground hover:text-rose cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditProduct} className="space-y-5 text-xs">
              
              {/* Product Name */}
              <div>
                <label className="block font-bold text-foreground mb-1.5 uppercase tracking-wider">Outfit Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Vanilla Skies Wide Leg Jeans"
                  className="w-full px-4 py-2.5 border border-border-custom rounded-xl bg-cream/10 focus:outline-none focus:border-rose text-foreground"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-foreground mb-1.5 uppercase tracking-wider">Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Enter fabric specifications..."
                  className="w-full px-4 py-2.5 border border-border-custom rounded-xl bg-cream/10 focus:outline-none focus:border-rose text-foreground"
                />
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-foreground mb-1.5 uppercase tracking-wider">Base Price (₹)</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="1999"
                    className="w-full px-4 py-2.5 border border-border-custom rounded-xl bg-cream/10 focus:outline-none focus:border-rose text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1.5 uppercase tracking-wider">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={formDiscountPrice}
                    onChange={(e) => setFormDiscountPrice(e.target.value)}
                    placeholder="1599"
                    className="w-full px-4 py-2.5 border border-border-custom rounded-xl bg-cream/10 focus:outline-none focus:border-rose text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1.5 uppercase tracking-wider">Stock Qty</label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    placeholder="25"
                    className="w-full px-4 py-2.5 border border-border-custom rounded-xl bg-cream/10 focus:outline-none focus:border-rose text-foreground"
                  />
                </div>
              </div>

              {/* Category & Sizes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-bold text-foreground mb-1.5 uppercase tracking-wider">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-2.5 border border-border-custom rounded-xl bg-cream/10 focus:outline-none focus:border-rose text-foreground cursor-pointer"
                  >
                    {categories.length > 0
                      ? categories.map((cat) => {
                          const parentName = typeof cat.parent === 'object' && cat.parent ? cat.parent.name : null;
                          return (
                            <option key={cat._id} value={cat.name}>
                              {parentName ? `${parentName} > ` : ''}{cat.name}
                            </option>
                          );
                        })
                      : CATEGORIES_FALLBACK.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                  </select>
                </div>
                
                <div>
                  <label className="block font-bold text-foreground mb-2 uppercase tracking-wider">Available Sizes</label>
                  <div className="flex gap-2">
                    {['XS', 'S', 'M', 'L', 'XL'].map((size) => {
                      const isChecked = formSizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleSizeToggle(size)}
                          className={`w-9 h-9 rounded-full border text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-rose border-rose text-white shadow-sm'
                              : 'border-border-custom bg-cream text-foreground'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Images selection */}
              <div className="border border-border-custom bg-cream/10 rounded-2xl p-4 space-y-4">
                <h4 className="font-bold text-foreground mb-1">Update Images</h4>
                
                <div>
                  <label className="block text-[9px] font-bold text-light-brown mb-1.5 uppercase tracking-wider">Upload new file(s)</label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setImageFiles(e.target.files)}
                    className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-rose/10 file:text-rose hover:file:bg-rose/20 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-center my-1 text-light-brown font-bold">OR</div>

                <div>
                  <label className="block text-[9px] font-bold text-light-brown mb-1.5 uppercase tracking-wider">Image Link URL</label>
                  <input
                    type="text"
                    value={imageUrlString}
                    onChange={(e) => setImageUrlString(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-4 py-2 border border-border-custom rounded-xl bg-background focus:outline-none focus:border-rose text-foreground"
                  />
                </div>
              </div>

              {/* Badges selection */}
              <div className="flex gap-6 pt-2 font-bold text-foreground">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsNewIn}
                    onChange={(e) => setFormIsNewIn(e.target.checked)}
                    className="accent-rose w-4 h-4"
                  />
                  <span>Mark as New In</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsBestseller}
                    onChange={(e) => setFormIsBestseller(e.target.checked)}
                    className="accent-rose w-4 h-4"
                  />
                  <span>Mark as Bestseller</span>
                </label>
              </div>

              {/* Submit Edit */}
              <button
                type="submit"
                className="w-full bg-rose text-white text-xs tracking-widest font-semibold py-3.5 rounded-xl hover:bg-mid hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                SAVE EDITS
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
