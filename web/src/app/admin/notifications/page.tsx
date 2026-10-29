'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Check, AlertTriangle, ShieldCheck, TrendingUp, Package } from 'lucide-react';

export default function AdminNotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Lỗi khi tải thông báo quản trị:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchNotifs();
  }, [authLoading]);

  const handleMarkRead = async (id: string) => {
    try {
      await api.put(`/api/v1/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Lỗi cập nhật:', err);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    for (const n of unread) {
      await handleMarkRead(n.id);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SYSTEM':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'PAYMENT':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'MEDICAL':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-600" />;
    }
  };

  if (loading || authLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Thông báo Hệ thống & Quản trị</h1>
          <p className="text-sm text-gray-500 mt-1">
            Báo cáo vận hành tự động, cảnh báo kho hàng và nhật ký sự kiện PetCare AI
          </p>
        </div>
        {notifications.some(n => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition"
          >
            <Check className="w-4 h-4" /> Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 divide-y divide-gray-100 overflow-hidden shadow-xs">
        {notifications.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-base font-semibold text-gray-700">Hộp thư quản trị trống</p>
            <p className="text-xs text-gray-400 mt-1">Hệ thống đang hoạt động ổn định và không có cảnh báo mới.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 flex items-start justify-between gap-4 transition ${
                notif.is_read ? 'bg-white' : 'bg-indigo-50/40'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs ${
                    notif.is_read ? 'bg-slate-100 text-gray-400' : 'bg-white border border-indigo-100'
                  }`}
                >
                  {getIcon(notif.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-bold ${notif.is_read ? 'text-gray-700' : 'text-gray-950'}`}>
                      {notif.title}
                    </h3>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{notif.message}</p>
                  <span className="text-[11px] text-gray-400 mt-2 block font-medium">
                    {new Date(notif.created_at).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>

              {!notif.is_read && (
                <button
                  onClick={() => handleMarkRead(notif.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 rounded-xl transition flex items-center gap-1 flex-shrink-0 shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" /> Đã đọc
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
