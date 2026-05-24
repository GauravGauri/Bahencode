'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { getImageUrl } from '@/lib/utils';

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
    cartCount,
  } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 cursor-pointer"
          />

          {/* DRAWER CONTAINER */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[450px] bg-background border-l border-border-custom shadow-2xl z-50 flex flex-col h-full"
          >
            {/* DRAWER HEADER */}
            <div className="p-6 border-b border-border-custom flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-rose" />
                <span className="font-playfair text-lg font-bold text-foreground">
                  Shopping Bag
                </span>
                <span className="text-xs text-light-brown font-medium bg-cream px-2 py-0.5 rounded-full">
                  {cartCount} items
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-foreground hover:text-rose transition-colors p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* DRAWER CONTENT */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center pb-12 select-none">
                  <span className="text-4xl mb-4">🌸</span>
                  <h3 className="font-playfair text-xl font-semibold mb-2">
                    Your bag is empty
                  </h3>
                  <p className="text-xs text-light-brown max-w-[250px] mb-6 leading-relaxed">
                    Looks like you haven't added any outfits yet. Let's find your new favorites!
                  </p>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                    }}
                    className="bg-rose text-white text-xs tracking-widest font-semibold px-6 py-3 rounded-full hover:bg-mid transition-all duration-300"
                  >
                    <Link href="/shop">SHOP NOW</Link>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={`${item._id}-${item.size}`}
                      className="flex items-center gap-4 py-4 border-b border-border-custom/50 last:border-b-0 animate-fadeIn"
                    >
                      {/* Product Thumbnail */}
                      <div className="relative w-20 h-24 bg-cream rounded-md overflow-hidden flex-shrink-0 border border-border-custom/30">
                        {item.image ? (
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-light-brown">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Info & Quantity controls */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground truncate mb-0.5">
                          {item.name}
                        </h4>
                        <p className="text-xs text-light-brown mb-2 font-medium">
                          Size: <span className="text-rose">{item.size}</span>
                        </p>
                        
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-border-custom rounded-full w-24 justify-between bg-cream">
                          <button
                            onClick={() => updateQuantity(item._id, item.size, item.quantity - 1)}
                            className="p-1.5 text-foreground hover:text-rose cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-semibold text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id, item.size, item.quantity + 1)}
                            className="p-1.5 text-foreground hover:text-rose cursor-pointer"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Price & Delete */}
                      <div className="flex flex-col items-end justify-between self-stretch py-1">
                        <span className="text-sm font-bold text-foreground">
                          ₹{item.price * item.quantity}
                        </span>
                        <button
                          onClick={() => removeFromCart(item._id, item.size)}
                          className="text-light-brown hover:text-red-500 transition-colors p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DRAWER FOOTER */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-border-custom bg-cream/40">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center text-sm font-semibold text-light-brown">
                    <span>Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-light-brown font-medium">
                    <span>Delivery</span>
                    <span className="text-green-600">FREE SHIPPING</span>
                  </div>
                  <div className="h-px bg-border-custom my-2" />
                  <div className="flex justify-between items-center text-base font-bold text-foreground">
                    <span>Total Estimated</span>
                    <span className="text-rose">₹{cartTotal}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full bg-rose text-white text-xs text-center tracking-widest font-semibold py-3.5 rounded-full hover:bg-mid transition-all duration-300 shadow-md flex items-center justify-center"
                  >
                    PROCEED TO CHECKOUT
                  </Link>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="w-full text-foreground hover:text-rose transition-colors text-xs text-center font-bold py-2 cursor-pointer"
                  >
                    CONTINUE SHOPPING
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
