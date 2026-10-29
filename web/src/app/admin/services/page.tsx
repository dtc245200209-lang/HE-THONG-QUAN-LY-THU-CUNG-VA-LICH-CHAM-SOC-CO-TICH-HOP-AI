'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ClipboardList, Plus, Search, Edit2, Trash2, 
  Clock, DollarSign, Tag, CheckCircle2, XCircle, AlertCircle, RefreshCw 
} from 'lucide-react';

export default function AdminServicesPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal create/edit
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'VETERINARY',
    base_price: 150000,
    estimated_duration_minutes: 30,
    is_active: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/services?include_inactive=true');
      setServices(res.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách dịch vụ:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchServices();
  }, [authLoading]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      name: '',
      description: '',
      category: 'VETERINARY',
      base_price: 150000,
      estimated_duration_minutes: 30,
      is_active: true
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEdit = (svc: any) => {
    setIsEditing(true);
    setCurrentId(svc.id);
    setFormData({
      name: svc.name,
      description: svc.description || '',
      category: svc.category,
      base_price: svc.base_price,
      estimated_duration_minutes: svc.estimated_duration_minutes,
      is_active: svc.is_active
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      setSubmitting(true);
      if (isEditing && currentId) {
        await api.put(`/api/v1/services/${currentId}`, formData);
      } else {
        await api.post('/api/v1/services', formData);
      }
      setShowModal(false);
      await fetchServices();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Không thể lưu dịch vụ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn ngưng kích hoạt dịch vụ này?")) return;
    try {
      await api.delete(`/api/v1/services/${id}`);
      await fetchServices();
    } catch (err) {
      console.error("Lỗi ngưng dịch vụ:", err);
    }
  };

  const filteredServices = services.filter(s => {
    const matchSearch = (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
                        (s.description || '').toLowerCase().includes(search.toLowerCase());
    if (categoryFilter === 'ALL') return matchSearch;
    return matchSearch && s.category === categoryFilter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Danh mục Dịch vụ & Bảng giá</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý các gói chăm sóc, khám chữa bệnh, spa và bảng giá niêm yết</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchServices}
            className="p-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition shadow-xs"
            title="Làm mới"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Thêm dịch vụ mới
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm tên dịch vụ, mô tả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'VETERINARY', 'GROOMING', 'TRAINING', 'BOARDING', 'WALKING'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                categoryFilter === cat
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'ALL' ? 'Tất cả' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-3xl border border-gray-200 text-gray-400">
            <ClipboardList className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            Không có dịch vụ nào phù hợp
          </div>
        ) : (
          filteredServices.map(svc => (
            <div key={svc.id} className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                      {svc.category}
                    </span>
                    <h3 className="font-bold text-gray-900 text-base mt-2">{svc.name}</h3>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    svc.is_active ? 'text-emerald-700 bg-emerald-50' : 'text-gray-500 bg-gray-100'
                  }`}>
                    {svc.is_active ? 'Đang mở' : 'Tạm dừng'}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                  {svc.description || 'Chưa có mô tả chi tiết cho gói dịch vụ này.'}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{svc.estimated_duration_minutes} phút</span>
                  </div>
                  <p className="text-base font-black text-primary">
                    {formatCurrency(svc.base_price)}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
                  <button
                    onClick={() => handleOpenEdit(svc)}
                    className="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-xl transition"
                    title="Chỉnh sửa dịch vụ"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {svc.is_active && (
                    <button
                      onClick={() => handleDelete(svc.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                      title="Ngưng kích hoạt"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Add / Edit Service */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {isEditing ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ mới'}
            </h2>
            <p className="text-xs text-gray-500 mb-4">Điền đầy đủ thông tin biểu phí và thời lượng phục vụ</p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tên dịch vụ</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Khám tổng quát, Tắm spa..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Danh mục</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium"
                >
                  <option value="VETERINARY">VETERINARY (Khám chữa bệnh thú y)</option>
                  <option value="GROOMING">GROOMING (Spa, Cắt tỉa, Tắm)</option>
                  <option value="BOARDING">BOARDING (Trông giữ khách sạn thú cưng)</option>
                  <option value="TRAINING">TRAINING (Huấn luyện kỹ năng)</option>
                  <option value="WALKING">WALKING (Dắt cún đi dạo vận động)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Giá niêm yết (VNĐ)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000}
                    value={formData.base_price}
                    onChange={e => setFormData({ ...formData, base_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Thời lượng (Phút)</label>
                  <input
                    type="number"
                    required
                    min={5}
                    value={formData.estimated_duration_minutes}
                    onChange={e => setFormData({ ...formData, estimated_duration_minutes: parseInt(e.target.value) || 30 })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Mô tả chi tiết</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Quy trình thực hiện, cam kết chất lượng..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-primary focus:ring-primary/20"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Đang cung cấp cho khách đặt lịch</label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-xl disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Tạo dịch vụ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
