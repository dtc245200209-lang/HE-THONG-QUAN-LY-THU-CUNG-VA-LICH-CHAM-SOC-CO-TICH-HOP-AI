import React, { useState, useEffect } from 'react';
import { CalendarClock, CheckCircle, Dog, Sparkles, Clock, Calendar, Edit3 } from 'lucide-react';

interface ActionPreviewCardProps {
  tool: string;
  parameters: Record<string, any>;
  onConfirm: (editedParams: Record<string, any>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  pets?: Array<{ id: string; name: string; species?: string; breed?: string }>;
  services?: Array<{ id: string; name: string; base_price?: number }>;
}

export function ActionPreviewCard({
  tool,
  parameters,
  onConfirm,
  onCancel,
  isLoading,
  pets = [],
  services = []
}: ActionPreviewCardProps) {
  const [editedParams, setEditedParams] = useState(parameters);
  const [isCustomPet, setIsCustomPet] = useState(false);

  useEffect(() => {
    setEditedParams(parameters);
    // If a pet name was provided from AI but doesn't exist in user pets, activate custom mode
    if (parameters.pet_name && pets.length > 0) {
      const match = pets.find(p => p.name.toLowerCase() === parameters.pet_name.toLowerCase());
      if (!match) {
        setIsCustomPet(true);
      }
    } else if (!parameters.pet_name && !parameters.pet_id && pets.length > 0) {
      // Default to first pet
      setEditedParams(prev => ({
        ...prev,
        pet_id: pets[0].id,
        pet_name: pets[0].name
      }));
    }
  }, [parameters, pets]);

  const handleInputChange = (key: string, value: string) => {
    setEditedParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePetSelect = (val: string) => {
    if (val === '__custom__') {
      setIsCustomPet(true);
      setEditedParams(prev => ({ ...prev, pet_id: '', pet_name: '' }));
    } else {
      setIsCustomPet(false);
      const selected = pets.find(p => p.id === val);
      if (selected) {
        setEditedParams(prev => ({
          ...prev,
          pet_id: selected.id,
          pet_name: selected.name
        }));
      }
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    const selected = services.find(s => s.id === serviceId);
    if (selected) {
      setEditedParams(prev => ({
        ...prev,
        service_id: selected.id,
        service_name: selected.name
      }));
    }
  };

  const getFriendlyToolName = (toolName: string) => {
    const names: Record<string, string> = {
      'reschedule_appointment': 'Đổi lịch hẹn',
      'book_appointment': 'Đặt lịch dịch vụ',
      'update_pet': 'Cập nhật thông tin',
    };
    return names[toolName] || toolName.replace(/_/g, ' ');
  };

  return (
    <div className="bg-white border border-blue-200/90 rounded-2xl p-5 my-3 shadow-[0_8px_30px_rgb(0,0,0,0.06)] w-full overflow-hidden relative text-gray-800">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/70 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-2 rounded-xl shadow-sm">
            <CalendarClock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">Xác nhận lịch hẹn</h4>
            <p className="text-[11px] text-gray-500">Chọn hoặc nhập tên thú cưng, dịch vụ và ngày giờ</p>
          </div>
        </div>
        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
          {getFriendlyToolName(tool)}
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-3 mb-4 relative z-10 bg-gray-50/80 p-4 rounded-xl border border-gray-100">
        
        {/* 1. Chọn hoặc nhập Thú cưng */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Dog className="w-3.5 h-3.5 text-blue-600" />
              Thú cưng
            </label>
            <button
              type="button"
              onClick={() => {
                const nextCustom = !isCustomPet;
                setIsCustomPet(nextCustom);
                if (!nextCustom && pets.length > 0) {
                  setEditedParams(prev => ({
                    ...prev,
                    pet_id: pets[0].id,
                    pet_name: pets[0].name
                  }));
                }
              }}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              {isCustomPet ? "Chọn từ danh sách thú cưng" : "✏️ Nhập tên bé khác"}
            </button>
          </div>

          {isCustomPet ? (
            <input
              type="text"
              placeholder="Nhập tên bé thú cưng (vd: Corgi Bông, Miu Con, Bé Bơ...)"
              value={editedParams.pet_name || ''}
              onChange={(e) => handleInputChange('pet_name', e.target.value)}
              className="w-full bg-white border border-blue-400 rounded-lg px-3 py-2 text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all shadow-sm"
              autoFocus
            />
          ) : (
            <select
              value={editedParams.pet_id || (pets.length > 0 ? pets[0].id : '')}
              onChange={(e) => handlePetSelect(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
            >
              {pets.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.breed ? `(${p.breed})` : ''}
                </option>
              ))}
              <option value="__custom__">➕ Nhập tên bé thú cưng khác...</option>
            </select>
          )}
        </div>

        {/* 2. Chọn Dịch vụ */}
        <div>
          <label className="text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Dịch vụ chăm sóc
          </label>
          <select
            value={editedParams.service_id || (services.length > 0 ? services[0].id : '')}
            onChange={(e) => handleServiceSelect(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
          >
            {services.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} {s.base_price ? `- ${Number(s.base_price).toLocaleString('vi-VN')} đ` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Ngày và Giờ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              Ngày hẹn
            </label>
            <input
              type="date"
              value={editedParams.date || ''}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              Giờ hẹn
            </label>
            <input
              type="time"
              value={editedParams.time || '09:00'}
              onChange={(e) => handleInputChange('time', e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* 4. Ghi chú */}
        <div>
          <label className="text-[11px] font-semibold text-gray-600 mb-1 block">
            Ghi chú thêm (tùy chọn)
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Bé sợ sấy lông, dặn làm nhẹ tay..."
            value={editedParams.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>

      </div>

      {/* Buttons */}
      <div className="flex gap-2 justify-end relative z-10">
        <button 
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
        >
          Hủy bỏ
        </button>
        <button 
          onClick={() => onConfirm(editedParams)}
          disabled={isLoading}
          className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <CheckCircle className="w-3.5 h-3.5" />
          )}
          {isLoading ? 'Đang đặt lịch...' : 'Xác nhận đặt lịch'}
        </button>
      </div>
    </div>
  );
}
