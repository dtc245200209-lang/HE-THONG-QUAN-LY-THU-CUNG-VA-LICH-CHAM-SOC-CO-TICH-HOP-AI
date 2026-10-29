'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Plus, Activity, FileText, ChevronRight, Bone } from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  sex: string;
  avatar: string | null;
}

export default function PetsPage() {
  const { user, loading: authLoading } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const fetchPets = async () => {
      try {
        const response = await api.get('/api/v1/pets');
        setPets(response.data);
      } catch (err: any) {
        console.error("Lỗi khi tải danh sách thú cưng:", err);
        setError('Không thể tải danh sách thú cưng.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPets();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách thú cưng</h1>
          <p className="text-gray-500 mt-1">Quản lý hồ sơ sức khỏe thú cưng của bạn</p>
        </div>
        <Link 
          href="/customer/pets/new" 
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm thú cưng
        </Link>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          {error}
        </div>
      ) : pets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Bone className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Bạn chưa có thú cưng nào</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Hãy thêm thông tin thú cưng của bạn để bắt đầu theo dõi sức khỏe và đặt lịch khám dễ dàng hơn.
          </p>
          <Link 
            href="/customer/pets/new" 
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Thêm thú cưng ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <div key={pet.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden border border-gray-100 flex-shrink-0">
                    {pet.avatar ? (
                      <img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-primary text-2xl font-bold">{pet.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{pet.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{pet.species} {pet.breed ? `- ${pet.breed}` : ''}</p>
                    <div className="flex gap-2">
                      <span className="inline-flex items-center text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                        {pet.sex === 'MALE' ? 'Đực' : pet.sex === 'FEMALE' ? 'Cái' : 'Chưa rõ'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 p-4 bg-gray-50/50 flex justify-between gap-3">
                <Link 
                  href={`/customer/pets/${pet.id}/passport`} 
                  className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-primary hover:text-primary text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Hộ chiếu
                </Link>
                <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-not-allowed opacity-50">
                  <Activity className="w-4 h-4" />
                  Sức khỏe
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
