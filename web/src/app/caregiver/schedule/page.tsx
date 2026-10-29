'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, MapPin, User, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Appointment {
  id: string;
  customer_id: string;
  pet_id: string;
  scheduled_time: string;
  status: string;
  total_price: number;
}

export default function SchedulePage() {
  const { user, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const fetchAppointments = async () => {
      try {
        const response = await api.get('/api/v1/appointments');
        setAppointments(response.data);
      } catch (err) {
        console.error("Lỗi khi tải lịch làm việc:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, [user, authLoading]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'CONFIRMED': return 'bg-blue-100 text-primary/90 border-blue-200';
      case 'CHECKED_IN': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'IN_PROGRESS': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const upcomingAppointments = appointments
    .filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING')
    .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime());

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-transparent">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Lịch làm việc của tôi</h1>
        <p className="text-gray-500">Xem các lịch hẹn chăm sóc được phân công cho bạn.</p>
      </div>

      {upcomingAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Không có lịch hẹn mới</h2>
          <p className="text-gray-500">Bạn hiện không có lịch hẹn nào đang chờ xử lý.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {upcomingAppointments.map((appt) => {
            const date = new Date(appt.scheduled_time);
            return (
              <div key={appt.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <div className="p-6 border-b border-gray-50 flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex flex-col items-center justify-center text-primary">
                      <span className="text-xs font-semibold uppercase">{date.toLocaleString('vi-VN', { month: 'short' })}</span>
                      <span className="text-lg font-bold leading-none">{date.getDate()}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Ca chăm sóc</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Clock className="w-4 h-4" />
                        {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(appt.status)}`}>
                    {appt.status}
                  </Badge>
                </div>

                <div className="p-6 space-y-4 flex-1 bg-gray-50/30">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <User className="w-5 h-5 text-gray-400" />
                    <span>Mã khách hàng: <span className="font-mono font-medium">{appt.customer_id.substring(0, 8)}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span>PetCare Center (Tại trung tâm)</span>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-50 bg-white">
                  <Link 
                    href="/caregiver/sessions"
                    className="flex w-full items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  >
                    Đến trang Phiên chăm sóc <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
