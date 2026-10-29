'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, UploadCloud, FileText, Sparkles, CheckCircle2, 
  AlertCircle, RefreshCw, Calendar, Building, Stethoscope, 
  ShieldCheck, Eye, Download, Check
} from 'lucide-react';
import Link from 'next/link';

interface PetDocument {
  id: string;
  pet_id: string;
  title: string;
  document_type?: string | null;
  file_url: string;
  upload_date: string;
  status: 'PENDING_REVIEW' | 'CONFIRMED' | 'REJECTED';
  extracted_data?: {
    document_type?: string;
    pet_name?: string;
    vaccine_name?: string;
    vaccination_date?: string;
    next_due_date?: string;
    veterinarian?: string;
    clinic?: string;
    diagnosis?: string;
    confidence?: number;
  } | null;
}

export default function PetDocumentsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [pet, setPet] = useState<any>(null);
  const [documents, setDocuments] = useState<PetDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Upload & Scan state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [activeScannedDoc, setActiveScannedDoc] = useState<PetDocument | null>(null);

  // Verification Form State
  const [confirmForm, setConfirmForm] = useState({
    title: '',
    document_type: 'VACCINATION',
    vaccine_name: '',
    vaccination_date: '',
    next_due_date: '',
    veterinarian: '',
    clinic: '',
    diagnosis: ''
  });
  const [confirming, setConfirming] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [petRes, docsRes] = await Promise.all([
        api.get(`/api/v1/pets/${id}`),
        api.get(`/api/v1/pets/${id}/documents`)
      ]);
      setPet(petRes.data);
      setDocuments(docsRes.data);
    } catch (err: any) {
      console.error("Lỗi khi tải tài liệu:", err);
      setError("Không thể tải danh sách tài liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = '/login';
      return;
    }
    fetchData();
  }, [id, user, authLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
      setActiveScannedDoc(null);
      setConfirmSuccess('');
    }
  };

  const handleScanUpload = async () => {
    if (!selectedFile) return;

    setScanning(true);
    setError('');
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.post(`/api/v1/pets/${id}/documents/scan`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const doc: PetDocument = res.data;
      setActiveScannedDoc(doc);

      // Pre-fill review form with AI extracted data
      const ext = doc.extracted_data || {};
      setConfirmForm({
        title: doc.title || selectedFile.name,
        document_type: ext.document_type || 'VACCINATION',
        vaccine_name: ext.vaccine_name || '',
        vaccination_date: ext.vaccination_date ? String(ext.vaccination_date) : new Date().toISOString().split('T')[0],
        next_due_date: ext.next_due_date ? String(ext.next_due_date) : '',
        veterinarian: ext.veterinarian || '',
        clinic: ext.clinic || '',
        diagnosis: ext.diagnosis || ''
      });

      fetchData();
    } catch (err: any) {
      alert("Lỗi khi quét tài liệu bằng AI: " + (err.response?.data?.detail || err.message));
    } finally {
      setScanning(false);
    }
  };

  const handleConfirmDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeScannedDoc) return;

    setConfirming(true);
    try {
      const payload = {
        title: confirmForm.title || activeScannedDoc.title || 'Tài liệu y tế',
        document_type: confirmForm.document_type || 'MEDICAL_REPORT',
        vaccine_name: confirmForm.vaccine_name?.trim() || null,
        vaccination_date: confirmForm.vaccination_date || null,
        next_due_date: confirmForm.document_type === 'VACCINATION' && confirmForm.next_due_date ? confirmForm.next_due_date : null,
        veterinarian: confirmForm.veterinarian?.trim() || null,
        clinic: confirmForm.clinic?.trim() || null,
        diagnosis: confirmForm.diagnosis?.trim() || null
      };

      await api.put(`/api/v1/pets/${id}/documents/${activeScannedDoc.id}/confirm`, payload);
      setConfirmSuccess("Đã xác nhận và tự động cập nhật vào Sổ sức khỏe số của thú cưng!");
      setActiveScannedDoc(null);
      setSelectedFile(null);
      setFilePreview(null);
      fetchData();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      let errMsg = err.message;
      if (typeof detail === 'string') {
        errMsg = detail;
      } else if (Array.isArray(detail)) {
        errMsg = detail.map((d: any) => `${d.loc?.slice(-1)[0] || 'Thông tin'}: ${d.msg}`).join('\n');
      } else if (typeof detail === 'object' && detail !== null) {
        errMsg = JSON.stringify(detail);
      }
      alert("Lỗi khi xác nhận tài liệu:\n" + errMsg);
    } finally {
      setConfirming(false);
    }
  };

  const getFileUrl = (url: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return url.startsWith('/') ? url : `/${url}`;
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href={`/customer/pets/${id}/passport`} 
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-gray-900 text-base">Quét Tài Liệu Y Tế Bằng AI</h1>
              <p className="text-xs text-gray-500">Thú cưng: {pet?.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-700 rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-300" />
              <h2 className="text-lg font-bold">AI Smart Medical Document Scanner</h2>
            </div>
            <p className="text-xs text-purple-100 max-w-xl leading-relaxed">
              Tải lên ảnh chụp sổ tiêm phòng, đơn thuốc hoặc kết quả xét nghiệm. AI sẽ tự động đọc ngày tiêm, tên vắc-xin, phòng khám và tích hợp thẳng vào hồ sơ thú cưng.
            </p>
          </div>
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-purple-100 flex-shrink-0">
            Tự động trích xuất
          </span>
        </div>

        {confirmSuccess && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            {confirmSuccess}
          </div>
        )}

        {/* Upload & AI Scanner Section */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 text-sm mb-3">Tải lên tài liệu y tế mới</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Dropzone */}
            <div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*,.pdf" 
                className="hidden" 
              />
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[200px] ${
                  filePreview ? 'border-indigo-400 bg-indigo-50/20' : 'border-gray-300 hover:border-indigo-400 hover:bg-slate-50'
                }`}
              >
                {filePreview ? (
                  <div className="space-y-2">
                    <img src={filePreview} alt="Preview" className="max-h-40 max-w-full rounded-xl object-contain mx-auto shadow-xs" />
                    <p className="text-xs font-semibold text-indigo-700">{selectedFile?.name}</p>
                    <p className="text-[11px] text-gray-400">Bấm để chọn ảnh khác</p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-2">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-gray-800">Chọn hoặc kéo thả ảnh sổ tiêm phòng, phiếu khám</p>
                    <p className="text-[11px] text-gray-400 mt-1">Hỗ trợ JPG, PNG, PDF</p>
                  </>
                )}
              </div>

              {selectedFile && !activeScannedDoc && (
                <button
                  onClick={handleScanUpload}
                  disabled={scanning}
                  className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  {scanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      AI đang phân tích tài liệu y tế...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Bắt đầu Quét bằng AI
                    </>
                  )}
                </button>
              )}
            </div>

            {/* AI Review Form */}
            <div>
              {scanning ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-gray-200 flex flex-col items-center justify-center min-h-[220px]">
                  <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-3"></div>
                  <h4 className="font-bold text-sm text-gray-900">AI đang xử lý nhận dạng OCR & Y bạ...</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs">
                    Hệ thống đang trích xuất tên vắc-xin, ngày tiêm, phòng khám và lịch hẹn nhắc nhở.
                  </p>
                </div>
              ) : activeScannedDoc ? (
                <form onSubmit={handleConfirmDocument} className="bg-slate-50 p-5 rounded-2xl border border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <span className="font-bold text-xs text-indigo-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" /> Kết quả AI nhận diện
                    </span>
                    {activeScannedDoc.extracted_data?.confidence && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Độ chính xác {Math.round(activeScannedDoc.extracted_data.confidence * 100)}%
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Tiêu đề tài liệu</label>
                    <input
                      type="text"
                      value={confirmForm.title}
                      onChange={(e) => setConfirmForm({ ...confirmForm, title: e.target.value })}
                      className="w-full text-xs p-2 border border-gray-200 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Loại tài liệu</label>
                      <select
                        value={confirmForm.document_type}
                        onChange={(e) => setConfirmForm({ ...confirmForm, document_type: e.target.value })}
                        className="w-full text-xs p-2 border border-gray-200 rounded-lg bg-white focus:outline-none"
                      >
                        <option value="VACCINATION">Tiêm phòng (Vaccination)</option>
                        <option value="PRESCRIPTION">Đơn thuốc (Prescription)</option>
                        <option value="MEDICAL_REPORT">Hồ sơ khám bệnh</option>
                        <option value="LAB_RESULT">Kết quả xét nghiệm</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-0.5">
                        {confirmForm.document_type === 'VACCINATION' ? 'Tên vắc-xin' : 'Chẩn đoán'}
                      </label>
                      <input
                        type="text"
                        value={confirmForm.document_type === 'VACCINATION' ? confirmForm.vaccine_name : confirmForm.diagnosis}
                        onChange={(e) => {
                          if (confirmForm.document_type === 'VACCINATION') {
                            setConfirmForm({ ...confirmForm, vaccine_name: e.target.value });
                          } else {
                            setConfirmForm({ ...confirmForm, diagnosis: e.target.value });
                          }
                        }}
                        placeholder="Ví dụ: Vắc-xin 7 bệnh..."
                        className="w-full text-xs p-2 border border-gray-200 rounded-lg bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Ngày tiêm / Ngày khám</label>
                      <input
                        type="date"
                        value={confirmForm.vaccination_date}
                        onChange={(e) => setConfirmForm({ ...confirmForm, vaccination_date: e.target.value })}
                        className="w-full text-xs p-2 border border-gray-200 rounded-lg bg-white focus:outline-none"
                        required
                      />
                    </div>

                    {confirmForm.document_type === 'VACCINATION' && (
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Ngày tái chủng</label>
                        <input
                          type="date"
                          value={confirmForm.next_due_date}
                          onChange={(e) => setConfirmForm({ ...confirmForm, next_due_date: e.target.value })}
                          className="w-full text-xs p-2 border border-gray-200 rounded-lg bg-white focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Phòng khám / Bệnh viện</label>
                      <input
                        type="text"
                        value={confirmForm.clinic}
                        onChange={(e) => setConfirmForm({ ...confirmForm, clinic: e.target.value })}
                        placeholder="Phòng khám PetCare"
                        className="w-full text-xs p-2 border border-gray-200 rounded-lg bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Bác sĩ thú y</label>
                      <input
                        type="text"
                        value={confirmForm.veterinarian}
                        onChange={(e) => setConfirmForm({ ...confirmForm, veterinarian: e.target.value })}
                        placeholder="BS. Trần Văn B"
                        className="w-full text-xs p-2 border border-gray-200 rounded-lg bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={confirming}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 mt-2"
                  >
                    <Check className="w-4 h-4" />
                    {confirming ? 'Đang lưu vào sổ sức khỏe...' : 'Xác nhận & Lưu vào Sổ Y Bạ'}
                  </button>
                </form>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-gray-200 text-gray-400 min-h-[220px] flex flex-col items-center justify-center">
                  <FileText className="w-10 h-10 mb-2 text-gray-300" />
                  <p className="text-xs font-semibold text-gray-600">Chưa có tài liệu đang quét</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Chọn ảnh ở cột bên trái và bấm Quét bằng AI</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Saved Documents History */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Kho tài liệu y tế đã lưu ({documents.length})</h3>
              <p className="text-xs text-gray-500">Các chứng từ tiêm chủng và bệnh án đã được số hóa</p>
            </div>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-xs font-semibold text-gray-600">Chưa có tài liệu nào được lưu</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="bg-slate-50 border border-gray-200 rounded-2xl p-4 flex items-start gap-3 transition hover:shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="font-bold text-xs text-gray-900 truncate" title={doc.title}>
                        {doc.title}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        doc.status === 'CONFIRMED' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {doc.status === 'CONFIRMED' ? 'Đã xác nhận' : 'Chờ duyệt'}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-500 mb-1">
                      {doc.document_type || 'Tài liệu y tế'} • {new Date(doc.upload_date).toLocaleDateString('vi-VN')}
                    </p>

                    <div className="flex items-center gap-2 pt-1 border-t border-gray-200 text-[11px]">
                      <a 
                        href={getFileUrl(doc.file_url)} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Eye className="w-3 h-3" /> Xem ảnh gốc
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
