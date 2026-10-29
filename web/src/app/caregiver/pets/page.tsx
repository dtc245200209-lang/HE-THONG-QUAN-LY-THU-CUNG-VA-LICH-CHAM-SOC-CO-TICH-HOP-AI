'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PawPrint, Calendar, User, Search, Eye, Activity } from 'lucide-react';
import Link from 'next/link';

export default function CaregiverPetsPage() {
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
        console.error("Lỗi khi tải thú cưng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
  }, [authLoading]);

  const filteredPets = pets.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.breed?.toLowerCase().includes(search.toLowerCase()) ||
    p.species?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading || authLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Thú cưng phụ trách</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách hồ sơ thú cưng chăm sóc tại cơ sở</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên, giống loài..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPets.map((pet) => (
          <div key={pet.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {pet.avatar ? (
                  <img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover" />
                ) : (
                  <PawPrint className="w-8 h-8 text-indigo-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-gray-900 truncate">{pet.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                    {pet.species}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{pet.breed || 'Chưa rõ giống'}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                  <span className="bg-slate-100 px-2 py-0.5 rounded-md text-[11px] font-medium">
                    {pet.sex === 'MALE' ? 'Đực' : pet.sex === 'FEMALE' ? 'Cái' : 'Không rõ'}
                  </span>
                  {pet.lost_mode && (
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-md text-[11px] font-bold">
                      Lost Mode
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <Link 
                href={`/customer/pets/${pet.id}/passport`} 
                target="_blank"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" /> Xem sổ y bạ
              </Link>
              <Link 
                href="/caregiver/sessions"
                className="text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl transition"
              >
                Lịch chăm sóc
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
