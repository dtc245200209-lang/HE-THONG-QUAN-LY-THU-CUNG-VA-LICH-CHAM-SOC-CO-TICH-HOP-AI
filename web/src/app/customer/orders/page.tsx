'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Package, ShoppingBag, Truck, CheckCircle2, Clock, XCircle, 
  AlertCircle, ArrowRight, RotateCcw, ChevronDown, ChevronUp,
  Search, ExternalLink, ShieldCheck, Phone, MapPin, CreditCard,
  Calendar, Check, AlertTriangle, Sparkles, Filter, RefreshCw, QrCode
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getMyOrders, cancelOrder, requestOrderReturn, lookupOrderByCode,
  OrderResponse, TimelineStep 
} from '@/lib/api/orders';
import VietQRPaymentModal from '@/components/ui/VietQRPaymentModal';

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [qrModalOrder, setQrModalOrder] = useState<OrderResponse | null>(null);
  const [expandedTimelineId, setExpandedTimelineId] = useState<string | null>(null);

  // Cancel Modal State
  const [cancelModalOrder, setCancelModalOrder] = useState<OrderResponse | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  // Return Modal State
  const [returnModalOrder, setReturnModalOrder] = useState<OrderResponse | null>(null);
  const [returnReason, setReturnReason] = useState<string>('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState<boolean>(false);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Quick Lookup State (Tra cứu nhanh bằng mã đơn)
  const [lookupCode, setLookupCode] = useState<string>('');
  const [lookupResult, setLookupResult] = useState<OrderResponse | null>(null);
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupCode.trim()) return;
    setIsLookingUp(true);
    setLookupError(null);
    try {
      const order = await lookupOrderByCode(lookupCode.trim());
      setLookupResult(order);
      setExpandedTimelineId(order.id);
    } catch (err: any) {
      setLookupResult(null);
      setLookupError(err.response?.data?.detail || 'Không tìm thấy đơn hàng với mã này!');
    } finally {
      setIsLookingUp(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getMyOrders(activeTab);
      setOrders(data.items);
    } catch (err) {
      console.error('Failed to load orders:', err);
      showToast('Không thể tải danh sách đơn hàng. Vui lòng thử lại!', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, activeTab]);

  // Format currency
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Format date
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

  // Handle Cancel Order (Only valid when status is PENDING)
  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalOrder) return;

    setIsCancelling(true);
    try {
      await cancelOrder(cancelModalOrder.id, cancelReason);
      showToast(`Đã hủy thành công đơn hàng #${cancelModalOrder.order_code}!`);
      setCancelModalOrder(null);
      setCancelReason('');
      fetchOrders();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Không thể hủy đơn hàng!';
      showToast(msg, 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle Return Order (Only valid when status is DELIVERED)
  const handleConfirmReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnModalOrder) return;
    if (!returnReason.trim() || returnReason.trim().length < 5) {
      alert('Vui lòng nhập lý do đổi/trả chi tiết (ít nhất 5 ký tự)!');
      return;
    }

    setIsSubmittingReturn(true);
    try {
      await requestOrderReturn(returnModalOrder.id, returnReason);
      showToast(`Đã gửi yêu cầu đổi/trả cho đơn hàng #${returnModalOrder.order_code}! Shop sẽ phản hồi sớm nhất.`);
      setReturnModalOrder(null);
      setReturnReason('');
      fetchOrders();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Không thể gửi yêu cầu đổi trả!';
      showToast(msg, 'error');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.order_code.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q) ||
      o.items.some(i => i.product_name.toLowerCase().includes(q))
    );
  });

  // KPI counts
  const kpis = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    shipping: orders.filter(o => o.status === 'SHIPPING' || o.status === 'CONFIRMED').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
  };

  // Helper for status badge styling & label
  const renderStatusBadge = (order: OrderResponse) => {
    switch (order.status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Chờ shop xác nhận (Có thể hủy)</span>
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Shop đã xác nhận • Chuẩn bị giao hàng</span>
          </span>
        );
      case 'SHIPPING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 shadow-2xs">
            <Truck className="w-3.5 h-3.5 animate-bounce" />
            <span>Đang giao hàng siêu tốc</span>
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <Check className="w-3.5 h-3.5" />
            <span>Giao thành công</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
            <XCircle className="w-3.5 h-3.5" />
            <span>Đã hủy đơn</span>
          </span>
        );
      case 'RETURN_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đang yêu cầu đổi/trả hàng</span>
          </span>
        );
      case 'RETURNED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã chấp thuận hoàn trả & Hoàn tiền</span>
          </span>
        );
      case 'RETURN_REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 shadow-2xs">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Từ chối yêu cầu đổi trả</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {order.status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-full bg-slate-50 font-sans text-slate-800 pb-12">
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
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
              <Link href="/customer" className="hover:text-teal-600 transition">Dashboard</Link>
              <span>/</span>
              <span className="text-slate-800">Đơn hàng của tôi</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-teal-600" />
              <span>Quản Lý Đơn Hàng & Tiến Trình Giao Hàng</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Mua Sắm Thêm Sản Phẩm</span>
            </Link>
          </div>
        </header>

        <div className="p-6 max-w-6xl w-full mx-auto space-y-6">
          {/* Quick Lookup Card (Dành cho mọi khách hàng tra cứu theo Mã đơn) */}
          <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-slate-900 text-white p-5 rounded-3xl shadow-md space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-teal-200">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Tra Cứu Trực Tuyến Tiến Trình Đơn Hàng</span>
                </div>
                <h3 className="text-base font-extrabold mt-0.5">Kiểm Tra Trạng Thái & Lộ Trình Vận Chuyển Siêu Tốc</h3>
              </div>
              {!isAuthenticated && (
                <Link
                  href="/login?redirect=/customer/orders"
                  className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur-md transition flex items-center gap-1.5 shrink-0"
                >
                  <span>Đăng Nhập Khách Hàng</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <form onSubmit={handleLookup} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={lookupCode}
                  onChange={(e) => setLookupCode(e.target.value)}
                  placeholder="Nhập Mã đơn hàng (Ví dụ: ORD-2026...)"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white text-slate-900 font-bold rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-400 placeholder:font-normal"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <button
                type="submit"
                disabled={isLookingUp}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs transition shadow-md flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                {isLookingUp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>{isLookingUp ? 'Đang tra cứu...' : 'Tra Cứu Đơn'}</span>
              </button>
            </form>

            {lookupError && (
              <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-300" />
                <span>{lookupError}</span>
              </div>
            )}
          </div>

          {/* Quick Lookup Result Card */}
          {lookupResult && (
            <div className="bg-white rounded-3xl border-2 border-teal-500 shadow-xl overflow-hidden p-6 space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-teal-700 font-bold uppercase tracking-wider">Kết Quả Tra Cứu Trực Tiếp</div>
                    <div className="text-base font-black text-slate-900">Mã đơn: #{lookupResult.order_code}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {renderStatusBadge(lookupResult)}
                  <button
                    onClick={() => setLookupResult(null)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    title="Đóng kết quả"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Stepper for Lookup Result */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>Tiến trình giao hàng hiện tại:</span>
                </div>
                {/* 4-Step Stepper */}
                <div className="relative grid grid-cols-4 gap-2 text-center pt-2">
                  <div className="absolute top-5 left-[12.5%] right-[12.5%] h-1 bg-slate-200 -z-0">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{
                        width: lookupResult.status === 'CANCELLED' 
                          ? '0%'
                          : lookupResult.status === 'PENDING' 
                          ? '25%' 
                          : lookupResult.status === 'CONFIRMED' 
                          ? '50%' 
                          : lookupResult.status === 'SHIPPING' 
                          ? '75%' 
                          : '100%'
                      }}
                    />
                  </div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${lookupResult.status !== 'CANCELLED' ? 'bg-emerald-600 text-white' : 'bg-slate-300'}`}>
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 mt-2">Đặt Hàng</span>
                  </div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${['CONFIRMED', 'SHIPPING', 'DELIVERED', 'RETURN_REQUESTED', 'RETURNED'].includes(lookupResult.status) ? 'bg-emerald-600 text-white' : lookupResult.status === 'PENDING' ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-200 text-slate-500'}`}>
                      {lookupResult.status === 'PENDING' ? <Clock className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 mt-2">Chuẩn Bị Giao Hàng</span>
                  </div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${['SHIPPING', 'DELIVERED', 'RETURN_REQUESTED', 'RETURNED'].includes(lookupResult.status) ? lookupResult.status === 'SHIPPING' ? 'bg-teal-600 text-white animate-pulse' : 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      <Truck className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 mt-2">Đang Giao</span>
                  </div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${['DELIVERED', 'RETURN_REQUESTED', 'RETURNED'].includes(lookupResult.status) ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 mt-2">Đã Nhận</span>
                  </div>
                </div>

                {/* Items in lookup */}
                <div className="pt-3 border-t border-slate-200 divide-y divide-slate-100 text-xs">
                  {lookupResult.items.map(item => (
                    <div key={item.id} className="py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={item.product_image || ''} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        <span className="font-bold text-slate-900">{item.product_name}</span>
                        <span className="text-slate-400">x{item.quantity}</span>
                      </div>
                      <span className="font-bold text-rose-600">{formatVND(item.subtotal)}</span>
                    </div>
                  ))}
                  <div className="pt-2 flex items-center justify-between font-bold">
                    <span>Tổng thanh toán ({lookupResult.payment_method}):</span>
                    <span className="text-sm font-black text-rose-600">{formatVND(lookupResult.final_amount)}</span>
                  </div>
                  {lookupResult.payment_method === 'BANK' && lookupResult.payment_status !== 'PAID' && lookupResult.status !== 'CANCELLED' && (
                    <div className="pt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setQrModalOrder(lookupResult)}
                        className="px-3.5 py-1.5 rounded-xl border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs flex items-center gap-1.5 transition shadow-2xs"
                      >
                        <QrCode className="w-3.5 h-3.5 text-teal-600" />
                        <span>Quét Mã VietQR Thanh Toán</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* Policy Banner Alert */}
          <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-cyan-50 border border-teal-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-slate-900 text-sm">
                  Quy Định Quản Lý Đơn Hàng & Bảo Hành Sản Phẩm PetCare
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  • <strong>Hủy đơn tự do:</strong> Bạn có thể bấm hủy đơn ngay khi đơn ở trạng thái <em>Chờ shop xác nhận</em>.<br/>
                  • <strong>Sau khi shop xác nhận giao hàng:</strong> Đơn hàng đã đóng gói / bàn giao bưu tá nên không thể hủy giữa chừng.<br/>
                  • <strong>Chính sách đổi trả:</strong> Sau khi nhận hàng, nếu có bất kỳ vấn đề gì (sản phẩm lỗi, cận date, không đúng mẫu), bạn có quyền gửi yêu cầu đổi/trả sản phẩm và hoàn tiền dễ dàng!
                </p>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold">Tổng Đơn Hàng</div>
                <div className="text-xl font-black text-slate-900">{kpis.total}</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold">Chờ Xác Nhận</div>
                <div className="text-xl font-black text-amber-600">{kpis.pending}</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold">Đang Vận Chuyển</div>
                <div className="text-xl font-black text-teal-600">{kpis.shipping}</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold">Đã Nhận Hàng</div>
                <div className="text-xl font-black text-emerald-600">{kpis.delivered}</div>
              </div>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Status Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
                {[
                  { key: 'ALL', label: 'Tất Cả' },
                  { key: 'PENDING', label: 'Chờ Xác Nhận (Có thể hủy)' },
                  { key: 'SHIPPING', label: 'Đang Giao' },
                  { key: 'DELIVERED', label: 'Đã Nhận' },
                  { key: 'RETURN_REQUESTED', label: 'Yêu Cầu Đổi/Trả' },
                  { key: 'CANCELLED', label: 'Đã Hủy' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                      activeTab === tab.key
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative min-w-[220px]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo mã đơn, tên sản phẩm..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* Orders List Display */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl border border-slate-200 p-6 animate-pulse space-y-4">
                  <div className="h-6 bg-slate-100 rounded w-1/4" />
                  <div className="h-16 bg-slate-100 rounded-2xl" />
                  <div className="h-8 bg-slate-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-3">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Không tìm thấy đơn hàng nào</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery || activeTab !== 'ALL' 
                  ? 'Không có đơn hàng nào khớp với bộ lọc hiện tại của bạn.'
                  : 'Bạn chưa mua món hàng nào tại PetCare SuperStore. Hãy khám phá ngay nhé!'
                }
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Xem Siêu Thị Thú Cưng Ngay</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredOrders.map(order => {
                const isTimelineExpanded = expandedTimelineId === order.id;

                return (
                  <div 
                    key={order.id}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* Order Card Header */}
                    <div className="bg-slate-50/70 px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-black text-xs">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-sm">{order.order_code}</span>
                            <span className="text-[11px] text-slate-400">•</span>
                            <span className="text-[11px] text-slate-500 font-medium">{formatDate(order.created_at)}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>Người nhận: <strong>{order.customer_name}</strong> ({order.customer_phone})</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>{renderStatusBadge(order)}</div>
                    </div>

                    {/* Order Items List */}
                    <div className="p-6 divide-y divide-slate-100">
                      {order.items.map(item => (
                        <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={item.product_image || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&q=80'}
                              alt=""
                              className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-slate-100"
                            />
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-900 text-xs truncate">{item.product_name}</h4>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Quy cách: {item.unit || 'Món'} • Số lượng: <strong className="text-slate-800">x{item.quantity}</strong>
                              </div>
                              <div className="text-xs text-rose-600 font-bold mt-0.5">
                                {formatVND(item.price)}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-sm font-black text-slate-900">{formatVND(item.subtotal)}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* INTERACTIVE DELIVERY PROGRESS TRACKER (Tiến trình giao hàng) */}
                    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-teal-600" />
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                            Tiến Trình Giao Hàng & Vận Chuyển
                          </span>
                        </div>
                        <button
                          onClick={() => setExpandedTimelineId(isTimelineExpanded ? null : order.id)}
                          className="text-xs text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1 transition"
                        >
                          <span>{isTimelineExpanded ? 'Thu gọn nhật ký' : 'Chi tiết lộ trình'}</span>
                          {isTimelineExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* 4-Step Visual Progress Stepper */}
                      <div className="relative grid grid-cols-4 gap-2 text-center pt-2">
                        {/* Connecting Line */}
                        <div className="absolute top-5 left-[12.5%] right-[12.5%] h-1 bg-slate-200 -z-0">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-500"
                            style={{
                              width: order.status === 'CANCELLED' 
                                ? '0%'
                                : order.status === 'PENDING' 
                                ? '25%' 
                                : order.status === 'CONFIRMED' 
                                ? '50%' 
                                : order.status === 'SHIPPING' 
                                ? '75%' 
                                : '100%'
                            }}
                          />
                        </div>

                        {/* Step 1: Đặt hàng */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                            order.status !== 'CANCELLED'
                              ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                              : 'bg-slate-300 text-slate-600'
                          }`}>
                            <Check className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-800 mt-2">Đặt Hàng</span>
                          <span className="text-[10px] text-slate-400">Đã tiếp nhận</span>
                        </div>

                        {/* Step 2: Shop xác nhận */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                            ['CONFIRMED', 'SHIPPING', 'DELIVERED', 'RETURN_REQUESTED', 'RETURNED'].includes(order.status)
                              ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                              : order.status === 'PENDING'
                              ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                              : 'bg-slate-200 text-slate-500'
                          }`}>
                            {['CONFIRMED', 'SHIPPING', 'DELIVERED', 'RETURN_REQUESTED', 'RETURNED'].includes(order.status) ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Clock className="w-4 h-4" />
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-slate-800 mt-2">Chuẩn Bị Giao Hàng</span>
                          <span className="text-[10px] text-slate-400">
                            {order.status === 'PENDING' ? 'Đang duyệt đơn' : 'Chuẩn bị giao'}
                          </span>
                        </div>

                        {/* Step 3: Đang giao hàng */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                            ['SHIPPING', 'DELIVERED', 'RETURN_REQUESTED', 'RETURNED'].includes(order.status)
                              ? order.status === 'SHIPPING'
                                ? 'bg-teal-600 text-white ring-4 ring-teal-100 animate-pulse'
                                : 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                              : 'bg-slate-200 text-slate-500'
                          }`}>
                            <Truck className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-800 mt-2">Đang Vận Chuyển</span>
                          <span className="text-[10px] text-slate-400">
                            {order.status === 'SHIPPING' ? 'Bưu tá đang giao' : order.status === 'DELIVERED' ? 'Đã hoàn tất' : 'Chờ lấy hàng'}
                          </span>
                        </div>

                        {/* Step 4: Giao hàng thành công */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                            ['DELIVERED', 'RETURN_REQUESTED', 'RETURNED'].includes(order.status)
                              ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                              : 'bg-slate-200 text-slate-500'
                          }`}>
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-800 mt-2">Đã Nhận Hàng</span>
                          <span className="text-[10px] text-slate-400">Hoàn tất đơn</span>
                        </div>
                      </div>

                      {/* Expandable detailed timeline logs */}
                      {isTimelineExpanded && order.tracking_timeline && (
                        <div className="mt-4 pt-4 border-t border-slate-200 space-y-2.5 text-xs animate-in fade-in duration-200">
                          <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-2">
                            Lịch Sử Cập Nhật Chi Tiết:
                          </div>
                          {order.tracking_timeline.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-100">
                              <div className="w-2 h-2 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900">{step.title}</span>
                                  {step.time && (
                                    <span className="text-[10px] text-slate-400 font-medium">
                                      {formatDate(step.time)}
                                    </span>
                                  )}
                                </div>
                                <p className="text-slate-600 text-[11px] mt-0.5">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Order Card Footer & Actions */}
                    <div className="px-6 py-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                      {/* Financial info */}
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-2 text-slate-500">
                          <span>Địa chỉ giao:</span>
                          <span className="font-semibold text-slate-800">{order.customer_address}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500">
                            Phương thức: <strong className="text-slate-700">{order.payment_method === 'BANK' ? 'Chuyển khoản' : 'COD (Tiền mặt)'}</strong>
                          </span>
                          <span>•</span>
                          <span className="text-slate-500">
                            Tổng thanh toán: <strong className="text-rose-600 font-black text-sm">{formatVND(order.final_amount)}</strong>
                          </span>
                        </div>
                      </div>

                      {/* ACTION BUTTONS: CANCEL & RETURN & VIETQR LOGIC */}
                      <div className="flex items-center gap-2 justify-end">
                        {/* 0. QUÉT MÃ VIETQR (Nếu chọn Bank và chưa thanh toán) */}
                        {order.payment_method === 'BANK' && order.payment_status !== 'PAID' && order.status !== 'CANCELLED' && (
                          <button
                            type="button"
                            onClick={() => setQrModalOrder(order)}
                            className="px-3.5 py-2 rounded-xl border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs transition shadow-2xs flex items-center gap-1.5"
                          >
                            <QrCode className="w-4 h-4 text-teal-600" />
                            <span>Quét Mã VietQR</span>
                          </button>
                        )}

                        {/* 1. HỦY ĐƠN HÀNG: Chỉ hiển thị & cho phép khi PENDING */}
                        {order.can_cancel ? (
                          <button
                            type="button"
                            onClick={() => {
                              setCancelModalOrder(order);
                              setCancelReason('');
                            }}
                            className="px-4 py-2 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition shadow-2xs flex items-center gap-1.5"
                          >
                            <XCircle className="w-4 h-4 text-rose-600" />
                            <span>Hủy Đơn Hàng</span>
                          </button>
                        ) : ['CONFIRMED', 'SHIPPING'].includes(order.status) ? (
                          <div 
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-500 font-bold text-[11px] border border-slate-200 flex items-center gap-1.5 cursor-not-allowed"
                            title="Chủ shop đã xác nhận hoặc bưu kiện đang được giao, không thể hủy đơn!"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                            <span>Shop đã xác nhận (Không thể hủy)</span>
                          </div>
                        ) : null}

                        {/* 2. ĐỔI / TRẢ HÀNG & HOÀN TIỀN: Chỉ cho phép khi DELIVERED */}
                        {order.can_return ? (
                          <button
                            type="button"
                            onClick={() => {
                              setReturnModalOrder(order);
                              setReturnReason('');
                            }}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-xs transition flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Yêu Cầu Đổi/Trả Hàng</span>
                          </button>
                        ) : order.status === 'RETURN_REQUESTED' ? (
                          <div className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-bold text-[11px] border border-purple-200 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Đã gửi yêu cầu đổi trả (Shop đang duyệt)</span>
                          </div>
                        ) : order.status === 'RETURNED' ? (
                          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Đã hoàn tiền & thu hồi sản phẩm</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      {/* MODAL 1: CONFIRM CANCEL ORDER (CHỈ HOẠT ĐỘNG KHI PENDING) */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Xác Nhận Hủy Đơn Hàng</span>
              </div>
              <button 
                onClick={() => setCancelModalOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p>
                Bạn có chắc chắn muốn hủy đơn hàng <strong>#{cancelModalOrder.order_code}</strong> trị giá <strong>{formatVND(cancelModalOrder.final_amount)}</strong>?
              </p>
              <div className="p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
                Lưu ý: Vì đơn hàng đang ở trạng thái <em>Chờ shop xác nhận</em>, bạn có thể hủy ngay lập tức và số lượng sản phẩm sẽ được hoàn lại kho.
              </div>
            </div>

            <form onSubmit={handleConfirmCancel} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lý do hủy đơn (tùy chọn):
                </label>
                <textarea
                  rows={2}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ví dụ: Đổi ý không mua nữa, muốn đổi sang sản phẩm khác, đặt nhầm số lượng..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOrder(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Giữ Lại Đơn
                </button>
                <button
                  type="submit"
                  disabled={isCancelling}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-md disabled:opacity-50"
                >
                  {isCancelling ? 'Đang hủy...' : 'Đồng Ý Hủy Đơn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REQUEST PRODUCT RETURN & REFUND (CHỈ HOẠT ĐỘNG KHI DELIVERED) */}
      {returnModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                <RotateCcw className="w-5 h-5" />
                <span>Yêu Cầu Đổi / Trả Hàng & Hoàn Tiền</span>
              </div>
              <button 
                onClick={() => setReturnModalOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p>
                Đơn hàng <strong>#{returnModalOrder.order_code}</strong> đã giao thành công.
                Nếu sản phẩm có bất kỳ vấn đề gì, PetCare cam kết bảo hành 1-đổi-1 hoặc hoàn tiền trong vòng 7 ngày!
              </p>
              <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200/80 text-teal-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  <span>Chính sách đổi trả bảo vệ người tiêu dùng:</span>
                </div>
                <p className="text-[11px] text-teal-800 leading-relaxed">
                  • Sản phẩm bị rách bao bì, móp méo trong lúc vận chuyển.<br/>
                  • Hạn sử dụng cận hoặc không đúng chủng loại đã đặt.<br/>
                  • Thú cưng có biểu hiện dị ứng hạt (được bác sĩ hỗ trợ đổi loại khác).
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmReturn} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mô tả chi tiết vấn đề bạn gặp phải: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Ví dụ: Bao bì thức ăn hạt bị rách mép khi bưu tá giao tới; Hoặc bé cún ăn thử không hợp khẩu vị..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReturnModalOrder(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReturn}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black transition shadow-md disabled:opacity-50"
                >
                  {isSubmittingReturn ? 'Đang gửi...' : 'Gửi Yêu Cầu Hoàn Trả'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VietQR Payment Modal */}
      {qrModalOrder && (
        <VietQRPaymentModal
          isOpen={!!qrModalOrder}
          onClose={() => setQrModalOrder(null)}
          orderCode={qrModalOrder.order_code}
          amount={qrModalOrder.final_amount}
          customerName={qrModalOrder.customer_name}
          onPaymentConfirmed={() => {
            const confirmedCode = qrModalOrder.order_code;
            setQrModalOrder(null);
            fetchOrders();
            if (lookupCode.trim()) {
              lookupOrderByCode(lookupCode.trim())
                .then(updated => setLookupResult(updated))
                .catch(() => {});
            }
            showToast(`🎉 Đã xác nhận chuyển khoản cho đơn #${confirmedCode}! Đơn hàng đang được chuẩn bị giao hàng.`, 'success');
          }}
        />
      )}
    </div>
  );
}
