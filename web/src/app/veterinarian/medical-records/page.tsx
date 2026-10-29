'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Stethoscope, FileText, Search, Calendar, User, Eye } from 'lucide-react';
import Link from 'next/link';

export default function VetMedicalRecordsPage() {
  const { user, loading: authLoading } = useAuth();
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (authLoading) return;
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/v1/pets');
        setPets(res.data);
      } catch (err) {
        console.error("Lỗi tải hồ sơ:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [authLoading]);

  const filtered = pets.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.species?.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Hồ sơ Khám bệnh Lâm sàng</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý toàn bộ hồ sơ khám chữa bệnh và phác đồ điều trị</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo thú cưng..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Bệnh nhân</th>
                <th className="px-6 py-4">Giống loài</th>
                <th className="px-6 py-4">Giới tính</th>
                <th className="px-6 py-4">Ngày tạo hồ sơ</th>
                <th className="px-6 py-4 text-right">Chi tiết bệnh án</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((pet) => (
                <tr key={pet.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-900 block">{pet.name}</span>
                    <span className="text-xs text-gray-400 font-mono">ID: {pet.id.split('-')[0]}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {pet.species} - {pet.breed || 'Chưa rõ'}
                  </td>
                  <td className="px-6 py-4">
                    {pet.sex === 'MALE' ? 'Đực' : pet.sex === 'FEMALE' ? 'Cái' : 'Chưa rõ'}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(pet.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/veterinarian/patients/${pet.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-semibold transition"
                    >
                      <Stethoscope className="w-3.5 h-3.5" /> Mở bệnh án
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
