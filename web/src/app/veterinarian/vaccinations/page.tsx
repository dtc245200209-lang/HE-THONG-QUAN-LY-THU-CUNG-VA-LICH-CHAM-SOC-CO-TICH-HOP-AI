'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Syringe, Plus, Calendar, ShieldCheck, Search, Clock, Sparkles, Check } from 'lucide-react';

interface VaccineItem {
  name: string;
  category: string;
  targetSpecies: 'ALL' | 'DOG' | 'CAT';
  boosterDays: number;
  description: string;
}

const COMMON_VACCINES: VaccineItem[] = [
  // Vắc-xin phòng Dại
  {
    name: 'Vắc-xin Dại Rabisin (Merial / Boehringer)',
    category: 'Phòng bệnh Dại',
    targetSpecies: 'ALL',
    boosterDays: 365,
    description: 'Vắc-xin phòng bệnh Dại vô hoạt, bảo hộ miễn dịch vững chắc 1 năm cho chó và mèo từ 3 tháng tuổi.'
  },
  {
    name: 'Vắc-xin Dại Nobivac Rabies (MSD)',
    category: 'Phòng bệnh Dại',
    targetSpecies: 'ALL',
    boosterDays: 365,
    description: 'Vắc-xin phòng dại tiêu chuẩn quốc tế của MSD Animal Health, tái chủng định kỳ 1 năm.'
  },
  {
    name: 'Vắc-xin Dại Defensor 3 (Zoetis)',
    category: 'Phòng bệnh Dại',
    targetSpecies: 'ALL',
    boosterDays: 365,
    description: 'Vắc-xin phòng bệnh dại chất lượng cao cho chó mèo của tập đoàn Zoetis (Mỹ).'
  },

  // Vắc-xin cho Chó
  {
    name: 'Vắc-xin 7 bệnh cho chó (Nobivac DHPPi + L4)',
    category: 'Vắc-xin Đa giá (Chó)',
    targetSpecies: 'DOG',
    boosterDays: 365,
    description: 'Phòng 7 bệnh: Care, Parvo, Viêm gan truyền nhiễm, Ho cũi chó, Viêm thanh khí quản và 2 chủng Leptospira.'
  },
  {
    name: 'Vắc-xin 7 bệnh cho chó (Vanguard Plus 5/CV-L)',
    category: 'Vắc-xin Đa giá (Chó)',
    targetSpecies: 'DOG',
    boosterDays: 365,
    description: 'Phòng 7 bệnh toàn diện của Zoetis: Care, Parvo, Viêm ruột do Coronavirus, Viêm gan, Hô hấp và Lepto.'
  },
  {
    name: 'Vắc-xin 5 bệnh cho chó (Vanguard Plus 5)',
    category: 'Vắc-xin Đa giá (Chó)',
    targetSpecies: 'DOG',
    boosterDays: 365,
    description: 'Phòng 5 bệnh cốt lõi: Care (Sài sốt), Parvovirus, Viêm gan truyền nhiễm, Phó cúm và Ho thanh quản.'
  },
  {
    name: 'Vắc-xin 6 bệnh cho chó (Canigen DHA2PPi/L)',
    category: 'Vắc-xin Đa giá (Chó)',
    targetSpecies: 'DOG',
    boosterDays: 365,
    description: 'Vắc-xin 6 bệnh Virbac (Pháp), phòng ngừa các bệnh truyền nhiễm nguy hiểm nhất ở chó.'
  },
  {
    name: 'Vắc-xin Ho cũi chó Nobivac KC (Nhỏ mũi / Tiêm)',
    category: 'Hô hấp & Ho cũi chó',
    targetSpecies: 'DOG',
    boosterDays: 365,
    description: 'Phòng bệnh viêm khí phế quản truyền nhiễm (Bordetella bronchiseptica và virus Parainfluenza).'
  },
  {
    name: 'Mũi tiêm Trị ve ghẻ & Nội ngoại ký sinh trùng (Ivermectin 1%)',
    category: 'Mũi tiêm Trị ký sinh trùng',
    targetSpecies: 'ALL',
    boosterDays: 14,
    description: 'Tiêm dưới da đặc trị ghẻ Demodex, ghẻ Sarcoptes, ve rận, giun tròn và ấu trùng giun tim.'
  },

  // Vắc-xin cho Mèo
  {
    name: 'Vắc-xin 4 bệnh cho mèo (Nobivac Tricat Trio + Chlamydia)',
    category: 'Vắc-xin Đa giá (Mèo)',
    targetSpecies: 'CAT',
    boosterDays: 365,
    description: 'Phòng 4 bệnh: Giảm bạch cầu (FPV), Viêm mũi khí quản truyền nhiễm (FHV), Viêm kết mạc Calicivirus (FCV) và Chlamydia.'
  },
  {
    name: 'Vắc-xin 4 bệnh cho mèo (Felocell 4 - Zoetis)',
    category: 'Vắc-xin Đa giá (Mèo)',
    targetSpecies: 'CAT',
    boosterDays: 365,
    description: 'Vắc-xin phòng 4 bệnh hàng đầu cho mèo của Zoetis (Mỹ), tiêm nhắc lại hàng năm.'
  },
  {
    name: 'Vắc-xin 3 bệnh cho mèo (Nobivac Tricat Trio)',
    category: 'Vắc-xin Đa giá (Mèo)',
    targetSpecies: 'CAT',
    boosterDays: 365,
    description: 'Phòng 3 bệnh truyền nhiễm nguy hiểm cốt lõi: Giảm bạch cầu (FPV), Viêm mũi khí quản (FHV) và Calicivirus (FCV).'
  },
  {
    name: 'Vắc-xin 3 bệnh cho mèo (Felocell 3)',
    category: 'Vắc-xin Đa giá (Mèo)',
    targetSpecies: 'CAT',
    boosterDays: 365,
    description: 'Phòng ngừa hiệu quả bệnh Giảm bạch cầu mèo, viêm kết mạc Calici và Herpesvirus hô hấp.'
  },
  {
    name: 'Vắc-xin Bạch cầu Mèo FeLV (Nobivac FeLV / Purevax)',
    category: 'Vắc-xin Chuyên sâu (Mèo)',
    targetSpecies: 'CAT',
    boosterDays: 365,
    description: 'Phòng virus bệnh Bạch cầu ở mèo (Feline Leukemia Virus) có nguy cơ gây u lympho và suy giảm miễn dịch.'
  },

  // Mũi tiêm lâm sàng bổ trợ
  {
    name: 'Mũi tiêm Bổ trợ Hồi sức Catosal 10% (Bayer / Elanco)',
    category: 'Mũi tiêm Bổ trợ Tăng lực',
    targetSpecies: 'ALL',
    boosterDays: 3,
    description: 'Kích thích trao đổi chất, tăng lực, hỗ trợ điều trị suy nhược, biếng ăn cho chó mèo mệt mỏi.'
  },
  {
    name: 'Mũi tiêm Kháng sinh Kéo dài Convenia 80mg/ml (Zoetis)',
    category: 'Kháng sinh Tác dụng Kéo dài',
    targetSpecies: 'ALL',
    boosterDays: 14,
    description: 'Kháng sinh thế hệ mới tác dụng kéo dài suốt 14 ngày chỉ với 1 mũi tiêm duy nhất dưới da.'
  },
  {
    name: 'Mũi tiêm Kháng thể Đặc hiệu Parvo / Care (Antiserum)',
    category: 'Huyết thanh Cấp cứu',
    targetSpecies: 'DOG',
    boosterDays: 7,
    description: 'Kháng thể tinh chế dùng trong điều trị cấp tính bệnh Care và Parvovirus nguy kịch.'
  }
];

