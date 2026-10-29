'use client';

import React, { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CreditCard, DollarSign, Search, Filter, 
  CheckCircle2, Clock, XCircle, RefreshCw, ArrowUpRight,
  Eye, Copy, Check, X, PawPrint, User, Calendar, Receipt, Printer
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPaymentsPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/payments');
      setPayments(res.data || []);
    } catch (err) {
      console.error("Lỗi tải lịch sử thanh toán:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchPayments();
  }, [authLoading]);

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const date = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      return `${time} - Ngày ${date}`;
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const custName = p.appointment?.customer?.full_name?.toLowerCase() || '';
      const petName = p.appointment?.pet?.name?.toLowerCase() || '';
      const pId = p.id?.toLowerCase() || '';
      const apptId = p.appointment_id?.toLowerCase() || '';
      const s = search.toLowerCase();

      const matchSearch = 
        pId.includes(s) || 
        apptId.includes(s) || 
        custName.includes(s) || 
        petName.includes(s);

      if (statusFilter === 'ALL') return matchSearch;
      return matchSearch && p.status === statusFilter;
    });
  }, [payments, search, statusFilter]);

  const totalRevenue = useMemo(() => {
    return payments
      .filter(p => p.status === 'PAID' || p.status === 'COMPLETED')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [payments]);

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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Thanh toán & Nhật ký Giao dịch</h1>
          <p className="text-sm text-gray-500 mt-1">Sổ cái kế toán, mã giao dịch, mã lịch hẹn, tên khách hàng và chi tiết viện phí</p>
        </div>

        <button
          onClick={fetchPayments}
          className="p-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition shadow-xs flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4 text-primary" />
          Làm mới
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-6 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between opacity-90 text-sm font-medium">
            <span>Tổng thực thu (Đã thanh toán)</span>
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black mt-3">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs opacity-75 mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Dữ liệu trực tiếp từ cổng thanh toán
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-sm font-medium">
            <span>Giao dịch thành công</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-gray-900 mt-3">
            {payments.filter(p => p.status === 'PAID' || p.status === 'COMPLETED').length}
          </p>
          <p className="text-xs text-gray-400 mt-2">Tổng số biên lai hoàn tất</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-sm font-medium">
            <span>Tổng hóa đơn phát sinh</span>
            <CreditCard className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-black text-gray-900 mt-3">{payments.length}</p>
          <p className="text-xs text-gray-400 mt-2">Toàn bộ giao dịch hệ thống</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã giao dịch, mã lịch hẹn, tên khách..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'PAID', 'PENDING', 'FAILED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : st === 'PAID' ? 'Thành công' : st === 'PENDING' ? 'Chờ thu' : 'Thất bại'}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 border-collapse">
            <thead className="bg-gray-50/80 text-xs uppercase font-bold text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Mã Giao Dịch & Ngày Giờ</th>
                <th className="px-6 py-4">Mã Đặt Lịch Hẹn</th>
                <th className="px-6 py-4">Khách Hàng (Tên Đầy Đủ)</th>
                <th className="px-6 py-4">Thú Cưng & Dịch Vụ</th>
                <th className="px-6 py-4">Hình Thức & Số Tiền</th>
                <th className="px-6 py-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <CreditCard className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    Không có giao dịch nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredPayments.map(pay => {
                  const custName = pay.appointment?.customer?.full_name || 'Khách hàng PetCare';
                  const petName = pay.appointment?.pet?.name || 'Thú cưng';
                  const fullPaymentCode = `PAY-${pay.id.replace(/-/g, '').substring(0, 10).toUpperCase()}`;
                  const fullApptCode = pay.appointment_id ? `APPT-${pay.appointment_id.replace(/-/g, '').substring(0, 8).toUpperCase()}` : 'TRỰC TIẾP';

                  return (
                    <tr key={pay.id} className="hover:bg-gray-50/60 transition">
                      {/* Mã Giao Dịch */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-gray-900">
                            <span>#{fullPaymentCode}</span>
                            <button
                              onClick={() => copyToClipboard(fullPaymentCode, pay.id)}
                              title="Sao chép mã giao dịch"
                              className="text-gray-400 hover:text-primary p-0.5 rounded transition"
                            >
                              {copiedId === pay.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(pay.created_at)}
                          </p>
                        </div>
                      </td>

                      {/* Mã Đặt Lịch */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 block w-fit">
                            #{fullApptCode}
                          </span>
                          {pay.appointment?.scheduled_time && (
                            <p className="text-[11px] text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDateTime(pay.appointment.scheduled_time)}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Khách Hàng (Tên Đầy Đủ) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {custName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block text-sm">
                              {custName}
                            </span>
                            <span className="text-xs text-gray-400">
                              {pay.appointment?.customer?.email || '—'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Thú Cưng & Dịch Vụ */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-gray-800 text-xs">
                            <PawPrint className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span>{petName}</span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {pay.appointment?.services && pay.appointment.services.length > 0
                              ? pay.appointment.services.map((s: any) => s.service.name).join(', ')
                              : 'Khám & Chăm sóc'}
                          </p>
                        </div>
                      </td>

                      {/* Số Tiền & Hình Thức */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="font-bold text-gray-900 block">
                            {formatCurrency(pay.amount)}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                              {pay.payment_method === 'BANK_TRANSFER' ? 'VietQR' : pay.payment_method === 'CASH' ? 'Tiền mặt' : pay.payment_method || 'CASH'}
                            </span>
                            {(pay.status === 'PAID' || pay.status === 'COMPLETED') ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                                Đã thu
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
                                Chờ thu
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Thao Tác (Chi tiết lại) */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedPayment(pay);
                            setShowDetailModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-primary hover:text-white transition shadow-xs"
                          title="Xem chi tiết hóa đơn giao dịch"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi tiết lại</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowDetailModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-5 border-b border-gray-100">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Receipt className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-gray-900">CHI TIẾT BIÊN LAI GIAO DỊCH</h2>
              <p className="text-xs text-gray-500 mt-0.5">Hệ thống Quản trị PetCare AI Hospital</p>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-3 font-mono text-xs">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg font-bold">
                  Mã GD: #PAY-{selectedPayment.id.replace(/-/g, '').substring(0, 10).toUpperCase()}
                </span>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg font-bold">
                  Mã Lịch: #APPT-{selectedPayment.appointment_id ? selectedPayment.appointment_id.replace(/-/g, '').substring(0, 8).toUpperCase() : 'TRỰC TIẾP'}
                </span>
              </div>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-gray-400 block mb-0.5">Thời gian thực hiện:</span>
                  <span className="font-bold text-gray-900">{formatDateTime(selectedPayment.created_at)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Phương thức:</span>
                  <span className="font-bold text-emerald-700">{selectedPayment.payment_method || 'CASH'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Khách hàng (Tên đầy đủ):</span>
                  <span className="font-bold text-gray-900">{selectedPayment.appointment?.customer?.full_name || 'Khách vãng lai'}</span>
                  <span className="text-[11px] text-gray-400 block">{selectedPayment.appointment?.customer?.email || ''}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Bệnh nhân thú cưng:</span>
                  <span className="font-bold text-purple-700 flex items-center gap-1">
                    <PawPrint className="w-3.5 h-3.5" />
                    {selectedPayment.appointment?.pet?.name || 'Thú cưng'}
                  </span>
                  <span className="text-[11px] text-gray-400 block">
                    {selectedPayment.appointment?.pet?.species === 'DOG' ? 'Chó' : 'Mèo'} • {selectedPayment.appointment?.pet?.breed || 'Chưa rõ giống'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-gray-500 uppercase font-bold text-[10px] block mb-2">Bảng kê viện phí</span>
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-gray-500 font-bold border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-2">Hạng mục</th>
                        <th className="px-4 py-2 text-right">Chi phí</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedPayment.appointment?.services && selectedPayment.appointment.services.length > 0 ? (
                        selectedPayment.appointment.services.map((item: any, idx: number) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 font-medium text-gray-800">{item.service.name}</td>
                            <td className="px-4 py-2 text-right font-semibold text-gray-900">{formatCurrency(item.price_at_booking)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-4 py-2 font-medium text-gray-800">Dịch vụ chăm sóc thú cưng</td>
                          <td className="px-4 py-2 text-right font-semibold text-gray-900">{formatCurrency(selectedPayment.amount)}</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-emerald-50/50 font-bold border-t border-gray-100">
                      <tr>
                        <td className="px-4 py-2.5">TỔNG THANH TOÁN</td>
                        <td className="px-4 py-2.5 text-right text-emerald-700 font-black text-sm">{formatCurrency(selectedPayment.amount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In biên lai</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-black text-xs font-bold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
