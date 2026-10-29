'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, MapPin, User, Stethoscope, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function AppointmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    const fetchAppointments = async () => {
      try {
        const response = await api.get('/api/v1/appointments');
        setAppointments(response.data);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [authLoading]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      PENDING: { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-700' },
      CONFIRMED: { label: 'Đã xác nhận', className: 'bg-blue-100 text-blue-700' },
      CHECKED_IN: { label: 'Đã đến', className: 'bg-purple-100 text-purple-700' },
      IN_PROGRESS: { label: 'Đang phục vụ', className: 'bg-indigo-100 text-indigo-700' },
      COMPLETED: { label: 'Hoàn thành', className: 'bg-green-100 text-green-700' },
      CANCELLED: { label: 'Đã hủy', className: 'bg-red-100 text-red-700' },
    };
    
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${config.className}`}>{config.label}</span>;
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Lịch hẹn của tôi</h1>
          <p className="text-gray-500 text-sm">Quản lý và theo dõi các lịch hẹn chăm sóc thú cưng.</p>
        </div>
        <Link 
          href="/customer/appointments/new"
          className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Đặt lịch mới
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Chưa có lịch hẹn nào</h3>
          <p className="text-gray-500 mb-6">Bạn chưa đặt lịch hẹn chăm sóc nào cho thú cưng của mình.</p>
          <Link 
            href="/customer/appointments/new"
            className="text-primary font-medium hover:underline"
          >
            Đặt lịch ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Lịch khám cho {appointment.pet?.name || 'Thú cưng'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {appointment.services?.map((s: any) => s.service.name).join(', ')}
                    </p>
                  </div>
                </div>
                <div>
                  {getStatusBadge(appointment.status)}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                  #APPT-{appointment.id.replace(/-/g, '').substring(0, 8).toUpperCase()}
                </span>
                <span className="text-xs text-gray-400">
                  Đặt lúc: {appointment.created_at ? new Date(appointment.created_at).toLocaleDateString('vi-VN') : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-700 font-semibold">
                  <Clock className="w-4 h-4 text-primary" />
                  {new Date(appointment.scheduled_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - Ngày {new Date(appointment.scheduled_time).toLocaleDateString('vi-VN')}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  Bệnh viện PetCare Center
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Stethoscope className="w-4 h-4 text-indigo-600" />
                  {appointment.caregiver?.full_name ? `BS/NV: ${appointment.caregiver.full_name}` : 'Đang điều phối nhân sự'}
                </div>
                <Link href={`/customer/appointments/${appointment.id}`} className="flex justify-end items-center gap-1.5 text-sm font-bold text-primary hover:underline">
                  Xem chi tiết lịch hẹn <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
