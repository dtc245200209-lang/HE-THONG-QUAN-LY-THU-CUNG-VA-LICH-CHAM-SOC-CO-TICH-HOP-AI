'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Cookies from 'js-cookie';
import { 
  Sparkles, ShoppingBag, LogOut, ChevronUp, ChevronDown, 
  ExternalLink, ArrowRight, ShieldCheck, UserCheck, Stethoscope, 
  Heart, CheckCircle2, RotateCw
} from 'lucide-react';

export const DEMO_ACCOUNTS = [
  { 
    role: 'ADMIN', 
    name: 'Quản Trị Viên', 
    sub: 'Toàn quyền hệ thống', 
    email: 'admin@petcare.local', 
    pass: 'admin123', 
    icon: '👑', 
    path: '/admin', 
    color: 'bg-amber-500 text-white hover:bg-amber-600',
    badgeBg: 'bg-amber-100 text-amber-800'
  },
  { 
    role: 'VETERINARIAN', 
    name: 'Bác Sĩ Thú Y', 
    sub: 'Khám, kê đơn, tiêm phòng', 
    email: 'doctor@petcare.local', 
    pass: 'doctor123', 
    icon: '🩺', 
    path: '/veterinarian', 
    color: 'bg-emerald-600 text-white hover:bg-emerald-700',
    badgeBg: 'bg-emerald-100 text-emerald-800'
  },
  { 
    role: 'CAREGIVER', 
    name: 'Điều Dưỡng Chăm Sóc', 
    sub: 'Spa, nhật ký nội trú', 
    email: 'caregiver@petcare.local', 
    pass: 'caregiver123', 
    icon: '🐾', 
    path: '/caregiver', 
    color: 'bg-teal-600 text-white hover:bg-teal-700',
    badgeBg: 'bg-teal-100 text-teal-800'
  },
  { 
    role: 'RECEPTIONIST', 
    name: 'Lễ Tân Tiếp Nhận', 
    sub: 'Lịch hẹn, thanh toán', 
    email: 'reception@petcare.local', 
    pass: 'reception123', 
    icon: '📋', 
    path: '/receptionist', 
    color: 'bg-purple-600 text-white hover:bg-purple-700',
    badgeBg: 'bg-purple-100 text-purple-800'
  },
  { 
    role: 'CUSTOMER', 
    name: 'Khách Hàng (Lý Thiên Hương)', 
    sub: 'Chủ bé Đen, Milo, Luna', 
    email: 'customer01@petcare.local', 
    pass: 'customer123', 
    icon: '🐶', 
    path: '/customer', 
    color: 'bg-blue-600 text-white hover:bg-blue-700',
    badgeBg: 'bg-blue-100 text-blue-800'
  },
];

export function getRoleDashboardPath(user: any): string {
  if (!user || !user.roles) return '/customer';
  const roles = user.roles.map((r: any) => r.name);
  if (roles.includes('ADMIN')) return '/admin';
  if (roles.includes('VETERINARIAN')) return '/veterinarian';
  if (roles.includes('CAREGIVER')) return '/caregiver';
  if (roles.includes('RECEPTIONIST')) return '/receptionist';
  return '/customer';
}

