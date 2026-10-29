'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  HeartPulse, Calendar, Clock, Activity, Video, 
  CheckCircle2, AlertCircle, ArrowRight, RefreshCw, PawPrint 
} from 'lucide-react';
import Link from 'next/link';

export default function CustomerCareHubPage() {
  const { user, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCareData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/appointments');
      setAppointments(res.data || []);
    } catch (err) {
      console.error("Lỗi tải thông tin ca chăm sóc:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchCareData();
  }, [authLoading]);

  const activeAppts = appointments.filter(a => ['CONFIRMED', 'IN_PROGRESS'].includes(a.status));
  const completedAppts = appointments.filter(a => a.status === 'COMPLETED');

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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Theo dõi Chăm sóc Trực tuyến</h1>
          <p className="text-sm text-gray-500 mt-1">Cập nhật nhật ký chăm sóc theo thời gian thực (Live WebSocket feed) từ Caregiver</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCareData}
            className="p-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition shadow-xs"
            title="Làm mới"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/customer/appointments"
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Calendar className="w-4 h-4" />
            Đặt lịch mới
          </Link>
        </div>
      </div>

      {/* Active Care Live Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
          <h2 className="text-base font-bold text-gray-900">Ca chăm sóc đang diễn ra & Đã xác nhận</h2>
        </div>

        {activeAppts.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-3xl border border-gray-200 shadow-xs">
            <HeartPulse className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">Hiện không có ca chăm sóc nào đang diễn ra</p>
            <p className="text-xs text-gray-400 mt-1">Khi bạn đặt dịch vụ và nhân viên tiếp nhận, bạn có thể theo dõi trực tiếp tại đây.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAppts.map((appt) => (
              <div key={appt.id} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        appt.status === 'IN_PROGRESS' 
                          ? 'bg-emerald-100 text-emerald-700 animate-pulse'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {appt.status === 'IN_PROGRESS' ? 'ĐANG CHĂM SÓC TRỰC TUYẾN' : 'ĐÃ XÁC NHẬN LỊCH'}
                      </span>
                      <h3 className="font-bold text-gray-900 text-base mt-2">
                        {appt.services?.map((s: any) => s.name).join(', ') || 'Chăm sóc thú cưng'}
                      </h3>
                    </div>
                    <Activity className="w-5 h-5 text-emerald-500" />
                  </div>

                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-3">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    Thời gian hẹn: {new Date(appt.scheduled_time).toLocaleString('vi-VN')}
                  </p>
                  {appt.notes && (
                    <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl mt-3">
                      Ghi chú: {appt.notes}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-mono">#{appt.id.substring(0, 8)}</span>
                  <Link
                    href={`/customer/appointments/${appt.id}`}
                    className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition shadow-xs"
                  >
                    Xem Live Feed <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3">Lịch sử chăm sóc hoàn thành gần đây</h2>
        <div className="bg-white rounded-3xl border border-gray-200 divide-y divide-gray-100 overflow-hidden shadow-xs">
          {completedAppts.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">
              Chưa có lịch sử ca chăm sóc hoàn thành
            </div>
          ) : (
            completedAppts.slice(0, 5).map((appt) => (
              <div key={appt.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {appt.services?.map((s: any) => s.name).join(', ') || 'Chăm sóc thú cưng'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(appt.scheduled_time).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/customer/appointments/${appt.id}`}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Xem báo cáo &rarr;
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
