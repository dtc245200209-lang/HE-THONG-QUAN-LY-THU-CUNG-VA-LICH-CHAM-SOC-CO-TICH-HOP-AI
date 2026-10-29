'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { User, Phone, Mail, Award, CheckCircle2, Search, Clock, Sparkles } from 'lucide-react';

export default function ReceptionistCaregiversPage() {
  const { user, loading: authLoading } = useAuth();
  const [caregivers, setCaregivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (authLoading) return;
    const fetchCaregivers = async () => {
      try {
        setLoading(true);
        // Call users API with role CAREGIVER
        const res = await api.get('/api/v1/users?role=CAREGIVER');
        setCaregivers(res.data);
      } catch (err) {
        console.error("Lỗi khi tải danh sách caregiver:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCaregivers();
  }, [authLoading]);

  const filtered = caregivers.filter(c => 
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading || authLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Đội ngũ Chuyên viên Chăm sóc</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách Caregiver phụ trách dịch vụ spa, tắm sấy và trông giữ</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên, email..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((caregiver) => (
          <div key={caregiver.id} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-xl flex-shrink-0">
                  {caregiver.full_name ? caregiver.full_name.charAt(0) : 'C'}
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">{caregiver.full_name || 'Chuyên viên PetCare'}</h3>
                  <span className="text-xs text-gray-500 block">{caregiver.email}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-600 bg-slate-50 p-3.5 rounded-2xl border border-gray-100 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Trạng thái làm việc:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Sẵn sàng nhận ca
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Chuyên môn chính:</span>
                  <span className="font-bold text-gray-800">Spa, Tắm sấy & Grooming</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Đánh giá trung bình:</span>
                  <span className="font-bold text-amber-600">★ 5.0 (Xuất sắc)</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-400 font-mono">ID: {caregiver.id.split('-')[0]}</span>
              <a 
                href={`mailto:${caregiver.email}`}
                className="font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <Mail className="w-3.5 h-3.5" /> Gửi thông báo
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
