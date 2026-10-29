'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  UserCheck, UserPlus, Search, Shield, Stethoscope, 
  Heart, Sparkles, CheckCircle2, XCircle, Phone, Mail, Filter, RefreshCw
} from 'lucide-react';

export default function AdminStaffPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/users');
      // Filter only users having staff roles: ADMIN, RECEPTIONIST, CAREGIVER, VETERINARIAN
      const staffOnly = (res.data || []).filter((u: any) => {
        const roles = (u.roles || []).map((r: any) => r.name);
        return roles.some((r: string) => ['ADMIN', 'RECEPTIONIST', 'CAREGIVER', 'VETERINARIAN'].includes(r));
      });
      setStaffList(staffOnly);
    } catch (err) {
      console.error("Lỗi lấy danh sách nhân viên:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchStaff();
  }, [authLoading]);

  const handleToggleStatus = async (id: string) => {
    try {
      await api.patch(`/api/v1/users/${id}/toggle-status`);
      setStaffList(prev => prev.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s));
    } catch (err) {
      console.error("Lỗi đổi trạng thái nhân viên:", err);
    }
  };

  const filteredStaff = staffList.filter(s => {
    const matchSearch = (s.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
                        (s.email || '').toLowerCase().includes(search.toLowerCase());
    if (roleFilter === 'ALL') return matchSearch;
    const roles = (s.roles || []).map((r: any) => r.name);
    return matchSearch && roles.includes(roleFilter);
  });

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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Đội ngũ Nhân sự & Chuyên gia</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý Bác sĩ thú y, Người chăm sóc và Nhân viên lễ tân</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStaff}
            className="p-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition shadow-xs"
            title="Làm mới"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Tổng nhân sự</span>
            <UserCheck className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{staffList.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-600 uppercase">Bác sĩ</span>
            <Stethoscope className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">
            {staffList.filter(s => s.roles?.some((r: any) => r.name === 'VETERINARIAN')).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 uppercase">Caregivers</span>
            <Heart className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">
            {staffList.filter(s => s.roles?.some((r: any) => r.name === 'CAREGIVER')).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase">Lễ tân</span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">
            {staffList.filter(s => s.roles?.some((r: any) => r.name === 'RECEPTIONIST')).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email nhân sự..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'VETERINARIAN', 'CAREGIVER', 'RECEPTIONIST', 'ADMIN'].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                roleFilter === role
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {role === 'ALL' ? 'Tất cả' : role}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStaff.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-3xl border border-gray-200 text-gray-400">
            <UserCheck className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            Không có nhân sự nào phù hợp
          </div>
        ) : (
          filteredStaff.map(staff => {
            const roleNames = (staff.roles || []).map((r: any) => r.name);
            const isVet = roleNames.includes('VETERINARIAN');
            const isCaregiver = roleNames.includes('CAREGIVER');
            const isReceptionist = roleNames.includes('RECEPTIONIST');
            const isAdmin = roleNames.includes('ADMIN');

            return (
              <div key={staff.id} className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                        isVet 
                          ? 'bg-purple-100 text-purple-700' 
                          : isCaregiver 
                          ? 'bg-blue-100 text-blue-700' 
                          : isAdmin
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {(staff.full_name || staff.email).substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{staff.full_name || 'Chưa đặt tên'}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" /> {staff.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {roleNames.map((r: string) => (
                      <span
                        key={r}
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          r === 'ADMIN'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : r === 'VETERINARIAN'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : r === 'CAREGIVER'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                    staff.is_active ? 'text-emerald-700' : 'text-red-600'
                  }`}>
                    {staff.is_active ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Đang hoạt động
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-red-500" /> Đã tạm ngưng
                      </>
                    )}
                  </span>

                  <button
                    onClick={() => handleToggleStatus(staff.id)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition ${
                      staff.is_active
                        ? 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {staff.is_active ? 'Tạm ngưng' : 'Kích hoạt'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
