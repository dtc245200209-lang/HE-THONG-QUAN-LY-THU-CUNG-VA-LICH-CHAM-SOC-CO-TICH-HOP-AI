'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Check, Clock, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export default function CaregiverNotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error("Lỗi tải thông báo:", err);
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
      console.error("Lỗi cập nhật:", err);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Thông báo ca trực</h1>
          <p className="text-sm text-gray-500 mt-1">Thông báo lịch hẹn, phân công chăm sóc và hệ thống</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 divide-y divide-gray-100 overflow-hidden shadow-xs">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-semibold text-gray-600">Hộp thư thông báo trống</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`p-5 flex items-start justify-between gap-4 transition ${
                notif.is_read ? 'bg-white' : 'bg-indigo-50/30'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  notif.is_read ? 'bg-slate-100 text-gray-500' : 'bg-indigo-600 text-white'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-bold ${notif.is_read ? 'text-gray-800' : 'text-indigo-950'}`}>
                      {notif.title}
                    </h3>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{notif.message}</p>
                  <span className="text-[11px] text-gray-400 mt-2 block">
                    {new Date(notif.created_at).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>

              {!notif.is_read && (
                <button
                  onClick={() => handleMarkRead(notif.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition flex items-center gap-1 flex-shrink-0"
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
