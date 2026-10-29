'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PawPrint, Calendar, FileText, Bot, Bell, Home, HeartPulse, FileArchive, LogOut, ShoppingBag, PackageCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

export default function CustomerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await api.get('/api/v1/notifications');
        const unread = res.data.filter((n: any) => !n.is_read).length;
        setUnreadCount(unread);
      } catch (err) {
        // silent fail
      }
    };
    fetchUnread();
  }, [user, pathname]);

  const menuItems = [
    { name: 'Dashboard', href: '/customer', icon: Home },
    { name: 'Siêu thị thú cưng', href: '/shop', icon: ShoppingBag },
    { name: 'Đơn hàng của tôi', href: '/customer/orders', icon: PackageCheck },
    { name: 'Thú cưng của tôi', href: '/customer/pets', icon: PawPrint },
    { name: 'Lịch hẹn', href: '/customer/appointments', icon: Calendar },
    { name: 'Digital Passport', href: '/customer/passport', icon: FileText },
    { name: 'Chăm sóc', href: '/customer/care', icon: HeartPulse },
    { name: 'Tài liệu', href: '/customer/documents', icon: FileArchive },
    { name: 'Thông báo', href: '/customer/notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
    { name: 'AI Assistant', href: '/customer/ai-chat', icon: Bot },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/shop';
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full flex-shrink-0">
      <div className="h-20 flex flex-col justify-center px-6 border-b border-gray-50 pt-4 pb-2">
        <div className="flex items-center gap-2 text-blue-600 mb-1">
          <PawPrint className="w-6 h-6 fill-blue-600 text-blue-600" />
          <span className="font-extrabold text-xl tracking-tight text-gray-900">PetCare AI</span>
        </div>
        <div className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full inline-block w-max tracking-wide uppercase mt-1">
          Chủ thú cưng
        </div>
      </div>

      {/* Public Shop Shortcut */}
      <div className="px-4 pt-3 pb-1">
        <Link
          href="/shop"
          className="w-full px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-between group transition shadow-xs"
          title="Xem Cửa hàng Siêu thị PetCare Public"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <span>🛒 Cửa Hàng Public</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform">&rarr;</span>
        </Link>
      </div>
      
      <nav className="flex-1 py-3 px-4 flex flex-col gap-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/customer' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                {item.name}
              </div>
              {item.badge && (
                <span className="bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold overflow-hidden flex items-center justify-center flex-shrink-0">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
            ) : (
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || user?.email || 'User')}&background=0D8ABC&color=fff`} 
                alt="User Avatar" 
                className="w-full h-full object-cover" 
              />
            )}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-sm text-gray-900 truncate">{user?.full_name || user?.email || 'Chủ thú cưng'}</h4>
            <p className="text-xs text-gray-500 truncate">{user?.email || 'Khách hàng'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
