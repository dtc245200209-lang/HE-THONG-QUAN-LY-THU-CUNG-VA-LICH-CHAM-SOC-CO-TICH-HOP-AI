'use client';

import { useState } from 'react';
import { Save, Building2, Bell, Shield, MonitorSmartphone } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('clinic');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Mock save delay
    setTimeout(() => {
      setIsSaving(false);
      alert('Đã lưu cấu hình thành công!');
    }, 800);
  };

  const tabs = [
    { id: 'clinic', label: 'Thông tin Phòng khám', icon: Building2 },
    { id: 'system', label: 'Cấu hình Hệ thống', icon: MonitorSmartphone },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'security', label: 'Bảo mật', icon: Shield },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Cài đặt Hệ thống</h1>
          <p className="text-gray-500 mt-2">Quản lý các cấu hình chung của phòng khám và hệ thống.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          
          {activeTab === 'clinic' && (
            <div className="p-8 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Thông tin Phòng khám</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tên phòng khám</label>
                  <input type="text" defaultValue="PetCare Center" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Số điện thoại hỗ trợ</label>
                  <input type="text" defaultValue="0987654321" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Địa chỉ</label>
                  <input type="text" defaultValue="123 Đường ABC, Phường XYZ, Quận 1, TP. HCM" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 pt-4 border-t border-gray-100">Giờ làm việc</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium text-gray-700">Thứ 2 - Thứ 6</div>
                  <input type="time" defaultValue="08:00" className="px-4 py-2 border border-gray-200 rounded-xl text-sm" />
                  <span className="text-gray-400">-</span>
                  <input type="time" defaultValue="20:00" className="px-4 py-2 border border-gray-200 rounded-xl text-sm" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium text-gray-700">Thứ 7 - CN</div>
                  <input type="time" defaultValue="09:00" className="px-4 py-2 border border-gray-200 rounded-xl text-sm" />
                  <span className="text-gray-400">-</span>
                  <input type="time" defaultValue="18:00" className="px-4 py-2 border border-gray-200 rounded-xl text-sm" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="p-8 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Cấu hình Hệ thống</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-gray-900">Bảo trì hệ thống</h4>
                    <p className="text-sm text-gray-500">Tạm dừng nhận khách hàng và đặt lịch mới</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Múi giờ mặc định</label>
                    <select className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 outline-none">
                      <option>Asia/Ho_Chi_Minh (UTC+07:00)</option>
                      <option>Asia/Bangkok (UTC+07:00)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Ngôn ngữ</label>
                    <select className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 outline-none">
                      <option>Tiếng Việt</option>
                      <option>English</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="p-8 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Thông báo</h2>
              <div className="space-y-4">
                {[
                  { title: "Email xác nhận lịch hẹn", desc: "Tự động gửi email cho khách hàng khi lịch hẹn được xác nhận" },
                  { title: "Nhắc nhở lịch hẹn (Zalo/SMS)", desc: "Gửi tin nhắn nhắc nhở trước 1 ngày" },
                  { title: "Thông báo Lịch làm việc cho Bác sĩ", desc: "Gửi thông báo có lịch hẹn mới được phân công" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="p-8 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Bảo mật</h2>
              <p className="text-gray-500 text-sm">Tính năng nâng cao đang được phát triển. Bạn sẽ sớm có thể quản lý 2FA và chính sách mật khẩu tại đây.</p>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
