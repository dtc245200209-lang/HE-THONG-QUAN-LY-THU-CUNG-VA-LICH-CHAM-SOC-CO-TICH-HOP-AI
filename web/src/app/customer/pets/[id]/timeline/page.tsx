'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, Calendar, Syringe, FileText, Weight, 
  Heart, Sparkles, Activity, Clock, ShieldCheck 
} from 'lucide-react';
import Link from 'next/link';

interface TimelineItem {
  id: string;
  type: 'BIRTH' | 'VACCINATION' | 'MEDICAL' | 'WEIGHT' | 'REPORT';
  date: string;
  title: string;
  description?: string;
  meta?: string;
}

export default function PetTimelinePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [pet, setPet] = useState<any>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const fetchTimeline = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/v1/pets/${id}/passport`);
        const data = res.data;
        setPet(data.pet);

        const items: TimelineItem[] = [];

        // Birth / Adoption
        if (data.pet.date_of_birth) {
          items.push({
            id: 'birth',
            type: 'BIRTH',
            date: data.pet.date_of_birth,
            title: `Chào đời / Gia nhập gia đình`,
            description: `Ngày sinh của ${data.pet.name} (${data.pet.breed || data.pet.species})`
          });
        }

        // Vaccinations
        data.vaccinations?.forEach((v: any) => {
          items.push({
            id: v.id,
            type: 'VACCINATION',
            date: v.vaccination_date,
            title: `Tiêm phòng: ${v.name}`,
            description: v.clinic ? `Tại: ${v.clinic}` : undefined,
            meta: v.next_due_date ? `Hạn tái chủng: ${new Date(v.next_due_date).toLocaleDateString('vi-VN')}` : undefined
          });
        });

        // Medical Records
        data.medical_records?.forEach((m: any) => {
          items.push({
            id: m.id,
            type: 'MEDICAL',
            date: m.visit_date,
            title: `Khám bệnh / Điều trị: ${m.diagnosis || 'Khám lâm sàng'}`,
            description: m.treatment || `Bác sĩ: ${m.veterinarian || 'PetCare Center'}`,
            meta: m.clinic
          });
        });

        // Weights
        data.weights?.forEach((w: any) => {
          items.push({
            id: w.id,
            type: 'WEIGHT',
            date: w.recorded_at,
            title: `Cân nặng ghi nhận: ${w.weight_kg} kg`,
            description: w.notes || undefined
          });
        });

        // Care Reports
        data.care_reports?.forEach((r: any) => {
          items.push({
            id: r.id,
            type: 'REPORT',
            date: r.created_at,
            title: `Hoàn thành ca chăm sóc tại trung tâm`,
            description: r.summary,
            meta: r.recommendations
          });
        });

        // Sort chronological descending
        items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTimeline(items);
      } catch (err) {
        console.error("Lỗi khi tải dòng thời gian:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [id, user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href={`/customer/pets/${id}/passport`} 
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-gray-900 text-base">Dòng Thời Gian Của {pet?.name}</h1>
              <p className="text-xs text-gray-500">Toàn bộ hành trình trưởng thành & sức khỏe</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm">
          {timeline.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-semibold text-gray-600">Chưa có sự kiện nào được ghi nhận</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-8 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100">
              {timeline.map((item) => (
                <div key={item.id} className="relative group">
                  <div className="absolute -left-[27px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center shadow-xs">
                    {item.type === 'VACCINATION' ? (
                      <Syringe className="w-3 h-3 text-blue-600" />
                    ) : item.type === 'MEDICAL' ? (
                      <Activity className="w-3 h-3 text-red-500" />
                    ) : item.type === 'WEIGHT' ? (
                      <Weight className="w-3 h-3 text-emerald-600" />
                    ) : item.type === 'REPORT' ? (
                      <Sparkles className="w-3 h-3 text-purple-600" />
                    ) : (
                      <Heart className="w-3 h-3 text-pink-500" />
                    )}
                  </div>

                  <div className="bg-slate-50 border border-gray-200 rounded-2xl p-4 transition hover:bg-slate-100/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-indigo-700">
                        {new Date(item.date).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">
                        {item.type === 'VACCINATION' ? 'Tiêm phòng' : item.type === 'MEDICAL' ? 'Khám bệnh' : item.type === 'WEIGHT' ? 'Cân nặng' : item.type === 'REPORT' ? 'Chăm sóc' : 'Cột mốc'}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-gray-900 mb-1">{item.title}</h4>
                    {item.description && (
                      <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
                    )}
                    {item.meta && (
                      <div className="mt-2 pt-2 border-t border-gray-200/60 text-[11px] text-gray-500 italic">
                        {item.meta}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
