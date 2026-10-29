'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  PawPrint, ShoppingBag, ArrowRight, ShieldCheck, Heart, Sparkles, 
  Stethoscope, QrCode, Video, Calendar, UserPlus, LogIn, Star, 
  ExternalLink, ChevronRight, CheckCircle2, LogOut, PackageCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getProducts, Product } from '@/lib/api/products';
import { getRoleDashboardPath, getRoleBadge } from '@/components/layout/QuickPortalNav';

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await getProducts({ is_featured: true, limit: 4 });
        setFeaturedProducts(res.items);
      } catch (e) {
        console.error('Failed to load featured products', e);
      }
    }
    loadFeatured();
  }, []);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. TOP NOTIFICATION BAR */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-600 to-cyan-700 text-white text-xs py-2 px-4 text-center font-medium">
        <span>🎉 Chào mừng bạn đến với <strong>PetCare AI</strong> — Nền tảng Thú y số & Siêu thị thú cưng chuẩn y khoa hàng đầu</span>
      </div>

      {/* 2. PUBLIC HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <PawPrint className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900">PetCare AI</span>
              <p className="text-[11px] text-slate-500 font-medium">Smart Clinic & Pet Shop</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <Link href="/shop" className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 font-bold">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>Siêu Thị Thú Cưng</span>
            </Link>
            <Link href="/customer/orders" className="hover:text-teal-600 flex items-center gap-1.5 font-bold">
              <PackageCheck className="w-4 h-4 text-teal-600" />
              <span>Tra Cứu & Đơn Hàng</span>
            </Link>
            <Link href="/pet/emergency/demo" className="hover:text-teal-600 flex items-center gap-1 text-rose-600">
              <QrCode className="w-4 h-4" />
              <span>Thẻ QR Cấp Cứu</span>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={getRoleDashboardPath(user)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span>{getRoleBadge(user).icon}</span>
                  <span>Vào Hệ Thống ({getRoleBadge(user).label})</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => {
                    logout();
                    window.location.reload();
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1 border border-rose-200"
                  title="Đăng xuất"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Đăng Xuất</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-bold text-slate-700 hover:text-teal-600 px-3 py-2 transition-colors flex items-center gap-1"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng Nhập</span>
                </Link>
                <Link
                  href="/register"
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Đăng Ký</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 3. HERO SHOWCASE */}
      <section className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-b from-teal-50/70 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wide">
            <Sparkles className="w-4 h-4" />
            <span>HỆ THỐNG Y TẾ & CHĂM SÓC THÚ CƯNG TOÀN DIỆN</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Thế Giới Thức Ăn & Vật Phẩm Thú Cưng Đạt Chuẩn Thú Y
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Khám phá đa dạng các loại thức ăn dinh dưỡng, hạt khô, pate, thuốc bổ trợ và phụ kiện chăm sóc thú cưng chất lượng cao đạt chuẩn thú y.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/shop"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-teal-500/25 hover:shadow-xl transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Khám Phá Siêu Thị Thú Cưng Ngay</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/login"
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-sm sm:text-base shadow-xs transition-all"
            >
              Đăng Nhập Cổng Phòng Khám
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS SPOTLIGHT (Dữ liệu thật từ DB) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-1">Dữ liệu thật từ Database</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Sản Phẩm Dinh Dưỡng Nổi Bật</h2>
          </div>
          <Link
            href="/shop"
            className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 group"
          >
            <span>Xem tất cả sản phẩm</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((item) => (
            <Link
              key={item.id}
              href="/shop"
              className="group bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-xl hover:border-teal-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 rounded-xl overflow-hidden bg-slate-100 mb-3">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.badge && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-bold text-teal-700 uppercase">{item.brand}</div>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mt-0.5 group-hover:text-teal-600 transition-colors">
                  {item.name}
                </h3>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-black text-slate-900">{formatVND(item.price)}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{item.unit}</div>
                </div>
                <span className="p-2 rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <ShoppingBag className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. ECOSYSTEM PILLARS */}
      <section className="py-14 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">Hệ Sinh Thái Toàn Diện PetCare AI</h3>
            <p className="text-xs text-slate-500 mt-1">Kết nối bác sĩ, chủ nuôi và người chăm sóc trên một nền tảng</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Siêu Thị Thú Cưng</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Đầy đủ các loại đồ ăn, hạt khô, pate dinh dưỡng và phụ kiện y tế cho chó mèo. Đặt hàng nhanh chóng và giao hàng tận nơi.
              </p>
              <Link href="/shop" className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                <span>Vào siêu thị</span> <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <QrCode className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Hồ Sơ Cấp Cứu & Lost Pet QR</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Thẻ định danh số và chế độ tìm kiếm thất lạc thông minh. Người nhặt được có thể quét mã gọi điện khẩn cấp cho chủ nuôi ngay lập tức.
              </p>
              <Link href="/pet/emergency/demo" className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1">
                <span>Xem hồ sơ cấp cứu demo</span> <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Phòng Khám & Bệnh Án Điện Tử</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Đặt lịch khám, tiêm chủng, theo dõi chăm sóc live stream WebSocket và khám bệnh từ xa qua video call WebRTC chuẩn HD.
              </p>
              <Link href="/login" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                <span>Đăng nhập cổng chuyên môn</span> <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <PawPrint className="w-5 h-5 text-teal-400" />
            <span>PetCare AI Full-Stack Platform</span>
          </div>
          <p className="text-slate-500">© 2026 PetCare AI. Mọi quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
}
