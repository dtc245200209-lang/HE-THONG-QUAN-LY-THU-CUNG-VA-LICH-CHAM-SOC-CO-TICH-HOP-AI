'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, Stethoscope, Syringe, Pill, Activity, 
  Sparkles, CheckCircle2, Plus, AlertTriangle, FileText, HeartPulse
} from 'lucide-react';
import Link from 'next/link';

export default function VetPatientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [passport, setPassport] = useState<any>(null);
  const [healthInsights, setHealthInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New Medical Record Form
  const [showExamModal, setShowExamModal] = useState(false);
  const [examForm, setExamForm] = useState({
    diagnosis: '',
    treatment: '',
    clinic: 'PetCare Central Hospital',
    veterinarian: user?.full_name || 'Bác sĩ Thú y'
  });
  const [submittingExam, setSubmittingExam] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [passportRes, insightsRes] = await Promise.all([
        api.get(`/api/v1/pets/${id}/passport`),
        api.get(`/api/v1/pets/${id}/health-insights`).catch(() => ({ data: null }))
      ]);
      setPassport(passportRes.data);
      setHealthInsights(insightsRes?.data);
    } catch (err) {
      console.error("Lỗi khi tải hồ sơ bệnh nhân:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchData();
  }, [id, authLoading]);

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examForm.diagnosis.trim()) return;

    setSubmittingExam(true);
    try {
      await api.post(`/api/v1/pets/${id}/medical_records`, {
        visit_date: new Date().toISOString().split('T')[0],
        clinic: examForm.clinic,
        veterinarian: examForm.veterinarian,
        diagnosis: examForm.diagnosis,
        treatment: examForm.treatment
      });
      setShowExamModal(false);
      setExamForm({
        diagnosis: '',
        treatment: '',
        clinic: 'PetCare Central Hospital',
        veterinarian: user?.full_name || 'Bác sĩ Thú y'
      });
      fetchData();
    } catch (err: any) {
      alert("Lỗi khi lưu bệnh án: " + (err.response?.data?.detail || err.message));
    } finally {
      setSubmittingExam(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!passport) {
    return (
      <div className="p-8 text-center text-red-500">
        Không tìm thấy thông tin bệnh nhân
      </div>
    );
  }

  const { pet, medical_records, vaccinations, allergies, conditions, weights } = passport;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/veterinarian/patients" 
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Bệnh án Lâm sàng: {pet.name}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {pet.species} • {pet.breed || 'Chưa rõ'} • {pet.sex === 'MALE' ? 'Đực' : 'Cái'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowExamModal(true)}
          className="bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> Tạo phiếu khám bệnh
        </button>
      </div>

      {/* AI Health Insights Banner */}
      {healthInsights && (
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-300" />
              <h2 className="font-bold text-base">AI Health Insights & Phân tích Xu hướng</h2>
            </div>
            <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">
              {healthInsights.life_stage}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthInsights.insights?.map((ins: any, idx: number) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-blue-200">
                  <span>{ins.category}</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] text-white">{ins.status}</span>
                </div>
                <p className="text-white/90">{ins.description}</p>
                <p className="text-blue-200 font-semibold pt-1">💡 Khuyến nghị: {ins.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Critical Medical Flags */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs">
          <h3 className="font-bold text-xs uppercase tracking-wider text-red-600 mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Dị ứng ({allergies?.length || 0})
          </h3>
          {allergies?.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Không có dị ứng ghi nhận</p>
          ) : (
            <ul className="text-xs text-gray-700 space-y-1">
              {allergies.map((a: any) => (
                <li key={a.id} className="font-semibold">• {a.name} ({a.severity || 'Mức độ vừa'})</li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs">
          <h3 className="font-bold text-xs uppercase tracking-wider text-amber-600 mb-3 flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4" /> Bệnh mãn tính ({conditions?.length || 0})
          </h3>
          {conditions?.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Không có bệnh lý nền</p>
          ) : (
            <ul className="text-xs text-gray-700 space-y-1">
              {conditions.map((c: any) => (
                <li key={c.id} className="font-semibold">• {c.name} {c.is_chronic ? '(Mãn tính)' : ''}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs">
          <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-600 mb-3 flex items-center gap-1.5">
            <Activity className="w-4 h-4" /> Cân nặng gần nhất
          </h3>
          {weights?.length > 0 ? (
            <div>
              <span className="text-2xl font-extrabold text-gray-900">{weights[weights.length - 1].weight_kg} kg</span>
              <p className="text-xs text-gray-400 mt-1">Đo ngày {new Date(weights[weights.length - 1].recorded_at).toLocaleDateString('vi-VN')}</p>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">Chưa có số đo cân nặng</p>
          )}
        </div>
      </div>

      {/* Medical History */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs">
        <h3 className="font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-primary" /> Lịch sử khám & Điều trị ({medical_records?.length || 0})
        </h3>

        {medical_records?.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-xs">Chưa có phiếu khám bệnh lâm sàng nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {medical_records.map((rec: any) => (
              <div key={rec.id} className="py-4 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900">{rec.diagnosis}</span>
                  <span className="text-gray-400">{new Date(rec.visit_date).toLocaleDateString('vi-VN')}</span>
                </div>
                {rec.treatment && (
                  <p className="text-gray-700"><strong>Phác đồ điều trị:</strong> {rec.treatment}</p>
                )}
                <p className="text-gray-400 italic">Bác sĩ: {rec.veterinarian || 'PetCare Center'} • Phòng khám: {rec.clinic || 'Bệnh viện'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Examination Modal */}
      {showExamModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Ghi nhận phiếu khám bệnh lâm sàng</h3>

            <form onSubmit={handleCreateRecord} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Chẩn đoán bệnh lý *</label>
                <input
                  type="text"
                  value={examForm.diagnosis}
                  onChange={(e) => setExamForm({ ...examForm, diagnosis: e.target.value })}
                  placeholder="Ví dụ: Viêm da dị ứng, viêm tai ngoài..."
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Phác đồ điều trị & Lời dặn</label>
                <textarea
                  rows={3}
                  value={examForm.treatment}
                  onChange={(e) => setExamForm({ ...examForm, treatment: e.target.value })}
                  placeholder="Vệ sinh tai hàng ngày, uống kháng sinh 7 ngày..."
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Bác sĩ phụ trách</label>
                  <input
                    type="text"
                    value={examForm.veterinarian}
                    onChange={(e) => setExamForm({ ...examForm, veterinarian: e.target.value })}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phòng khám</label>
                  <input
                    type="text"
                    value={examForm.clinic}
                    onChange={(e) => setExamForm({ ...examForm, clinic: e.target.value })}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowExamModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-gray-700 font-semibold rounded-xl transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingExam}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition disabled:opacity-50"
                >
                  {submittingExam ? 'Đang lưu...' : 'Lưu hồ sơ bệnh án'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
