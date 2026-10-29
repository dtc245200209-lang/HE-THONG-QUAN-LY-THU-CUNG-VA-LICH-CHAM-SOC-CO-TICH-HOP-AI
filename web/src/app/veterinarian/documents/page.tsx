'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Eye, CheckCircle2, Search, ExternalLink } from 'lucide-react';

export default function VetDocumentsPage() {
  const { user, loading: authLoading } = useAuth();
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/pets');
      setPets(res.data);
      if (res.data.length > 0) {
        setSelectedPetId(res.data[0].id);
        fetchDocs(res.data[0].id);
      }
    } catch (err) {
      console.error("Lỗi khi tải thú cưng:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocs = async (petId: string) => {
    try {
      const res = await api.get(`/api/v1/pets/${petId}/documents`);
      setDocuments(res.data);
    } catch (err) {
      console.error("Lỗi khi tải tài liệu:", err);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchPets();
  }, [authLoading]);

  const handlePetChange = (petId: string) => {
    setSelectedPetId(petId);
    fetchDocs(petId);
  };

  if (loading || authLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentPet = pets.find(p => p.id === selectedPetId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tài Liệu Y Tế & Chẩn Đoán Hình Ảnh</h1>
        <p className="text-sm text-gray-500 mt-1">Xem kết quả xét nghiệm, phim chụp X-quang và chứng nhận y khoa</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Chọn bệnh nhân tra cứu:</label>
          <select
            value={selectedPetId}
            onChange={(e) => handlePetChange(e.target.value)}
            className="text-sm p-2.5 border border-gray-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary min-w-[240px]"
          >
            {pets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.species} - {p.breed || 'Chưa rõ'})
              </option>
            ))}
          </select>
        </div>

        {currentPet && (
          <div className="text-xs text-gray-500 bg-slate-50 px-4 py-2 rounded-2xl border border-gray-100 flex items-center gap-3">
            <span>Bệnh nhân: <strong>{currentPet.name}</strong></span>
            <span>Mã: <strong className="font-mono">{currentPet.id.split('-')[0]}</strong></span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.length === 0 ? (
          <div className="col-span-2 bg-white rounded-3xl border border-gray-200 p-12 text-center text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-semibold text-gray-600">Bệnh nhân chưa có tài liệu chẩn đoán nào</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-bold text-sm text-gray-900 truncate">{doc.title}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    {doc.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  Loại: {doc.document_type || 'Chẩn đoán'} • Ngày: {new Date(doc.upload_date).toLocaleDateString('vi-VN')}
                </p>
                <a
                  href={`/${doc.file_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Mở ảnh tài liệu
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
