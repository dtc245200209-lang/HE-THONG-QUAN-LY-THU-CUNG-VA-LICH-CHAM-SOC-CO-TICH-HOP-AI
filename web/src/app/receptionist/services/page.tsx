'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, Clock, Tag, Search, ShieldCheck } from 'lucide-react';

export default function ReceptionistServicesPage() {
  const { user, loading: authLoading } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (authLoading) return;
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/v1/services');
        setServices(res.data);
      } catch (err) {
        console.error("Lỗi khi tải bảng giá:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [authLoading]);

  const filtered = services.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bảng giá Dịch vụ PetCare</h1>
          <p className="text-sm text-gray-500 mt-1">Danh mục dịch vụ chăm sóc, khám chữa bệnh và bảng giá niêm yết</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm dịch vụ..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((service) => (
          <div key={service.id} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                  {service.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Khả dụng
                </span>
              </div>

              <h3 className="font-bold text-lg text-gray-900 mb-2">{service.name}</h3>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-4">
                {service.description || 'Dịch vụ chuẩn y khoa tiêu chuẩn cao tại PetCare Center.'}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                <span>{service.estimated_duration_minutes || 60} phút</span>
              </div>
              <div className="text-base font-extrabold text-primary">
                {service.base_price?.toLocaleString('vi-VN')} ₫
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
