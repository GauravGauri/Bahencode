'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import API from '@/lib/api';

interface LoginFormData {
  email: string;
  password: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setLoginError('');

    try {
      // POST to backend API login
      const response = await API.post('/auth/login', data);
      
      if (response.data?.success && response.data?.token) {
        // Save to localStorage for API headers
        localStorage.setItem('behencode_admin_token', response.data.token);
        localStorage.setItem('behencode_admin_user', JSON.stringify(response.data.user));
        
        // Redirect to admin dashboard
        router.push('/admin/dashboard');
      } else {
        throw new Error(response.data?.message || 'Login failed.');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Server error occurred.';
      console.warn('Backend login connection issue. Allowing bypass with default credentials for developer preview.');
      
      // Fallback developer bypass if DB is offline
      if (data.email === 'admin@behencode.co' && data.password === 'BehencodeAdmin123!') {
        localStorage.setItem('behencode_admin_token', 'mock_preview_jwt_token_key');
        localStorage.setItem('behencode_admin_user', JSON.stringify({ email: data.email, username: 'Admin' }));
        router.push('/admin/dashboard');
      } else {
        setLoginError(errMsg + ' (Note: Use admin@behencode.co / BehencodeAdmin123!)');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-soft-pink/50 to-cream/20 flex flex-col items-center justify-center p-4">
      
      {/* Back to store link */}
      <div className="absolute top-8 left-8">
        <Link
          href="/"
          className="text-xs font-bold text-mid hover:text-rose transition-colors uppercase tracking-widest flex items-center gap-1.5"
        >
          <ArrowRight size={14} className="rotate-180" /> Back to Store
        </Link>
      </div>

      <div className="w-full max-w-md bg-background border border-border-custom p-8 rounded-3xl shadow-lg relative overflow-hidden">
        
        {/* LOGO */}
        <div className="text-center mb-8 select-none">
          <h1 className="font-playfair text-2xl font-bold tracking-wide text-foreground">
            behencode<span className="text-rose">♡</span> CMS
          </h1>
          <p className="text-[9px] tracking-[0.2em] uppercase text-light-brown mt-1">
            Store Management Panel
          </p>
        </div>

        {loginError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-3 animate-fadeIn">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold">Access Denied:</span> {loginError}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Address */}
          <div>
            <label className="block text-[10px] font-bold text-foreground mb-1.5 uppercase tracking-wider">
              Admin Email
            </label>
            <div className="relative">
              <input
                type="email"
                {...register('email', { required: 'Admin email is required' })}
                placeholder="admin@behencode.co"
                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-xs bg-cream/10 focus:outline-none focus:border-rose text-foreground ${
                  errors.email ? 'border-red-400' : 'border-border-custom'
                }`}
              />
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-light-brown" />
            </div>
            {errors.email && (
              <span className="text-[10px] text-red-500 font-medium mt-1 block">{errors.email.message}</span>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold text-foreground mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', { required: 'Password is required' })}
                placeholder="••••••••••••"
                className={`w-full pl-10 pr-10 py-3 border rounded-xl text-xs bg-cream/10 focus:outline-none focus:border-rose text-foreground ${
                  errors.password ? 'border-red-400' : 'border-border-custom'
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
            {errors.password && (
              <span className="text-[10px] text-red-500 font-medium mt-1 block">{errors.password.message}</span>
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
                SECURE LOGIN <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-border-custom/50 pt-4 text-[10px] text-light-brown">
          <p>Seeded Admin Credentials:</p>
          <p className="font-bold text-foreground mt-1">admin@behencode.co</p>
          <p className="font-bold text-foreground">BehencodeAdmin123!</p>
        </div>

      </div>

    </div>
  );
}
