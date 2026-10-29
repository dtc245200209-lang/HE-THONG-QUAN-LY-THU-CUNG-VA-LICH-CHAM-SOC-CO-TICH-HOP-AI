'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FileArchive, Sparkles, PawPrint, UploadCloud, 
  ChevronRight, ArrowRight, RefreshCw, FileText 
} from 'lucide-react';
import Link from 'next/link';

export default function CustomerDocumentsHubPage() {
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
        console.error("Lỗi lấy danh sách thú cưng:", err);
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tài liệu & Quét Y bạ AI (OCR)</h1>
          <p className="text-sm text-gray-500 mt-1">Lưu trữ hồ sơ xét nghiệm, phiếu tiêm chủng và tự động trích xuất dữ liệu bằng AI</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Sparkles className="w-3.5 h-3.5" /> AI OCR Powered
          </span>
        </div>
      </div>

      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Công nghệ thông minh</span>
          <h2 className="text-xl sm:text-2xl font-black">Chụp ảnh sổ tiêm phòng — AI tự động lưu bệnh án</h2>
          <p className="text-sm text-purple-200 max-w-xl">
            Bạn không cần nhập liệu thủ công! Chỉ cần tải lên hình ảnh sổ tiêm chủng hoặc đơn thuốc, mô hình Gemini OCR sẽ đọc ngày tiêm, tên vắc-xin và cập nhật thẳng vào Digital Passport của bé.
          </p>
        </div>
        <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center text-purple-200 shrink-0">
          <UploadCloud className="w-8 h-8" />
        </div>
      </div>

      {/* Pet Document Selectors */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3">Chọn hồ sơ bé để quản lý tài liệu y tế</h2>

        {pets.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-gray-200 text-gray-400">
            <PawPrint className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            Bạn chưa đăng ký thú cưng nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pets.map((pet) => (
              <div key={pet.id} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
                      {pet.photo_url ? (
                        <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                      ) : (
                        pet.name.substring(0, 1).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{pet.name}</h3>
                      <p className="text-xs text-gray-500">{pet.breed || pet.species}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                  <Link
                    href={`/customer/pets/${pet.id}/documents`}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Quét y bạ AI & Tài liệu
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href={`/customer/pets/${pet.id}/passport`}
                    className="w-full flex items-center justify-center px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold transition"
                  >
                    Xem Digital Passport
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
