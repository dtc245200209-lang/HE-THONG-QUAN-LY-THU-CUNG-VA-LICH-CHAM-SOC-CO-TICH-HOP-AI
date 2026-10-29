'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import { PawPrint, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { PET_BREEDS } from '@/lib/constants/petBreeds';

export default function EditPetPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('DOG');
  const [selectedBreed, setSelectedBreed] = useState(PET_BREEDS.DOG[0]);
  const [customBreed, setCustomBreed] = useState('');
  const [gender, setGender] = useState('MALE');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const fetchPet = async () => {
      try {
        const response = await api.get(`/api/v1/pets/${id}`);
        const pet = response.data;
        setName(pet.name || '');
        const currentSpecies = pet.species || 'DOG';
        setSpecies(currentSpecies);
        setGender(pet.sex || 'MALE');

        const currentBreed = pet.breed || '';
        const breedList = PET_BREEDS[currentSpecies] || PET_BREEDS.OTHER;
        const matched = breedList.find(b => b === currentBreed || b.toLowerCase().includes(currentBreed.toLowerCase()));
        
        if (matched) {
          setSelectedBreed(matched);
          setCustomBreed('');
        } else if (currentBreed) {
          setSelectedBreed('Khác (Nhập tùy chỉnh)');
          setCustomBreed(currentBreed);
        } else {
          setSelectedBreed(breedList[0] || 'Khác (Nhập tùy chỉnh)');
          setCustomBreed('');
        }
      } catch (err: any) {
        setError('Không thể tải dữ liệu thú cưng.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPet();
  }, [id, user, authLoading]);

  const handleSpeciesChange = (newSpecies: string) => {
    setSpecies(newSpecies);
    const breedList = PET_BREEDS[newSpecies] || PET_BREEDS.OTHER;
    if (breedList && breedList.length > 0) {
      setSelectedBreed(breedList[0]);
      setCustomBreed('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const finalBreed = selectedBreed === 'Khác (Nhập tùy chỉnh)' 
      ? customBreed.trim() 
      : selectedBreed;

    try {
      await api.put(`/api/v1/pets/${id}`, {
        name,
        species,
        breed: finalBreed || undefined,
        sex: gender
      });
      router.push(`/customer/pets/${id}/passport`);
    } catch (err: any) {
      let errorMessage = 'Lỗi khi cập nhật thú cưng.';
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail)) {
        errorMessage = detail.map((d: any) => d.msg).join(', ');
      }
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-12">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href={`/customer/pets/${id}/passport`} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <span className="font-bold text-lg text-gray-900">Chỉnh Sửa Thông Tin</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto w-full px-4 pt-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center justify-center mb-8">
            <div className="w-20 h-20 bg-blue-50 text-primary rounded-full flex items-center justify-center border-4 border-white shadow-sm">
              <PawPrint className="w-10 h-10" />
            </div>
          </div>
          
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên thú cưng *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                placeholder="Ví dụ: Milo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loài *</label>
                <select
                  value={species}
                  onChange={(e) => handleSpeciesChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all bg-white"
                >
                  <option value="DOG">Chó</option>
                  <option value="CAT">Mèo</option>
                  <option value="BIRD">Chim</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all bg-white"
                >
                  <option value="MALE">Đực</option>
                  <option value="FEMALE">Cái</option>
                  <option value="UNKNOWN">Không xác định</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giống (Breed) *
              </label>
              <select
                value={selectedBreed}
                onChange={(e) => setSelectedBreed(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all bg-white text-gray-900 font-medium"
              >
                {(PET_BREEDS[species] || PET_BREEDS.OTHER).map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              {selectedBreed === 'Khác (Nhập tùy chỉnh)' && (
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Nhập tên giống cụ thể:
                  </label>
                  <input
                    type="text"
                    value={customBreed}
                    onChange={(e) => setCustomBreed(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    placeholder="Ví dụ: Chó cỏ lai, Mèo Tam Thể Bắc Cực..."
                  />
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl transition-all"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
