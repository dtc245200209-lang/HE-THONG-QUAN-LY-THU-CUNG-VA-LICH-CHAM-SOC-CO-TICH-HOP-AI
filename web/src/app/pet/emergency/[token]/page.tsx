'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from '@/lib/api/client';
import { 
  ShieldAlert, Phone, Mail, MapPin, Clock, Heart, 
  AlertTriangle, CheckCircle2, Send, Navigation, Info, Award
} from 'lucide-react';

export default function PublicEmergencyPetPage() {
  const { token } = useParams();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Report form state
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchPet = async () => {
      try {
        setLoading(true);
        // Direct call to public emergency endpoint
        const res = await axios.get(`/api/v1/public/pets/emergency/${token}`);
        setPet(res.data);
      } catch (err: any) {
        console.error("Lỗi khi tải thông tin thú cưng khẩn cấp:", err);
        setError(err.response?.data?.detail || "Mã QR khẩn cấp không hợp lệ hoặc đã hết hạn.");
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [token]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ định vị GPS");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`Tọa độ GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)} (gần vị trí hiện tại)`);
        setLocating(false);
      },
      (err) => {
        alert("Không thể lấy vị trí hiện tại: " + err.message);
        setLocating(false);
      }
    );
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone && !email) {
      alert("Vui lòng để lại Số điện thoại hoặc Email để chủ nuôi có thể liên lạc!");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`/api/v1/public/pets/emergency/${token}/report`, {
        contact_phone: phone.trim() || undefined,
        contact_email: email.trim() || undefined,
        last_seen_location: location.trim() || undefined,
        last_seen_time: new Date().toISOString(),
        message: message.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err: any) {
      alert("Lỗi khi gửi thông tin: " + (err.response?.data?.detail || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Đang tải thẻ y tế khẩn cấp...</p>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy thông tin thẻ</h1>
        <p className="text-gray-600 max-w-md mx-auto mb-6">{error}</p>
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <a
            href="/pet/emergency/demo"
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md shadow-red-200 transition"
          >
            Xem thẻ khẩn cấp mẫu (Demo)
          </a>
          <a
            href="/"
            className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold transition"
          >
            Về trang chủ
          </a>
        </div>
        <p className="text-xs text-gray-400">PetCare AI Emergency Passport System</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-16 font-sans">
      {/* Lost Pet Top Banner */}
      {pet.lost_mode ? (
        <div className="bg-red-600 text-white px-4 py-4 sticky top-0 z-30 shadow-lg text-center animate-pulse">
          <div className="max-w-2xl mx-auto flex items-center justify-center gap-2">
            <ShieldAlert className="w-6 h-6 flex-shrink-0" />
            <span className="font-extrabold text-sm sm:text-base tracking-wide uppercase">
              🚨 THÚ CƯNG ĐANG BỊ THẤT LẠC - XIN HÃY GIÚP ĐỠ! 🚨
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-center text-xs font-semibold">
          Thẻ Nhận Diện Y Tế Khẩn Cấp (PetCare Digital Passport)
        </div>
      )}

      <main className="max-w-xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Pet ID Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="relative h-64 bg-slate-200">
            {pet.avatar ? (
              <img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-amber-400 to-orange-400 text-white text-6xl font-bold">
                {pet.name?.charAt(0)}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
              <div className="text-white">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-extrabold tracking-tight">{pet.name}</h1>
                  <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
                    {pet.species}
                  </span>
                </div>
                <p className="text-white/80 text-sm">{pet.breed || 'Chưa rõ giống'} • {pet.sex === 'MALE' ? 'Đực' : pet.sex === 'FEMALE' ? 'Cái' : 'Chưa rõ'}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Characteristics */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 p-3 rounded-2xl border border-gray-100">
                <span className="text-xs text-gray-500 block">Màu lông</span>
                <span className="font-semibold text-gray-800">{pet.color || 'Không có'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-gray-100">
                <span className="text-xs text-gray-500 block">Đặc điểm nhận dạng</span>
                <span className="font-semibold text-gray-800">{pet.distinguishing_marks || 'Không có'}</span>
              </div>
            </div>

            {/* Owner Contact */}
            {pet.owner_emergency_contact && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-blue-700 font-semibold uppercase tracking-wider block">Chủ sở hữu</span>
                  <span className="font-bold text-gray-900 text-sm">{pet.owner_emergency_contact}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
              </div>
            )}

            {/* Medical Warnings */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Lưu ý y tế khẩn cấp
              </h3>

              {pet.allergies?.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800">
                  <span className="font-bold block mb-1">Dị ứng nguy hiểm:</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {pet.allergies.map((a: any) => (
                      <li key={a.id || a.name}>{a.name} {a.severity ? `(${a.severity})` : ''}</li>
                    ))}
                  </ul>
                </div>
              )}

              {pet.conditions?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
                  <span className="font-bold block mb-1">Bệnh lý đang theo dõi:</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {pet.conditions.map((c: any) => (
                      <li key={c.id || c.name}>{c.name} {c.is_chronic ? '(Mãn tính)' : ''}</li>
                    ))}
                  </ul>
                </div>
              )}

              {pet.medications?.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-900">
                  <span className="font-bold block mb-1">Thuốc đang sử dụng:</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {pet.medications.map((m: any) => (
                      <li key={m.id || m.name}>{m.name} - Liều lượng: {m.dosage || 'Theo chỉ định'}</li>
                    ))}
                  </ul>
                </div>
              )}

              {(!pet.allergies?.length && !pet.conditions?.length && !pet.medications?.length) && (
                <p className="text-xs text-gray-500 italic">Thú cưng không có dị ứng hoặc tiền sử bệnh đặc biệt ghi nhận.</p>
              )}
            </div>
          </div>
        </div>

        {/* Report Found Pet Form */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
              <Heart className="w-5 h-5 fill-red-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">Báo tin tìm thấy thú cưng</h2>
              <p className="text-xs text-gray-500">Giúp bé sớm đoàn tụ với gia đình!</p>
            </div>
          </div>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">Đã gửi tin nhắn báo tin!</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Thông tin và vị trí của bạn đã được chuyển tới chủ nuôi của {pet.name}. Chân thành cảm ơn sự giúp đỡ quý báu của bạn!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Số điện thoại của bạn <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email (tùy chọn)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Vị trí nhìn thấy bé
                  </label>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={locating}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <Navigation className="w-3 h-3" />
                    {locating ? 'Đang lấy vị trí...' : 'Gửi vị trí GPS hiện tại'}
                  </button>
                </div>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ví dụ: Công viên Tao Đàn, đối diện quán cafe..."
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ghi chú tình trạng thú cưng
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Bé khỏe mạnh, đang được tạm giữ an toàn tại..."
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-md shadow-red-500/20 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Đang gửi thông báo...' : 'Gửi thông tin cho chủ nuôi ngay'}
              </button>
            </form>
          )}

        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-gray-400 py-4">
          PetCare AI • Hệ thống thẻ căn cước thú cưng thông minh
        </div>
      </main>
    </div>
  );
}
