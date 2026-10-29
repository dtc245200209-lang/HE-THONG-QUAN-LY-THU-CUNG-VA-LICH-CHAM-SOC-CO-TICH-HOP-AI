'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Pill, Plus, Search, Calendar, User, CheckCircle2, Clock, Sparkles, Check } from 'lucide-react';

interface DrugItem {
  name: string;
  dosage: string;
  frequency: string;
  durationDays?: number;
  notes: string;
  category: string;
}

const COMMON_DRUGS: DrugItem[] = [
  {
    name: 'Amoxicillin 250mg',
    dosage: '1 viên / 10-15kg',
    frequency: '2 lần/ngày sau ăn',
    durationDays: 7,
    notes: 'Kháng sinh phổ rộng đường uống, điều trị nhiễm khuẩn hô hấp, tiết niệu, mô mềm.',
    category: 'Kháng sinh'
  },
  {
    name: 'Amoxicillin + Clavulanate (Clavamox 62.5mg)',
    dosage: '1 viên / 5kg',
    frequency: '2 lần/ngày sau ăn',
    durationDays: 7,
    notes: 'Kháng sinh chống kháng thuốc, trị viêm da, nhiễm khuẩn răng miệng và vết thương.',
    category: 'Kháng sinh'
  },
  {
    name: 'Bravecto (Fluralaner)',
    dosage: '1 viên nhai theo cân nặng',
    frequency: '1 lần duy nhất mỗi 12 tuần',
    durationDays: 1,
    notes: 'Thuốc nhai diệt ve, bọ chét tác dụng kéo dài suốt 3 tháng.',
    category: 'Trị ký sinh trùng'
  },
  {
    name: 'NexGard Spectra',
    dosage: '1 viên nhai theo dải cân nặng',
    frequency: '1 lần/tháng',
    durationDays: 1,
    notes: 'Trị ve, bọ chét, giun tim, giun đũa, giun móc và ghẻ Demodex.',
    category: 'Trị ký sinh trùng'
  },
  {
    name: 'Drontal Plus',
    dosage: '1 viên / 10kg',
    frequency: '1 liều duy nhất, nhắc lại sau 3 tháng',
    durationDays: 1,
    notes: 'Tẩy giun sán tổng hợp (giun tròn, giun móc, sán dây).',
    category: 'Tẩy giun sán'
  },
  {
    name: 'Meloxicam 0.5mg/ml (Metacam)',
    dosage: '0.1mg/kg (theo ống tiêm kèm theo)',
    frequency: '1 lần/ngày trộn thức ăn',
    durationDays: 5,
    notes: 'Kháng viêm NSAID, giảm đau sau phẫu thuật hoặc viêm khớp. Không dùng khi đói.',
    category: 'Giảm đau & Kháng viêm'
  },
  {
    name: 'Prednisolone 5mg',
    dosage: '0.5 - 1mg/kg',
    frequency: '1-2 lần/ngày',
    durationDays: 5,
    notes: 'Kháng viêm steroid, điều trị dị ứng da, hen suyễn, bệnh tự miễn.',
    category: 'Kháng viêm & Dị ứng'
  },
  {
    name: 'Metronidazole 250mg',
    dosage: '15mg/kg',
    frequency: '2 lần/ngày sau ăn',
    durationDays: 7,
    notes: 'Kháng sinh kỵ khí và đơn bào Giardia, trị tiêu chảy, viêm ruột.',
    category: 'Tiêu hóa'
  },
  {
    name: 'Cefalexin 250mg',
    dosage: '1 viên / 10-15kg',
    frequency: '2 lần/ngày sau ăn',
    durationDays: 10,
    notes: 'Kháng sinh cephalosporin, chuyên trị viêm mủ da sâu, nhiễm trùng mô mềm.',
    category: 'Kháng sinh'
  },
  {
    name: 'Doxycycline 100mg',
    dosage: '5-10mg/kg',
    frequency: '1-2 lần/ngày cùng thức ăn',
    durationDays: 14,
    notes: 'Trị ký sinh trùng đường máu (Ehrlichia, Mycoplasma) và viêm phổi.',
    category: 'Kháng sinh'
  },
  {
    name: 'Pro-Kolin Advanced',
    dosage: '2 - 5ml/lần tuỳ thể trọng',
    frequency: '2 lần/ngày',
    durationDays: 3,
    notes: 'Men vi sinh và đất sét Kaolin hỗ trợ cầm tiêu chảy và phục hồi hệ vi sinh ruột.',
    category: 'Men tiêu hóa'
  },
  {
    name: 'Silymarin 70mg (Legalon / Hepatosil)',
    dosage: '1 viên / 10kg',
    frequency: '2 lần/ngày',
    durationDays: 30,
    notes: 'Chiết xuất kế sữa hỗ trợ bảo vệ và phục hồi chức năng tế bào gan.',
    category: 'Bổ trợ gan'
  },
  {
    name: 'Ketoconazole 200mg',
    dosage: '5-10mg/kg',
    frequency: '1 lần/ngày cùng bữa ăn béo',
    durationDays: 14,
    notes: 'Kháng nấm toàn thân điều trị nấm Malassezia, nấm sợi Microsporum.',
    category: 'Kháng nấm'
  },
  {
    name: 'Otomax / Surolan (Nhỏ tai)',
    dosage: '4 - 8 giọt mỗi bên tai bệnh',
    frequency: '2 lần/ngày sau khi rửa tai',
    durationDays: 7,
    notes: 'Hỗn dịch nhỏ tai trị viêm tai ngoài do vi khuẩn và nấm kèm giảm ngứa.',
    category: 'Thuốc nhỏ tai'
  },
  {
    name: 'Tobramycin 0.3% (Tobrex nhỏ mắt)',
    dosage: '1 - 2 giọt mỗi mắt',
    frequency: '3 - 4 lần/ngày',
    durationDays: 7,
    notes: 'Kháng sinh nhỏ mắt điều trị viêm kết mạc, giác mạc và loét trợt nhẹ.',
    category: 'Thuốc nhỏ mắt'
  },
  {
    name: 'Nutri-plus Gel',
    dosage: '1-2 thìa cà phê (5-10cm gel)/ngày',
    frequency: '1-2 lần/ngày',
    durationDays: 14,
    notes: 'Gel dinh dưỡng cao năng lượng phục hồi sức khỏe cho chó mèo ốm.',
    category: 'Dinh dưỡng hồi sức'
  },
  {
    name: 'Simparica Trio',
    dosage: '1 viên nhai theo thể trọng',
    frequency: '1 lần/tháng',
    durationDays: 1,
    notes: 'Viên nhai bảo vệ toàn diện 3 trong 1: ve, bọ chét, giun tim và giun ruột.',
    category: 'Trị ký sinh trùng'
  },
  {
    name: 'Enrofloxacin (Baytril 50mg)',
    dosage: '1 viên / 10kg',
    frequency: '1 lần/ngày',
    durationDays: 7,
    notes: 'Kháng sinh fluoroquinolone mạnh diệt khuẩn Gram âm và Gram dương nặng.',
    category: 'Kháng sinh'
  }
];

