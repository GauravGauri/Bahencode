'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, User, ArrowRight, Eye, EyeOff, AlertCircle, ShoppingBag, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type ActiveTab = 'login' | 'signup';

export default function AuthPage() {
  const router = useRouter();
  const { login, register: signUpUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Forms
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLoginForm,
  } = useForm({
    defaultValues: { email: '', password: '' },
  });

  const {
    register: signupRegister,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    reset: resetSignupForm,
  } = useForm({
    defaultValues: { username: '', email: '', password: '' },
  });

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setErrorMsg('');
    resetLoginForm();
    resetSignupForm();
  };

  const onLogin = async (data: any) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const user = await login(data.email, data.password);
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Incorrect email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSignup = async (data: any) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await signUpUser(data.username, data.email, data.password);
      router.push('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to register account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-soft-pink/40 via-cream/20 to-background flex flex-col items-center justify-center p-4 py-16 relative overflow-hidden">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/10 w-72 h-72 rounded-full bg-rose/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-80 h-80 rounded-full bg-blush/20 blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-background/85 backdrop-blur-md border border-border-custom p-8 rounded-3xl shadow-xl relative z-10 overflow-hidden">
        
        {/* Tab Toggle Header */}
        <div className="flex border border-border-custom rounded-full p-1 bg-cream/35 mb-8">
          <button
            onClick={() => handleTabChange('login')}
            className={`flex-1 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-rose text-white shadow-sm'
                : 'text-foreground hover:text-rose'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => handleTabChange('signup')}
            className={`flex-1 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === 'signup'
                ? 'bg-rose text-white shadow-sm'
                : 'text-foreground hover:text-rose'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Brand Greeting */}
        <div className="text-center mb-6">
          <h2 className="font-playfair text-xl font-bold tracking-wide text-foreground flex items-center justify-center gap-1.5">
            {activeTab === 'login' ? (
              <>Welcome Back <Sparkles size={16} className="text-rose" /></>
            ) : (
              <>Join the Sisterhood <Sparkles size={16} className="text-rose" /></>
            )}
          </h2>
          <p className="text-[10px] uppercase tracking-[0.15em] text-light-brown mt-1">
            {activeTab === 'login' 
              ? 'Login to view your bag and purchase' 
              : 'Sign up to shop the premium collection'}
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-3 animate-fadeIn">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div className="text-xs font-medium">
              {errorMsg}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'login' ? (
            <motion.form
              key="login-form"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleLoginSubmit(onLogin)}
              className="space-y-4"
            >
              {/* Email Address */}
              <div>
                <label className="block text-[10px] font-bold text-foreground mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    {...loginRegister('email', { required: 'Email address is required' })}
                    placeholder="diya@gmail.com"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl text-xs bg-cream/10 focus:outline-none focus:border-rose text-foreground ${
                      loginErrors.email ? 'border-red-400' : 'border-border-custom'
                    }`}
                  />
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-light-brown" />
                </div>
                {loginErrors.email && (
                  <span className="text-[10px] text-red-500 font-medium mt-1 block">{loginErrors.email.message}</span>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-bold text-foreground uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...loginRegister('password', { required: 'Password is required' })}
                    placeholder="••••••••••••"
                    className={`w-full pl-10 pr-10 py-3 border rounded-xl text-xs bg-cream/10 focus:outline-none focus:border-rose text-foreground ${
                      loginErrors.password ? 'border-red-400' : 'border-border-custom'
                    }`}
                  />
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-light-brown" />
                  
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-light-brown hover:text-rose p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {loginErrors.password && (
                  <span className="text-[10px] text-red-500 font-medium mt-1 block">{loginErrors.password.message}</span>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-rose text-white text-xs tracking-widest font-semibold py-4 rounded-xl hover:bg-mid hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:bg-border-custom"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    VERIFYING...
                  </>
                ) : (
                  <>
                    SECURE SIGN IN <ArrowRight size={14} />
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="signup-form"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSignupSubmit(onSignup)}
              className="space-y-4"
            >
              {/* Username */}
              <div>
                <label className="block text-[10px] font-bold text-foreground mb-1.5 uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...signupRegister('username', { required: 'Username is required' })}
                    placeholder="diya_sharma"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl text-xs bg-cream/10 focus:outline-none focus:border-rose text-foreground ${
                      signupErrors.username ? 'border-red-400' : 'border-border-custom'
                    }`}
                  />
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-light-brown" />
                </div>
                {signupErrors.username && (
                  <span className="text-[10px] text-red-500 font-medium mt-1 block">{signupErrors.username.message}</span>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[10px] font-bold text-foreground mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    {...signupRegister('email', { required: 'Email address is required' })}
                    placeholder="diya@gmail.com"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl text-xs bg-cream/10 focus:outline-none focus:border-rose text-foreground ${
                      signupErrors.email ? 'border-red-400' : 'border-border-custom'
                    }`}
                  />
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-light-brown" />
                </div>
                {signupErrors.email && (
                  <span className="text-[10px] text-red-500 font-medium mt-1 block">{signupErrors.email.message}</span>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-bold text-foreground mb-1.5 uppercase tracking-wider">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...signupRegister('password', { 
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                    placeholder="••••••••••••"
                    className={`w-full pl-10 pr-10 py-3 border rounded-xl text-xs bg-cream/10 focus:outline-none focus:border-rose text-foreground ${
                      signupErrors.password ? 'border-red-400' : 'border-border-custom'
                    }`}
                  />
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-light-brown" />
                  
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-light-brown hover:text-rose p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {signupErrors.password && (
                  <span className="text-[10px] text-red-500 font-medium mt-1 block">{signupErrors.password.message}</span>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-rose text-white text-xs tracking-widest font-semibold py-4 rounded-xl hover:bg-mid hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:bg-border-custom"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    CREATING ACCOUNT...
                  </>
                ) : (
                  <>
                    REGISTER & START SHOPPING <ArrowRight size={14} />
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Demo Accounts Tip (Helpful for test verification) */}
        <div className="mt-8 pt-4 border-t border-border-custom/50 text-center text-[9px] text-light-brown leading-relaxed">
          <p>Want to test? Administrators can log in directly using:</p>
          <p className="font-bold text-foreground mt-0.5">admin@behencode.co / BehencodeAdmin123!</p>
        </div>

      </div>
    </div>
  );
}
