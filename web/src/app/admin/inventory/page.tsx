'use client';

import React, { useEffect, useState } from 'react';
import StaffLayout from '@/components/layout/StaffLayout';
import api from '@/lib/api';
import { 
  Package, Search, Plus, ArrowUpDown, AlertTriangle, 
  Calendar, CheckCircle2, RefreshCw, Layers, DollarSign, 
  Trash2, Edit, History, ShieldAlert, Filter, Sparkles, X, ChevronRight
} from 'lucide-react';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  min_threshold: number;
  cost_price: number;
  selling_price: number;
  batch_number?: string;
  expiry_date?: string;
  supplier?: string;
  location?: string;
  notes?: string;
  created_at: string;
}

interface InventoryStats {
  total_items: number;
  total_units: number;
  low_stock_count: number;
  out_of_stock_count: number;
  expiring_soon_count: number;
  total_inventory_value: number;
}

interface Transaction {
  id: string;
  item_id: string;
  transaction_type: string;
  quantity_change: number;
  balance_after: number;
  reference_id?: string;
  notes?: string;
  created_at: string;
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ITEMS' | 'TRANSACTIONS'>('ITEMS');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItemForAdjust, setSelectedItemForAdjust] = useState<InventoryItem | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    sku: '',
    name: '',
    category: 'MEDICINE',
    unit: 'Hộp',
    quantity: 0,
    min_threshold: 10,
    cost_price: 0,
    selling_price: 0,
    batch_number: '',
    expiry_date: '',
    supplier: '',
    location: '',
    notes: ''
  });

  const [adjustForm, setAdjustForm] = useState({
    quantity_change: 10,
    transaction_type: 'IMPORT', // IMPORT, EXPORT, ADJUSTMENT
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, statsRes, txRes] = await Promise.all([
        api.get('/api/v1/inventory'),
        api.get('/api/v1/inventory/stats'),
        api.get('/api/v1/inventory/transactions')
      ]);
      setItems(itemsRes.data);
      setStats(statsRes.data);
      setTransactions(txRes.data);
    } catch (err) {
      console.error('Failed to load inventory data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.sku || !createForm.name) {
      alert('Vui lòng điền mã SKU và tên mặt hàng');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/v1/inventory', {
        ...createForm,
        quantity: Number(createForm.quantity),
        min_threshold: Number(createForm.min_threshold),
        cost_price: Number(createForm.cost_price),
        selling_price: Number(createForm.selling_price),
        expiry_date: createForm.expiry_date || undefined
      });
      alert('Đã thêm mặt hàng mới thành công!');
      setShowCreateModal(false);
      // Reset form
      setCreateForm({
        sku: '',
        name: '',
        category: 'MEDICINE',
        unit: 'Hộp',
        quantity: 0,
        min_threshold: 10,
        cost_price: 0,
        selling_price: 0,
        batch_number: '',
        expiry_date: '',
        supplier: '',
        location: '',
        notes: ''
      });
      fetchData();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.detail || 'Không thể tạo mặt hàng'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForAdjust) return;

    setSubmitting(true);
    try {
      const change = adjustForm.transaction_type === 'EXPORT' 
        ? -Math.abs(Number(adjustForm.quantity_change))
        : Number(adjustForm.quantity_change);

      await api.post(`/api/v1/inventory/${selectedItemForAdjust.id}/adjust`, {
        quantity_change: change,
        transaction_type: adjustForm.transaction_type,
        notes: adjustForm.notes
      });
      alert('Đã cập nhật tồn kho thành công!');
      setShowAdjustModal(false);
      setSelectedItemForAdjust(null);
      setAdjustForm({ quantity_change: 10, transaction_type: 'IMPORT', notes: '' });
      fetchData();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.detail || 'Không thể cập nhật tồn kho'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa mặt hàng "${name}" khỏi kho?`)) return;
    try {
      await api.delete(`/api/v1/inventory/${id}`);
      fetchData();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.detail || 'Không thể xóa'));
    }
  };

  const handleSeedData = async () => {
    if (!confirm('Khởi tạo danh mục thuốc & vắc-xin mẫu cho phòng khám?')) return;
    try {
      const res = await api.post('/api/v1/inventory/seed');
      alert(res.data.message);
      fetchData();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.detail || 'Không thể seed'));
    }
  };

  // Filtered items
  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (lowStockOnly && item.quantity > item.min_threshold) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        (item.supplier && item.supplier.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'MEDICINE': return { label: 'Thuốc điều trị', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'VACCINE': return { label: 'Vắc-xin', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'SUPPLY': return { label: 'Vật tư y tế', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'CONSUMABLE': return { label: 'Vật tư tiêu hao', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      default: return { label: cat, color: 'bg-gray-50 text-gray-700 border-gray-200' };
    }
  };

  return (
    <StaffLayout role="ADMIN">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
              <Package className="w-7 h-7 text-primary" />
              Quản Lý Kho Dược Phẩm & Vật Tư Tiêu Hao
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kiểm soát nhập - xuất tồn kho, cảnh báo hết hạn, định mức tồn an toàn và tự động trừ kho khi tiêm chủng.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {items.length === 0 && (
              <button
                onClick={handleSeedData}
                className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-2xl text-xs flex items-center gap-2 border border-indigo-200 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Khởi tạo thuốc mẫu</span>
              </button>
            )}

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-2xl text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm mặt hàng mới</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Items */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-gray-400">Tổng mặt hàng</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-900">{stats?.total_items || 0}</span>
                <span className="text-xs text-gray-500 font-medium">({stats?.total_units || 0} đơn vị)</span>
              </div>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-gray-400">Cảnh báo sắp hết</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-600">{stats?.low_stock_count || 0}</span>
                <span className="text-xs text-amber-700 font-medium">cần nhập thêm</span>
              </div>
            </div>
          </div>

          {/* Expiring Soon */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-gray-400">Sắp hết hạn (&lt;45 ngày)</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-rose-600">{stats?.expiring_soon_count || 0}</span>
                <span className="text-xs text-rose-700 font-medium">lô thuốc</span>
              </div>
            </div>
          </div>

          {/* Total Valuation */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-gray-400">Giá trị tồn kho</p>
              <span className="text-xl font-black text-emerald-700">
                {(stats?.total_inventory_value || 0).toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selector & Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-4">
            {/* View Tabs */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setActiveTab('ITEMS')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'ITEMS'
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Danh Mục Tồn Kho ({filteredItems.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('TRANSACTIONS')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'TRANSACTIONS'
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Nhật Ký Biến Động ({transactions.length})</span>
              </button>
            </div>

            {/* Quick Refresh */}
            <button
              onClick={fetchData}
              className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition self-end md:self-auto"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {activeTab === 'ITEMS' && (
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[260px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm theo tên thuốc, mã SKU, nhà cung cấp, vị trí..."
                  className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-primary outline-hidden transition"
                />
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'ALL', label: 'Tất cả' },
                  { id: 'MEDICINE', label: 'Thuốc' },
                  { id: 'VACCINE', label: 'Vắc-xin' },
                  { id: 'SUPPLY', label: 'Vật tư' },
                  { id: 'CONSUMABLE', label: 'Tiêu hao' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}

                {/* Low stock toggle */}
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 ml-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lowStockOnly}
                    onChange={(e) => setLowStockOnly(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>Chỉ hàng sắp hết</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Tab 1: Inventory Items Table */}
        {activeTab === 'ITEMS' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
            {loading ? (
              <div className="py-16 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-xs text-gray-500 font-medium">Đang tải dữ liệu kho...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Package className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-700">Không tìm thấy mặt hàng nào</p>
                <p className="text-xs mt-1">Thử đổi từ khóa tìm kiếm hoặc nhấn nút &quot;Thêm mặt hàng mới&quot;.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Mã SKU / Tên Dược Phẩm</th>
                      <th className="py-3 px-4">Phân loại</th>
                      <th className="py-3 px-4">Tồn kho / Định mức</th>
                      <th className="py-3 px-4">Giá nhập / Bán</th>
                      <th className="py-3 px-4">Số lô / Hạn dùng</th>
                      <th className="py-3 px-4">Vị trí lưu kho</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredItems.map((item) => {
                      const cat = getCategoryLabel(item.category);
                      const isLowStock = item.quantity <= item.min_threshold;
                      const isOutOfStock = item.quantity <= 0;

                      return (
                        <tr key={item.id} className="hover:bg-gray-50/80 transition">
                          {/* SKU & Name */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-[11px] text-gray-400 uppercase">{item.sku}</span>
                            <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                            {item.supplier && (
                              <p className="text-[11px] text-gray-400 mt-0.5">NCC: {item.supplier}</p>
                            )}
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cat.color}`}>
                              {cat.label}
                            </span>
                          </td>

                          {/* Stock Level */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className={`text-base font-black ${
                                isOutOfStock 
                                  ? 'text-red-600' 
                                  : isLowStock 
                                  ? 'text-amber-600' 
                                  : 'text-gray-900'
                              }`}>
                                {item.quantity}
                              </span>
                              <span className="text-gray-500">{item.unit}</span>
                              {isLowStock && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800">
                                  Sắp hết
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400 mt-0.5">Mức an toàn: &gt;= {item.min_threshold} {item.unit}</p>
                          </td>

                          {/* Prices */}
                          <td className="py-3.5 px-4">
                            <div className="text-gray-900 font-semibold">
                              Bán: <span className="text-primary font-bold">{item.selling_price?.toLocaleString('vi-VN')} ₫</span>
                            </div>
                            <div className="text-[11px] text-gray-400">
                              Vốn: {item.cost_price?.toLocaleString('vi-VN')} ₫
                            </div>
                          </td>

                          {/* Lot & Expiry */}
                          <td className="py-3.5 px-4">
                            <p className="font-medium text-gray-700">Lô: {item.batch_number || '---'}</p>
                            {item.expiry_date ? (
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                HSD: {new Date(item.expiry_date).toLocaleDateString('vi-VN')}
                              </p>
                            ) : (
                              <p className="text-[11px] text-gray-400 mt-0.5">Chưa có HSD</p>
                            )}
                          </td>

                          {/* Location */}
                          <td className="py-3.5 px-4 text-gray-600">
                            {item.location || 'Kho chung'}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedItemForAdjust(item);
                                  setShowAdjustModal(true);
                                }}
                                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition flex items-center gap-1 cursor-pointer"
                                title="Nhập / Xuất kho"
                              >
                                <ArrowUpDown className="w-3 h-3" />
                                <span>Nhập/Xuất</span>
                              </button>

                              <button
                                onClick={() => handleDeleteItem(item.id, item.name)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                                title="Xóa mặt hàng"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Transaction History */}
        {activeTab === 'TRANSACTIONS' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900">
                Nhật Ký Xuất / Nhập & Tự Động Trừ Kho
              </h3>
              <span className="text-xs text-gray-400">Hiển thị {transactions.length} giao dịch gần nhất</span>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <History className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-600">Chưa có giao dịch biến động nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Thời gian</th>
                      <th className="py-3 px-4">Loại giao dịch</th>
                      <th className="py-3 px-4">Mặt hàng</th>
                      <th className="py-3 px-4">Biến động số lượng</th>
                      <th className="py-3 px-4">Tồn sau giao dịch</th>
                      <th className="py-3 px-4">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((tx) => {
                      const item = items.find((i) => i.id === tx.item_id);
                      const isPlus = tx.quantity_change > 0;

                      return (
                        <tr key={tx.id} className="hover:bg-gray-50/80 transition">
                          <td className="py-3 px-4 text-gray-500">
                            {new Date(tx.created_at).toLocaleString('vi-VN')}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              tx.transaction_type === 'IMPORT'
                                ? 'bg-emerald-100 text-emerald-800'
                                : tx.transaction_type === 'VACCINATION_DEDUCTION'
                                ? 'bg-indigo-100 text-indigo-800'
                                : tx.transaction_type === 'PRESCRIPTION_DEDUCTION'
                                ? 'bg-pink-100 text-pink-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {tx.transaction_type === 'IMPORT' ? 'NHẬP KHO' :
                               tx.transaction_type === 'VACCINATION_DEDUCTION' ? 'TRỪ TIÊM CHỦNG' :
                               tx.transaction_type === 'PRESCRIPTION_DEDUCTION' ? 'TRỪ ĐƠN THUỐC' :
                               tx.transaction_type === 'EXPORT' ? 'XUẤT KHO' : 'ĐIỀU CHỈNH'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-gray-900">
                            {item?.name || tx.item_id.split('-')[0]}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-mono font-bold text-sm ${isPlus ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {isPlus ? `+${tx.quantity_change}` : tx.quantity_change}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-gray-700">
                            {tx.balance_after}
                          </td>
                          <td className="py-3 px-4 text-gray-500">
                            {tx.notes || '---'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal: Create New Item */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl animate-in zoom-in-95 my-8">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Thêm Mặt Hàng Dược Phẩm / Vật Tư Mới
                </h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Mã SKU (Duy nhất) *</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: MED-AMOX-500, VAC-RAB-01"
                      value={createForm.sku}
                      onChange={(e) => setCreateForm({ ...createForm, sku: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Tên Dược phẩm / Vật tư *</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Kháng sinh Amoxicillin 500mg"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Phân loại</label>
                    <select
                      value={createForm.category}
                      onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-hidden font-medium"
                    >
                      <option value="MEDICINE">Thuốc điều trị</option>
                      <option value="VACCINE">Vắc-xin phòng bệnh</option>
                      <option value="SUPPLY">Vật tư y tế</option>
                      <option value="CONSUMABLE">Vật tư tiêu hao</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Đơn vị tính</label>
                    <input
                      type="text"
                      placeholder="VD: Hộp, Lọ, Viên, Cái..."
                      value={createForm.unit}
                      onChange={(e) => setCreateForm({ ...createForm, unit: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Định mức an toàn</label>
                    <input
                      type="number"
                      value={createForm.min_threshold}
                      onChange={(e) => setCreateForm({ ...createForm, min_threshold: Number(e.target.value) })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Số lượng nhập ban đầu</label>
                    <input
                      type="number"
                      value={createForm.quantity}
                      onChange={(e) => setCreateForm({ ...createForm, quantity: Number(e.target.value) })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Giá vốn nhập (VNĐ)</label>
                    <input
                      type="number"
                      value={createForm.cost_price}
                      onChange={(e) => setCreateForm({ ...createForm, cost_price: Number(e.target.value) })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Giá bán / Kê đơn (VNĐ)</label>
                    <input
                      type="number"
                      value={createForm.selling_price}
                      onChange={(e) => setCreateForm({ ...createForm, selling_price: Number(e.target.value) })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Số lô sản xuất</label>
                    <input
                      type="text"
                      placeholder="VD: LOT-2026-X1"
                      value={createForm.batch_number}
                      onChange={(e) => setCreateForm({ ...createForm, batch_number: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Hạn sử dụng (HSD)</label>
                    <input
                      type="date"
                      value={createForm.expiry_date}
                      onChange={(e) => setCreateForm({ ...createForm, expiry_date: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Vị trí lưu kho</label>
                    <input
                      type="text"
                      placeholder="VD: Tủ Lạnh A1, Kệ B3"
                      value={createForm.location}
                      onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nhà cung cấp / Hãng sản xuất</label>
                  <input
                    type="text"
                    placeholder="VD: Boehringer Ingelheim, Zoetis, Vinahankook..."
                    value={createForm.supplier}
                    onChange={(e) => setCreateForm({ ...createForm, supplier: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Ghi chú & Hướng dẫn bảo quản</label>
                  <textarea
                    rows={2}
                    placeholder="Bảo quản nhiệt độ 2-8 độ C, tránh ánh sáng trực tiếp..."
                    value={createForm.notes}
                    onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-hidden"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition shadow-xs disabled:opacity-50"
                  >
                    {submitting ? 'Đang lưu...' : 'Lưu Mặt Hàng'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Adjust Stock */}
        {showAdjustModal && selectedItemForAdjust && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Biến Động Kho / Điều Chỉnh</h3>
                  <p className="text-xs text-gray-500">{selectedItemForAdjust.name}</p>
                </div>
                <button 
                  onClick={() => setShowAdjustModal(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <form onSubmit={handleAdjustStock} className="space-y-4 text-xs">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
                  <span className="text-gray-500">Tồn kho hiện tại:</span>
                  <span className="text-base font-black text-gray-900">
                    {selectedItemForAdjust.quantity} {selectedItemForAdjust.unit}
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Loại biến động</label>
                  <select
                    value={adjustForm.transaction_type}
                    onChange={(e) => setAdjustForm({ ...adjustForm, transaction_type: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-hidden font-medium"
                  >
                    <option value="IMPORT">Nhập thêm hàng vào kho (+)</option>
                    <option value="EXPORT">Xuất kho / Tiêu hủy / Hết hạn (-)</option>
                    <option value="ADJUSTMENT">Điều chỉnh kiểm kê số dư</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Số lượng {adjustForm.transaction_type === 'EXPORT' ? 'xuất' : 'nhập'} ({selectedItemForAdjust.unit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={adjustForm.quantity_change}
                    onChange={(e) => setAdjustForm({ ...adjustForm, quantity_change: Number(e.target.value) })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-hidden text-base font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Lý do / Số hóa đơn / Ghi chú</label>
                  <textarea
                    rows={2}
                    placeholder="VD: Nhập thêm từ nhà cung cấp theo HĐ số #8821..."
                    value={adjustForm.notes}
                    onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-hidden"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowAdjustModal(false)}
                    className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition shadow-xs disabled:opacity-50"
                  >
                    {submitting ? 'Đang cập nhật...' : 'Xác Nhận'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </StaffLayout>
  );
}
