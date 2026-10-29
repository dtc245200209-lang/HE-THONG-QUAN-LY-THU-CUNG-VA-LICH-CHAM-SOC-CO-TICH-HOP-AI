'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { 
  Bell, Plus, ChevronRight, Edit3, ShieldCheck, 
  Weight, Calendar as CalendarIcon, HeartPulse, Activity,
  CalendarPlus, FileText, Download, Bot, Camera, UserSquare,
  Syringe, Stethoscope, FileArchive, Send, ShieldAlert, Sparkles,
  PackageCheck, Truck, ShoppingBag, Package, Clock
} from 'lucide-react';
import Link from 'next/link';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  sex: string;
  avatar: string | null;
  date_of_birth?: string | null;
  color?: string | null;
  lost_mode?: boolean;
}

export default function DashboardPage() {
  const { user } = useAuth();
  
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  // Fetch live pets, appointments, and notifications from API
  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // 1. Fetch live pets of current user
        const petsRes = await api.get('/api/v1/pets');
        const petList: Pet[] = petsRes.data || [];
        setPets(petList);
        if (petList.length > 0) {
          setSelectedPetId(petList[0].id);
        }

        // 2. Fetch live notifications
        try {
          const notifsRes = await api.get('/api/v1/notifications');
          const notifList = notifsRes.data || [];
          setNotifications(notifList.slice(0, 3));
          setUnreadCount(notifList.filter((n: any) => !n.is_read).length);
        } catch (e) {
          console.warn("Could not load notifications:", e);
        }

        // 3. Fetch live appointments
        try {
          const apptRes = await api.get('/api/v1/appointments');
          setAppointments(apptRes.data || []);
        } catch (e) {
          console.warn("Could not load appointments:", e);
        }

        // 4. Fetch recent pet shop orders
        try {
          const ordersRes = await api.get('/api/v1/orders/my-orders');
          setRecentOrders((ordersRes.data?.items || []).slice(0, 2));
        } catch (e) {
          console.warn("Could not load orders:", e);
        }

      } catch (err) {
        console.error("Lỗi khi tải dữ liệu trang Dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Selected pet object
  const selectedPet = pets.find(p => p.id === selectedPetId) || pets[0];

  // Helper to get image matching breed or species
  const getPetAvatar = (pet: Pet) => {
    if (pet.avatar) return pet.avatar;
    const nameLower = pet.name.toLowerCase();
    const breedLower = (pet.breed || '').toLowerCase();
    
    if (nameLower.includes('đen') || breedLower.includes('husky')) {
      return 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&q=80&w=400&h=400';
    }
    if (nameLower.includes('milo') || breedLower.includes('golden')) {
      return 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400&h=400';
    }
    if (nameLower.includes('luna') || breedLower.includes('mèo') || breedLower.includes('british') || pet.species === 'CAT') {
      return 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&q=80&w=400&h=400';
    }
    if (breedLower.includes('corgi')) {
      return 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&q=80&w=400&h=400';
    }
    if (breedLower.includes('poodle')) {
      return 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=400&h=400';
    }
    if (pet.species === 'CAT') {
      return 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400&h=400';
    }
    return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400&h=400';
  };

  // Helper to format age
  const formatAge = (dobString?: string | null) => {
    if (!dobString) return 'Chưa cập nhật ngày sinh';
    try {
      const birth = new Date(dobString);
      const now = new Date();
      const diffYears = now.getFullYear() - birth.getFullYear();
      if (diffYears > 0) return `${diffYears} tuổi (${birth.toLocaleDateString('vi-VN')})`;
      const diffMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
      return `${Math.max(1, diffMonths)} tháng tuổi (${birth.toLocaleDateString('vi-VN')})`;
    } catch {
      return dobString;
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Xin chào, {user?.full_name || user?.email || 'Quý khách'}! <span className="text-2xl">👋</span>
          </h1>
          <p className="text-gray-500 font-medium mt-1">Cùng nhau chăm sóc để những người bạn luôn khỏe mạnh và hạnh phúc!</p>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/customer/notifications"
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 bg-white relative shadow-sm transition"
            title="Xem thông báo"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </Link>
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center">
            <img 
              src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || user?.email || 'User')}&background=0D8ABC&color=fff`} 
              alt="Avatar" 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
      </div>

      {/* Top Pet List (Real live pets) */}
      <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {pets.length === 0 && !loading && (
          <div className="text-sm text-gray-500 bg-white border border-gray-200 px-4 py-2.5 rounded-full flex items-center gap-2">
            <span>Bạn chưa có thú cưng nào. Hãy thêm ngay!</span>
          </div>
        )}

        {pets.map((pet) => {
          const isSelected = selectedPet && pet.id === selectedPet.id;
          return (
            <button 
              key={pet.id} 
              onClick={() => setSelectedPetId(pet.id)}
              className={`flex items-center gap-3 rounded-full pr-5 p-1.5 transition-all flex-shrink-0 border cursor-pointer ${
                isSelected 
                  ? 'bg-blue-50 border-blue-500 shadow-sm ring-2 ring-blue-500/20' 
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <div className={`w-11 h-11 rounded-full overflow-hidden border-2 ${isSelected ? 'border-blue-500' : 'border-transparent'}`}>
                <img 
                  src={getPetAvatar(pet)} 
                  alt={pet.name} 
                  className={`w-full h-full object-cover ${isSelected ? '' : 'grayscale opacity-75'}`} 
                />
              </div>
              <div className="text-left">
                <div className={`font-bold text-sm leading-tight ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>{pet.name}</div>
                <div className="text-[11px] text-gray-500 font-medium truncate max-w-[130px]">
                  {pet.breed || (pet.species === 'DOG' ? 'Chó' : 'Mèo')}
                </div>
              </div>
            </button>
          );
        })}
        
        <Link 
          href="/customer/pets/new"
          className="flex items-center gap-2 border border-dashed border-gray-300 rounded-full px-5 py-2 text-gray-600 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all flex-shrink-0 h-[56px] ml-2 font-medium text-sm shadow-2xs"
        >
          <Plus className="w-4 h-4 text-blue-600" />
          Thêm thú cưng
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column (2/3 width) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Main Pet Card */}
          {selectedPet ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6">
              <div className="w-40 h-40 rounded-2xl overflow-hidden flex-shrink-0 shadow-md border border-gray-100">
                <img 
                  src={getPetAvatar(selectedPet)} 
                  alt={selectedPet.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                      {selectedPet.name}
                    </h2>
                    <p className="text-sm font-medium text-gray-500 mt-1">
                      {selectedPet.breed || (selectedPet.species === 'DOG' ? 'Chó' : selectedPet.species === 'CAT' ? 'Mèo' : 'Thú cưng')}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {selectedPet.lost_mode ? (
                      <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-red-200 animate-pulse">
                        <ShieldAlert className="w-3.5 h-3.5" /> Bị thất lạc
                      </div>
                    ) : (
                      <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-green-100">
                        <ShieldCheck className="w-3.5 h-3.5" /> Khỏe mạnh
                      </div>
                    )}
                    <Link 
                      href={`/customer/pets/${selectedPet.id}/edit`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa
                    </Link>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-y-3 mt-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="w-5 text-center font-bold text-blue-500">
                      {selectedPet.sex === 'FEMALE' ? '♀' : '♂'}
                    </span> 
                    <span className="font-medium text-gray-900">
                      {selectedPet.sex === 'FEMALE' ? 'Cái' : selectedPet.sex === 'MALE' ? 'Đực' : 'Không xác định'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="w-5 text-center"><CalendarIcon className="w-4 h-4 text-gray-400 inline" /></span> 
                    <span className="font-medium text-gray-900">
                      {formatAge(selectedPet.date_of_birth)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="w-5 text-center"><Activity className="w-4 h-4 text-gray-400 inline" /></span> 
                    <span className="font-medium text-gray-900 font-mono">
                      ID: PET-{selectedPet.id.substring(0, 6).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="w-5 text-center font-bold text-emerald-500">●</span>
                    <span className="font-medium text-gray-900">
                      Màu lông: {selectedPet.color || 'Đang cập nhật'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-12 text-center shadow-sm">
              <p className="text-gray-500 mb-4 font-medium">Bạn chưa chọn hoặc chưa thêm bé thú cưng nào.</p>
              <Link
                href="/customer/pets/new"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition"
              >
                <Plus className="w-4 h-4" /> Thêm thú cưng đầu tiên
              </Link>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
                <Weight className="w-4 h-4" />
              </div>
              <p className="text-xs font-medium text-gray-500 mb-1">Cân nặng</p>
              <h3 className="text-lg font-bold text-gray-900">28.5 kg</h3>
              <p className="text-[10px] text-green-600 font-medium mt-1">↑ Thể trạng tiêu chuẩn</p>
            </div>
            
            <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
              <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-3">
                <Syringe className="w-4 h-4" />
              </div>
              <p className="text-xs font-medium text-gray-600 mb-1">Vaccine dại đến hạn</p>
              <h3 className="text-lg font-bold text-red-600">Còn 25 ngày</h3>
              <p className="text-[10px] text-gray-500 font-medium mt-1">Rabies định kỳ</p>
            </div>
            
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
              <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mb-3">
                <HeartPulse className="w-4 h-4" />
              </div>
              <p className="text-xs font-medium text-gray-500 mb-1">Lần chăm sóc gần nhất</p>
              <h3 className="text-lg font-bold text-gray-900">Grooming & Spa</h3>
              <p className="text-[10px] text-gray-500 font-medium mt-1">Tuần trước</p>
            </div>
            
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col justify-center relative overflow-hidden">
              <div className="absolute -right-2 -bottom-2 opacity-5 text-green-500">
                <ShieldCheck className="w-20 h-20" />
              </div>
              <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center mb-3">
                <Activity className="w-4 h-4" />
              </div>
              <p className="text-xs font-medium text-gray-500 mb-1">Tình trạng sức khỏe</p>
              <h3 className="text-lg font-bold text-green-600">Rất tốt</h3>
              <p className="text-[10px] text-gray-500 font-medium mt-1">Ăn uống bình thường</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Thao tác nhanh</h3>
              <Link href="/customer/care" className="text-xs font-semibold text-green-600 flex items-center gap-1 hover:underline">
                Theo dõi chăm sóc <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/customer/appointments" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm">
                <CalendarPlus className="w-4 h-4" /> Đặt lịch hẹn
              </Link>
              <Link href="/customer/orders" className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm">
                <PackageCheck className="w-4 h-4" /> Đơn hàng của tôi
              </Link>
              <Link href="/shop" className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
                <ShoppingBag className="w-4 h-4 text-emerald-600" /> Siêu thị Pet Shop
              </Link>
              <Link 
                href={selectedPet ? `/customer/pets/${selectedPet.id}/passport` : "/customer/passport"} 
                className="bg-white border border-gray-200 hover:bg-gray-50 text-blue-600 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4" /> Xem Passport
              </Link>
              <Link href="/customer/ai-chat" className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ml-auto">
                <Bot className="w-4 h-4" /> Hỏi AI
              </Link>
            </div>
          </div>

          {/* Recent Pet Shop Orders Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Đơn hàng Pet Shop & Vận chuyển</h3>
                  <p className="text-[11px] text-gray-400">Theo dõi trạng thái giao hàng trực tiếp</p>
                </div>
              </div>
              <Link 
                href="/customer/orders" 
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition"
              >
                <span>Xem tất cả đơn</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                <p className="text-xs text-gray-500">Bạn chưa có đơn hàng nào tại PetCare SuperStore.</p>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Khám phá Cửa hàng</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentOrders.map(order => (
                  <Link
                    key={order.id}
                    href="/customer/orders"
                    className="block p-3 rounded-xl border border-slate-100 hover:border-teal-200 bg-slate-50/60 hover:bg-teal-50/30 transition group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-slate-900 group-hover:text-teal-700 transition">
                          #{order.order_code}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          • {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.final_amount)}
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        order.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'SHIPPING' ? 'bg-teal-100 text-teal-800' :
                        order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                        order.status === 'RETURN_REQUESTED' ? 'bg-purple-100 text-purple-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {order.status === 'PENDING' ? 'Chờ xác nhận' :
                         order.status === 'CONFIRMED' ? 'Shop đã xác nhận' :
                         order.status === 'SHIPPING' ? 'Đang giao hàng' :
                         order.status === 'DELIVERED' ? 'Đã nhận hàng' :
                         order.status === 'RETURN_REQUESTED' ? 'Đang đổi/trả' : order.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 truncate">
                      {order.items?.map((i: any) => `${i.product_name} (x${i.quantity})`).join(', ')}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Notifications & Photos Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Thông báo gần đây</h3>
                <Link href="/customer/notifications" className="text-xs font-semibold text-blue-600 hover:underline">
                  Xem tất cả
                </Link>
              </div>
              <div className="space-y-3.5">
                {notifications.length === 0 ? (
                  <p className="text-xs text-gray-400 py-4 text-center">Chưa có thông báo mới.</p>
                ) : (
                  notifications.map((n) => (
                    <Link 
                      key={n.id} 
                      href="/customer/notifications" 
                      className="flex gap-3 hover:bg-slate-50 p-1.5 rounded-xl transition group"
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.is_read ? 'bg-gray-300' : 'bg-blue-600'}`}></div>
                      <div>
                        <p className={`text-sm font-semibold leading-tight group-hover:text-blue-600 transition ${n.is_read ? 'text-gray-700' : 'text-gray-950 font-bold'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{n.message}</p>
                        <span className="text-[10px] text-gray-400 mt-0.5 block">
                          {new Date(n.created_at).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
            
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Hình ảnh đáng yêu</h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="aspect-square rounded-xl overflow-hidden shadow-2xs">
                  <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200&h=200" alt="Dog" className="w-full h-full object-cover" />
                </div>
                <div className="aspect-square rounded-xl overflow-hidden shadow-2xs">
                  <img src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=200&h=200" alt="Dog" className="w-full h-full object-cover" />
                </div>
                <div className="aspect-square rounded-xl overflow-hidden shadow-2xs">
                  <img src="https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&q=80&w=200&h=200" alt="Dog" className="w-full h-full object-cover" />
                </div>
                <Link 
                  href="/customer/documents"
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-semibold">Thêm ảnh</span>
                </Link>
              </div>
            </div>
          </div>
          
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-6">
          
          {/* Digital Pet Passport Menu */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Digital Pet Passport</h3>
              <Link 
                href={selectedPet ? `/customer/pets/${selectedPet.id}/passport` : "/customer/passport"} 
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Xem chi tiết
              </Link>
            </div>
            <div className="space-y-2">
              <Link 
                href={selectedPet ? `/customer/pets/${selectedPet.id}/passport` : "/customer/passport"} 
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group text-left"
              >
                <div className="flex items-center gap-3 text-sm font-semibold text-gray-700 group-hover:text-blue-600">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <UserSquare className="w-4 h-4" />
                  </div>
                  Hồ sơ định danh
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
              </Link>
              <Link 
                href={selectedPet ? `/customer/pets/${selectedPet.id}/passport` : "/customer/passport"} 
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group text-left"
              >
                <div className="flex items-center gap-3 text-sm font-semibold text-gray-700 group-hover:text-blue-600">
                  <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                    <Syringe className="w-4 h-4" />
                  </div>
                  Lịch sử vaccine
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
              </Link>
              <Link 
                href="/customer/care" 
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group text-left"
              >
                <div className="flex items-center gap-3 text-sm font-semibold text-gray-700 group-hover:text-blue-600">
                  <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  Hồ sơ y tế
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
              </Link>
              <Link 
                href="/customer/documents" 
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group text-left"
              >
                <div className="flex items-center gap-3 text-sm font-semibold text-gray-700 group-hover:text-blue-600">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <FileArchive className="w-4 h-4" />
                  </div>
                  Tài liệu quan trọng
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
              </Link>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Lịch hẹn sắp tới</h3>
              <Link href="/customer/appointments" className="text-xs font-semibold text-blue-600 hover:underline">
                Xem tất cả
              </Link>
            </div>
            
            <div className="space-y-3">
              {appointments.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs font-medium">Chưa có lịch hẹn nào sắp tới.</p>
                  <Link href="/customer/appointments" className="text-xs font-bold text-blue-600 mt-2 inline-block hover:underline">
                    + Đặt lịch ngay
                  </Link>
                </div>
              ) : (
                appointments.slice(0, 3).map((appt) => (
                  <Link 
                    key={appt.id}
                    href="/customer/appointments"
                    className="flex items-start gap-3 p-3 border border-gray-100 rounded-xl bg-white shadow-2xs hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden block"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-gray-900 truncate">
                        {appt.notes || 'Khám & Spa thú cưng'}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(appt.start_time).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold">
                      {appt.status === 'CONFIRMED' ? 'Đã xác nhận' : appt.status === 'COMPLETED' ? 'Hoàn thành' : 'Chờ duyệt'}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* AI Assistant Widget */}
          <div className="bg-gradient-to-b from-blue-50 to-white border border-blue-100 rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Bot className="w-32 h-32 text-blue-600" />
            </div>
            
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Trợ lý AI PetCare</h3>
                <div className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span> Đang hoạt động
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-blue-50 rounded-xl p-3 shadow-sm mb-4 relative z-10 text-sm text-gray-700 leading-relaxed font-medium">
              Xin chào! Tôi có thể giúp gì cho bạn và <span className="font-bold text-blue-600">{selectedPet?.name || 'thú cưng'}</span> hôm nay?
            </div>
            
            <div className="space-y-2 mb-4 relative z-10">
              <Link 
                href="/customer/ai-chat"
                className="w-full text-left text-xs font-medium text-blue-700 bg-blue-50/50 hover:bg-blue-100 border border-blue-100 px-3 py-2 rounded-lg transition-colors truncate block"
              >
                {selectedPet?.name || 'Bé'} cần tiêm vaccine khi nào?
              </Link>
              <Link 
                href="/customer/ai-chat"
                className="w-full text-left text-xs font-medium text-blue-700 bg-blue-50/50 hover:bg-blue-100 border border-blue-100 px-3 py-2 rounded-lg transition-colors truncate block"
              >
                Chế độ ăn phù hợp cho {selectedPet?.name || 'bé'}?
              </Link>
              <Link 
                href="/customer/ai-chat"
                className="w-full text-left text-xs font-medium text-blue-700 bg-blue-50/50 hover:bg-blue-100 border border-blue-100 px-3 py-2 rounded-lg transition-colors truncate block"
              >
                Dấu hiệu nào cần gặp bác sĩ thú y ngay?
              </Link>
            </div>
            
            <Link href="/customer/ai-chat" className="relative z-10 block cursor-pointer">
              <div className="w-full bg-white border border-gray-200 rounded-full pl-4 pr-10 py-2.5 text-xs font-medium text-gray-400 hover:border-blue-400 flex items-center justify-between shadow-2xs transition-all">
                <span>Nhấn vào đây để trò chuyện với AI...</span>
                <div className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors">
                  <Send className="w-3 h-3" />
                </div>
              </div>
            </Link>
            
          </div>

        </div>
      </div>
    </div>
  );
}
