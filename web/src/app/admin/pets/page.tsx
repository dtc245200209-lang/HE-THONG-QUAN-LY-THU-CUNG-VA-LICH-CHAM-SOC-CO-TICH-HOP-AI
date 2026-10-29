'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  PawPrint, Search, Filter, QrCode, ExternalLink, 
  ShieldAlert, RefreshCw, Eye, Sparkles 
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPetsPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('ALL');

  const fetchPets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/pets');
      setPets(res.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách thú cưng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchPets();
  }, [authLoading]);

  const filteredPets = pets.filter(p => {
    const matchSearch = (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
                        (p.breed || '').toLowerCase().includes(search.toLowerCase()) ||
                        (p.microchip_number || '').toLowerCase().includes(search.toLowerCase()) ||
                        (p.microchip || '').toLowerCase().includes(search.toLowerCase());
    if (speciesFilter === 'ALL') return matchSearch;
    const sp = speciesFilter.toLowerCase();
    const petSp = (p.species || '').toLowerCase();
    const matchSpecies = (sp === 'dog' && (petSp === 'dog' || petSp === 'chó')) ||
                         (sp === 'cat' && (petSp === 'cat' || petSp === 'mèo'));
    return matchSearch && matchSpecies;
  });

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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Hồ sơ Thú cưng Hệ thống</h1>
          <p className="text-sm text-gray-500 mt-1">Toàn bộ hồ sơ thú cưng, thẻ định danh QR và tình trạng theo dõi</p>
        </div>

        <button
          onClick={fetchPets}
          className="p-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition shadow-xs flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4 text-primary" />
          Làm mới
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase">Tổng số bé</span>
          <p className="text-2xl font-black text-gray-900 mt-1">{pets.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-blue-600 uppercase">Chó (Canine)</span>
          <p className="text-2xl font-black text-gray-900 mt-1">
            {pets.filter(p => p.species?.toLowerCase() === 'dog' || p.species?.toLowerCase() === 'chó').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-purple-600 uppercase">Mèo (Feline)</span>
          <p className="text-2xl font-black text-gray-900 mt-1">
            {pets.filter(p => p.species?.toLowerCase() === 'cat' || p.species?.toLowerCase() === 'mèo').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-red-600 uppercase">Đang báo thất lạc</span>
          <p className="text-2xl font-black text-red-600 mt-1">
            {pets.filter(p => p.is_lost).length}
          </p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm tên bé, giống loài, microchip..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'Dog', 'Cat'].map((sp) => (
            <button
              key={sp}
              onClick={() => setSpeciesFilter(sp)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                speciesFilter === sp
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {sp === 'ALL' ? 'Tất cả' : sp === 'Dog' ? 'Chó' : 'Mèo'}
            </button>
          ))}
        </div>
      </div>

      {/* Pets Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/80 text-xs uppercase font-bold text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Thú cưng</th>
                <th className="px-6 py-4">Loài & Giống</th>
                <th className="px-6 py-4">Cân nặng</th>
                <th className="px-6 py-4">Mã Microchip</th>
                <th className="px-6 py-4">Tình trạng</th>
                <th className="px-6 py-4 text-right">Hộ chiếu & Thẻ QR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <PawPrint className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    Không có thú cưng nào được tìm thấy
                  </td>
                </tr>
              ) : (
                filteredPets.map((pet) => (
                  <tr key={pet.id} className="hover:bg-gray-50/60 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-base overflow-hidden shrink-0">
                          {pet.photo_url ? (
                            <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                          ) : (
                            pet.name.substring(0, 1).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{pet.name}</p>
                          <p className="text-xs text-gray-400">ID: {pet.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{pet.breed || 'Không rõ giống'}</p>
                      <span className="text-[11px] text-gray-500 uppercase">{pet.species} • {pet.gender === 'male' ? 'Đực' : 'Cái'}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {pet.weight ? `${pet.weight} kg` : '—'}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                      {pet.microchip_number || 'Chưa cấy chip'}
                    </td>
                    <td className="px-6 py-4">
                      {pet.is_lost ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full animate-pulse">
                          <ShieldAlert className="w-3.5 h-3.5" /> Báo thất lạc
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                          An toàn
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {pet.qr_code_token && (
                          <Link
                            href={`/pet/emergency/${pet.qr_code_token}`}
                            target="_blank"
                            className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-xl transition"
                            title="Xem Thẻ định danh QR"
                          >
                            <QrCode className="w-4 h-4" />
                          </Link>
                        )}
                        <Link
                          href={`/customer/pets/${pet.id}/passport`}
                          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Hộ chiếu
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
