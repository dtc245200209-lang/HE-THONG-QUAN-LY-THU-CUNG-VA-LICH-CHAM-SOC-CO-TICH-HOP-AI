'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, FileText, ClipboardList, Activity, Stethoscope, 
  PawPrint, Syringe, Clock, CheckCircle2, RefreshCw, ArrowRight, Video 
} from 'lucide-react';
import Link from 'next/link';

export default function VeterinarianDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVetData = async () => {
    try {
      setLoading(true);
      const [apptsRes, petsRes] = await Promise.all([
        api.get('/api/v1/appointments').catch(() => ({ data: [] })),
        api.get('/api/v1/pets').catch(() => ({ data: [] }))
      ]);
      setAppointments(apptsRes.data || []);
      setPatients(petsRes.data || []);
    } catch (err) {
      console.error("Lỗi tải thông tin bác sĩ:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchVetData();
  }, [authLoading]);

  const activeCases = appointments.filter(a => ['CONFIRMED', 'IN_PROGRESS'].includes(a.status));
  const completedCases = appointments.filter(a => a.status === 'COMPLETED');

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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Cổng Bác sĩ Thú y (Veterinarian Portal)</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý lịch khám lâm sàng, hồ sơ bệnh nhân và phác đồ điều trị</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchVetData}
            className="p-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition shadow-xs flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className="w-4 h-4 text-primary" />
            Làm mới
          </button>
          <Link 
            href="/veterinarian/documents" 
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
          >
            <FileText className="w-4 h-4" />
            Quét y bạ AI OCR
          </Link>
        </div>
      </div>
      
      {/* 4 Clinical KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="rounded-3xl border-gray-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase text-gray-500">Ca khám cần xử lý</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-gray-900">{activeCases.length}</div>
            <p className="text-xs text-primary font-medium mt-1">Đang chờ hoặc đang trong ca</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-3xl border-gray-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase text-gray-500">Bệnh nhân đã tiếp nhận</CardTitle>
            <PawPrint className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-gray-900">{patients.length}</div>
            <p className="text-xs text-purple-600 font-medium mt-1">Hồ sơ thú cưng trên hệ thống</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-gray-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase text-gray-500">Ca khám đã hoàn tất</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-gray-900">{completedCases.length}</div>
            <p className="text-xs text-emerald-600 font-medium mt-1">Đã lưu bệnh án & đơn thuốc</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-gray-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase text-gray-500">Cảnh báo lâm sàng</CardTitle>
            <Activity className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-gray-900">
              {patients.filter(p => p.is_lost).length}
            </div>
            <p className="text-xs text-amber-600 font-medium mt-1">Thú cưng đang báo thất lạc</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Clinical Modules */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/veterinarian/patients"
          className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-primary/50 shadow-xs flex items-center gap-3 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition">
            <PawPrint className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Danh sách Bệnh nhân</p>
            <p className="text-[11px] text-gray-400">Tra cứu bệnh sử</p>
          </div>
        </Link>

        <Link
          href="/veterinarian/medical-records"
          className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-primary/50 shadow-xs flex items-center gap-3 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Bệnh án Điện tử</p>
            <p className="text-[11px] text-gray-400">Chẩn đoán & Khám</p>
          </div>
        </Link>

        <Link
          href="/veterinarian/prescriptions"
          className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-primary/50 shadow-xs flex items-center gap-3 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Kê Đơn thuốc</p>
            <p className="text-[11px] text-gray-400">Liều lượng & Hướng dẫn</p>
          </div>
        </Link>

        <Link
          href="/veterinarian/vaccinations"
          className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-primary/50 shadow-xs flex items-center gap-3 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
            <Syringe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Sổ Tiêm chủng</p>
            <p className="text-[11px] text-gray-400">Mũi nhắc lại & Chứng nhận</p>
          </div>
        </Link>
      </div>

      {/* Active Patients Roster */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Ca khám Gần nhất Cần Tiếp nhận
          </h2>
          <Link href="/veterinarian/schedule" className="text-xs font-semibold text-primary hover:underline">
            Xem lịch khám chi tiết &rarr;
          </Link>
        </div>

        {activeCases.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <ClipboardList className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-semibold text-gray-600">Hiện không có ca khám nào đang chờ</p>
            <p className="text-xs mt-1">Khi lễ tân check-in bệnh nhân mới, thông tin sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {activeCases.map((appt) => (
              <div key={appt.id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-sm text-gray-900">
                    {appt.services?.map((s: any) => s.name).join(', ') || 'Khám lâm sàng thú y'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Hẹn lúc: {new Date(appt.scheduled_time).toLocaleString('vi-VN')} {appt.notes ? `• Ghi chú: ${appt.notes}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    appt.status === 'IN_PROGRESS' 
                      ? 'bg-amber-100 text-amber-800 animate-pulse'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {appt.status}
                  </span>
                  <Link
                    href={`/veterinarian/telehealth/${appt.id}`}
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition flex items-center gap-1"
                    title="Vào phòng khám từ xa (Video Call)"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Khám Video</span>
                  </Link>
                  <Link
                    href={`/veterinarian/patients/${appt.pet_id || ''}`}
                    className="p-2 text-primary hover:bg-primary/10 rounded-xl transition"
                    title="Mở bệnh án lâm sàng"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
