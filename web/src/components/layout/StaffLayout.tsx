'use client';

import { useAuth } from '@/contexts/AuthContext';
import { 
  PawPrint, Calendar, Users, FileText, Settings, LogOut, LayoutDashboard, 
  Search, Bell, CreditCard, ShieldCheck, Stethoscope, Sparkles, Activity, 
  Clock, Syringe, ClipboardList, BarChart3, UserCheck, Package, ShoppingBag,
  ExternalLink, PackageCheck
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function StaffLayout({ children, role }: { children: React.ReactNode, role: string }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await api.get('/api/v1/notifications');
        const count = res.data.filter((n: any) => !n.is_read).length;
        setUnreadCount(count);
      } catch (err) {
        // silent fail
      }
    };
    fetchUnread();
  }, [user, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const roles = user.roles ? user.roles.map((r: any) => typeof r === 'string' ? r : r.name) : [];
  const hasAccess = roles.includes(role) || roles.includes('ADMIN');
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
          <PawPrint className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Yêu Cầu Quyền {role === 'RECEPTIONIST' ? 'Lễ Tân' : role}</h1>
        <p className="text-gray-500 mb-2 max-w-md text-sm">
          Tài khoản hiện tại của bạn là <strong>{user.full_name || user.email}</strong> ({roles.join(', ') || 'Chưa phân quyền'}).
        </p>
        <p className="text-slate-400 mb-6 text-xs">
          Bạn cần đăng nhập bằng tài khoản <strong>Lễ Tân ({role})</strong> hoặc <strong>Quản Trị Viên (ADMIN)</strong> để duyệt đơn hàng.
        </p>
        <div className="flex flex-wrap gap-3 justify-center max-w-sm">
          <Link
            href="/shop"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm"
          >
            🛒 Về Cửa Hàng Shop
          </Link>
          <Link
            href="/customer"
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-sm"
          >
            👤 Về Trang Khách Hàng
          </Link>
          <button 
            onClick={logout} 
            className="px-4 py-2.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 font-bold text-xs transition"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }


  const getNavigation = () => {
    if (role === 'ADMIN') {
      return [
        { name: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
        { name: 'Người dùng', href: '/admin/users', icon: Users },
        { name: 'Nhân viên', href: '/admin/staff', icon: UserCheck },
        { name: 'Thú cưng', href: '/admin/pets', icon: PawPrint },
        { name: 'Kho dược & Vật tư', href: '/admin/inventory', icon: Package },
        { name: 'Sản phẩm Pet Shop (DB)', href: '/admin/products', icon: ShoppingBag },
        { name: 'Thống kê Đơn & Hoàn trả', href: '/admin/orders', icon: BarChart3 },
        { name: 'Dịch vụ', href: '/admin/services', icon: ClipboardList },
        { name: 'Lịch hẹn', href: '/admin/appointments', icon: Calendar },
        { name: 'Giao dịch', href: '/admin/payments', icon: CreditCard },
        { name: 'Báo cáo', href: '/admin/reports', icon: BarChart3 },
        { name: 'Thông báo', href: '/admin/notifications', icon: Bell },
        { name: 'Nhật ký audit', href: '/admin/audit', icon: ShieldCheck },
        { name: 'Cấu hình AI', href: '/admin/ai', icon: Sparkles },
        { name: 'Cài đặt', href: '/admin/settings', icon: Settings },
      ];
    }
    if (role === 'RECEPTIONIST') {
      return [
        { name: 'Tổng quan', href: '/receptionist', icon: LayoutDashboard },
        { name: 'Khách hàng', href: '/receptionist/customers', icon: Users },
        { name: 'Lịch hẹn', href: '/receptionist/appointments', icon: Calendar },
        { name: 'Duyệt đơn Pet Shop', href: '/receptionist/orders', icon: PackageCheck },
        { name: 'Hồ sơ thú cưng', href: '/receptionist/pets', icon: PawPrint },
        { name: 'Dịch vụ & Giá', href: '/receptionist/services', icon: ClipboardList },
        { name: 'Thu ngân', href: '/receptionist/payments', icon: CreditCard },
        { name: 'Đội Caregiver', href: '/receptionist/caregivers', icon: Activity },
        { name: 'Đội Bác sĩ', href: '/receptionist/veterinarians', icon: Stethoscope },
        { name: 'Thông báo', href: '/receptionist/notifications', icon: Bell },
      ];
    }
    if (role === 'CAREGIVER') {
      return [
        { name: 'Công việc hôm nay', href: '/caregiver', icon: LayoutDashboard },
        { name: 'Lịch làm việc', href: '/caregiver/schedule', icon: Calendar },
        { name: 'Phiên chăm sóc', href: '/caregiver/sessions', icon: Clock },
        { name: 'Thú cưng', href: '/caregiver/pets', icon: PawPrint },
        { name: 'Báo cáo ca trực', href: '/caregiver/reports', icon: FileText },
        { name: 'Thông báo', href: '/caregiver/notifications', icon: Bell },
      ];
    }
    if (role === 'VETERINARIAN') {
      return [
        { name: 'Bệnh nhân hôm nay', href: '/veterinarian', icon: LayoutDashboard },
        { name: 'Danh sách thú cưng', href: '/veterinarian/patients', icon: PawPrint },
        { name: 'Lịch khám', href: '/veterinarian/schedule', icon: Calendar },
        { name: 'Kho Dược Phẩm', href: '/veterinarian/inventory', icon: Package },
        { name: 'Bệnh án điện tử', href: '/veterinarian/medical-records', icon: FileText },
        { name: 'Đơn thuốc', href: '/veterinarian/prescriptions', icon: ClipboardList },
        { name: 'Tiêm chủng', href: '/veterinarian/vaccinations', icon: Syringe },
        { name: 'Tài liệu & SA/X-quang', href: '/veterinarian/documents', icon: Activity },
        { name: 'Thông báo', href: '/veterinarian/notifications', icon: Bell },
      ];
    }
    return [];
  };

  const navigation = getNavigation();
  const currentNav = navigation.find(n => n.href === pathname) || navigation[0];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col min-h-screen flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-primary">
            <PawPrint className="w-6 h-6" />
            <span className="font-bold text-lg text-gray-900">PetCare AI</span>
          </div>
        </div>
        
        <div className="px-6 py-4 flex items-center justify-between">
           <span className="text-xs font-bold uppercase tracking-wider text-primary">
             {role === 'RECEPTIONIST' ? 'Lễ tân' : role === 'CAREGIVER' ? 'Người chăm sóc' : role === 'VETERINARIAN' ? 'Bác sĩ thú y' : 'Quản trị viên'}
           </span>
        </div>

        {/* Public Shop Shortcut */}
        <div className="px-4 mb-2">
          <Link
            href="/shop"
            className="w-full px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-between group transition shadow-xs"
            title="Xem Cửa Hàng Siêu Thị PetCare"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>🛒 Siêu Thị Thú Cưng</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-semibold' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                  {item.name}
                </div>
                {item.name === 'Thông báo' && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
               <img src={`https://ui-avatars.com/api/?name=${user.full_name}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-bold text-gray-900 truncate">{user.full_name}</p>
               <p className="text-xs text-gray-500 truncate">{user.email}</p>
             </div>
          </div>
          <button
            onClick={() => {
              logout();
              window.location.href = '/shop';
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
          >
            <LogOut className="w-5 h-5 text-gray-400" />
            Đăng xuất ra Shop
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
           <h2 className="text-xl font-bold text-gray-900">
             {currentNav?.name || 'Trang chủ'}
           </h2>
           <div className="flex items-center gap-4">
             <Link
               href="/shop"
               className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-bold transition border border-slate-200"
               title="Xem Cửa Hàng Siêu Thị PetCare (Public)"
             >
               <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
               <span>Cửa hàng Public</span>
             </Link>

             <div className="relative">
               <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
               <input 
                 type="text" 
                 placeholder="Search..." 
                 className="pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all w-64"
               />
             </div>
             <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 relative">
               <Bell className="w-5 h-5" />
               <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
             </button>
           </div>
        </header>

        {/* Scrollable Content */}
        <div className="p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
