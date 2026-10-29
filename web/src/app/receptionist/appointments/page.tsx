'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, User, Clock, CheckCircle, ChevronRight, Stethoscope, 
  Search, PawPrint, Eye, Copy, Check, X, Plus, Filter, 
  RefreshCw, DollarSign, LayoutGrid, Table as TableIcon, ExternalLink,
  Phone, Mail, ArrowUpRight
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ServiceItem {
  service: {
    id: string;
    name: string;
    category: string;
    base_price: number;
    estimated_duration_minutes?: number;
  };
  price_at_booking: number;
}

interface Appointment {
  id: string;
  customer_id: string;
  pet_id: string;
  caregiver_id: string | null;
  scheduled_time: string;
  status: string;
  total_price: number;
  notes?: string;
  created_at?: string;
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
    sex?: string;
  };
  services?: ServiceItem[];
}

interface Caregiver {
  id: string;
  full_name: string;
  email: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('TABLE');

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [apptsRes, usersRes] = await Promise.all([
        api.get('/api/v1/appointments'),
        api.get('/api/v1/users?role=CAREGIVER')
      ]);
      setAppointments(apptsRes.data || []);
      setCaregivers(usersRes.data || []);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu lịch hẹn:", error);
      showToast("Không thể tải danh sách lịch hẹn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (appointmentId: string, caregiverId: string) => {
    try {
      await api.patch(`/api/v1/appointments/${appointmentId}/assign?caregiver_id=${caregiverId}`);
      setAssignModalOpen(null);
      showToast("Đã phân công nhân sự phụ trách thành công!");
      await fetchData();
      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        const updated = caregivers.find(c => c.id === caregiverId);
        setSelectedAppointment(prev => prev ? { ...prev, caregiver_id: caregiverId, caregiver: updated, status: 'CONFIRMED' } : null);
      }
    } catch (error) {
      alert("Lỗi khi phân công nhân sự");
    }
  };

  const handleCheckIn = async (appointmentId: string) => {
    try {
      await api.put(`/api/v1/appointments/${appointmentId}/status`, { status: "CHECKED_IN" });
      showToast("Khách hàng đã Check-in tại quầy thành công!");
      await fetchData();
      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment(prev => prev ? { ...prev, status: 'CHECKED_IN' } : null);
      }
    } catch (error) {
      alert("Lỗi khi xác nhận check-in");
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': 
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Chờ tiếp nhận</span>;
      case 'CONFIRMED': 
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Đã xác nhận</span>;
      case 'CHECKED_IN': 
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">Đã đến (Check-in)</span>;
      case 'IN_PROGRESS': 
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse">Đang chăm sóc</span>;
      case 'COMPLETED': 
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Hoàn thành</span>;
      case 'CANCELLED': 
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">Đã hủy</span>;
      default: 
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      const custName = a.customer?.full_name?.toLowerCase() || '';
      const petName = a.pet?.name?.toLowerCase() || '';
      const apptCode = `appt-${a.id.replace(/-/g, '').substring(0, 8)}`.toLowerCase();
      const s = search.toLowerCase();

      const matchSearch = 
        custName.includes(s) || 
        petName.includes(s) || 
        apptCode.includes(s) || 
        a.id.toLowerCase().includes(s) ||
        (a.services && a.services.some(svc => svc.service.name.toLowerCase().includes(s)));

      const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [appointments, search, statusFilter]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <Check className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Quản Lý Lịch Hẹn & Đón Tiếp</h1>
              <p className="text-sm text-gray-500">Mã đặt lịch, tên đầy đủ khách hàng, thú cưng, phân công nhân sự và check-in</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-700">
              Tổng lịch: <strong className="text-gray-900">{appointments.length}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full text-xs font-bold text-amber-700">
              Chờ tiếp nhận: <strong className="text-amber-800">{appointments.filter(a => a.status === 'PENDING').length}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 rounded-full text-xs font-bold text-purple-700">
              Đã Check-in: <strong className="text-purple-800">{appointments.filter(a => a.status === 'CHECKED_IN').length}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full text-xs font-bold text-emerald-700">
              Đã hoàn thành: <strong className="text-emerald-800">{appointments.filter(a => a.status === 'COMPLETED').length}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/receptionist/customers"
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm shadow-md hover:shadow-blue-500/20 flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Tạo Lịch Hẹn Cho Khách</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm theo mã lịch hẹn, tên khách, thú cưng, dịch vụ..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
            {/* Status Filter Tabs */}
            <div className="flex items-center p-1 bg-gray-100 rounded-2xl border border-gray-200/60 text-xs font-semibold overflow-x-auto max-w-full">
              {['ALL', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                    statusFilter === st ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {st === 'ALL' ? 'Tất cả' : st === 'PENDING' ? 'Chờ duyệt' : st === 'CONFIRMED' ? 'Đã duyệt' : st === 'CHECKED_IN' ? 'Check-in' : st === 'IN_PROGRESS' ? 'Đang làm' : 'Hoàn thành'}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-gray-100 rounded-2xl border border-gray-200/60 text-xs">
              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded-xl transition ${viewMode === 'TABLE' ? 'bg-white text-blue-700 shadow-xs' : 'text-gray-500'}`}
                title="Dạng bảng chi tiết"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('CARDS')}
                className={`p-1.5 rounded-xl transition ${viewMode === 'CARDS' ? 'bg-white text-blue-700 shadow-xs' : 'text-gray-500'}`}
                title="Dạng thẻ lưới"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
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

        {/* View Mode: TABLE */}
        {viewMode === 'TABLE' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 border-collapse">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Mã Đặt Lịch & Giờ Hẹn</th>
                  <th className="px-6 py-4">Khách Hàng (Tên Đầy Đủ)</th>
                  <th className="px-6 py-4">Thú Cưng & Dịch Vụ</th>
                  <th className="px-6 py-4">Nhân Sự Phụ Trách</th>
                  <th className="px-6 py-4">Tổng Tiền & Trạng Thái</th>
                  <th className="px-6 py-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                      <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm font-semibold text-gray-600">Không tìm thấy lịch hẹn nào</p>
                      <p className="text-xs text-gray-400">Thử tìm kiếm với từ khóa khác hoặc lọc theo trạng thái khác.</p>
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appt) => {
                    const custName = appt.customer?.full_name || 'Khách hàng PetCare';
                    const petName = appt.pet?.name || 'Thú cưng';
                    const fullApptCode = `APPT-${appt.id.replace(/-/g, '').substring(0, 8).toUpperCase()}`;

                    return (
                      <tr key={appt.id} className="hover:bg-blue-50/20 transition group">
                        {/* 1. Mã Đặt Lịch & Giờ Hẹn */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-gray-900">
                              <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                                #{fullApptCode}
                              </span>
                              <button
                                onClick={() => copyToClipboard(fullApptCode, appt.id)}
                                title="Sao chép mã đặt lịch"
                                className="text-gray-400 hover:text-blue-600 p-0.5 rounded transition"
                              >
                                {copiedId === appt.id ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-700 font-semibold">
                              <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{formatDateTime(appt.scheduled_time)}</span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Khách Hàng (Tên Đầy Đủ) */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {custName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 block text-sm group-hover:text-blue-700 transition">
                                {custName}
                              </span>
                              <span className="text-xs text-gray-400">
                                {appt.customer?.email || '—'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 3. Thú Cưng & Dịch Vụ */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-gray-800 text-xs">
                              <PawPrint className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                              <span>{petName}</span>
                              {appt.pet?.breed && (
                                <span className="text-[11px] font-normal text-gray-500">
                                  ({appt.pet.species === 'DOG' ? 'Chó' : 'Mèo'} {appt.pet.breed})
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {appt.services && appt.services.length > 0
                                ? appt.services.map(s => s.service.name).join(', ')
                                : 'Chăm sóc & Thăm khám'}
                            </p>
                          </div>
                        </td>

                        {/* 4. Nhân Sự Phụ Trách */}
                        <td className="px-6 py-4">
                          {appt.caregiver ? (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                                <Stethoscope className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <span className="font-bold text-gray-800 text-xs block">
                                  {appt.caregiver.full_name}
                                </span>
                                <span className="text-[10px] text-gray-400">Caregiver</span>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setAssignModalOpen(appt.id)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-xl transition"
                            >
                              <span>Chưa phân công</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </td>

                        {/* 5. Tổng Tiền & Trạng Thái */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className="font-black text-gray-900 text-sm block">
                              {formatCurrency(appt.total_price)}
                            </span>
                            <div>{getStatusBadge(appt.status)}</div>
                          </div>
                        </td>

                        {/* 6. Thao Tác */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Nút Xem chi tiết lại */}
                            <button
                              onClick={() => {
                                setSelectedAppointment(appt);
                                setDetailModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 transition shadow-xs"
                              title="Xem chi tiết lịch hẹn & thông tin đầy đủ"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Chi tiết</span>
                            </button>

                            {/* Nút Check-in nếu khách đến */}
                            {(appt.status === 'CONFIRMED' || appt.status === 'PENDING') && (
                              <button
                                onClick={() => handleCheckIn(appt.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-white transition shadow-xs"
                                title="Xác nhận khách đã đến sảnh"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Check-in</span>
                              </button>
                            )}

                            {/* Nút Phân công nếu chưa có */}
                            {!appt.caregiver_id && (
                              <button
                                onClick={() => setAssignModalOpen(appt.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-xs"
                                title="Chọn nhân viên phụ trách"
                              >
                                <span>Phân công</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* View Mode: CARDS */
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAppointments.map((appt) => {
              const custName = appt.customer?.full_name || 'Khách hàng';
              const petName = appt.pet?.name || 'Thú cưng';
              const fullApptCode = `APPT-${appt.id.replace(/-/g, '').substring(0, 8).toUpperCase()}`;

              return (
                <div key={appt.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:shadow-md transition space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                        #{fullApptCode}
                      </span>
                      <h4 className="font-black text-gray-900 text-base mt-2 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-blue-600" />
                        {formatDateTime(appt.scheduled_time)}
                      </h4>
                    </div>
                    <div>{getStatusBadge(appt.status)}</div>
                  </div>

                  <div className="space-y-2 text-xs py-2 border-y border-gray-100">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <strong className="text-gray-900">{custName}</strong>
                        <span className="text-gray-400 block text-[11px]">{appt.customer?.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <PawPrint className="w-4 h-4 text-purple-600" />
                      <div>
                        <strong className="text-gray-900">{petName}</strong>
                        <span className="text-gray-400 block text-[11px]">
                          {appt.pet?.species === 'DOG' ? 'Chó' : 'Mèo'} • {appt.pet?.breed || 'Chưa rõ giống'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-indigo-600" />
                      <div>
                        <span className="text-gray-500">Phụ trách: </span>
                        <strong className="text-gray-900">
                          {appt.caregiver?.full_name || 'Chưa phân công'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[11px] text-gray-400 block">Tổng tiền</span>
                      <strong className="text-emerald-700 font-black text-sm">{formatCurrency(appt.total_price)}</strong>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedAppointment(appt);
                          setDetailModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 transition"
                      >
                        Chi tiết
                      </button>
                      {(appt.status === 'CONFIRMED' || appt.status === 'PENDING') && (
                        <button
                          onClick={() => handleCheckIn(appt.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition"
                        >
                          Check-in
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL CHI TIẾT LỊCH HẸN ĐẦY ĐỦ */}
      {detailModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setDetailModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                    #APPT-{selectedAppointment.id.replace(/-/g, '').substring(0, 8).toUpperCase()}
                  </span>
                  {getStatusBadge(selectedAppointment.status)}
                </div>
                <h3 className="text-lg font-black text-gray-900 mt-1">Chi Tiết Lịch Hẹn Chăm Sóc</h3>
              </div>
            </div>

            {/* Content Details */}
            <div className="py-5 space-y-4 text-xs">
              {/* Date & Time */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-gray-400 block mb-0.5">Ngày & Giờ Hẹn Khám:</span>
                  <span className="text-sm font-black text-blue-700">
                    {formatDateTime(selectedAppointment.scheduled_time)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Tổng giá trị:</span>
                  <span className="text-sm font-black text-emerald-700">
                    {formatCurrency(selectedAppointment.total_price)}
                  </span>
                </div>
              </div>

              {/* Customer & Pet Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-gray-100 bg-white">
                  <span className="text-gray-400 block mb-1 uppercase font-bold text-[10px]">Khách hàng</span>
                  <strong className="text-gray-900 block text-sm">
                    {selectedAppointment.customer?.full_name || 'Khách hàng PetCare'}
                  </strong>
                  <span className="text-gray-500 block mt-1">{selectedAppointment.customer?.email}</span>
                </div>

                <div className="p-4 rounded-2xl border border-gray-100 bg-white">
                  <span className="text-gray-400 block mb-1 uppercase font-bold text-[10px]">Bệnh nhân Thú cưng</span>
                  <strong className="text-purple-700 block text-sm flex items-center gap-1">
                    <PawPrint className="w-3.5 h-3.5" />
                    {selectedAppointment.pet?.name || 'Thú cưng'}
                  </strong>
                  <span className="text-gray-500 block mt-1">
                    {selectedAppointment.pet?.species === 'DOG' ? 'Chó' : 'Mèo'} • {selectedAppointment.pet?.breed || 'Chưa rõ giống'}
                  </span>
                </div>
              </div>

              {/* Services List */}
              <div>
                <span className="text-gray-500 uppercase font-bold text-[10px] block mb-2">Dịch vụ đã đăng ký</span>
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-gray-500 font-bold border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-2">Dịch vụ</th>
                        <th className="px-4 py-2 text-right">Đơn giá</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedAppointment.services && selectedAppointment.services.length > 0 ? (
                        selectedAppointment.services.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2.5 font-medium text-gray-800">{item.service.name}</td>
                            <td className="px-4 py-2.5 text-right font-semibold text-gray-900">{formatCurrency(item.price_at_booking)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-gray-800">Chăm sóc & Khám lâm sàng</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-gray-900">{formatCurrency(selectedAppointment.total_price)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Caregiver Assigned */}
              <div className="p-4 rounded-2xl border border-gray-100 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <span className="text-gray-400 block text-[11px]">Người phụ trách / Caregiver:</span>
                  <strong className="text-gray-900 text-sm">
                    {selectedAppointment.caregiver?.full_name || 'Chưa có nhân viên phụ trách'}
                  </strong>
                </div>
                <button
                  onClick={() => setAssignModalOpen(selectedAppointment.id)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition"
                >
                  {selectedAppointment.caregiver_id ? 'Đổi người phụ trách' : 'Chỉ định ngay'}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              {selectedAppointment.pet?.id && (
                <Link
                  href={`/customer/pets/${selectedAppointment.pet.id}/passport`}
                  target="_blank"
                  className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <PawPrint className="w-3.5 h-3.5" />
                  <span>Sổ y bạ (Passport) ↗</span>
                </Link>
              )}

              <div className="flex items-center gap-2">
                {(selectedAppointment.status === 'CONFIRMED' || selectedAppointment.status === 'PENDING') && (
                  <button
                    onClick={() => handleCheckIn(selectedAppointment.id)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition"
                  >
                    Xác nhận Check-in
                  </button>
                )}
                <Link
                  href="/receptionist/payments"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition"
                >
                  Thu tiền lịch hẹn
                </Link>
                <button
                  type="button"
                  onClick={() => setDetailModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PHÂN CÔNG CAREGIVER */}
      {assignModalOpen && (
        <Dialog open={!!assignModalOpen} onOpenChange={() => setAssignModalOpen(null)}>
          <DialogContent className="bg-white rounded-3xl border-gray-100 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Chọn Bác sĩ / Người chăm sóc</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-2">
              {caregivers.map(c => (
                <div 
                  key={c.id} 
                  className="flex justify-between items-center p-4 bg-slate-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 rounded-2xl cursor-pointer transition-all group" 
                  onClick={() => handleAssign(assignModalOpen, c.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                      {c.full_name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 block text-sm">{c.full_name}</span>
                      <span className="text-xs text-gray-400">{c.email}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
