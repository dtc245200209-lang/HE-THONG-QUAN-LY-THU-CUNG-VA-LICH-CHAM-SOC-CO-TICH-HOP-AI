'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, Users, UserPlus, Shield, Trash2, Edit3, 
  CheckCircle2, AlertCircle, Info, Heart, Mail
} from 'lucide-react';
import Link from 'next/link';

interface PetMember {
  id: string;
  user_id: string;
  pet_id: string;
  role: 'PRIMARY_OWNER' | 'CO_OWNER' | 'CAREGIVER_MEMBER' | 'VIEWER';
  created_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string | null;
  };
}

export default function PetMembersPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [pet, setPet] = useState<any>(null);
  const [members, setMembers] = useState<PetMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'CO_OWNER' | 'CAREGIVER_MEMBER' | 'VIEWER'>('CAREGIVER_MEMBER');
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const [petRes, membersRes] = await Promise.all([
        api.get(`/api/v1/pets/${id}`),
        api.get(`/api/v1/pets/${id}/members`)
      ]);
      setPet(petRes.data);
      setMembers(membersRes.data);
    } catch (err: any) {
      console.error("Lỗi khi tải thành viên chăm sóc:", err);
      setError("Không thể tải danh sách thành viên chăm sóc thú cưng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = '/login';
      return;
    }
    fetchMembers();
  }, [id, user, authLoading]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    setInviteSuccess('');
    setError('');
    try {
      await api.post(`/api/v1/pets/${id}/members`, {
        email: inviteEmail.trim(),
        role: inviteRole
      });
      setInviteSuccess(`Đã thêm thành công thành viên ${inviteEmail} vào gia đình!`);
      setInviteEmail('');
      fetchMembers();
    } catch (err: any) {
      alert("Lỗi khi thêm thành viên: " + (err.response?.data?.detail || err.message));
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async (membershipId: string, newRole: string) => {
    try {
      await api.put(`/api/v1/pets/${id}/members/${membershipId}`, { role: newRole });
      fetchMembers();
    } catch (err: any) {
      alert("Lỗi khi cập nhật vai trò: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleRemoveMember = async (membershipId: string, memberName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa ${memberName} khỏi danh sách chăm sóc thú cưng?`)) {
      return;
    }

    try {
      await api.delete(`/api/v1/pets/${id}/members/${membershipId}`);
      fetchMembers();
    } catch (err: any) {
      alert("Lỗi khi xóa thành viên: " + (err.response?.data?.detail || err.message));
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'PRIMARY_OWNER':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold">Chủ sở hữu chính</span>;
      case 'CO_OWNER':
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold">Đồng chủ sở hữu</span>;
      case 'CAREGIVER_MEMBER':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">Người chăm sóc gia đình</span>;
      case 'VIEWER':
        return <span className="bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1 rounded-full text-xs font-bold">Chỉ xem</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">{role}</span>;
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error || "Không tìm thấy dữ liệu thú cưng"}</p>
        <Link href="/customer/pets" className="text-primary hover:underline">Quay lại danh sách</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href={`/customer/pets/${id}/passport`} 
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-gray-900 text-base">Chia Sẻ Quyền Chăm Sóc Gia Đình</h1>
              <p className="text-xs text-gray-500">Thú cưng: {pet.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        
        {/* Intro Card */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Gia đình cùng chăm sóc {pet.name}</h2>
              <p className="text-xs text-gray-500 mt-0.5 max-w-lg leading-relaxed">
                Thêm người thân hoặc bạn cùng phòng vào nhóm để họ cùng theo dõi sổ sức khỏe, lịch tiêm phòng và đặt lịch chăm sóc dễ dàng.
              </p>
            </div>
          </div>

          <div className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
            {members.length} thành viên hiện tại
          </div>
        </div>

        {/* Invite Form Card */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-gray-900 text-sm">Mời thành viên gia đình mới</h3>
          </div>

          {inviteSuccess && (
            <div className="mb-4 bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {inviteSuccess}
            </div>
          )}

          <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-6">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email tài khoản PetCare của người thân
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="nguoithan@example.com"
                  className="w-full text-sm pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Quyền hạn cấp
              </label>
              <select
                value={inviteRole}
                onChange={(e: any) => setInviteRole(e.target.value)}
                className="w-full text-sm py-2.5 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="CAREGIVER_MEMBER">Người chăm sóc gia đình</option>
                <option value="CO_OWNER">Đồng chủ sở hữu (Toàn quyền)</option>
                <option value="VIEWER">Chỉ xem hồ sơ</option>
              </select>
            </div>

            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={inviting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 h-[42px]"
              >
                <UserPlus className="w-4 h-4" />
                {inviting ? 'Đang thêm...' : 'Thêm ngay'}
              </button>
            </div>
          </form>

          <p className="text-[11px] text-gray-400 mt-2.5">
            * Người được thêm cần có tài khoản đã đăng ký trên hệ thống PetCare với email tương ứng.
          </p>
        </div>

        {/* Members List Card */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Danh sách thành viên hiện tại</h3>

          <div className="divide-y divide-gray-100">
            {members.map((member) => {
              const isPrimary = member.role === 'PRIMARY_OWNER';
              const displayName = member.user?.full_name || member.user?.email || 'Thành viên';
              const displayEmail = member.user?.email || '';

              return (
                <div key={member.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">{displayName}</span>
                        {getRoleBadge(member.role)}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{displayEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isPrimary ? (
                      <>
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="CO_OWNER">Đồng chủ sở hữu</option>
                          <option value="CAREGIVER_MEMBER">Người chăm sóc</option>
                          <option value="VIEWER">Chỉ xem</option>
                        </select>

                        <button
                          onClick={() => handleRemoveMember(member.id, displayName)}
                          className="w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 flex items-center justify-center transition"
                          title="Xóa thành viên"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Chủ tạo hồ sơ</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Roles explanation card */}
        <div className="bg-slate-100 rounded-2xl p-5 border border-gray-200 text-xs text-gray-600 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-gray-800">
            <Info className="w-4 h-4 text-indigo-600" /> Giải thích phân quyền thành viên:
          </div>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Chủ sở hữu chính:</strong> Người đầu tiên tạo hồ sơ cho thú cưng, nắm quyền tối cao và không thể bị xóa.</li>
            <li><strong>Đồng chủ sở hữu:</strong> Toàn quyền xem và chỉnh sửa thông tin, đặt lịch hẹn, thêm thành viên khác.</li>
            <li><strong>Người chăm sóc gia đình:</strong> Xem sổ sức khỏe, ghi nhận nhật ký chăm sóc hàng ngày và đặt lịch khám.</li>
            <li><strong>Chỉ xem:</strong> Chỉ xem thông tin sức khỏe và lịch sử tiêm phòng, không thể chỉnh sửa.</li>
          </ul>
        </div>

      </main>
    </div>
  );
}
