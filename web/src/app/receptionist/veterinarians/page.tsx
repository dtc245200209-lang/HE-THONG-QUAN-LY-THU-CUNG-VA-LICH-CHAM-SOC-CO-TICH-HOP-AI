'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Stethoscope, Phone, Mail, Award, CheckCircle2, Search, Clock } from 'lucide-react';

export default function ReceptionistVeterinariansPage() {
  const { user, loading: authLoading } = useAuth();
  const [vets, setVets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (authLoading) return;
    const fetchVets = async () => {
      try {
        setLoading(true);
        // Query users with role VETERINARIAN
        const res = await api.get('/api/v1/users?role=VETERINARIAN');
        setVets(res.data);
      } catch (err) {
        console.error("Lỗi tải bác sĩ thú y:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVets();
  }, [authLoading]);

  const filtered = vets.filter(v => 
    v.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    v.email?.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Đội ngũ Bác sĩ Thú y</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách bác sĩ khám lâm sàng, phẫu thuật và tiêm phòng</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm bác sĩ..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((vet) => (
          <div key={vet.id} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-extrabold text-xl flex-shrink-0">
                  <Stethoscope className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">{vet.full_name || 'Bác sĩ Thú y'}</h3>
                  <span className="text-xs text-gray-500 block">{vet.email}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-600 bg-slate-50 p-3.5 rounded-2xl border border-gray-100 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Chuyên môn:</span>
                  <span className="font-bold text-gray-800">Nội khoa & Phẫu thuật thú y</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Trạng thái:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đang trong ca trực
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-400 font-mono">ID: {vet.id.split('-')[0]}</span>
              <a 
                href={`mailto:${vet.email}`}
                className="font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <Mail className="w-3.5 h-3.5" /> Điều phối ca khám
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
