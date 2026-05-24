'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { ShoppingBag, ArrowLeft, CheckCircle2, Ticket, CreditCard, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { getImageUrl } from '@/lib/utils';
import API from '@/lib/api';

interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: 'cod' | 'card';
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
}

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    defaultValues: {
      paymentMethod: 'cod',
    },
  });

  // Prefill user details if logged in
  useEffect(() => {
    if (user) {
      setValue('fullName', user.username);
      setValue('email', user.email);
    }
  }, [user, setValue]);

  const selectedPayment = watch('paymentMethod');

  const applyPromo = () => {
    setPromoError('');
    const code = promoCode.trim().toUpperCase();
    if (code === 'WELCOME10') {
      const discount = Math.round(cartTotal * 0.1);
      setPromoDiscount(discount);
      setPromoApplied(true);
    } else if (code === 'FASHION20') {
      const discount = Math.round(cartTotal * 0.2);
      setPromoDiscount(discount);
      setPromoApplied(true);
    } else {
      setPromoError('Invalid coupon code. Try WELCOME10 or FASHION20');
    }
  };

  const finalTotal = cartTotal - promoDiscount;

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    
    try {
      const orderItems = cartItems.map(item => ({
        product: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
      }));

      const orderPayload = {
        customerDetails: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
        },
        items: orderItems,
        paymentMethod: data.paymentMethod,
        couponCode: promoApplied ? promoCode.trim().toUpperCase() : undefined,
      };

      const response = await API.post('/orders', orderPayload);
      
      if (response.data?.success && response.data?.order) {
        setOrderId(response.data.order.orderId);
        setIsSuccess(true);
        clearCart();
      } else {
        alert(response.data?.message || 'Failed to place order.');
      }
    } catch (err: any) {
      console.error('Order checkout submission error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Server error placing order.';
      alert(`Checkout failed: ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order is placed successfully, render Success Screen
  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto text-center px-4 py-24 animate-fadeIn">
        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-200">
          <CheckCircle2 size={32} />
        </div>
        <p className="font-caveat text-3xl text-rose font-bold">Thank you, Sister!</p>
        <h1 className="font-playfair text-3xl font-bold text-foreground mt-2">Order Confirmed</h1>
        <p className="text-xs text-light-brown mt-4 leading-relaxed max-w-sm mx-auto">
          Your order <strong>{orderId}</strong> has been successfully placed. We will send shipping and tracking updates to your email.
        </p>

        <div className="mt-8 p-4 bg-cream/40 rounded-2xl border border-border-custom/50 text-left space-y-2.5 text-xs text-mid">
          <p className="font-bold text-foreground">What happens next?</p>
          <p>1. Order validation & sizing confirmation checks.</p>
          <p>2. Shipping from Gurugram studios within 24 hours.</p>
          <p>3. Dispatch SMS with tracking link details.</p>
        </div>

        <button className="mt-10 w-full bg-rose text-white text-xs tracking-widest font-semibold py-4 rounded-full hover:bg-mid transition-all shadow-md">
          <Link href="/shop">CONTINUE SHOPPING</Link>
        </button>
      </div>
    );
  }

  // If cart is empty, render Empty Cart warning
  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center px-4 py-24 select-none">
        <span className="text-4xl">🌸</span>
        <h2 className="font-playfair text-xl font-bold mt-4">Your Bag is Empty</h2>
        <p className="text-xs text-light-brown mt-2">Add some stunning outfits before proceeding to checkout.</p>
        <button className="mt-6 bg-rose text-white text-xs tracking-widest font-semibold px-6 py-2.5 rounded-full hover:bg-mid">
          <Link href="/shop">SHOP THE CATALOG</Link>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      
      {/* Back button */}
      <Link
        href="/shop"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-mid hover:text-rose mb-8 transition-colors uppercase tracking-wider"
      >
        <ArrowLeft size={14} /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* LEFT COLUMN: CHECKOUT FORM */}
        <div className="lg:col-span-7 bg-background p-6 md:p-8 border border-border-custom/45 rounded-3xl shadow-sm">
          <h2 className="font-playfair text-2xl font-bold text-foreground mb-6">Delivery Details</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Contact information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-foreground mb-1.5 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  {...register('fullName', { required: 'Full name is required' })}
                  placeholder="e.g. Diya Sharma"
                  className={`w-full px-4 py-3 border rounded-xl text-xs bg-cream/20 focus:outline-none focus:border-rose text-foreground ${errors.fullName ? 'border-red-400' : 'border-border-custom'}`}
                />
                {errors.fullName && <span className="text-[10px] text-red-500 mt-1 block">{errors.fullName.message}</span>}
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-foreground mb-1.5 uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: { value: /^[0-9]{10}$/, message: 'Must be a 10-digit number' },
                  })}
                  placeholder="e.g. 9876543210"
                  className={`w-full px-4 py-3 border rounded-xl text-xs bg-cream/20 focus:outline-none focus:border-rose text-foreground ${errors.phone ? 'border-red-400' : 'border-border-custom'}`}
                />
                {errors.phone && <span className="text-[10px] text-red-500 mt-1 block">{errors.phone.message}</span>}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-foreground mb-1.5 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                {...register('email', { required: 'Email address is required' })}
                placeholder="e.g. diya@gmail.com"
                className={`w-full px-4 py-3 border rounded-xl text-xs bg-cream/20 focus:outline-none focus:border-rose text-foreground ${errors.email ? 'border-red-400' : 'border-border-custom'}`}
              />
              {errors.email && <span className="text-[10px] text-red-500 mt-1 block">{errors.email.message}</span>}
            </div>

            {/* Address */}
            <div>
              <label className="block text-[10px] font-bold text-foreground mb-1.5 uppercase tracking-wider">Shipping Address</label>
              <input
                type="text"
                {...register('address', { required: 'Shipping address is required' })}
                placeholder="House No, Apartment, Street name"
                className={`w-full px-4 py-3 border rounded-xl text-xs bg-cream/20 focus:outline-none focus:border-rose text-foreground mb-3 ${errors.address ? 'border-red-400' : 'border-border-custom'}`}
              />
              {errors.address && <span className="text-[10px] text-red-500 mt-1 block">{errors.address.message}</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-foreground mb-1.5 uppercase tracking-wider">City</label>
                <input
                  type="text"
                  {...register('city', { required: 'City is required' })}
                  placeholder="Gurugram"
                  className={`w-full px-4 py-3 border rounded-xl text-xs bg-cream/20 focus:outline-none focus:border-rose text-foreground ${errors.city ? 'border-red-400' : 'border-border-custom'}`}
                />
                {errors.city && <span className="text-[10px] text-red-500 mt-1 block">{errors.city.message}</span>}
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-foreground mb-1.5 uppercase tracking-wider">State</label>
                <input
                  type="text"
                  {...register('state', { required: 'State is required' })}
                  placeholder="Haryana"
                  className={`w-full px-4 py-3 border rounded-xl text-xs bg-cream/20 focus:outline-none focus:border-rose text-foreground ${errors.state ? 'border-red-400' : 'border-border-custom'}`}
                />
                {errors.state && <span className="text-[10px] text-red-500 mt-1 block">{errors.state.message}</span>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-foreground mb-1.5 uppercase tracking-wider">Pincode</label>
                <input
                  type="text"
                  {...register('pincode', {
                    required: 'Pincode is required',
                    pattern: { value: /^[0-9]{6}$/, message: 'Must be 6 digits' },
                  })}
                  placeholder="122008"
                  className={`w-full px-4 py-3 border rounded-xl text-xs bg-cream/20 focus:outline-none focus:border-rose text-foreground ${errors.pincode ? 'border-red-400' : 'border-border-custom'}`}
                />
                {errors.pincode && <span className="text-[10px] text-red-500 mt-1 block">{errors.pincode.message}</span>}
              </div>
            </div>

            <div className="h-px bg-border-custom/50" />

            {/* PAYMENT CHOICES */}
            <div>
              <h3 className="font-playfair text-lg font-bold text-foreground mb-4">Payment Method</h3>
              <div className="grid grid-cols-2 gap-4">
                
                {/* Cash on delivery */}
                <label className={`border rounded-2xl p-4 flex items-center gap-3 cursor-pointer select-none transition-all ${selectedPayment === 'cod' ? 'border-rose bg-soft-pink/30' : 'border-border-custom bg-cream/10'}`}>
                  <input
                    type="radio"
                    value="cod"
                    {...register('paymentMethod')}
                    className="accent-rose"
                  />
                  <div>
                    <p className="text-xs font-bold text-foreground">Cash On Delivery</p>
                    <p className="text-[10px] text-light-brown mt-0.5">Pay in cash on arrival</p>
                  </div>
                </label>

                {/* Simulated payment card */}
                <label className={`border rounded-2xl p-4 flex items-center gap-3 cursor-pointer select-none transition-all ${selectedPayment === 'card' ? 'border-rose bg-soft-pink/30' : 'border-border-custom bg-cream/10'}`}>
                  <input
                    type="radio"
                    value="card"
                    {...register('paymentMethod')}
                    className="accent-rose"
                  />
                  <div>
                    <p className="text-xs font-bold text-foreground">Test Card</p>
                    <p className="text-[10px] text-light-brown mt-0.5">Simulate instant payments</p>
                  </div>
                </label>

              </div>
            </div>

            {/* Credit Card inputs */}
            {selectedPayment === 'card' && (
              <div className="p-5 border border-border-custom bg-cream/20 rounded-2xl space-y-4 animate-fadeIn">
                <div>
                  <label className="block text-[9px] font-bold text-foreground mb-1 uppercase tracking-wider">Card Number</label>
                  <input
                    type="text"
                    {...register('cardNumber', { required: selectedPayment === 'card' })}
                    placeholder="4111 2222 3333 4444"
                    className="w-full px-3 py-2.5 border border-border-custom rounded-xl text-xs bg-background focus:outline-none focus:border-rose text-foreground"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-foreground mb-1 uppercase tracking-wider">Expiry Date</label>
                    <input
                      type="text"
                      {...register('cardExpiry', { required: selectedPayment === 'card' })}
                      placeholder="MM/YY"
                      className="w-full px-3 py-2.5 border border-border-custom rounded-xl text-xs bg-background focus:outline-none focus:border-rose text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-foreground mb-1 uppercase tracking-wider">CVV Code</label>
                    <input
                      type="text"
                      {...register('cardCvv', { required: selectedPayment === 'card' })}
                      placeholder="123"
                      className="w-full px-3 py-2.5 border border-border-custom rounded-xl text-xs bg-background focus:outline-none focus:border-rose text-foreground"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-light-brown">
                  <CreditCard size={12} className="text-rose" />
                  <span>Payments are simulated and secure. No real money will be charged.</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-rose text-white text-xs tracking-widest font-semibold py-4 rounded-xl hover:bg-mid hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:bg-border-custom disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  PLACING ORDER...
                </>
              ) : (
                <>
                  PLACE ORDER (₹{finalTotal})
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-cream/40 p-6 rounded-3xl border border-border-custom/50">
            <h3 className="font-playfair text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <ShoppingBag size={18} className="text-rose" /> Summary
            </h3>

            {/* List of items */}
            <div className="space-y-4 max-h-72 overflow-y-auto mb-6 pr-2">
              {cartItems.map((item) => (
                <div key={`${item._id}-${item.size}`} className="flex items-center gap-3 py-3 border-b border-border-custom/40 last:border-0">
                  <div className="w-12 h-15 bg-cream rounded-md overflow-hidden flex-shrink-0 border border-border-custom/30">
                    <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-foreground truncate">{item.name}</h4>
                    <p className="text-[10px] text-light-brown mt-0.5">
                      Size: <span className="text-rose">{item.size}</span> x {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-foreground">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Promo-coupon code application */}
            <div className="space-y-2 mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon Code (WELCOME10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={promoApplied}
                  className="flex-1 px-3 py-2 border border-border-custom bg-background rounded-xl text-xs focus:outline-none focus:border-rose text-foreground disabled:bg-cream disabled:text-light-brown"
                />
                <button
                  type="button"
                  onClick={applyPromo}
                  disabled={promoApplied}
                  className="bg-rose text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-mid disabled:bg-border-custom cursor-pointer"
                >
                  APPLY
                </button>
              </div>
              {promoApplied && (
                <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                  <Ticket size={12} /> Coupon applied successfully!
                </span>
              )}
              {promoError && (
                <span className="text-[10px] text-red-500 font-medium">{promoError}</span>
              )}
            </div>

            {/* Pricing math details */}
            <div className="space-y-3.5 text-xs text-mid">
              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between font-bold text-green-600">
                  <span>Discount</span>
                  <span>-₹{promoDiscount}</span>
                </div>
              )}
              <div className="flex justify-between font-medium">
                <span>Delivery Shipping</span>
                <span className="text-green-600 font-bold">FREE SHIPPING</span>
              </div>
              <div className="h-px bg-border-custom/50 my-1" />
              <div className="flex justify-between text-sm font-bold text-foreground">
                <span>Total Amount</span>
                <span className="text-rose">₹{finalTotal}</span>
              </div>
            </div>

          </div>

          {/* Security details trust box */}
          <div className="flex items-center gap-3 px-6 py-4 bg-background border border-border-custom/40 rounded-2xl shadow-inner text-mid">
            <ShieldCheck size={20} className="text-rose flex-shrink-0" />
            <span className="text-[10px] leading-relaxed font-semibold">
              All transactions are simulated and secure. Customer details are covered under privacy agreements.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
