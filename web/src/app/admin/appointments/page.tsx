'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, Search, Filter, Clock, User, 
  CheckCircle2, XCircle, AlertCircle, RefreshCw, UserCheck, ExternalLink 
} from 'lucide-react';
import Link from 'next/link';

export default function AdminAppointmentsPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [caregivers, setCaregivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Assign modal
  const [selectedAppt, setSelectedAppt] = useState<any | null>(null);
  const [selectedCaregiverId, setSelectedCaregiverId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const [apptsRes, usersRes] = await Promise.all([
        api.get('/api/v1/appointments'),
        api.get('/api/v1/users?role=CAREGIVER').catch(() => ({ data: [] }))
      ]);
      setAppointments(apptsRes.data || []);
      setCaregivers(usersRes.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách lịch hẹn:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchAppointments();
  }, [authLoading]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/api/v1/appointments/${id}/status`, { status: newStatus });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
    }
  };

  const handleAssignCaregiver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt || !selectedCaregiverId) return;
    try {
      setAssigning(true);
      await api.patch(`/api/v1/appointments/${selectedAppt.id}/assign`, null, {
        params: { caregiver_id: selectedCaregiverId }
      });
      setSelectedAppt(null);
      await fetchAppointments();
    } catch (err) {
      console.error("Lỗi phân công caregiver:", err);
    } finally {
      setAssigning(false);
    }
  };

  const filteredAppointments = appointments.filter(a => {
    const matchSearch = (a.notes || '').toLowerCase().includes(search.toLowerCase()) ||
                        (a.id || '').toLowerCase().includes(search.toLowerCase());
    if (statusFilter === 'ALL') return matchSearch;
    return matchSearch && a.status === statusFilter;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý Lịch hẹn & Phân công</h1>
          <p className="text-sm text-gray-500 mt-1">Điều phối lịch đặt, phân bổ nhân sự chăm sóc và theo dõi tiến trình</p>
        </div>

        <button
          onClick={fetchAppointments}
          className="p-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition shadow-xs flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4 text-primary" />
          Làm mới
        </button>
      </div>

      {/* Status KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase">Tổng lịch</span>
          <p className="text-2xl font-black text-gray-900 mt-1">{appointments.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-amber-600 uppercase">Chờ tiếp nhận</span>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {appointments.filter(a => a.status === 'PENDING').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-blue-600 uppercase">Đang chăm sóc</span>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {appointments.filter(a => a.status === 'IN_PROGRESS').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-emerald-600 uppercase">Đã hoàn thành</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {appointments.filter(a => a.status === 'COMPLETED').length}
          </p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo ghi chú hoặc mã lịch hẹn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/80 text-xs uppercase font-bold text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Mã Đặt Lịch & Thời Gian</th>
                <th className="px-6 py-4">Khách Hàng (Tên Đầy Đủ)</th>
                <th className="px-6 py-4">Thú Cưng & Dịch Vụ</th>
                <th className="px-6 py-4">Nhân Sự Phụ Trách</th>
                <th className="px-6 py-4">Giá Trị & Trạng Thái</th>
                <th className="px-6 py-4 text-right">Điều Phối & Xử Lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    Không tìm thấy lịch hẹn phù hợp
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appt) => {
                  const custName = appt.customer?.full_name || 'Khách hàng PetCare';
                  const petName = appt.pet?.name || 'Thú cưng';
                  const apptCode = `APPT-${appt.id.replace(/-/g, '').substring(0, 8).toUpperCase()}`;

                  return (
                    <tr key={appt.id} className="hover:bg-gray-50/60 transition">
                      {/* Mã & Thời gian */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 block w-fit">
                            #{apptCode}
                          </span>
                          <p className="text-xs text-gray-700 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            {new Date(appt.scheduled_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - Ngày {new Date(appt.scheduled_time).toLocaleDateString('vi-VN')}
                          </p>
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
                              {appt.customer?.email || '—'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Thú Cưng & Dịch Vụ */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-gray-800 text-xs">
                            <span className="text-purple-600">🐾 {petName}</span>
                            {appt.pet?.breed && (
                              <span className="text-[11px] font-normal text-gray-400">
                                ({appt.pet.species === 'DOG' ? 'Chó' : 'Mèo'} {appt.pet.breed})
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {appt.services && appt.services.length > 0 
                              ? appt.services.map((s: any) => s.service?.name || s.name).join(', ')
                              : 'Chăm sóc & Khám toàn diện'}
                          </p>
                        </div>
                      </td>

                      {/* Phụ trách */}
                      <td className="px-6 py-4">
                        {appt.caregiver_id ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                              C
                            </div>
                            <span className="text-xs font-bold text-gray-800">
                              {caregivers.find(c => c.id === appt.caregiver_id)?.full_name || appt.caregiver?.full_name || 'Caregiver'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            Chưa phân công
                          </span>
                        )}
                      </td>

                      {/* Giá trị & Trạng thái */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="font-bold text-gray-900 text-sm block">
                            {formatCurrency(appt.total_price)}
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block ${
                            appt.status === 'CONFIRMED'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : appt.status === 'IN_PROGRESS'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                              : appt.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : appt.status === 'CANCELLED'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {appt.status === 'PENDING' ? 'Chờ duyệt' : appt.status === 'CONFIRMED' ? 'Đã duyệt' : appt.status}
                          </span>
                        </div>
                      </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedAppt(appt);
                            setSelectedCaregiverId(appt.caregiver_id || '');
                          }}
                          className="px-2.5 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition"
                        >
                          Phân công
                        </button>
                        {appt.status === 'PENDING' && (
                          <button
                            onClick={() => handleUpdateStatus(appt.id, 'CONFIRMED')}
                            className="px-2.5 py-1.5 text-xs font-semibold bg-primary text-white hover:bg-primary/90 rounded-lg transition"
                          >
                            Duyệt
                          </button>
                        )}
                        {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleUpdateStatus(appt.id, 'CANCELLED')}
                            className="px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            Hủy
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
      </div>

      {/* Assign Modal */}
      {selectedAppt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Chỉ định Caregiver phụ trách</h2>
            <p className="text-xs text-gray-500 mb-4">Lịch hẹn #{selectedAppt.id.substring(0, 8)}</p>

            <form onSubmit={handleAssignCaregiver} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Chọn nhân sự Caregiver
                </label>
                <select
                  required
                  value={selectedCaregiverId}
                  onChange={e => setSelectedCaregiverId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                >
                  <option value="">-- Chọn nhân sự chăm sóc --</option>
                  {caregivers.map(cg => (
                    <option key={cg.id} value={cg.id}>
                      {cg.full_name || cg.email} ({cg.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedAppt(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={assigning || !selectedCaregiverId}
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-xl disabled:opacity-50"
                >
                  {assigning ? 'Đang lưu...' : 'Xác nhận phân công'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
