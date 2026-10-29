'use client';

import React, { useEffect, useState } from 'react';
import StaffLayout from '@/components/layout/StaffLayout';
import api from '@/lib/api';
import { 
  Package, Search, Stethoscope, Pill, Syringe, 
  AlertCircle, CheckCircle2, Clock, MapPin, RefreshCw,
  ExternalLink, Layers, Sparkles
} from 'lucide-react';
import Link from 'next/link';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  min_threshold: number;
  selling_price: number;
  batch_number?: string;
  expiry_date?: string;
  supplier?: string;
  location?: string;
  notes?: string;
}

export default function VetInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/inventory');
      setItems(res.data);
    } catch (err) {
      console.error('Failed to load vet inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'MEDICINE':
        return { label: 'Thuốc điều trị', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'VACCINE':
        return { label: 'Vắc-xin', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'SUPPLY':
        return { label: 'Vật tư y tế', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: 'Vật tư', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
  };

  return (
    <StaffLayout role="VETERINARIAN">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
              <Pill className="w-7 h-7 text-indigo-600" />
              Tra Cứu Kho Dược & Vắc-xin Lâm Sàng
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Bác sĩ kiểm tra lượng tồn khả dụng, vị trí tủ thuốc và số lô trước khi kê đơn hoặc chỉ định tiêm phòng.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/veterinarian/prescriptions"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl text-xs flex items-center gap-2 shadow-xs transition"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Quản lý Đơn thuốc</span>
            </Link>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tra cứu theo tên thuốc (Amoxicillin, Rabisin...), hoạt chất, mã SKU..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-indigo-500 outline-hidden transition"
            />
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'MEDICINE', label: 'Thuốc điều trị' },
              { id: 'VACCINE', label: 'Vắc-xin phòng bệnh' },
              { id: 'SUPPLY', label: 'Vật tư & Khác' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}

            <button
              onClick={fetchItems}
              className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition"
              title="Làm mới"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-gray-200">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
            <p className="text-xs text-gray-500 font-medium">Đang tải kho dược...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 text-gray-400">
            <Package className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-semibold text-gray-700">Không tìm thấy thuốc hoặc vắc-xin phù hợp</p>
            <p className="text-xs mt-1">Thử tìm kiếm với tên thuốc khác hoặc liên hệ bộ phận dược.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => {
              const cat = getCategoryBadge(item.category);
              const inStock = item.quantity > 0;
              const isLow = inStock && item.quantity <= item.min_threshold;

              return (
                <div 
                  key={item.id}
                  className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header: Category & Stock Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cat.bg}`}>
                        {cat.label}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          !inStock ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}></span>
                        <span className={`text-xs font-bold ${
                          !inStock ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-emerald-700'
                        }`}>
                          {!inStock ? 'Hết hàng' : `Còn ${item.quantity} ${item.unit}`}
                        </span>
                      </div>
                    </div>

                    {/* Name & SKU */}
                    <div>
                      <h3 className="font-bold text-gray-900 text-base leading-snug">
                        {item.name}
                      </h3>
                      <p className="font-mono text-[11px] text-gray-400 mt-0.5">
                        SKU: {item.sku}
                      </p>
                    </div>

                    {/* Storage Location & Lot */}
                    <div className="bg-gray-50 rounded-2xl p-3 space-y-1.5 text-xs text-gray-600 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> Vị trí:
                        </span>
                        <span className="font-bold text-gray-800">{item.location || 'Kho chung'}</span>
                      </div>

                      {item.batch_number && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Số lô:</span>
                          <span className="font-mono text-gray-700">{item.batch_number}</span>
                        </div>
                      )}

                      {item.expiry_date && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Hạn dùng:
                          </span>
                          <span className="font-medium text-gray-700">
                            {new Date(item.expiry_date).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                        <span className="text-gray-400">Đơn giá kê đơn:</span>
                        <span className="font-bold text-indigo-700">
                          {item.selling_price?.toLocaleString('vi-VN')} ₫ / {item.unit}
                        </span>
                      </div>
                    </div>

                    {/* Notes / Clinical indications */}
                    {item.notes && (
                      <p className="text-xs text-gray-600 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                        💡 {item.notes}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">
                      Định mức an toàn: &gt;={item.min_threshold}
                    </span>
                    <Link
                      href={`/veterinarian/prescriptions`}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span>Vào kê đơn</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
