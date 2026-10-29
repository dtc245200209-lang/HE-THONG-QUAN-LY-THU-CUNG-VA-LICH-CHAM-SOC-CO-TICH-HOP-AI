'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Stethoscope, Heart, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import TelehealthRoom from '@/components/telehealth/TelehealthRoom';

export default function CustomerTelehealthPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user, loading: authLoading } = useAuth();

  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    const fetchAppointment = async () => {
      try {
        const res = await api.get(`/api/v1/appointments/${id}`);
        setAppointment(res.data);
      } catch (err: any) {
        console.error('Failed to load appointment for telehealth:', err);
        setError('Không tìm thấy thông tin phòng khám hoặc lịch hẹn không hợp lệ.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [id, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center text-white">
        <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
        <h2 className="text-xl font-bold mb-2">Không thể tham gia phòng khám</h2>
        <p className="text-slate-400 text-sm mb-6">{error}</p>
        <button
          onClick={() => router.push('/customer/appointments')}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition cursor-pointer"
        >
          Quay lại danh sách lịch hẹn
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top Bar */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/customer/appointments/${id}`)}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition cursor-pointer"
            title="Trở về chi tiết lịch hẹn"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-400" />
              Tư Vấn Khám Thú Y Từ Xa (Tele-Health)
            </h1>
            <p className="text-xs text-slate-400">
              Lịch hẹn: #{appointment.id.split('-')[0].toUpperCase()} • Bác sĩ:{' '}
              {appointment.caregiver?.full_name || 'Bác sĩ PetCare'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/customer/appointments/${id}`}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Xem hồ sơ hẹn</span>
          </Link>
        </div>
      </header>

      {/* Main Call Area */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full flex flex-col">
        <TelehealthRoom
          roomId={`appt_${id}`}
          currentUser={{
            id: user?.id || 'cust_guest',
            name: user?.full_name || user?.email || 'Khách hàng',
            role: 'CUSTOMER',
          }}
          patientInfo={{
            petName: appointment.pet?.name || 'Thú cưng',
            species: appointment.pet?.species,
            ownerName: user?.full_name || 'Chủ nuôi',
          }}
          onEndCall={() => {
            if (confirm('Bạn có muốn kết thúc buổi tư vấn khám trực tuyến?')) {
              router.push(`/customer/appointments/${id}`);
            }
          }}
        />
      </main>
    </div>
  );
}
