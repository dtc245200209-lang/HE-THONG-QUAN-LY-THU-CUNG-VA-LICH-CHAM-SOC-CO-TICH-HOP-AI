'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FileText, PawPrint, QrCode, Users, ShieldAlert, 
  ChevronRight, Sparkles, Clock, Eye 
} from 'lucide-react';
import Link from 'next/link';

export default function CustomerPassportsHubPage() {
  const { user, loading: authLoading } = useAuth();
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/v1/pets');
        setPets(res.data || []);
      } catch (err) {
        console.error("Lỗi tải danh sách thú cưng:", err);
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) {
      fetchPets();
    }
  }, [authLoading]);

  if (loading || authLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Hộ chiếu Điện tử (Digital Passport)</h1>
        <p className="text-sm text-gray-500 mt-1">Chọn thú cưng để xem lý lịch, hồ sơ tiêm chủng, thẻ QR và chia sẻ quyền chăm sóc</p>
      </div>

      {pets.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-3xl border border-gray-200 shadow-xs">
          <PawPrint className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">Bạn chưa có hồ sơ thú cưng nào</h3>
          <p className="text-xs text-gray-400 mt-1 mb-4">Hãy đăng ký bé cưng đầu tiên để kích hoạt Hộ chiếu số</p>
          <Link
            href="/customer/pets"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition shadow-xs"
          >
            Đăng ký thú cưng
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <div key={pet.id} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl overflow-hidden shrink-0">
                    {pet.photo_url ? (
                      <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                    ) : (
                      pet.name.substring(0, 1).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{pet.name}</h2>
                    <p className="text-xs text-gray-500">{pet.breed || 'Chưa rõ giống'} • {pet.species}</p>
                    <p className="text-[11px] font-mono text-gray-400 mt-0.5">Chip: {pet.microchip_number || 'Chưa cấy'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-5 text-center">
                  <div className="p-2.5 bg-gray-50 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Cân nặng</span>
                    <p className="text-sm font-extrabold text-gray-800 mt-0.5">{pet.weight ? `${pet.weight} kg` : '—'}</p>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Giới tính</span>
                    <p className="text-sm font-extrabold text-gray-800 mt-0.5">{pet.gender === 'male' ? 'Đực' : 'Cái'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2 pt-4 border-t border-gray-100">
                <Link
                  href={`/customer/pets/${pet.id}/passport`}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition shadow-xs"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Mở Digital Passport
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Link>

                <div className="grid grid-cols-3 gap-2">
                  <Link
                    href={`/customer/pets/${pet.id}/emergency`}
                    className="flex flex-col items-center justify-center p-2 bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-xl text-[10px] font-bold transition"
                  >
                    <QrCode className="w-3.5 h-3.5 mb-1 text-red-500" />
                    Thẻ QR
                  </Link>
                  <Link
                    href={`/customer/pets/${pet.id}/members`}
                    className="flex flex-col items-center justify-center p-2 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-xl text-[10px] font-bold transition"
                  >
                    <Users className="w-3.5 h-3.5 mb-1 text-blue-500" />
                    Gia đình
                  </Link>
                  <Link
                    href={`/customer/pets/${pet.id}/documents`}
                    className="flex flex-col items-center justify-center p-2 bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-purple-600 rounded-xl text-[10px] font-bold transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 mb-1 text-purple-500" />
                    AI OCR
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
