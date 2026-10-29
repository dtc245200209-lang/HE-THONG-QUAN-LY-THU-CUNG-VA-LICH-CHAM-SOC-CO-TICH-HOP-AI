'use client';

import React, { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DollarSign, CreditCard, CheckCircle2, Clock, Search, Plus, 
  Receipt, Eye, Calendar, User, PawPrint, Copy, Check, X, 
  Printer, ArrowUpRight, Filter, RefreshCw, Sparkles, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface ServiceItem {
  service: {
    id: string;
    name: string;
    category: string;
    base_price: number;
  };
  price_at_booking: number;
}

interface AppointmentDetails {
  id: string;
  customer_id: string;
  pet_id: string;
  caregiver_id?: string;
  scheduled_time: string;
  status: string;
  total_price: number;
  notes?: string;
  customer?: {
    id: string;
    full_name: string;
    email: string;
  };
  caregiver?: {
    id: string;
    full_name: string;
    email: string;
  };
  pet?: {
    id: string;
    name: string;
    species: string;
    breed?: string;
    avatar?: string;
  };
  services?: ServiceItem[];
}

interface Payment {
  id: string;
  appointment_id: string;
  amount: number;
  status: string;
  payment_method: string;
  transaction_id?: string;
  notes?: string;
  created_at: string;
  appointment?: AppointmentDetails;
}

export default function ReceptionistPaymentsPage() {
  const { user, loading: authLoading } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [appointments, setAppointments] = useState<AppointmentDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');

  // Modal Thu tiền mới
  const [showModal, setShowModal] = useState(false);
  const [selectedApptId, setSelectedApptId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [submitting, setSubmitting] = useState(false);

  // Modal Xem chi tiết hóa đơn
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, apptsRes] = await Promise.all([
        api.get('/api/v1/payments'),
        api.get('/api/v1/appointments')
      ]);
      setPayments(paymentsRes.data || []);
      setAppointments(apptsRes.data || []);
    } catch (err) {
      console.error("Lỗi khi tải giao dịch:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchData();
  }, [authLoading]);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApptId || amount <= 0) {
      alert("Vui lòng chọn lịch hẹn và nhập số tiền thanh toán!");
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/v1/payments', {
        appointment_id: selectedApptId,
        amount: Number(amount),
        payment_method: paymentMethod,
        status: 'PAID'
      });
      setShowModal(false);
      setSelectedApptId('');
      setAmount(0);
      await fetchData();
    } catch (err: any) {
      alert("Lỗi khi tạo giao dịch thanh toán: " + (err.response?.data?.detail || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleApptSelect = (apptId: string) => {
    setSelectedApptId(apptId);
    const appt = appointments.find(a => a.id === apptId);
    if (appt) {
      setAmount(appt.total_price || 0);
    }
  };

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
    return (val || 0).toLocaleString('vi-VN') + ' ₫';
  };

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const appt = p.appointment || appointments.find(a => a.id === p.appointment_id);
      const custName = appt?.customer?.full_name?.toLowerCase() || '';
      const petName = appt?.pet?.name?.toLowerCase() || '';
      const pId = p.id.toLowerCase();
      const apptId = p.appointment_id.toLowerCase();
      const s = search.toLowerCase();

      const matchSearch = 
        custName.includes(s) || 
        petName.includes(s) || 
        pId.includes(s) || 
        apptId.includes(s) ||
        (appt?.services && appt.services.some(svc => svc.service.name.toLowerCase().includes(s)));

      const matchMethod = methodFilter === 'ALL' || p.payment_method === methodFilter;

      return matchSearch && matchMethod;
    });
  }, [payments, appointments, search, methodFilter]);

  const totalRevenue = useMemo(() => {
    return payments.reduce((sum, p) => sum + (p.amount || 0), 0);
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
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Thu Ngân & Lịch Sử Giao Dịch</h1>
              <p className="text-sm text-gray-500">Tra cứu mã hóa đơn, mã đặt lịch, thông tin đầy đủ khách hàng & thú cưng</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-700">
              Tổng số giao dịch: <strong className="text-gray-900">{payments.length} hóa đơn</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full text-xs font-bold text-emerald-700">
              Tổng doanh thu: <strong className="text-emerald-800">{formatCurrency(totalRevenue)}</strong>
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedApptId('');
            setAmount(0);
            setShowModal(true);
          }}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm shadow-md hover:shadow-emerald-500/20 flex items-center gap-2 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Lập Phiếu Thu Tiền Mới</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm theo mã giao dịch, mã lịch hẹn, tên khách, thú cưng..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center p-1 bg-gray-100 rounded-2xl border border-gray-200/60 text-xs font-semibold">
              {['ALL', 'CASH', 'BANK_TRANSFER', 'MOMO', 'CREDIT_CARD'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMethodFilter(m)}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    methodFilter === m ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {m === 'ALL' ? 'Tất cả' : m === 'BANK_TRANSFER' ? 'VietQR' : m}
                </button>
              ))}
            </div>

            <button
              onClick={fetchData}
              title="Làm mới"
              className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 border-collapse">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-gray-500 border-b border-gray-100">
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
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    <Receipt className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-semibold text-gray-600">Không tìm thấy giao dịch nào phù hợp</p>
                    <p className="text-xs text-gray-400">Thử tìm kiếm với từ khóa khác hoặc nhấn Lập phiếu thu tiền mới.</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const appt = p.appointment || appointments.find(a => a.id === p.appointment_id);
                  const custName = appt?.customer?.full_name || 'Khách hàng PetCare';
                  const petName = appt?.pet?.name || 'Thú cưng';
                  const fullPaymentCode = `PAY-${p.id.replace(/-/g, '').substring(0, 10).toUpperCase()}`;
                  const fullApptCode = `APPT-${p.appointment_id.replace(/-/g, '').substring(0, 8).toUpperCase()}`;

                  return (
                    <tr key={p.id} className="hover:bg-emerald-50/20 transition group">
                      {/* 1. Mã Giao Dịch & Ngày Giờ */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-gray-900">
                            <span>#{fullPaymentCode}</span>
                            <button
                              onClick={() => copyToClipboard(fullPaymentCode, p.id)}
                              title="Sao chép mã giao dịch"
                              className="text-gray-400 hover:text-emerald-600 p-0.5 rounded transition"
                            >
                              {copiedId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                            <span>{formatDateTime(p.created_at)}</span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Mã Đặt Lịch Hẹn */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 block w-fit">
                            #{fullApptCode}
                          </span>
                          <div className="text-[11px] text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span>Hẹn: {formatDateTime(appt?.scheduled_time)}</span>
                          </div>
                        </div>
                      </td>

                      {/* 3. Tên Đầy Đủ Khách Hàng */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {custName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block text-sm group-hover:text-emerald-700 transition">
                              {custName}
                            </span>
                            <span className="text-xs text-gray-400">
                              {appt?.customer?.email || '—'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 4. Thú Cưng & Dịch Vụ */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-gray-800 text-xs">
                            <PawPrint className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span>{petName}</span>
                            {appt?.pet?.breed && (
                              <span className="text-[11px] font-normal text-gray-500">
                                ({appt.pet.species === 'DOG' ? 'Chó' : 'Mèo'} {appt.pet.breed})
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {appt?.services && appt.services.length > 0 
                              ? appt.services.map(s => s.service.name).join(', ')
                              : 'Chăm sóc & Khám thú y tổng quát'}
                          </p>
                        </div>
                      </td>

                      {/* 5. Hình Thức & Số Tiền */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="font-black text-emerald-700 text-sm">
                            {formatCurrency(p.amount)}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                              {p.payment_method === 'BANK_TRANSFER' ? 'VietQR Ngân hàng' : p.payment_method === 'CASH' ? 'Tiền mặt' : p.payment_method}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Đã thu
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 6. Thao Tác (Xem Chi Tiết Lại) */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedPayment({
                              ...p,
                              appointment: appt
                            });
                            setShowDetailModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 transition shadow-xs"
                          title="Xem chi tiết hóa đơn & in biên lai"
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

      {/* MODAL CHI TIẾT HÓA ĐƠN & BIÊN LAI */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowDetailModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt Header */}
            <div className="text-center pb-6 border-b border-gray-100">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Receipt className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-gray-900">PHIẾU THU TIỀN DỊCH VỤ</h2>
              <p className="text-xs text-gray-500 mt-0.5">Bệnh viện & Khách sạn Thú cưng PetCare AI</p>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-3 font-mono text-xs">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg font-bold">
                  Mã giao dịch: #{`PAY-${selectedPayment.id.replace(/-/g, '').substring(0, 10).toUpperCase()}`}
                </span>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg font-bold">
                  Mã đặt lịch: #{`APPT-${selectedPayment.appointment_id.replace(/-/g, '').substring(0, 8).toUpperCase()}`}
                </span>
              </div>
            </div>

            {/* Information Grid */}
            <div className="py-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-gray-400 block mb-0.5">Thời gian thanh toán:</span>
                  <span className="font-bold text-gray-900">{formatDateTime(selectedPayment.created_at)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Hình thức thanh toán:</span>
                  <span className="font-bold text-emerald-700">
                    {selectedPayment.payment_method === 'BANK_TRANSFER' ? 'Chuyển khoản VietQR' : selectedPayment.payment_method === 'CASH' ? 'Tiền mặt' : selectedPayment.payment_method}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Khách hàng (Tên đầy đủ):</span>
                  <span className="font-bold text-gray-900">
                    {selectedPayment.appointment?.customer?.full_name || 'Khách hàng vãng lai'}
                  </span>
                  <span className="block text-gray-400 text-[11px]">{selectedPayment.appointment?.customer?.email || ''}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Bệnh nhân thú cưng:</span>
                  <span className="font-bold text-purple-700 flex items-center gap-1">
                    <PawPrint className="w-3.5 h-3.5" />
                    {selectedPayment.appointment?.pet?.name || 'Thú cưng'}
                  </span>
                  <span className="block text-gray-400 text-[11px]">
                    {selectedPayment.appointment?.pet?.species === 'DOG' ? 'Chó' : 'Mèo'} • {selectedPayment.appointment?.pet?.breed || 'Chưa rõ giống'}
                  </span>
                </div>
              </div>

              {/* Service Breakdown */}
              <div>
                <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[11px] mb-2">
                  Danh mục dịch vụ thực hiện
                </h4>
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-gray-500 font-bold border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-2.5">Dịch vụ</th>
                        <th className="px-4 py-2.5 text-right">Đơn giá</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedPayment.appointment?.services && selectedPayment.appointment.services.length > 0 ? (
                        selectedPayment.appointment.services.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2.5 font-medium text-gray-800">
                              {item.service.name}
                            </td>
                            <td className="px-4 py-2.5 text-right font-semibold text-gray-900">
                              {formatCurrency(item.price_at_booking)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-gray-800">
                            Chăm sóc & Thăm khám toàn diện
                          </td>
                          <td className="px-4 py-2.5 text-right font-semibold text-gray-900">
                            {formatCurrency(selectedPayment.amount)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-emerald-50/50 font-bold text-gray-900 border-t border-gray-100">
                      <tr>
                        <td className="px-4 py-3 text-sm">TỔNG CỘNG THANH TOÁN</td>
                        <td className="px-4 py-3 text-right text-base text-emerald-700 font-black">
                          {formatCurrency(selectedPayment.amount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Receipt Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
              {selectedPayment.appointment?.pet?.id ? (
                <Link
                  href={`/customer/pets/${selectedPayment.appointment.pet.id}/passport`}
                  target="_blank"
                  className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <PawPrint className="w-3.5 h-3.5" />
                  <span>Xem Sổ y bạ (Passport)</span>
                </Link>
              ) : <div></div>}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In phiếu thu</span>
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
        </div>
      )}

      {/* MODAL THU TIỀN MỚI */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Lập phiếu thu tiền lịch hẹn</h3>
                <p className="text-xs text-gray-500">Xác nhận thanh toán cho khách hàng tại quầy</p>
              </div>
            </div>

            <form onSubmit={handleCreatePayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Chọn lịch hẹn cần thanh toán *
                </label>
                <select
                  value={selectedApptId}
                  onChange={(e) => handleApptSelect(e.target.value)}
                  className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium"
                  required
                >
                  <option value="">-- Chọn lịch hẹn có đầy đủ tên khách, thú cưng, ngày hẹn --</option>
                  {appointments.map((a) => {
                    const cust = a.customer?.full_name || 'Khách';
                    const pet = a.pet?.name || 'Bé';
                    const date = formatDateTime(a.scheduled_time);
                    const apptCode = `APPT-${a.id.replace(/-/g, '').substring(0, 8).toUpperCase()}`;
                    return (
                      <option key={a.id} value={a.id}>
                        #{apptCode} • Khách: {cust} • Thú cưng: {pet} • Ngày: {date} ({formatCurrency(a.total_price || 0)})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Số tiền thanh toán (VNĐ) *
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full text-sm font-bold text-emerald-700 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  required
                  min="1000"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Hình thức thanh toán *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium"
                >
                  <option value="CASH">Tiền mặt (CASH)</option>
                  <option value="BANK_TRANSFER">Chuyển khoản QR ngân hàng (VietQR)</option>
                  <option value="MOMO">Ví MoMo</option>
                  <option value="CREDIT_CARD">Thẻ POS</option>
                </select>
              </div>

              {paymentMethod === 'BANK_TRANSFER' && selectedApptId && amount > 0 && (
                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-emerald-900 mb-2">Quét mã VietQR thanh toán tại quầy</span>
                  <img
                    src={`https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=${amount}&addInfo=PETCARE%20${selectedApptId.replace(/-/g, '').substring(0, 8).toUpperCase()}&accountName=PETCARE%20HOSPITAL`}
                    alt="VietQR Napas247"
                    className="w-48 h-auto rounded-xl shadow-xs border border-white bg-white p-1"
                  />
                  <div className="mt-2 text-[11px] text-gray-600 font-mono">
                    <p>Ngân hàng: <b>MBBank (0987654321)</b></p>
                    <p>Nội dung: <b>PETCARE {selectedApptId.replace(/-/g, '').substring(0, 8).toUpperCase()}</b></p>
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-gray-700 font-bold rounded-xl transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : 'Xác nhận thu tiền'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
