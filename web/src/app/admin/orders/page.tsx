'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, ShoppingBag, Truck, CheckCircle2, Clock, XCircle, 
  AlertCircle, ArrowRight, RotateCcw, ChevronDown, ChevronUp,
  Search, ExternalLink, ShieldCheck, Phone, MapPin, CreditCard,
  Calendar, Check, AlertTriangle, Sparkles, Filter, RefreshCw,
  BarChart3, TrendingUp, DollarSign, ArrowUpRight, CheckSquare,
  Users, UserCheck
} from 'lucide-react';
import { 
  getAllOrdersAdmin, getOrderStatistics, 
  OrderResponse, OrderStatistics 
} from '@/lib/api/orders';

export default function AdminOrdersAnalyticsPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [stats, setStats] = useState<OrderStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'DISPATCHED' | 'RETURNS' | 'ALL'>('DISPATCHED');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersData, statsData] = await Promise.all([
        getAllOrdersAdmin(undefined, searchQuery),
        getOrderStatistics()
      ]);
      setOrders(ordersData.items);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load admin order statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Filter orders by Admin focus: Dispatched vs Returns
  const displayedOrders = orders.filter(order => {
    if (activeTab === 'DISPATCHED') {
      return ['CONFIRMED', 'SHIPPING', 'DELIVERED'].includes(order.status);
    }
    if (activeTab === 'RETURNS') {
      return ['RETURN_REQUESTED', 'RETURNED', 'RETURN_REJECTED'].includes(order.status);
    }
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
              <span>Admin</span>
              <span>/</span>
              <span className="text-slate-800">Thống Kê Đơn Hàng Đi & Hoàn Trả</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <BarChart3 className="w-7 h-7 text-indigo-600" />
              <span>Quản Lý Số Lượng Đơn Hàng Đi & Đơn Hoàn Trả</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Trung tâm giám sát số lượng đơn hàng xuất kho đi giao, hiệu suất giao vận và thống kê các ca hoàn trả & hoàn tiền của PetCare Store.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="p-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
              title="Làm mới số liệu"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              href="/receptionist/orders"
              className="px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 shadow-2xs transition flex items-center gap-1.5"
              title="Xem bàn Lễ tân duyệt đơn trực tiếp"
            >
              <UserCheck className="w-4 h-4" />
              <span>Bàn Lễ Tân Duyệt Đơn &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Operational Role Clarification Alert */}
        <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-blue-50 border border-indigo-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs shadow-xs">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="font-bold text-slate-900 text-sm">
              Phân Quyền Vận Hành Chuẩn: Lễ Tân Duyệt Đơn — Admin Quản Lý Chỉ Số
            </h4>
            <p className="text-slate-600 leading-relaxed">
              • <strong>Bộ phận Lễ tân:</strong> Trực tiếp gọi điện xác nhận khách hàng, bấm duyệt đơn đóng gói, bàn giao bưu tá và xử lý đổi/trả.<br/>
              • <strong>Quản trị viên (Admin):</strong> Giám sát số lượng đơn hàng đi giao, tỷ lệ hoàn trả, kiểm soát dòng tiền xuất kho và doanh thu thực tế.
            </p>
          </div>
        </div>

        {/* 4 CORE KPI METRICS: DISPATCHED VS RETURNS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Đơn hàng đi */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-bold">Số Lượng Đơn Đi</span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {stats?.dispatched_count ?? 0} <span className="text-xs text-slate-400 font-normal">đơn</span>
            </div>
            <div className="text-xs text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>Đang giao: <strong className="text-teal-600">{stats?.shipping_count ?? 0}</strong></span>
              <span>Đã giao: <strong className="text-emerald-600">{stats?.delivered_count ?? 0}</strong></span>
            </div>
            <div className="text-[11px] text-slate-400">
              Doanh thu đơn đi: <strong className="text-slate-800">{formatVND(stats?.dispatched_revenue ?? 0)}</strong>
            </div>
          </div>

          {/* Card 2: Đơn hàng hoàn trả */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-bold">Số Lượng Hoàn Trả</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <RotateCcw className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-purple-700">
              {stats?.total_return_cases ?? 0} <span className="text-xs text-slate-400 font-normal">ca</span>
            </div>
            <div className="text-xs text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>Chờ duyệt: <strong className="text-purple-600">{stats?.return_requested_count ?? 0}</strong></span>
              <span>Đã duyệt: <strong className="text-emerald-600">{stats?.returned_count ?? 0}</strong></span>
            </div>
            <div className="text-[11px] text-slate-400">
              Tỷ lệ hoàn trả: <strong className="text-rose-600">{stats?.return_rate ?? 0}%</strong> tổng đơn
            </div>
          </div>

          {/* Card 3: Số tiền hoàn trả */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-bold">Tổng Tiền Hoàn Trả</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-600">
              {formatVND(stats?.refunded_amount ?? 0)}
            </div>
            <div className="text-xs text-slate-500 pt-1 border-t border-slate-100">
              Chờ hoàn trả: <strong className="text-amber-600">{formatVND(stats?.pending_refund_amount ?? 0)}</strong>
            </div>
            <div className="text-[11px] text-slate-400">
              Đã thu hồi hàng về kho an toàn
            </div>
          </div>

          {/* Card 4: Tổng đơn toàn viện */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-bold">Tổng Đơn Toàn Viện</span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {stats?.total_orders ?? 0} <span className="text-xs text-slate-400 font-normal">đơn</span>
            </div>
            <div className="text-xs text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>Chờ duyệt: <strong className="text-amber-600">{stats?.pending_count ?? 0}</strong></span>
              <span>Đã hủy: <strong className="text-slate-500">{stats?.cancelled_count ?? 0}</strong></span>
            </div>
            <div className="text-[11px] text-slate-400">
              Cập nhật trực tiếp từ CSDL PostgreSQL
            </div>
          </div>
        </div>

        {/* Tab Navigation & Search */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* 3 Main Focused Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('DISPATCHED')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'DISPATCHED'
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>🚚 Đơn Hàng Đi Giao ({stats?.dispatched_count ?? 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('RETURNS')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'RETURNS'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>🔄 Đơn Hàng Hoàn Trả ({stats?.total_return_cases ?? 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'ALL'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Tất Cả Đơn ({stats?.total_orders ?? 0})</span>
              </button>
            </div>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 min-w-[260px]">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Mã đơn, tên khách, số ĐT..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition"
              >
                Tìm
              </button>
            </form>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Đang tải số liệu đơn hàng...</div>
          ) : displayedOrders.length === 0 ? (
            <div className="p-16 text-center space-y-2">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-700">Chưa có đơn hàng nào trong phân loại này</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Mã Đơn / Thời Gian</th>
                    <th className="py-3.5 px-4">Khách Hàng & Nơi Nhận</th>
                    <th className="py-3.5 px-4">Sản Phẩm Xuất Kho</th>
                    <th className="py-3.5 px-4">Giá Trị Đơn Hàng</th>
                    <th className="py-3.5 px-4">Trạng Thái Vận Hành</th>
                    <th className="py-3.5 px-4">Thông Tin Đổi Trả / Bưu Tá</th>
                    <th className="py-3.5 px-4 text-right">Chi Tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {displayedOrders.map(order => {
                    const isReturn = ['RETURN_REQUESTED', 'RETURNED', 'RETURN_REJECTED'].includes(order.status);

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Mã đơn */}
                        <td className="py-3.5 px-4">
                          <div className="font-black text-slate-900 text-xs">{order.order_code}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{formatDate(order.created_at)}</div>
                        </td>

                        {/* Khách hàng */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{order.customer_name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{order.customer_phone}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-xs" title={order.customer_address}>
                            {order.customer_address}
                          </div>
                        </td>

                        {/* Sản phẩm */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            {order.items.slice(0, 2).map(item => (
                              <div key={item.id} className="flex items-center gap-2 truncate max-w-xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                <span className="font-semibold text-slate-800 truncate">{item.product_name}</span>
                                <span className="text-slate-400 text-[10px]">x{item.quantity}</span>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <div className="text-[10px] text-indigo-600 font-bold pl-3">
                                +{order.items.length - 2} món khác...
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Giá trị */}
                        <td className="py-3.5 px-4">
                          <div className={`font-black text-sm ${isReturn ? 'text-purple-700' : 'text-slate-900'}`}>
                            {formatVND(order.final_amount)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {order.payment_method} • {order.payment_status}
                          </div>
                        </td>

                        {/* Trạng thái */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            order.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                            order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'SHIPPING' ? 'bg-teal-100 text-teal-800' :
                            order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                            order.status === 'RETURN_REQUESTED' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'RETURNED' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {order.status === 'SHIPPING' && <Truck className="w-3 h-3" />}
                            {order.status === 'DELIVERED' && <Check className="w-3 h-3" />}
                            {order.status === 'RETURN_REQUESTED' && <RotateCcw className="w-3 h-3" />}
                            <span>{order.status}</span>
                          </span>
                        </td>

                        {/* Thông tin đổi trả / điều phối */}
                        <td className="py-3.5 px-4">
                          {isReturn ? (
                            <div className="space-y-0.5 max-w-xs">
                              <div className="text-[11px] font-bold text-purple-900 truncate" title={order.return_reason || ''}>
                                Lý do: {order.return_reason || 'Không ghi'}
                              </div>
                              {order.return_response_notes && (
                                <div className="text-[10px] text-slate-500 truncate" title={order.return_response_notes}>
                                  Lễ tân: {order.return_response_notes}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-500">
                              {order.status === 'SHIPPING' ? (
                                <span className="text-teal-700 font-semibold">Đang giao vận tốc hành 2h</span>
                              ) : order.status === 'DELIVERED' ? (
                                <span className="text-emerald-700 font-semibold">Đã giao tận tay khách</span>
                              ) : order.status === 'CONFIRMED' ? (
                                <span className="text-blue-700 font-semibold">Đã đóng gói niêm phong</span>
                              ) : (
                                <span className="text-amber-700">Lễ tân chưa duyệt</span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Nút Xem chi tiết */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold text-xs transition"
                          >
                            Xem Hồ Sơ
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL DETAIL: FULL ORDER INFORMATION */}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900">Chi Tiết Đơn Hàng #{selectedOrder.order_code}</span>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl">
              <div>
                <div className="text-slate-400">Khách hàng:</div>
                <div className="font-bold text-slate-900">{selectedOrder.customer_name} ({selectedOrder.customer_phone})</div>
                <div className="text-slate-600 mt-1">Đ/c: {selectedOrder.customer_address}</div>
              </div>
              <div>
                <div className="text-slate-400">Trạng thái hiện tại:</div>
                <div className="font-black text-indigo-700 text-sm mt-0.5">{selectedOrder.status}</div>
                <div className="text-slate-500 mt-1">Thanh toán: {selectedOrder.payment_method} ({selectedOrder.payment_status})</div>
              </div>
            </div>

            {selectedOrder.return_reason && (
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-purple-700" />
                  <span>Chi tiết yêu cầu hoàn trả của khách hàng:</span>
                </div>
                <p className="text-[11px] text-purple-800">{selectedOrder.return_reason}</p>
                {selectedOrder.return_response_notes && (
                  <p className="text-[11px] text-purple-700 italic border-t border-purple-200/60 pt-1 mt-1">
                    Phản hồi từ Lễ tân: {selectedOrder.return_response_notes}
                  </p>
                )}
              </div>
            )}

            {/* Products List */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-700 uppercase tracking-wide text-[11px]">Danh mục sản phẩm:</div>
              <div className="border border-slate-100 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                {selectedOrder.items.map(item => (
                  <div key={item.id} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={item.product_image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <div className="font-bold text-slate-900">{item.product_name}</div>
                        <div className="text-slate-500 text-[11px]">{formatVND(item.price)} x {item.quantity} {item.unit}</div>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900">{formatVND(item.subtotal)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            {selectedOrder.tracking_timeline && (
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-700 uppercase tracking-wide text-[11px]">Nhật ký vận chuyển:</div>
                <div className="space-y-2">
                  {selectedOrder.tracking_timeline.map((step, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-800">{step.title}</div>
                        <div className="text-[11px] text-slate-500">{step.description}</div>
                        {step.time && <div className="text-[10px] text-slate-400">{formatDate(step.time)}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