export function getRoleBadge(user: any): { label: string; icon: string; bg: string } {
  if (!user || !user.roles) return { label: 'Khách', icon: '👤', bg: 'bg-slate-100 text-slate-700' };
  const roles = user.roles.map((r: any) => r.name);
  if (roles.includes('ADMIN')) return { label: 'Quản Trị Viên', icon: '👑', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
  if (roles.includes('VETERINARIAN')) return { label: 'Bác Sĩ', icon: '🩺', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
  if (roles.includes('CAREGIVER')) return { label: 'Điều Dưỡng', icon: '🐾', bg: 'bg-teal-100 text-teal-900 border-teal-300' };
  if (roles.includes('RECEPTIONIST')) return { label: 'Lễ Tân', icon: '📋', bg: 'bg-purple-100 text-purple-900 border-purple-300' };
  return { label: 'Khách Hàng', icon: '🐶', bg: 'bg-blue-100 text-blue-900 border-blue-300' };
}

export default function QuickPortalNav() {
  const pathname = usePathname();
  const { user, isAuthenticated, login, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);

  // Quick 1-click login handler
  const handleQuickLogin = async (acc: typeof DEMO_ACCOUNTS[0]) => {
    try {
      setSwitching(acc.role);
      const formData = new URLSearchParams();
      formData.append('username', acc.email);
      formData.append('password', acc.pass);

      const res = await api.post('/api/v1/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const token = res.data.access_token;
      Cookies.set('token', token, { expires: 7 });

      const meRes = await api.get('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      login(token, meRes.data);
      window.location.href = acc.path;
    } catch (err: any) {
      alert(`Đăng nhập thất bại cho ${acc.name}: ` + (err.response?.data?.detail || err.message));
      setSwitching(null);
    }
  };

  const handleLogoutToShop = () => {
    logout();
    window.location.href = '/shop';
  };

  const currentRoleInfo = getRoleBadge(user);
  const dashboardPath = getRoleDashboardPath(user);
  const isPublicPage = pathname === '/' || pathname === '/shop';

  return (
    <aside aria-label="Bộ điều hướng chuyển đổi vai trò nhanh" className="fixed bottom-4 right-4 z-50 font-sans">
      {/* Expanded Modal / Card */}
      {isOpen && (
        <div className="mb-3 w-84 sm:w-96 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 p-4 text-slate-800 transition-all animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-teal-500 to-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                ⚡
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 leading-tight">Chuyển Đổi Nhanh PetCare</h4>
                <p className="text-[10px] text-slate-500">Đổi vai trò & Điều hướng 1-chạm</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title="Thu nhỏ"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Current Status Box */}
          <div className="my-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg">{currentRoleInfo.icon}</span>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Hiện tại:</div>
                <div className="font-bold text-slate-900 truncate">
                  {isAuthenticated ? (user?.full_name || user?.email) : 'Khách vãng lai (Chưa đăng nhập)'}
                </div>
              </div>
            </div>
            {isAuthenticated && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentRoleInfo.bg}`}>
                {currentRoleInfo.label}
              </span>
            )}
          </div>

          {/* Quick Route Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Link
              href="/shop"
              onClick={() => setIsOpen(false)}
              className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                pathname === '/shop' 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
              <span>🛒 Siêu Thị Thú Cưng</span>
            </Link>

            {isAuthenticated ? (
              <Link
                href={dashboardPath}
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xs transition"
              >
                <span>🚀 Vào Không Gian Việc</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white transition"
              >
                <span>🔑 Trang Đăng Nhập</span>
              </Link>
            )}
          </div>

          {/* Demo Accounts List (1-Click Login) */}
          <div className="space-y-1.5 mb-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Đăng nhập 1-chạm vào các vai trò:
            </div>
            {DEMO_ACCOUNTS.map((acc) => {
              const isCurrent = user?.roles?.some((r: any) => r.name === acc.role);
              const isLoadingThis = switching === acc.role;

              return (
                <button
                  key={acc.role}
                  disabled={isLoadingThis || switching !== null}
                  onClick={() => handleQuickLogin(acc)}
                  className={`w-full p-2 rounded-xl text-left text-xs transition flex items-center justify-between group ${
                    isCurrent 
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold' 
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">{acc.icon}</span>
                    <div className="min-w-0">
                      <div className="font-bold flex items-center gap-1.5">
                        <span className="truncate">{acc.name}</span>
                        {isCurrent && (
                          <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-semibold">
                            Đang dùng
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{acc.sub}</div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center">
                    {isLoadingThis ? (
                      <RotateCw className="w-4 h-4 text-emerald-600 animate-spin" />
                    ) : (
                      <span className="text-[10px] font-semibold text-teal-700 opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5">
                        Vào ngay &rarr;
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            {isAuthenticated ? (
              <button
                onClick={handleLogoutToShop}
                className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 text-[11px] p-1.5 hover:bg-rose-50 rounded-lg transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất & Về Cửa Hàng</span>
              </button>
            ) : (
              <span className="text-[10px] text-slate-400">Bạn đang ở chế độ xem tự do</span>
            )}

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-800 font-medium text-[11px] px-2 py-1"
            >
              Đóng lại
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 bg-slate-900/90 hover:bg-slate-900 text-white px-3.5 py-2.5 rounded-full shadow-xl shadow-slate-900/30 hover:scale-105 transition-all backdrop-blur-md border border-slate-700 text-xs font-bold"
        title="Chuyển đổi vai trò / Siêu thị"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-sm">{currentRoleInfo.icon}</span>
        <span className="hidden sm:inline">
          {isAuthenticated ? currentRoleInfo.label : '⚡ Đổi Vai Trò / Về Shop'}
        </span>
        <span className="sm:hidden">
          {isAuthenticated ? currentRoleInfo.label : 'Vai Trò'}
        </span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
      </button>
    </aside>
  );
}
