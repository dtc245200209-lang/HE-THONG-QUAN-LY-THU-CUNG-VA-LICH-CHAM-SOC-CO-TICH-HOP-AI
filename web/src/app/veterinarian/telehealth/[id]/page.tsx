'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Stethoscope, Heart, FileText, AlertCircle, 
  Save, CheckCircle2, Pill, Activity, User, ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import TelehealthRoom from '@/components/telehealth/TelehealthRoom';

export default function VetTelehealthPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user, loading: authLoading } = useAuth();

  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Clinical quick notes state
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    const fetchAppointment = async () => {
      try {
        const res = await api.get(`/api/v1/appointments/${id}`);
        setAppointment(res.data);
      } catch (err: any) {
        console.error('Failed to load appointment for telehealth:', err);
        setError('Không tìm thấy thông tin ca khám hoặc bạn không có quyền phụ trách ca này.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [id, authLoading]);

  const handleSaveClinicalNotes = async () => {
    if (!appointment?.pet?.id) return;
    if (!diagnosis.trim()) {
      alert('Vui lòng nhập chẩn đoán lâm sàng sơ bộ trước khi lưu.');
      return;
    }

    setSavingNotes(true);
    try {
      await api.post(`/api/v1/pets/${appointment.pet.id}/medical-records`, {
        pet_id: appointment.pet.id,
        veterinarian_id: user?.id,
        visit_date: new Date().toISOString().split('T')[0],
        diagnosis: `[Khám từ xa Tele-Health] ${diagnosis}`,
        treatment: treatmentPlan || 'Tư vấn theo dõi trực tuyến',
        notes: symptoms ? `Triệu chứng: ${symptoms}` : undefined,
      });

      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 3000);
    } catch (err: any) {
      alert('Lỗi khi lưu bệnh án: ' + (err.response?.data?.detail || ''));
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-400"></div>
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
          onClick={() => router.push('/veterinarian/appointments')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition cursor-pointer"
        >
          Quay lại danh sách ca khám
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top Bar */}
      <header className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/veterinarian')}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition cursor-pointer"
            title="Trở về trang Bác sĩ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-indigo-400" />
              Phòng Khám Trực Tuyến Tele-Health (Dành cho Bác Sĩ)
            </h1>
            <p className="text-xs text-slate-400">
              Bệnh nhân: <strong className="text-slate-200">{appointment.pet?.name || 'Thú cưng'}</strong> ({appointment.pet?.species || 'Pet'}) • Chủ nuôi:{' '}
              {appointment.customer?.full_name || 'Khách hàng'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {appointment.pet?.id && (
            <Link
              href={`/veterinarian/pets/${appointment.pet.id}`}
              target="_blank"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl border border-slate-700 transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Mở hồ sơ bệnh án thú cưng</span>
            </Link>
          )}
        </div>
      </header>

      {/* Main Grid: Video Call on Left, Clinical Quick Notes on Right */}
      <main className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-[1700px] mx-auto w-full">
        {/* Video Call (Takes 3 columns on large screens) */}
        <div className="lg:col-span-3 flex flex-col">
          <TelehealthRoom
            roomId={`appt_${id}`}
            currentUser={{
              id: user?.id || 'vet_guest',
              name: `BS. ${user?.full_name || 'PetCare'}`,
              role: 'VETERINARIAN',
            }}
            patientInfo={{
              petName: appointment.pet?.name || 'Thú cưng',
              species: appointment.pet?.species,
              ownerName: appointment.customer?.full_name || 'Chủ nuôi',
            }}
            onEndCall={() => {
              if (confirm('Bác sĩ có muốn kết thúc ca khám trực tuyến này?')) {
                router.push('/veterinarian');
              }
            }}
          />
        </div>

        {/* Clinical Quick Notes Panel (Takes 1 column) */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-2xl">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Ghi Chép Lâm Sàng Nhanh
              </h3>
              {notesSaved && (
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Đã lưu
                </span>
              )}
            </div>

            {/* Pet Quick Info Banner */}
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Thú cưng:</span>
                <span className="font-semibold text-slate-200">{appointment.pet?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Giống loài:</span>
                <span className="text-slate-300">{appointment.pet?.species} {appointment.pet?.breed ? `• ${appointment.pet.breed}` : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cân nặng:</span>
                <span className="text-slate-300">{appointment.pet?.weight ? `${appointment.pet.weight} kg` : 'Chưa ghi nhận'}</span>
              </div>
            </div>

            {/* Note Fields */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Triệu chứng quan sát qua Video:
              </label>
              <textarea
                rows={2}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Ho, chảy nước mắt, lờ đờ, gãi tai nhiều..."
                className="w-full bg-slate-800/90 text-xs text-slate-100 rounded-xl p-2.5 border border-slate-700 focus:border-indigo-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Chẩn đoán lâm sàng sơ bộ: <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={2}
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Viêm kết mạc dị ứng nhẹ, theo dõi 3 ngày..."
                className="w-full bg-slate-800/90 text-xs text-slate-100 rounded-xl p-2.5 border border-slate-700 focus:border-indigo-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phác đồ / Hướng điều trị & Lời khuyên:
              </label>
              <textarea
                rows={3}
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                placeholder="Vệ sinh bằng nước muối sinh lý 0.9%, nhỏ mắt Tobrex 2 lần/ngày..."
                className="w-full bg-slate-800/90 text-xs text-slate-100 rounded-xl p-2.5 border border-slate-700 focus:border-indigo-500 outline-hidden"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={handleSaveClinicalNotes}
              disabled={savingNotes}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {savingNotes ? (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{savingNotes ? 'Đang lưu bệnh án...' : 'Lưu Vào Hồ Sơ Bệnh Án'}</span>
            </button>

            {appointment.pet?.id && (
              <Link
                href={`/veterinarian/prescriptions/new?pet_id=${appointment.pet.id}`}
                target="_blank"
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition flex items-center justify-center gap-2 border border-slate-700"
              >
                <Pill className="w-3.5 h-3.5 text-pink-400" />
                <span>Kê đơn thuốc điện tử cho ca này</span>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
