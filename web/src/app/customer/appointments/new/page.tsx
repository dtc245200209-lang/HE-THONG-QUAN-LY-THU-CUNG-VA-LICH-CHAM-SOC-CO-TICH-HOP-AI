'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewAppointmentPage() {
  const router = useRouter();
  const [pets, setPets] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  
  const [selectedPet, setSelectedPet] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [petsRes, servicesRes] = await Promise.all([
          api.get('/api/v1/pets'),
          api.get('/api/v1/services')
        ]);
        setPets(petsRes.data);
        if (petsRes.data.length > 0) {
          setSelectedPet(petsRes.data[0].id);
        }
        setServices(servicesRes.data);
      } catch (err: any) {
        console.error("Failed to fetch data", err);
        setError("Không thể tải dữ liệu thú cưng hoặc dịch vụ.");
      } finally {
        setFetchingData(false);
      }
    };
    fetchData();
  }, []);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet || selectedServices.length === 0 || !date || !time) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const scheduledTimeObj = new Date(`${date}T${time}:00`);
      if (scheduledTimeObj < new Date()) {
        setError("Không thể đặt lịch trong quá khứ. Vui lòng chọn thời gian khác.");
        setLoading(false);
        return;
      }
      
      const scheduledTime = scheduledTimeObj.toISOString();
      
      await api.post('/api/v1/appointments', {
        pet_id: selectedPet,
        service_ids: selectedServices,
        scheduled_time: scheduledTime,
        notes: notes || undefined
      });
      router.push('/customer/appointments');
    } catch (err: any) {
      let errorMessage = 'Lỗi khi đặt lịch hẹn.';
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail)) {
        errorMessage = detail.map((d: any) => d.msg).join(', ');
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-12">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/customer/appointments" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <span className="font-bold text-lg text-gray-900">Đặt Lịch Hẹn Mới</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto w-full px-4 pt-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center justify-center mb-8">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center border-4 border-white shadow-sm">
              <Calendar className="w-10 h-10" />
            </div>
          </div>
          
          {error && <p className="text-red-500 text-sm mb-4 text-center p-3 bg-red-50 rounded-lg">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chọn thú cưng *</label>
              {pets.length === 0 ? (
                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm border border-yellow-100">
                  Bạn chưa có thú cưng nào. Vui lòng thêm thú cưng trước khi đặt lịch.
                </div>
              ) : (
                <select
                  value={selectedPet}
                  onChange={(e) => setSelectedPet(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all bg-white"
                >
                  {pets.map(pet => (
                    <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chọn dịch vụ *</label>
              <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                {services.map(service => (
                  <label key={service.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedServices.includes(service.id) ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service.id)}
                      onChange={() => handleServiceToggle(service.id)}
                      className="w-4 h-4 text-primary rounded focus:ring-primary"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{service.name}</div>
                      <div className="text-sm text-gray-500">{service.base_price.toLocaleString('vi-VN')} ₫</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày hẹn *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giờ hẹn *</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú (Tùy chọn)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none"
                placeholder="Ví dụ: Bé nhát người lạ..."
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || pets.length === 0 || selectedServices.length === 0 || !date || !time}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all"
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
