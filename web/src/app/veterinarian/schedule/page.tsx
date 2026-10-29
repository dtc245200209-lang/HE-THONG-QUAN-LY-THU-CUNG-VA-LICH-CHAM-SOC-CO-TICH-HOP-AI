'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, Stethoscope, User, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function VetSchedulePage() {
  const { user, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    const fetchAppts = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/v1/appointments');
        setAppointments(res.data);
      } catch (err) {
        console.error("Lỗi tải lịch khám:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppts();
  }, [authLoading]);

  if (loading || authLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Lịch Khám & Trực Bác Sĩ</h1>
        <p className="text-sm text-gray-500 mt-1">Danh sách ca khám bệnh theo lịch hẹn trong ngày và tuần này</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {appointments.length === 0 ? (
          <div className="col-span-2 bg-white rounded-3xl border border-gray-200 p-12 text-center text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-semibold text-gray-600">Chưa có lịch hẹn khám nào</p>
          </div>
        ) : (
          appointments.map((appt) => (
            <div key={appt.id} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(appt.scheduled_time).toLocaleString('vi-VN')}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700">
                    {appt.status}
                  </span>
                </div>

                <h3 className="font-bold text-base text-gray-900 mb-1">
                  Khám cho {appt.pet?.name || 'Thú cưng'}
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  Dịch vụ: {appt.services?.map((s: any) => s.service?.name).join(', ') || 'Khám bệnh thú cưng'}
                </p>

                {appt.notes && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-600 mb-4">
                    <strong>Ghi chú:</strong> {appt.notes}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                {appt.pet_id && (
                  <Link
                    href={`/veterinarian/patients/${appt.pet_id}`}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    Vào khám bệnh ngay <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