export default function VetPrescriptionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Prescription Form Modal & Autocomplete
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [medForm, setMedForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/pets');
      setPets(res.data);
      if (res.data.length > 0) {
        setSelectedPetId(res.data[0].id);
        fetchMedications(res.data[0].id);
      }
    } catch (err) {
      console.error("Lỗi khi tải thú cưng:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedications = async (petId: string) => {
    try {
      const res = await api.get(`/api/v1/pets/${petId}/passport`);
      setMedications(res.data.medications || []);
    } catch (err) {
      console.error("Lỗi khi tải đơn thuốc:", err);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchPets();
  }, [authLoading]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePetChange = (petId: string) => {
    setSelectedPetId(petId);
    fetchMedications(petId);
  };

  const handleCreateMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetId || !medForm.name.trim()) return;

    setSubmitting(true);
    try {
      await api.post(`/api/v1/pets/${selectedPetId}/medications`, {
        name: medForm.name,
        dosage: medForm.dosage || '1 viên/lần',
        frequency: medForm.frequency || '2 lần/ngày',
        start_date: medForm.start_date,
        end_date: medForm.end_date || undefined,
        notes: medForm.notes || undefined
      });
      setShowModal(false);
      setMedForm({
        name: '',
        dosage: '',
        frequency: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        notes: ''
      });
      fetchMedications(selectedPetId);
    } catch (err: any) {
      alert("Lỗi khi kê đơn thuốc: " + (err.response?.data?.detail || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const currentPet = pets.find(p => p.id === selectedPetId);

  const handleSelectDrug = (drug: DrugItem) => {
    let endDate = medForm.end_date;
    if (drug.durationDays && medForm.start_date) {
      const start = new Date(medForm.start_date);
      start.setDate(start.getDate() + drug.durationDays);
      endDate = start.toISOString().split('T')[0];
    }
    setMedForm({
      ...medForm,
      name: drug.name,
      dosage: drug.dosage,
      frequency: drug.frequency,
      end_date: endDate,
      notes: drug.notes
    });
    setShowDropdown(false);
  };

  const filteredDrugs = COMMON_DRUGS.filter(d => {
    if (!medForm.name.trim()) return false;
    const q = medForm.name.toLowerCase().trim();
    return d.name.toLowerCase().includes(q) || 
           d.category.toLowerCase().includes(q) ||
           d.notes.toLowerCase().includes(q);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kê Đơn Thuốc Điện Tử</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý và cấp đơn thuốc điều trị trực tiếp cho bệnh nhân</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> Kê thuốc mới
        </button>
      </div>

      {/* Select Patient */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-auto">
          <label className="block text-xs font-bold text-gray-700 mb-1">Chọn bệnh nhân thú cưng:</label>
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
            <span>Mã hồ sơ: <strong className="font-mono">{currentPet.id.split('-')[0]}</strong></span>
          </div>
        )}
      </div>

      {/* Medications List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {medications.length === 0 ? (
          <div className="col-span-2 bg-white rounded-3xl border border-gray-200 p-12 text-center text-gray-400">
            <Pill className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-semibold text-gray-600">Bệnh nhân chưa có đơn thuốc nào đang dùng</p>
          </div>
        ) : (
          medications.map((med) => (
            <div key={med.id} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                    Thuốc điều trị
                  </span>
                  <span className="text-xs text-gray-400">
                    Bắt đầu: {new Date(med.start_date).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <h3 className="font-bold text-base text-gray-900 mb-1 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-primary" /> {med.name}
                </h3>
                
                <div className="space-y-1 text-xs text-gray-600 mt-2 bg-slate-50 p-3 rounded-xl border border-gray-100">
                  <p><strong>Liều lượng:</strong> {med.dosage || 'Theo chỉ định'}</p>
                  <p><strong>Tần suất:</strong> {med.frequency || 'Hàng ngày'}</p>
                  {med.end_date && <p><strong>Hạn dùng đến:</strong> {new Date(med.end_date).toLocaleDateString('vi-VN')}</p>}
                </div>

                {med.notes && (
                  <p className="text-xs text-gray-500 italic mt-3">&quot;{med.notes}&quot;</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal kê thuốc */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Pill className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Kê đơn thuốc cho {currentPet?.name}</h3>
              </div>
              <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Gợi ý tự động
              </span>
            </div>

            <form onSubmit={handleCreateMedication} className="space-y-4 text-xs">
              {/* Tên thuốc với Gợi ý Autocomplete */}
              <div className="relative" ref={dropdownRef}>
                <label className="block font-semibold text-gray-700 mb-1 flex items-center justify-between">
                  <span>Tên thuốc * (Gõ 1-2 ký tự sẽ gợi ý tự động)</span>
                  {medForm.name && (
                    <span className="text-[10px] text-gray-400 font-normal">Đã nhập {medForm.name.length} ký tự</span>
                  )}
                </label>
                
                <div className="relative">
                  <input
                    type="text"
                    value={medForm.name}
                    onChange={(e) => {
                      setMedForm({ ...medForm, name: e.target.value });
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Ví dụ: Amox, Brav, Nex, Melox, Dron..."
                    className="w-full text-xs p-2.5 pr-8 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                    required
                  />
                  <Pill className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Autocomplete Dropdown List */}
                {showDropdown && filteredDrugs.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-gray-100 animate-in fade-in-50 zoom-in-95">
                    <div className="px-3 py-1.5 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                      <span>Tìm thấy {filteredDrugs.length} thuốc phù hợp:</span>
                      <span className="text-primary">Bấm để tự điền liều dùng</span>
                    </div>
                    {filteredDrugs.map((drug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectDrug(drug)}
                        className="w-full text-left p-3 hover:bg-emerald-50/70 transition flex items-start justify-between gap-3 group cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 group-hover:text-primary transition-colors text-xs">
                              {drug.name}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-gray-100 text-gray-600">
                              {drug.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                            <strong>Liều:</strong> {drug.dosage} • <strong>Tần suất:</strong> {drug.frequency}
                          </p>
                        </div>
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Check className="w-3 h-3" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick Selection Pills */}
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-gray-400 font-medium">Gợi ý nhanh:</span>
                  {COMMON_DRUGS.slice(0, 5).map((d, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectDrug(d)}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-gray-600 transition font-medium cursor-pointer"
                    >
                      + {d.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Liều lượng</label>
                  <input
                    type="text"
                    value={medForm.dosage}
                    onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })}
                    placeholder="1 viên / 5ml"
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tần suất</label>
                  <input
                    type="text"
                    value={medForm.frequency}
                    onChange={(e) => setMedForm({ ...medForm, frequency: e.target.value })}
                    placeholder="2 lần/ngày sau ăn"
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={medForm.start_date}
                    onChange={(e) => setMedForm({ ...medForm, start_date: e.target.value })}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={medForm.end_date}
                    onChange={(e) => setMedForm({ ...medForm, end_date: e.target.value })}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Hướng dẫn dùng thuốc</label>
                <textarea
                  rows={2}
                  value={medForm.notes}
                  onChange={(e) => setMedForm({ ...medForm, notes: e.target.value })}
                  placeholder="Cho uống cùng thức ăn, theo dõi phản ứng..."
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-gray-700 font-semibold rounded-xl transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : 'Xác nhận cấp đơn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
