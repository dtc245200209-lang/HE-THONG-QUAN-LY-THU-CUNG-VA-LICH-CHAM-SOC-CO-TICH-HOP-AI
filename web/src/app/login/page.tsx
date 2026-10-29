'use client';

import { useState } from 'react';
import Cookies from 'js-cookie';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';
import { PawPrint, Heart, ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { DEMO_ACCOUNTS } from '@/components/layout/QuickPortalNav';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await api.post('/api/v1/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      // Store token based on remember me
      const expires = rememberMe ? 30 : 1; // 30 days or 1 day
      Cookies.set('token', response.data.access_token, { expires });
      
      const meResponse = await api.get('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${response.data.access_token}` }
      });
      
      login(response.data.access_token, meResponse.data);
      
      const roles = meResponse.data.roles.map((r: any) => r.name);
      
      let defaultRoute = '/customer';
      if (roles.includes("ADMIN")) {
        defaultRoute = '/admin';
      } else if (roles.includes("VETERINARIAN")) {
        defaultRoute = '/veterinarian';
      } else if (roles.includes("CAREGIVER")) {
        defaultRoute = '/caregiver';
      } else if (roles.includes("RECEPTIONIST")) {
        defaultRoute = '/receptionist';
      } else if (roles.includes("CUSTOMER")) {
        defaultRoute = '/customer';
      }

      const redirectUrl = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('redirect') : null;
      // Only obey redirectUrl if it belongs to the user's role or is a public shop page
      if (redirectUrl && !redirectUrl.startsWith('/login')) {
        const isStaff = roles.some((r: string) => ["ADMIN", "VETERINARIAN", "CAREGIVER", "RECEPTIONIST"].includes(r));
        if (!isStaff || redirectUrl.startsWith(defaultRoute) || redirectUrl.startsWith('/shop')) {
          window.location.href = redirectUrl;
          return;
        }
      }

      window.location.href = defaultRoute;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-gray-900">
      
      {/* Left side: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24 xl:p-32">
        <div className="w-full max-w-md">
          
          {/* Back to Public Shop */}
          <div className="mb-6">
            <Link 
              href="/shop" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-3 py-1.5 rounded-full transition border border-slate-200 hover:border-emerald-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Quay lại Siêu thị Thú Cưng</span>
            </Link>
          </div>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <PawPrint className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">PetCare AI</span>
          </div>

          <h1 className="text-4xl font-bold mb-2">Better Care<br/>Happier Pets</h1>
          <p className="text-gray-500 mb-8 mt-2">Quản lý chăm sóc thú cưng thông minh với AI</p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="Nhập mật khẩu"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4" 
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <a href="#" className="text-sm text-primary hover:underline font-medium">Quên mật khẩu?</a>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-lg transition-all flex justify-center items-center shadow-md shadow-primary/20"
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </form>

          {/* Quick Demo Helper (Chỉ điền form để xác thực bảo mật) */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <details className="group text-xs">
              <summary className="cursor-pointer list-none flex items-center justify-between text-slate-500 hover:text-slate-800 font-semibold p-2 rounded-xl hover:bg-slate-50 transition select-none">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tài khoản kiểm thử nghiệm thu (Dành cho Giảng viên / Đánh giá)</span>
                </span>
                <span className="text-[10px] text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>

              <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Nhấn vào vai trò bên dưới để <strong>tự động điền thông tin đăng nhập</strong> vào ô phía trên, sau đó bấm <strong>Đăng nhập</strong> để máy chủ xác thực bảo mật (mã hóa JWT & phân quyền RBAC):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => {
                        setEmail(acc.email);
                        setPassword(acc.pass);
                        setError('');
                      }}
                      className="p-2 rounded-xl bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-left transition shadow-2xs"
                      title={`Điền thông tin ${acc.name}`}
                    >
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-800 truncate">
                        <span>{acc.icon}</span>
                        <span>{acc.name.split(' (')[0]}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">{acc.email}</div>
                    </button>
                  ))}
                </div>
              </div>
            </details>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Đăng ký
            </Link>
          </div>
        </div>
      </div>

      {/* Right side: Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#F8F3EC] items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image 
            src="/login-hero.jpg" 
            alt="Happy Pets" 
            layout="fill"
            objectFit="cover"
            priority
          />
        </div>
        
        {/* Optional Overlay quote at bottom */}
        <div className="absolute bottom-12 w-full px-12 flex justify-center">
           <div className="bg-white/90 backdrop-blur-md px-8 py-5 rounded-2xl shadow-xl max-w-lg text-center flex flex-col items-center">
             <Heart className="text-primary mb-2 w-6 h-6" />
              <p className="text-gray-900 font-medium text-lg leading-relaxed">
                &ldquo;Chăm sóc hôm nay<br/>cho một ngày mai khoẻ mạnh hơn&rdquo;
              </p>
           </div>
        </div>
      </div>

    </div>
  );
}
