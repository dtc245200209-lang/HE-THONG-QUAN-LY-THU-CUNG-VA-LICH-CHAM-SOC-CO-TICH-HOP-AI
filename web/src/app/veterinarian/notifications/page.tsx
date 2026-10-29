'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Check, Clock, ShieldAlert, Sparkles, CheckCircle2, Stethoscope, RefreshCw } from 'lucide-react';

export default function VeterinarianNotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Lỗi tải thông báo y tế:", err);
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
      console.error("Lỗi cập nhật trạng thái:", err);
    }
  };

  const handleTriggerReminders = async () => {
    try {
      await api.post('/api/v1/notifications/trigger-reminders');
      await fetchNotifs();
    } catch (err) {
      console.error("Lỗi đồng bộ nhắc nhở:", err);
    }
  };

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading || authLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Thông báo y tế & Lịch khám</h1>
            {unreadCount > 0 && (
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {unreadCount} mới
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">Cảnh báo ca tái khám, phác đồ điều trị và thông báo phòng khám</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerReminders}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-primary" />
            Đồng bộ cảnh báo
          </button>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === 'unread' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 divide-y divide-gray-100 overflow-hidden shadow-xs">
        {filteredNotifs.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-semibold text-gray-700">Không có thông báo nào</p>
            <p className="text-xs text-gray-400 mt-1">Bác sĩ đã cập nhật hết tất cả thông báo lâm sàng.</p>
          </div>
        ) : (
          filteredNotifs.map((notif) => (
            <div 
              key={notif.id} 
              className={`p-5 flex items-start justify-between gap-4 transition ${
                notif.is_read ? 'bg-white' : 'bg-blue-50/30'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  notif.type === 'APPOINTMENT' 
                    ? 'bg-blue-100 text-blue-600'
                    : notif.type === 'VACCINE'
                    ? 'bg-purple-100 text-purple-600'
                    : notif.type === 'LOST_PET'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {notif.type === 'APPOINTMENT' ? (
                    <Stethoscope className="w-5 h-5" />
                  ) : notif.type === 'LOST_PET' ? (
                    <ShieldAlert className="w-5 h-5" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${notif.is_read ? 'font-semibold text-gray-800' : 'font-bold text-gray-900'}`}>
                      {notif.title}
                    </p>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                      {notif.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(notif.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              <div className="shrink-0 pt-1">
                {!notif.is_read ? (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition"
                    title="Đánh dấu đã đọc"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-gray-300" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
