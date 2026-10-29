'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { 
  User, Mail, Search, Plus, PawPrint, Calendar, ExternalLink, 
  ShieldCheck, ShieldAlert, RefreshCw, Eye, Edit3, X, 
  UserPlus, Check, AlertCircle, Phone, ArrowUpRight, Lock, Unlock
} from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  avatar?: string;
  sex?: string;
  owner_id?: string;
}

interface Customer {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  pets?: Pet[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '' });
  const [editFormData, setEditFormData] = useState({ full_name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, petsRes] = await Promise.all([
        api.get('/api/v1/users?role=CUSTOMER'),
        api.get('/api/v1/pets').catch(() => ({ data: [] }))
      ]);

      const petList: Pet[] = petsRes.data || [];
      setPets(petList);

      const customerList: Customer[] = (usersRes.data || []).map((u: any) => ({
        ...u,
        pets: petList.filter(p => p.owner_id === u.id)
      }));

      setCustomers(customerList);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu khách hàng:", error);
      showToast("Không thể tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Add Customer
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      setSubmitting(true);
      await api.post('/api/v1/users', {
        ...formData,
        role: 'CUSTOMER'
      });
      setShowAddModal(false);
      setFormData({ full_name: '', email: '', password: '' });
      showToast('Đăng ký khách hàng mới thành công!');
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Không thể tạo tài khoản khách hàng");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Customer
  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setErrorMsg('');
    try {
      setSubmitting(true);
      const payload: any = {
        full_name: editFormData.full_name,
        email: editFormData.email
      };
      if (editFormData.password.trim()) {
        payload.password = editFormData.password.trim();
      }
      await api.put(`/api/v1/users/${selectedCustomer.id}`, payload);
      setShowEditModal(false);
      showToast('Cập nhật thông tin khách hàng thành công!');
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Không thể cập nhật tài khoản khách hàng");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle active status
  const handleToggleStatus = async (customerId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/api/v1/users/${customerId}/toggle-status`);
      showToast(currentStatus ? 'Đã khóa tài khoản khách hàng' : 'Đã mở khóa tài khoản khách hàng');
      await fetchData();
    } catch (err) {
      console.error("Lỗi đổi trạng thái:", err);
      showToast("Không thể thay đổi trạng thái tài khoản");
    }
  };

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchSearch = 
        c.full_name.toLowerCase().includes(search.toLowerCase()) || 
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.pets && c.pets.some(p => p.name.toLowerCase().includes(search.toLowerCase())));
      
      const matchStatus = 
        statusFilter === 'ALL' ? true :
        statusFilter === 'ACTIVE' ? c.is_active :
        !c.is_active;

      return matchSearch && matchStatus;
    });
  }, [customers, search, statusFilter]);

  const totalPets = useMemo(() => {
    return customers.reduce((acc, c) => acc + (c.pets?.length || 0), 0);
  }, [customers]);

  const activeCount = useMemo(() => {
    return customers.filter(c => c.is_active).length;
  }, [customers]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <Check className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Main Header with Actions */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Hồ Sơ Khách Hàng</h1>
              <p className="text-sm text-gray-500">Quản lý tài khoản khách, danh sách thú cưng và sổ y bạ số (Pet Passport)</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-700">
              Tổng số khách: <strong className="text-gray-900">{customers.length}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full text-xs font-bold text-emerald-700">
              Đang hoạt động: <strong className="text-emerald-800">{activeCount}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 rounded-full text-xs font-bold text-purple-700">
              Thú cưng sở hữu: <strong className="text-purple-800">{totalPets}</strong>
            </span>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setFormData({ full_name: '', email: '', password: '' });
              setErrorMsg('');
              setShowAddModal(true);
            }}
            className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-sm shadow-md hover:shadow-purple-500/30 flex items-center gap-2 transition duration-200"
            id="btn-add-customer-main"
          >
            <Plus className="w-5 h-5" />
            <span>Thêm Khách Hàng Mới</span>
          </button>
        </div>
      </div>

      {/* Table & Filter Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search, Filter & Quick Action Bar */}
        <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm theo tên khách, email, hoặc tên thú cưng..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
            {/* Status Filter Tabs */}
            <div className="flex items-center p-1 bg-gray-100 rounded-2xl border border-gray-200/60 text-xs font-semibold">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  statusFilter === 'ALL' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Tất cả ({customers.length})
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  statusFilter === 'ACTIVE' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Hoạt động ({activeCount})
              </button>
              <button
                onClick={() => setStatusFilter('BLOCKED')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  statusFilter === 'BLOCKED' ? 'bg-white text-rose-700 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Bị khóa ({customers.length - activeCount})
              </button>
            </div>

            {/* Quick Refresh Button */}
            <button
              onClick={fetchData}
              title="Tải lại danh sách"
              className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-600' : ''}`} />
            </button>

            {/* Secondary Add Button for easy reach */}
            <button
              onClick={() => {
                setFormData({ full_name: '', email: '', password: '' });
                setErrorMsg('');
                setShowAddModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Đăng ký khách</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50 text-gray-500 font-bold uppercase tracking-wider text-xs border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Thú cưng & Sổ y bạ (Passport)</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      <span className="text-xs text-gray-500 font-medium">Đang tải danh sách khách hàng...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <User className="w-10 h-10 text-gray-300" />
                      <p className="text-sm font-semibold text-gray-600">Không tìm thấy khách hàng nào phù hợp</p>
                      <p className="text-xs text-gray-400">Thử tìm kiếm với từ khóa khác hoặc nhấn Đăng ký khách mới.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const customerPets = c.pets || [];
                  return (
                    <tr key={c.id} className="hover:bg-purple-50/30 transition-colors group">
                      {/* Customer Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                            {c.full_name ? c.full_name.charAt(0).toUpperCase() : 'K'}
                          </div>
                          <div>
                            <button
                              onClick={() => {
                                setSelectedCustomer(c);
                                setShowDetailModal(true);
                              }}
                              className="font-bold text-gray-900 text-sm hover:text-purple-600 transition text-left block"
                              title="Xem chi tiết khách hàng này"
                            >
                              {c.full_name}
                            </button>
                            <span className="text-[11px] font-mono text-gray-400">
                              ID: {c.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4">
                        <a 
                          href={`mailto:${c.email}`} 
                          className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition text-xs font-medium"
                          title="Gửi email cho khách hàng"
                        >
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span>{c.email}</span>
                        </a>
                      </td>

                      {/* Pets & Passport Links */}
                      <td className="px-6 py-4">
                        {customerPets.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-2">
                            {customerPets.map((p) => (
                              <Link
                                key={p.id}
                                href={`/customer/pets/${p.id}/passport`}
                                target="_blank"
                                title={`Mở Sổ y bạ (Passport) của bé ${p.name}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border border-purple-200 hover:border-purple-600 rounded-xl text-xs font-bold transition shadow-xs group/btn"
                              >
                                <PawPrint className="w-3.5 h-3.5 text-purple-500 group-hover/btn:text-white" />
                                <span>{p.name}</span>
                                <ExternalLink className="w-3 h-3 opacity-60 group-hover/btn:opacity-100" />
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 italic">Chưa liên kết thú cưng</span>
                            <Link
                              href="/receptionist/pets"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 hover:underline"
                            >
                              <PawPrint className="w-3 h-3" /> Tra cứu
                            </Link>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full border ${
                          c.is_active 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {c.is_active ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Hoạt động
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              Bị khóa
                            </>
                          )}
                        </span>
                      </td>

                      {/* Action Buttons Column */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Button: Xem chi tiết / Sổ y bạ */}
                          <button
                            onClick={() => {
                              setSelectedCustomer(c);
                              setShowDetailModal(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 shadow-xs transition"
                            title="Xem chi tiết hồ sơ & thú cưng"
                          >
                            <PawPrint className="w-3.5 h-3.5" />
                            <span>Hồ sơ ({customerPets.length})</span>
                          </button>

                          {/* Button: Đặt lịch hẹn */}
                          <Link
                            href={`/receptionist/appointments?customer_id=${c.id}&customer_name=${encodeURIComponent(c.full_name)}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-xs transition"
                            title="Tạo lịch hẹn dịch vụ cho khách này"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Đặt lịch</span>
                          </Link>

                          {/* Button: Sửa thông tin */}
                          <button
                            onClick={() => {
                              setSelectedCustomer(c);
                              setEditFormData({
                                full_name: c.full_name,
                                email: c.email,
                                password: ''
                              });
                              setErrorMsg('');
                              setShowEditModal(true);
                            }}
                            className="p-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Button: Khóa / Mở khóa tài khoản */}
                          <button
                            onClick={() => handleToggleStatus(c.id, c.is_active)}
                            className={`p-1.5 rounded-xl border transition ${
                              c.is_active 
                                ? 'border-amber-200 text-amber-700 hover:bg-amber-50' 
                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={c.is_active ? 'Khóa tài khoản này' : 'Mở khóa tài khoản'}
                          >
                            {c.is_active ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>
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

      {/* MODAL 1: Đăng ký khách hàng mới */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Đăng ký khách hàng mới</h2>
                <p className="text-xs text-gray-500">Mở tài khoản cho khách đến trực tiếp tại quầy lễ tân</p>
              </div>
            </div>

            {errorMsg && (
              <div className="my-4 p-3.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateCustomer} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Họ và tên khách hàng *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email liên hệ *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="khachhang@gmail.com"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Mật khẩu đăng nhập ban đầu *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none transition"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">Khách hàng có thể đổi mật khẩu sau khi đăng nhập</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2 transition"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Đang đăng ký...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Đăng ký khách
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Chi tiết khách hàng & Thú cưng liên kết */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowDetailModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Customer Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                {selectedCustomer.full_name ? selectedCustomer.full_name.charAt(0).toUpperCase() : 'K'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedCustomer.full_name}</h2>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{selectedCustomer.email}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                    selectedCustomer.is_active 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {selectedCustomer.is_active ? 'Tài khoản hoạt động' : 'Tài khoản bị khóa'}
                  </span>
                </div>
              </div>
            </div>

            {/* Pet List Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-purple-600" />
                  Thú cưng sở hữu ({selectedCustomer.pets?.length || 0})
                </h3>
                <Link
                  href="/receptionist/pets"
                  className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
                >
                  Tra cứu tất cả thú cưng <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {selectedCustomer.pets && selectedCustomer.pets.length > 0 ? (
                <div className="space-y-3">
                  {selectedCustomer.pets.map(pet => (
                    <div key={pet.id} className="p-4 rounded-2xl border border-gray-100 bg-slate-50/70 flex items-center justify-between gap-4 hover:border-purple-200 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold overflow-hidden">
                          {pet.avatar ? (
                            <img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover" />
                          ) : (
                            pet.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 block text-sm">{pet.name}</span>
                          <span className="text-xs text-gray-500">
                            {pet.species === 'DOG' ? 'Chó' : pet.species === 'CAT' ? 'Mèo' : pet.species} • {pet.breed || 'Chưa rõ giống'}
                          </span>
                        </div>
                      </div>

                      {/* Direct Passport Button */}
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/customer/pets/${pet.id}/passport`}
                          target="_blank"
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Sổ y bạ (Passport)</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl border border-dashed border-gray-200 text-center">
                  <PawPrint className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-500">Khách hàng này chưa có thú cưng nào liên kết.</p>
                  <p className="text-xs text-gray-400 mt-1">Khi khách đưa bé đến khám, thông tin thú cưng sẽ được tạo tại mục Hồ sơ thú cưng.</p>
                </div>
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap items-center justify-end gap-3">
              <Link
                href={`/receptionist/appointments?customer_id=${selectedCustomer.id}&customer_name=${encodeURIComponent(selectedCustomer.full_name)}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Đặt lịch hẹn ngay</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Sửa thông tin khách hàng */}
      {showEditModal && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 relative">
            <button 
              onClick={() => setShowEditModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Sửa thông tin khách hàng</h2>
                <p className="text-xs text-gray-500">Cập nhật họ tên, email hoặc đặt lại mật khẩu</p>
              </div>
            </div>

            {errorMsg && (
              <div className="my-4 p-3.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdateCustomer} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.full_name}
                  onChange={e => setEditFormData({ ...editFormData, full_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email liên hệ *
                </label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Mật khẩu mới (Bỏ trống nếu giữ nguyên)
                </label>
                <input
                  type="password"
                  value={editFormData.password}
                  onChange={e => setEditFormData({ ...editFormData, password: e.target.value })}
                  placeholder="Nhập mật khẩu mới..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2 transition"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
