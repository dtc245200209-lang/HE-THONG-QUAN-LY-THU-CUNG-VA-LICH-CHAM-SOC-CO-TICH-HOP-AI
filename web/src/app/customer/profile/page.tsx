'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Phone, MapPin, Shield, Edit2, Save, X } from 'lucide-react';
import api from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '0901 234 567',
    address: 'Hà Nội, Việt Nam',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data when user is loaded
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        full_name: user.full_name || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put('/api/v1/auth/me', { full_name: formData.full_name });
      setIsEditing(false);
      alert('Đã cập nhật thông tin thành công!');
      window.location.reload();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Lỗi khi cập nhật hồ sơ');
    } finally {
      setIsSaving(false);
    }
  };

  const roleName = user.roles && user.roles.length > 0 
    ? user.roles[0].name === 'CUSTOMER' ? 'Khách hàng' : user.roles[0].name
    : 'Khách hàng';

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen bg-transparent">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Hồ sơ cá nhân</h1>
        <p className="text-gray-500">Quản lý thông tin tài khoản và bảo mật của bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cột trái: Avatar & Tóm tắt */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 text-center shadow-sm">
            <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
              <span className="text-4xl font-bold text-primary uppercase">
                {user.full_name ? user.full_name.charAt(0) : user.email.charAt(0)}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{user.full_name || 'Khách hàng'}</h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium mb-4">
              <Shield className="w-4 h-4" />
              {roleName}
            </div>
            <p className="text-sm text-gray-500">Thành viên từ {user.created_at ? new Date(user.created_at).getFullYear() : '2024'}</p>
          </div>
        </div>

        {/* Cột phải: Thông tin chi tiết */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Thông tin liên hệ
              </h3>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm"
                >
                  <Edit2 className="w-4 h-4" /> Chỉnh sửa
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm"
                  >
                    <X className="w-4 h-4" /> Hủy
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 text-white bg-primary hover:bg-primary/90 font-medium text-sm transition-colors px-4 py-2 rounded-xl shadow-sm"
                  >
                    <Save className="w-4 h-4" /> {isSaving ? 'Đang lưu...' : 'Lưu lại'}
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    Họ và tên
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  ) : (
                    <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-gray-900 font-medium border border-transparent">
                      {user.full_name || 'Chưa cập nhật'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    Email
                  </label>
                  <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-gray-500 font-medium border border-transparent flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-400 px-1">Email không thể thay đổi</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    Số điện thoại
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  ) : (
                    <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-gray-900 font-medium border border-transparent flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {formData.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    Địa chỉ
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  ) : (
                    <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-gray-900 font-medium border border-transparent flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {formData.address}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