export default function VetVaccinationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Autocomplete
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [vacForm, setVacForm] = useState({
    name: '',
    vaccination_date: new Date().toISOString().split('T')[0],
    next_due_date: '',
    clinic: 'PetCare Central Hospital'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/pets');
      setPets(res.data);
      if (res.data.length > 0) {
        setSelectedPetId(res.data[0].id);
        fetchVaccinations(res.data[0].id);
      }
    } catch (err) {
      console.error("Lỗi khi tải thú cưng:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVaccinations = async (petId: string) => {
    try {
      const res = await api.get(`/api/v1/pets/${petId}/passport`);
      setVaccinations(res.data.vaccinations || []);
    } catch (err) {
      console.error("Lỗi khi tải tiêm phòng:", err);
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
    fetchVaccinations(petId);
  };

  const handleCreateVaccination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetId || !vacForm.name.trim()) return;

    setSubmitting(true);
    try {
      await api.post(`/api/v1/pets/${selectedPetId}/vaccinations`, {
        name: vacForm.name,
        vaccination_date: vacForm.vaccination_date,
        next_due_date: vacForm.next_due_date || undefined,
        clinic: vacForm.clinic
      });
      setShowModal(false);
      setVacForm({
        name: '',
        vaccination_date: new Date().toISOString().split('T')[0],
        next_due_date: '',
        clinic: 'PetCare Central Hospital'
      });
      fetchVaccinations(selectedPetId);
    } catch (err: any) {
      alert("Lỗi khi ghi nhận tiêm phòng: " + (err.response?.data?.detail || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const currentPet = pets.find(p => p.id === selectedPetId);

  const handleSelectVaccine = (vac: VaccineItem) => {
    let nextDue = vacForm.next_due_date;
    if (vac.boosterDays && vacForm.vaccination_date) {
      const date = new Date(vacForm.vaccination_date);
      date.setDate(date.getDate() + vac.boosterDays);
      nextDue = date.toISOString().split('T')[0];
    }
    setVacForm({
      ...vacForm,
      name: vac.name,
      next_due_date: nextDue
    });
    setShowDropdown(false);
  };

  const filteredVaccines = COMMON_VACCINES.filter(v => {
    if (!vacForm.name.trim()) return false;
    const q = vacForm.name.toLowerCase().trim();
    return v.name.toLowerCase().includes(q) ||
           v.category.toLowerCase().includes(q) ||
           v.description.toLowerCase().includes(q);
  }).sort((a, b) => {
    const petSpecies = (currentPet?.species || '').toUpperCase();
    if (petSpecies === 'DOG' || petSpecies === 'CHÓ') {
      if (a.targetSpecies === 'DOG' && b.targetSpecies !== 'DOG') return -1;
      if (b.targetSpecies === 'DOG' && a.targetSpecies !== 'DOG') return 1;
    } else if (petSpecies === 'CAT' || petSpecies === 'MÈO') {
      if (a.targetSpecies === 'CAT' && b.targetSpecies !== 'CAT') return -1;
      if (b.targetSpecies === 'CAT' && a.targetSpecies !== 'CAT') return 1;
    }
    return 0;
  });

  // Recommended quick vaccines based on species
  const quickVaccines = COMMON_VACCINES.filter(v => {
    const petSpecies = (currentPet?.species || '').toUpperCase();
    if (petSpecies === 'CAT' || petSpecies === 'MÈO') {
      return v.targetSpecies === 'CAT' || v.category === 'Phòng bệnh Dại';
    }
    return v.targetSpecies === 'DOG' || v.category === 'Phòng bệnh Dại';
  }).slice(0, 5);

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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sổ Tiêm Chủng Bác Sĩ</h1>
          <p className="text-sm text-gray-500 mt-1">Ghi nhận mũi tiêm, lên lịch hẹn tái chủng và cấp chứng nhận</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> Ghi nhận mũi tiêm mới
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

      {/* Vaccinations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vaccinations.length === 0 ? (
          <div className="col-span-2 bg-white rounded-3xl border border-gray-200 p-12 text-center text-gray-400">
            <Syringe className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-semibold text-gray-600">Bệnh nhân chưa có mũi tiêm phòng nào được lưu</p>
          </div>
        ) : (
          vaccinations.map((v) => (
            <div key={v.id} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Đã tiêm
                  </span>
                  <span className="text-xs text-gray-400">
                    Ngày tiêm: {new Date(v.vaccination_date).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <h3 className="font-bold text-base text-gray-900 mb-2 flex items-center gap-2">
                  <Syringe className="w-4 h-4 text-primary" /> {v.name}
                </h3>

                <div className="space-y-1 text-xs text-gray-600 bg-slate-50 p-3 rounded-xl border border-gray-100">
                  <p><strong>Cơ sở y tế:</strong> {v.clinic || 'PetCare Central Hospital'}</p>
                  {v.next_due_date && (
                    <p className="text-amber-700 font-semibold">
                      <strong>Hạn tiêm nhắc lại:</strong> {new Date(v.next_due_date).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal ghi nhận mũi tiêm */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Ghi nhận tiêm phòng cho {currentPet?.name}</h3>

            <form onSubmit={handleCreateVaccination} className="space-y-4 text-xs">
              <div className="relative" ref={dropdownRef}>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-gray-700">Tên vắc-xin / Mũi tiêm *</label>
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Gõ 1-2 ký tự để gợi ý
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={vacForm.name}
                    onChange={(e) => {
                      setVacForm({ ...vacForm, name: e.target.value });
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Gõ 'dại', '7', 'nobi', 'van', 'mèo'..."
                    className="w-full text-xs p-2.5 pr-8 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    required
                    autoComplete="off"
                  />
                  <Syringe className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Dropdown Gợi ý thông minh */}
                {showDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-gray-50">
                    {filteredVaccines.length > 0 ? (
                      filteredVaccines.slice(0, 8).map((vac, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectVaccine(vac)}
                          className="w-full text-left p-2.5 hover:bg-emerald-50/70 transition flex items-start gap-2.5 group"
                        >
                          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 mt-0.5 group-hover:bg-primary group-hover:text-white transition">
                            <Syringe className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 group-hover:text-emerald-800 transition truncate">
                                {vac.name}
                              </span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold shrink-0 ${
                                vac.targetSpecies === 'DOG' ? 'bg-amber-100 text-amber-800' :
                                vac.targetSpecies === 'CAT' ? 'bg-purple-100 text-purple-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {vac.targetSpecies === 'DOG' ? 'Chó' : vac.targetSpecies === 'CAT' ? 'Mèo' : 'Chó & Mèo'}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{vac.description}</p>
                            <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500">
                              <span className="text-emerald-700 font-semibold">{vac.category}</span>
                              {vac.boosterDays > 0 && (
                                <span className="text-amber-700 font-medium">
                                  • Nhắc lại sau: {vac.boosterDays >= 365 ? `${Math.round(vac.boosterDays / 365)} năm` : `${vac.boosterDays} ngày`}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    ) : vacForm.name.trim().length > 0 ? (
                      <div className="p-3 text-center text-gray-500 text-xs">
                        <p>Không tìm thấy vắc-xin chuẩn khớp với &quot;{vacForm.name}&quot;</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Bạn vẫn có thể tiếp tục nhập tên này tự do.</p>
                      </div>
                    ) : (
                      <div className="p-2 space-y-1">
                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">
                          Vắc-xin phổ biến nhất
                        </div>
                        {COMMON_VACCINES.slice(0, 5).map((vac, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectVaccine(vac)}
                            className="w-full text-left p-2 rounded-xl hover:bg-emerald-50 transition flex items-center justify-between"
                          >
                            <span className="font-medium text-gray-800 truncate">{vac.name}</span>
                            <span className="text-[10px] text-emerald-700 font-semibold shrink-0">{vac.category}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Select Pills */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-gray-500 font-medium">Gợi ý nhanh:</span>
                  {quickVaccines.map((vac, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectVaccine(vac)}
                      className="px-2 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-medium transition"
                    >
                      + {vac.name.split(' (')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Ngày tiêm *</label>
                  <input
                    type="date"
                    value={vacForm.vaccination_date}
                    onChange={(e) => setVacForm({ ...vacForm, vaccination_date: e.target.value })}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Ngày hẹn tái chủng
                    <span className="text-[10px] font-normal text-emerald-600 ml-1">(tự tính)</span>
                  </label>
                  <input
                    type="date"
                    value={vacForm.next_due_date}
                    onChange={(e) => setVacForm({ ...vacForm, next_due_date: e.target.value })}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Phòng khám / Bệnh viện</label>
                <input
                  type="text"
                  value={vacForm.clinic}
                  onChange={(e) => setVacForm({ ...vacForm, clinic: e.target.value })}
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
                  {submitting ? 'Đang lưu...' : 'Lưu chứng nhận tiêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
