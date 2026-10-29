'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, DollarSign, Activity, Calendar, PawPrint, 
  ArrowUpRight, ShieldCheck, ClipboardList, Sparkles, RefreshCw 
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    totalPets: 0,
    activeStaff: 0
  });
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, usersRes, apptsRes, petsRes] = await Promise.all([
        api.get('/api/v1/payments').catch(() => ({ data: [] })),
        api.get('/api/v1/users').catch(() => ({ data: [] })),
        api.get('/api/v1/appointments').catch(() => ({ data: [] })),
        api.get('/api/v1/pets').catch(() => ({ data: [] }))
      ]);

      const payments = paymentsRes.data || [];
      const users = usersRes.data || [];
      const appts = apptsRes.data || [];
      const pets = petsRes.data || [];

      const totalRev = payments
        .filter((p: any) => p.status === 'PAID')
        .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

      const staffCount = users.filter((u: any) => 
        u.roles?.some((r: any) => ['CAREGIVER', 'VETERINARIAN', 'RECEPTIONIST', 'ADMIN'].includes(r.name))
      ).length;

      setStats({
        totalRevenue: totalRev,
        totalUsers: users.length,
        totalAppointments: appts.length,
        pendingAppointments: appts.filter((a: any) => a.status === 'PENDING').length,
        totalPets: pets.length,
        activeStaff: staffCount
      });

      setRecentAppointments(appts.slice(0, 5));
    } catch (err) {
      console.error("Lỗi tải dữ liệu dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchDashboardData();
  }, [authLoading]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tổng quan Hệ thống Quản trị</h1>
          <p className="text-sm text-gray-500 mt-1">Số liệu thời gian thực từ cơ sở dữ liệu và các phân hệ</p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="p-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition shadow-xs flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4 text-primary" />
          Làm mới
        </button>
      </div>
      
      {/* 4 Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="rounded-3xl border-gray-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase text-gray-500">Tổng doanh thu thực</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-gray-900">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> Giao dịch đã thu tiền
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-gray-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase text-gray-500">Người dùng & Khách hàng</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-gray-900">{stats.totalUsers}</div>
            <p className="text-xs text-gray-400 mt-1">Bao gồm {stats.activeStaff} nhân sự</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-gray-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase text-gray-500">Lịch hẹn dịch vụ</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-gray-900">{stats.totalAppointments}</div>
            <p className="text-xs text-amber-600 font-medium mt-1">
              {stats.pendingAppointments} ca đang chờ duyệt
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-gray-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase text-gray-500">Thú cưng định danh</CardTitle>
            <PawPrint className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-gray-900">{stats.totalPets}</div>
            <p className="text-xs text-purple-600 font-medium mt-1">Có mã hồ sơ Digital Passport</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/admin/users"
          className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-primary/50 shadow-xs flex items-center gap-3 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Quản lý Tài khoản</p>
            <p className="text-[11px] text-gray-400">Khách & Nhân viên</p>
          </div>
        </Link>

        <Link
          href="/admin/services"
          className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-primary/50 shadow-xs flex items-center gap-3 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Bảng giá Dịch vụ</p>
            <p className="text-[11px] text-gray-400">Biểu phí & Thời lượng</p>
          </div>
        </Link>

        <Link
          href="/admin/appointments"
          className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-primary/50 shadow-xs flex items-center gap-3 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Điều phối Lịch hẹn</p>
            <p className="text-[11px] text-gray-400">Phân công Caregiver</p>
          </div>
        </Link>

        <Link
          href="/admin/ai"
          className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-primary/50 shadow-xs flex items-center gap-3 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Điều khiển AI</p>
            <p className="text-[11px] text-gray-400">LLM & OCR Engine</p>
          </div>
        </Link>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Lịch hẹn Gần nhất trên Hệ thống
          </h2>
          <Link href="/admin/appointments" className="text-xs font-semibold text-primary hover:underline">
            Xem toàn bộ &rarr;
          </Link>
        </div>

        {recentAppointments.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">Chưa có lịch hẹn nào</p>
        ) : (
          <div className="divide-y divide-gray-100 text-sm">
            {recentAppointments.map((appt) => (
              <div key={appt.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {appt.services?.map((s: any) => s.name).join(', ') || 'Chăm sóc thú cưng'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(appt.scheduled_time).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    appt.status === 'COMPLETED'
                      ? 'bg-emerald-50 text-emerald-700'
                      : appt.status === 'IN_PROGRESS'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-blue-50 text-blue-700'
                  }`}>
                    {appt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
