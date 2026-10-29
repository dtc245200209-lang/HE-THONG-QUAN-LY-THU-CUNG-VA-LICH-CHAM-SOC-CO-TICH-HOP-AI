'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, ShoppingBag, Truck, CheckCircle2, Clock, XCircle, 
  AlertCircle, ArrowRight, RotateCcw, ChevronDown, ChevronUp,
  Search, ExternalLink, ShieldCheck, Phone, MapPin, CreditCard,
  Calendar, Check, AlertTriangle, Sparkles, Filter, RefreshCw,
  Users, CheckSquare, X, UserCheck
} from 'lucide-react';
import { 
  getAllOrdersAdmin, updateOrderStatusAdmin, 
  OrderResponse 
} from '@/lib/api/orders';

export default function ReceptionistOrdersApprovalPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

  // Status Action Modal State
  const [actionModal, setActionModal] = useState<{
    order: OrderResponse;
    targetStatus: string;
    title: string;
    notesPrompt?: string;
    defaultNotes?: string;
  } | null>(null);
  const [actionNotes, setActionNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrdersAdmin(activeTab, searchQuery);
      setOrders(data.items);
    } catch (err) {
      console.error('Failed to load orders for receptionist:', err);
      showToast('Không thể tải danh sách đơn hàng!', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
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

  const handleConfirmStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal) return;

    setIsUpdating(true);
    try {
      await updateOrderStatusAdmin(actionModal.order.id, actionModal.targetStatus, actionNotes);
      showToast(`Đã duyệt đơn #${actionModal.order.order_code} chuyển sang ${actionModal.targetStatus}!`);
      setActionModal(null);
      setActionNotes('');
      fetchOrders();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Lỗi khi cập nhật trạng thái!';
      showToast(msg, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const pendingCount = orders.filter(o => o.status === 'PENDING').length;
  const returnRequestedCount = orders.filter(o => o.status === 'RETURN_REQUESTED').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold animate-bounce border ${
            toastType === 'success' 
              ? 'bg-slate-900 text-emerald-400 border-emerald-500/30' 
              : 'bg-rose-900 text-rose-200 border-rose-500/30'
          }`}>
            {toastType === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
              <span>Lễ Tân</span>
              <span>/</span>
              <span className="text-slate-800">Duyệt Đơn Hàng & Vận Chuyển</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <UserCheck className="w-7 h-7 text-teal-600" />
              <span>Bàn Lễ Tân • Duyệt Đơn Hàng & Xử Lý Đổi Trả</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Bộ phận Lễ tân trực tiếp xác nhận đơn hàng của khách, gọi điện kiểm tra địa chỉ, bàn giao bưu tá và tiếp nhận xử lý đổi/trả hàng.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              className="p-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
              title="Làm mới danh sách"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              href="/shop"
              target="_blank"
              className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Xem Cửa Hàng Shop</span>
            </Link>
          </div>
        </div>

        {/* Operational Priority Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                <Clock className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-900">Đơn Chờ Duyệt Gấp</div>
                <div className="text-[11px] text-amber-700">Cần lễ tân bấm xác nhận ngay</div>
              </div>
            </div>
            <div className="text-2xl font-black text-amber-900">{pendingCount}</div>
          </div>

          <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-purple-900">Yêu Cầu Đổi / Trả Hàng</div>
                <div className="text-[11px] text-purple-700">Khách báo sự cố sau nhận hàng</div>
              </div>
            </div>
            <div className="text-2xl font-black text-purple-900">{returnRequestedCount}</div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-900">Quy Tắc Vận Hành</div>
                <div className="text-[11px] text-emerald-700">Lễ tân duyệt ➔ Khách khóa hủy</div>
              </div>
            </div>
            <div className="text-xs font-bold text-emerald-800 bg-emerald-200/60 px-2.5 py-1 rounded-full">
              Chuẩn 100%
            </div>
          </div>
        </div>

        {/* Search & Status Filters */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
              {[
                { key: 'ALL', label: 'Tất Cả' },
                { key: 'PENDING', label: `Cần Duyệt (${pendingCount})` },
                { key: 'CONFIRMED', label: 'Đã Xác Nhận' },
                { key: 'SHIPPING', label: 'Đang Giao' },
                { key: 'DELIVERED', label: 'Đã Giao Xong' },
                { key: 'RETURN_REQUESTED', label: `Yêu Cầu Đổi/Trả (${returnRequestedCount})` },
                { key: 'RETURNED', label: 'Đã Hoàn Tiền' },
                { key: 'CANCELLED', label: 'Đã Hủy' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                    activeTab === tab.key
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 min-w-[260px]">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Mã đơn, tên khách, số ĐT..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition"
              >
                Tìm
              </button>
            </form>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Đang tải danh sách đơn hàng...</div>
          ) : orders.length === 0 ? (
            <div className="p-16 text-center space-y-2">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-700">Chưa có đơn hàng nào trong danh mục này</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Mã Đơn / Thời Gian</th>
                    <th className="py-3.5 px-4">Khách Hàng & Liên Hệ</th>
                    <th className="py-3.5 px-4">Sản Phẩm Đặt Mua</th>
                    <th className="py-3.5 px-4">Tổng Thanh Toán</th>
                    <th className="py-3.5 px-4">Trạng Thái</th>
                    <th className="py-3.5 px-4 text-right">Lễ Tân Thao Tác Duyệt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Mã đơn */}
                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-900 text-xs">{order.order_code}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{formatDate(order.created_at)}</div>
                      </td>

                      {/* Khách hàng */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{order.customer_name}</div>
                        <div className="text-[11px] text-slate-600 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-teal-600" />
                          <span className="font-bold">{order.customer_phone}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5" title={order.customer_address}>
                          {order.customer_address}
                        </div>
                      </td>

                      {/* Sản phẩm */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {order.items.slice(0, 2).map(item => (
                            <div key={item.id} className="flex items-center gap-2 truncate max-w-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                              <span className="font-semibold text-slate-800 truncate">{item.product_name}</span>
                              <span className="text-slate-400 text-[10px]">x{item.quantity}</span>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="text-[10px] text-teal-600 font-bold pl-3">
                              +{order.items.length - 2} sản phẩm khác...
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Tổng tiền */}
                      <td className="py-3.5 px-4">
                        <div className="font-black text-rose-600 text-sm">{formatVND(order.final_amount)}</div>
                        <div className="text-[10px] text-slate-400">
                          {order.payment_method === 'BANK' ? 'Chuyển khoản' : 'COD'} • {order.payment_status}
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
                          {order.status === 'PENDING' && <Clock className="w-3 h-3" />}
                          {order.status === 'SHIPPING' && <Truck className="w-3 h-3" />}
                          {order.status === 'RETURN_REQUESTED' && <RotateCcw className="w-3 h-3" />}
                          <span>{order.status}</span>
                        </span>
                      </td>

                      {/* Thao tác Lễ tân */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. XÁC NHẬN ĐƠN (Chuyển sang CONFIRMED -> khách không thể tự hủy nữa) */}
                          {order.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => {
                                setActionModal({
                                  order,
                                  targetStatus: 'CONFIRMED',
                                  title: 'Lễ Tân Duyệt Đơn & Xác Nhận Đóng Gói',
                                  notesPrompt: 'Ghi chú cho khách hàng hoặc nhân viên soạn hàng...',
                                  defaultNotes: 'Lễ tân đã gọi điện xác nhận địa chỉ và đang đóng gói sản phẩm.'
                                });
                                setActionNotes('Lễ tân đã gọi điện xác nhận địa chỉ và đang đóng gói sản phẩm.');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1"
                              title="Lễ tân duyệt đơn: sau khi duyệt, khách sẽ không thể tự hủy đơn nữa"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Duyệt Đơn Hàng</span>
                            </button>
                          )}

                          {/* 2. BÀN GIAO VẬN CHUYỂN (Chuyển sang SHIPPING) */}
                          {order.status === 'CONFIRMED' && (
                            <button
                              type="button"
                              onClick={() => {
                                setActionModal({
                                  order,
                                  targetStatus: 'SHIPPING',
                                  title: 'Bàn Giao Bưu Tá Vận Chuyển Siêu Tốc',
                                  notesPrompt: 'Tên bưu tá, biển số xe hoặc số điện thoại tài xế...',
                                  defaultNotes: 'Đã bàn giao bưu tá giao hàng trong 2 giờ.'
                                });
                                setActionNotes('Đã bàn giao bưu tá giao hàng trong 2 giờ.');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Bàn Giao Bưu Tá</span>
                            </button>
                          )}

                          {/* 3. HOÀN TẤT GIAO HÀNG (Chuyển sang DELIVERED) */}
                          {order.status === 'SHIPPING' && (
                            <button
                              type="button"
                              onClick={() => {
                                setActionModal({
                                  order,
                                  targetStatus: 'DELIVERED',
                                  title: 'Xác Nhận Khách Đã Nhận Hàng Thành Công',
                                  notesPrompt: 'Ghi chú giao nhận...',
                                  defaultNotes: 'Khách hàng đã nhận hàng và kiểm tra bưu kiện nguyên vẹn.'
                                });
                                setActionNotes('Khách hàng đã nhận hàng và kiểm tra bưu kiện nguyên vẹn.');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Đã Giao Xong</span>
                            </button>
                          )}

                          {/* 4. XỬ LÝ YÊU CẦU ĐỔI TRẢ */}
                          {order.status === 'RETURN_REQUESTED' && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setActionModal({
                                    order,
                                    targetStatus: 'RETURNED',
                                    title: 'Lễ Tân Duyệt Chấp Thuận Hoàn Trả Hàng',
                                    notesPrompt: 'Ghi chú xác nhận thu hồi sản phẩm & hoàn tiền...',
                                    defaultNotes: 'Lễ tân đã liên hệ kiểm tra tình trạng hàng và chấp thuận hoàn trả & hoàn tiền cho khách.'
                                  });
                                  setActionNotes('Lễ tân đã liên hệ kiểm tra tình trạng hàng và chấp thuận hoàn trả & hoàn tiền cho khách.');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Duyệt Đổi/Trả</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActionModal({
                                    order,
                                    targetStatus: 'RETURN_REJECTED',
                                    title: 'Lễ Tân Từ Chối Yêu Cầu Hoàn Trả Hàng',
                                    notesPrompt: 'Lý do từ chối cụ thể để giải thích cho khách hàng...',
                                    defaultNotes: 'Sản phẩm đã qua sử dụng quá 7 ngày hoặc không thuộc danh mục đổi trả theo chính sách.'
                                  });
                                  setActionNotes('Sản phẩm đã qua sử dụng quá 7 ngày hoặc không thuộc danh mục đổi trả theo chính sách.');
                                }}
                                className="px-2.5 py-1.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 font-bold text-xs transition"
                              >
                                Từ Chối
                              </button>
                            </div>
                          )}

                          {/* Xem chi tiết */}
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                          >
                            Chi Tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL ACTION: STATUS TRANSITION CONFIRMATION */}

      {actionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900">{actionModal.title}</span>
              <button 
                onClick={() => setActionModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                Đơn hàng: <strong>#{actionModal.order.order_code}</strong> ({actionModal.order.customer_name})
              </p>
              {actionModal.targetStatus === 'CONFIRMED' && (
                <div className="p-3 rounded-xl bg-blue-50 text-blue-900 border border-blue-200">
                  ℹ️ <strong>Lưu ý:</strong> Sau khi Lễ tân duyệt đơn này, trạng thái sẽ chuyển sang <em>CONFIRMED</em> và khách hàng sẽ <strong>không thể tự hủy đơn hàng</strong> được nữa!
                </div>
              )}
              {actionModal.order.return_reason && (
                <div className="p-3 rounded-xl bg-purple-50 text-purple-900 border border-purple-200">
                  <strong>Lý do khách xin đổi trả:</strong> {actionModal.order.return_reason}
                </div>
              )}
            </div>

            <form onSubmit={handleConfirmStatusChange} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ghi chú điều phối Lễ tân:
                </label>
                <textarea
                  rows={2}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder={actionModal.notesPrompt || "Nhập ghi chú..."}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-md disabled:opacity-50"
                >
                  {isUpdating ? 'Đang lưu...' : 'Xác Nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <div className="font-bold text-slate-900">{selectedOrder.customer_name}</div>
                <div className="text-teal-700 font-bold mt-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{selectedOrder.customer_phone}</span>
                </div>
                <div className="text-slate-600 mt-1">Đ/c: {selectedOrder.customer_address}</div>
              </div>
              <div>
                <div className="text-slate-400">Trạng thái hiện tại:</div>
                <div className="font-black text-teal-700 text-sm mt-0.5">{selectedOrder.status}</div>
                <div className="text-slate-500 mt-1">Thanh toán: {selectedOrder.payment_method} ({selectedOrder.payment_status})</div>
              </div>
            </div>

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
                      <div className="w-2 h-2 rounded-full bg-teal-600 mt-1.5 shrink-0" />
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
