'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Sparkles, CheckCircle2, Calendar, Clock, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function CaregiverReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/v1/appointments');
        // Filter appointments that are completed or in progress
        setAppointments(res.data.filter((a: any) => a.status === 'COMPLETED' || a.status === 'IN_PROGRESS'));
      } catch (err) {
        console.error("Lỗi khi tải báo cáo:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [authLoading]);

  if (loading || authLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Nhật ký & Báo cáo Chăm sóc</h1>
        <p className="text-sm text-gray-500 mt-1">Lịch sử các báo cáo Care Report và phiên chăm sóc đã thực hiện</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {appointments.length === 0 ? (
          <div className="col-span-2 bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-semibold text-gray-600">Chưa có báo cáo chăm sóc nào</p>
          </div>
        ) : (
          appointments.map((appt) => (
            <div key={appt.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    appt.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
                  }`}>
                    {appt.status === 'COMPLETED' ? 'Đã nghiệm thu' : 'Đang thực hiện'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(appt.scheduled_time).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <h3 className="font-bold text-base text-gray-900 mb-1">
                  Ca chăm sóc cho {appt.pet?.name || 'Thú cưng'}
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  Dịch vụ: {appt.services?.map((s: any) => s.service?.name).join(', ') || 'Chăm sóc toàn diện'}
                </p>

                {appt.notes && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-700 mb-4">
                    <strong>Ghi chú:</strong> {appt.notes}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <Link
                  href={`/caregiver/sessions/${appt.id}`}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  Xem chi tiết ca chăm sóc <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
