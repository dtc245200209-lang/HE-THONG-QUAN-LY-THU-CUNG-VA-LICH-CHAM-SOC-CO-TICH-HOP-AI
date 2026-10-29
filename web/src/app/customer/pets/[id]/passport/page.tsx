'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Activity, Syringe, Pill, ShieldAlert, 
  FileText, QrCode, Edit, CheckCircle2, Download, Users, Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function PetPassportPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [passport, setPassport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const fetchPassport = async () => {
      try {
        const response = await api.get(`/api/v1/pets/${id}/passport`);
        setPassport(response.data);
      } catch (err: any) {
        setError('Không thể tải dữ liệu sổ sức khỏe.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPassport();
  }, [id, user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !passport) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => router.back()} className="text-primary hover:underline">Quay lại</button>
      </div>
    );
  }

  const { pet, weights, allergies, conditions, vaccinations, medications } = passport;

  const tabs = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'health', label: 'Sức khỏe' },
    { id: 'vaccine', label: 'Tiêm phòng' },
    { id: 'medication', label: 'Thuốc' },
    { id: 'history', label: 'Lịch sử chăm sóc' },
    { id: 'docs', label: 'Tài liệu' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header with back button and breadcrumb */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Hồ sơ thú cưng</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        {/* Profile Card Header */}
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden border border-gray-100">
              {pet.avatar ? (
                <img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary text-4xl font-bold">{pet.name.charAt(0)}</span>
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Hoạt động
                </span>
              </div>
              <p className="text-gray-500 mb-2">{pet.breed || pet.species}</p>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">
                    {pet.gender === 'MALE' || pet.sex === 'MALE' ? '♂' : (pet.gender === 'FEMALE' || pet.sex === 'FEMALE' ? '♀' : '?')}
                  </span>
                  {pet.gender === 'MALE' || pet.sex === 'MALE' ? 'Đực' : (pet.gender === 'FEMALE' || pet.sex === 'FEMALE' ? 'Cái' : 'Không rõ')}
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gray-400" />
                  3 tuổi (15/08/2021)
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gray-400" />
                  12.4 kg
                </div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-gray-400" />
                  Đã triệt sản
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-gray-400" />
                Microchip: <span className="font-mono">900113001234567</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Link 
              href={`/customer/pets/${pet.id}/emergency`} 
              className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-semibold transition"
              title="Thẻ QR cứu hộ và Chế độ Báo mất"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              Thẻ Cứu Hộ & QR
            </Link>

            <Link 
              href={`/customer/pets/${pet.id}/members`} 
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-semibold transition"
              title="Chia sẻ quyền chăm sóc với người thân"
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              Gia đình ({passport?.pet?.memberships?.length || 1})
            </Link>

            <Link 
              href={`/customer/pets/${pet.id}/documents`} 
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-semibold transition"
              title="Quét tài liệu y tế bằng AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Quét AI
            </Link>

            <Link 
              href={`/customer/pets/${pet.id}/edit`} 
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold hover:bg-gray-50 text-gray-700 transition"
            >
              <Edit className="w-3.5 h-3.5" />
              Sửa
            </Link>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex overflow-x-auto border-b border-gray-100 px-6 hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8 bg-gray-50/30">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Hộ chiếu thú cưng</h2>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition-colors">
                    <Download className="w-4 h-4" /> Tải PDF
                  </button>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 mb-1">Mã định danh</dt>
                      <dd className="text-base text-gray-900 font-mono">PC-2024-001</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 mb-1">Chủ sở hữu</dt>
                      <dd className="text-base text-gray-900">{user?.full_name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 mb-1">Giống loài</dt>
                      <dd className="text-base text-gray-900">{pet.species} / {pet.breed}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 mb-1">Màu lông</dt>
                      <dd className="text-base text-gray-900">Vàng kim</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500 mb-1">Đặc điểm</dt>
                      <dd className="text-base text-gray-900">Hiền lành, thân thiện, thích chơi đùa.</dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-gray-100 p-6">
                <div className="w-40 h-40 bg-gray-50 p-2 border border-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <QrCode className="w-32 h-32 text-gray-800" />
                </div>
                <p className="text-sm text-center text-gray-500 leading-relaxed">
                  Quét QR để xem<br/>thông tin khẩn cấp
                </p>
              </div>
            </div>
          )}

          {/* HEALTH TAB */}
          {activeTab === 'health' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-bold text-gray-900">Tình trạng bệnh lý</h2>
                </div>
                {conditions.length === 0 ? (
                  <p className="text-gray-500 text-sm">Không có ghi nhận bệnh lý.</p>
                ) : (
                  <ul className="space-y-3">
                    {conditions.map((c: any) => (
                      <li key={c.id} className="p-3 bg-orange-50/50 border border-orange-100 rounded-lg">
                        <p className="font-semibold text-orange-900 text-sm">{c.name}</p>
                        {c.notes && <p className="text-sm text-orange-700/80 mt-1">{c.notes}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-bold text-gray-900">Dị ứng</h2>
                </div>
                {allergies.length === 0 ? (
                  <p className="text-gray-500 text-sm">Không có ghi nhận dị ứng.</p>
                ) : (
                  <ul className="space-y-3">
                    {allergies.map((a: any) => (
                      <li key={a.id} className="p-3 bg-red-50/50 border border-red-100 rounded-lg">
                        <p className="font-semibold text-red-900 text-sm">{a.name}</p>
                        <p className="text-sm text-red-700/80 mt-1">Mức độ: {a.severity}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* VACCINE TAB */}
          {activeTab === 'vaccine' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Syringe className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-gray-900">Lịch sử tiêm phòng</h2>
              </div>
              {vaccinations.length === 0 ? (
                <p className="text-gray-500 text-sm">Chưa có lịch sử tiêm phòng.</p>
              ) : (
                <div className="space-y-4">
                  {vaccinations.map((v: any) => (
                    <div key={v.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-primary/30 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Syringe className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{v.name}</p>
                          <p className="text-sm text-gray-500 mt-0.5">Tiêm ngày: {new Date(v.vaccination_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {v.next_due_date && (
                        <div className="text-right">
                          <div className="text-xs text-gray-500 mb-1">Nhắc lại</div>
                          <div className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-lg">
                            {new Date(v.next_due_date).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MEDICATION TAB */}
          {activeTab === 'medication' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Pill className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-bold text-gray-900">Đơn thuốc đang dùng</h2>
              </div>
              {medications.length === 0 ? (
                <p className="text-gray-500 text-sm">Không có đơn thuốc đang sử dụng.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {medications.map((m: any) => (
                    <div key={m.id} className="p-4 border border-gray-100 rounded-xl hover:border-purple-200 transition-colors flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Pill className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{m.name}</p>
                        <p className="text-sm text-gray-600 mt-1">Liều lượng: <span className="font-medium">{m.dosage}</span></p>
                        <p className="text-sm text-gray-600">Tần suất: <span className="font-medium">{m.frequency}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'history' && (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              Tính năng đang được cập nhật
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              Chưa có tài liệu đính kèm
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
