'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart3, TrendingUp, Calendar, DollarSign, 
  Users, CheckCircle2, Download, Printer, RefreshCw, Award 
} from 'lucide-react';

export default function AdminReportsPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [apptsRes, paysRes, usersRes] = await Promise.all([
        api.get('/api/v1/appointments').catch(() => ({ data: [] })),
        api.get('/api/v1/payments').catch(() => ({ data: [] })),
        api.get('/api/v1/users').catch(() => ({ data: [] }))
      ]);
      setAppointments(apptsRes.data || []);
      setPayments(paysRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error("Lỗi tải báo cáo:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchData();
  }, [authLoading]);

  const totalRevenue = payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const completedAppts = appointments.filter(a => a.status === 'COMPLETED').length;
  const completionRate = appointments.length > 0 
    ? Math.round((completedAppts / appointments.length) * 100) 
    : 100;

  const caregivers = users.filter(u => u.roles?.some((r: any) => r.name === 'CAREGIVER'));

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const handlePrint = () => {
    window.print();
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Báo cáo Hoạt động & Tài chính</h1>
          <p className="text-sm text-gray-500 mt-1">Tổng hợp số liệu kinh doanh, hiệu suất dịch vụ và năng suất nhân sự</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition shadow-xs"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-semibold transition shadow-xs"
          >
            <Printer className="w-4 h-4" />
            In báo cáo
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase">
            <span>Doanh thu thực thu</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-3">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">100% từ giao dịch hợp lệ</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase">
            <span>Tổng lượt phục vụ</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-3">{appointments.length}</p>
          <p className="text-xs text-blue-600 font-medium mt-1">{completedAppts} ca đã hoàn thành</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase">
            <span>Tỷ lệ hoàn thành</span>
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-3">{completionRate}%</p>
          <p className="text-xs text-gray-400 mt-1">Chỉ số cam kết dịch vụ</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase">
            <span>Khách hàng thành viên</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-3">
            {users.filter(u => u.roles?.some((r: any) => r.name === 'CUSTOMER')).length}
          </p>
          <p className="text-xs text-purple-600 font-medium mt-1">Đã kích hoạt tài khoản</p>
        </div>
      </div>

      {/* Detailed Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Caregiver Performance Table */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Năng suất Đội ngũ Caregiver
            </h2>
            <span className="text-xs text-gray-400 font-medium">{caregivers.length} nhân sự</span>
          </div>

          <div className="divide-y divide-gray-100">
            {caregivers.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">Chưa có thông tin nhân sự chăm sóc</p>
            ) : (
              caregivers.map((cg) => {
                const count = appointments.filter(a => a.caregiver_id === cg.id).length;
                return (
                  <div key={cg.id} className="py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        {(cg.full_name || cg.email).substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{cg.full_name || cg.email}</p>
                        <p className="text-xs text-gray-400">{cg.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{count} ca trực</p>
                      <p className="text-[11px] text-emerald-600 font-medium">Đang hoạt động</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Appointment Status Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Phân bố Trạng thái Đặt lịch
          </h2>

          <div className="space-y-4">
            {[
              { label: 'Hoàn thành (COMPLETED)', count: appointments.filter(a => a.status === 'COMPLETED').length, color: 'bg-emerald-500' },
              { label: 'Đang chăm sóc (IN_PROGRESS)', count: appointments.filter(a => a.status === 'IN_PROGRESS').length, color: 'bg-amber-500' },
              { label: 'Đã xác nhận (CONFIRMED)', count: appointments.filter(a => a.status === 'CONFIRMED').length, color: 'bg-blue-500' },
              { label: 'Chờ duyệt (PENDING)', count: appointments.filter(a => a.status === 'PENDING').length, color: 'bg-purple-500' },
              { label: 'Đã hủy (CANCELLED)', count: appointments.filter(a => a.status === 'CANCELLED').length, color: 'bg-red-400' }
            ].map(item => {
              const pct = appointments.length > 0 ? Math.round((item.count / appointments.length) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-700">
                    <span>{item.label}</span>
                    <span>{item.count} ca ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className={`${item.color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
