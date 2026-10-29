'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Check, Calendar, Stethoscope, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const fetchNotifications = async () => {
      try {
        const response = await api.get('/api/v1/notifications');
        setNotifications(response.data);
      } catch (err) {
        console.error("Lỗi khi tải thông báo:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [user, authLoading]);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/api/v1/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc", error);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    for (const n of unread) {
      await markAsRead(n.id);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'APPOINTMENT': return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'MEDICAL': return <Stethoscope className="w-5 h-5 text-green-500" />;
      case 'CARE_SESSION': return <Info className="w-5 h-5 text-purple-500" />;
      case 'SYSTEM': return <ShieldAlert className="w-5 h-5 text-red-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBgColorForType = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-gray-50';
    switch (type) {
      case 'APPOINTMENT': return 'bg-blue-50';
      case 'MEDICAL': return 'bg-green-50';
      case 'CARE_SESSION': return 'bg-purple-50';
      case 'SYSTEM': return 'bg-red-50';
      default: return 'bg-gray-50';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen bg-transparent">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Thông báo</h1>
          <p className="text-gray-500">Cập nhật các hoạt động và nhắc nhở mới nhất từ phòng khám.</p>
        </div>
        {notifications.some(n => !n.is_read) && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors bg-primary/10 px-4 py-2 rounded-xl"
          >
            <Check className="w-4 h-4" /> Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bell className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Không có thông báo nào</h2>
          <p className="text-gray-500 max-w-md mx-auto">Khi có cập nhật mới về lịch hẹn hoặc thú cưng của bạn, thông báo sẽ xuất hiện tại đây.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`flex gap-4 p-5 rounded-2xl border transition-all ${
                notification.is_read 
                  ? 'bg-white border-gray-100 text-gray-600' 
                  : 'bg-white border-primary/20 shadow-md shadow-primary/5 text-gray-900'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getBgColorForType(notification.type, notification.is_read)}`}>
                {getIconForType(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start gap-4">
                  <h3 className={`text-base font-bold mb-1 ${notification.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(notification.created_at).toLocaleString('vi-VN')}
                  </span>
                </div>
                <p className={`text-sm ${notification.is_read ? 'text-gray-500' : 'text-gray-600 font-medium'}`}>
                  {notification.message}
                </p>
              </div>
              {!notification.is_read && (
                <button 
                  onClick={() => markAsRead(notification.id)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors self-center flex-shrink-0"
                  title="Đánh dấu đã đọc"
                >
                  <span className="w-2.5 h-2.5 bg-primary rounded-full"></span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
