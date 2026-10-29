'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Search, PawPrint, QrCode, Phone, User, Eye, ShieldAlert, Plus, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function ReceptionistPetsPage() {
  const { user, loading: authLoading } = useAuth();
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (authLoading) return;
    const fetchPets = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/v1/pets');
        setPets(res.data);
      } catch (err) {
        console.error("Lỗi khi tải danh sách thú cưng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
  }, [authLoading]);

  const filteredPets = pets.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.breed?.toLowerCase().includes(search.toLowerCase()) ||
    p.species?.toLowerCase().includes(search.toLowerCase()) ||
    p.microchip?.includes(search)
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tra cứu hồ sơ thú cưng</h1>
          <p className="text-sm text-gray-500 mt-1">Tìm kiếm nhanh thông tin bệnh nhân thú cưng tại quầy lễ tân</p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, microchip, giống..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Thú cưng</th>
                <th className="px-6 py-4">Giống loài</th>
                <th className="px-6 py-4">Giới tính</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    Không tìm thấy thú cưng phù hợp
                  </td>
                </tr>
              ) : (
                filteredPets.map((pet) => (
                  <tr key={pet.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold overflow-hidden flex-shrink-0">
                          {pet.avatar ? (
                            <img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover" />
                          ) : (
                            pet.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 block">{pet.name}</span>
                          <span className="text-xs text-gray-400 font-mono">ID: {pet.id.split('-')[0]}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-800">{pet.species}</span>
                      <span className="text-xs text-gray-400 block">{pet.breed || 'Chưa rõ'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {pet.sex === 'MALE' ? 'Đực' : pet.sex === 'FEMALE' ? 'Cái' : 'Chưa rõ'}
                    </td>
                    <td className="px-6 py-4">
                      {pet.lost_mode ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 animate-pulse">
                          Lost Mode
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                          Bình thường
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/customer/pets/${pet.id}/passport`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border border-purple-200 hover:border-purple-600 rounded-xl text-xs font-bold transition shadow-xs"
                          title="Mở Sổ y bạ (Passport)"
                        >
                          <Eye className="w-3.5 h-3.5" /> Sổ y bạ
                        </Link>
                        <Link
                          href={`/receptionist/appointments?pet_id=${pet.id}&pet_name=${encodeURIComponent(pet.name)}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 rounded-xl text-xs font-bold transition shadow-xs"
                          title="Đặt lịch khám cho thú cưng này"
                        >
                          <Calendar className="w-3.5 h-3.5" /> Đặt khám
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
