'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, ShieldAlert, QrCode, Printer, ExternalLink, 
  Phone, Mail, MapPin, Clock, CheckCircle2, AlertTriangle, 
  Share2, Copy, Download
} from 'lucide-react';
import Link from 'next/link';

export default function CustomerPetEmergencyPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [pet, setPet] = useState<any>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [lostMode, setLostMode] = useState(false);
  const [lostReports, setLostReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingLostMode, setTogglingLostMode] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch passport to get pet and qr_token
        const passportRes = await api.get(`/api/v1/pets/${id}/passport`);
        const p = passportRes.data;
        setPet(p.pet);
        setLostMode(p.pet.lost_mode);
        setQrToken(p.qr_token);

        // Fetch lost reports
        try {
          const reportsRes = await api.get(`/api/v1/pets/${id}/lost_reports`);
          setLostReports(reportsRes.data);
        } catch (e) {
          console.warn("Could not fetch lost reports:", e);
        }
      } catch (err: any) {
        console.error("Lỗi khi tải thông tin thẻ khẩn cấp:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user, authLoading]);

  const handleToggleLostMode = async () => {
    setTogglingLostMode(true);
    const newStatus = !lostMode;
    try {
      await api.put(`/api/v1/pets/${id}/lost_mode`, { lost_mode: newStatus });
      setLostMode(newStatus);
      if (newStatus) {
        alert("Đã KÍCH HOẠT Chế độ Thú cưng Thất lạc! Bất kỳ ai quét mã QR sẽ thấy cảnh báo khẩn cấp và thông tin liên hệ của bạn.");
      } else {
        alert("Đã tắt Chế độ Thú cưng Thất lạc. Chúc mừng bạn và thú cưng đã an toàn!");
      }
    } catch (err: any) {
      alert("Lỗi khi cập nhật chế độ thất lạc: " + (err.response?.data?.detail || err.message));
    } finally {
      setTogglingLostMode(false);
    }
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const publicEmergencyUrl = qrToken ? `${origin}/pet/emergency/${qrToken}` : '';
  const qrImageUrl = publicEmergencyUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicEmergencyUrl)}` : '';

  const handleCopyLink = () => {
    if (!publicEmergencyUrl) return;
    navigator.clipboard.writeText(publicEmergencyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintCard = () => {
    window.print();
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">Không tìm thấy thông tin thú cưng</p>
        <Link href="/customer/pets" className="text-primary hover:underline">Quay lại danh sách</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-xs print:hidden">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href={`/customer/pets/${id}/passport`} 
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-gray-900 text-base">Thẻ Cứu Hộ & Chế Độ Thất Lạc</h1>
              <p className="text-xs text-gray-500">Dành cho {pet.name}</p>
            </div>
          </div>

          <button
            onClick={handlePrintCard}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition"
          >
            <Printer className="w-4 h-4" /> In thẻ đeo vòng cổ
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        
        {/* Lost Mode Control Card */}
        <div className={`rounded-3xl p-6 border transition shadow-sm ${
          lostMode 
            ? 'bg-red-50 border-red-200 text-red-950' 
            : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                lostMode ? 'bg-red-600 text-white animate-bounce' : 'bg-slate-100 text-slate-600'
              }`}>
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">Chế độ Thú cưng Bị lạc (Lost Pet Mode)</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    lostMode ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {lostMode ? 'ĐANG BẬT' : 'Đang tắt'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 max-w-xl">
                  {lostMode 
                    ? 'Cảnh báo khẩn cấp đang hiển thị công khai trên mã QR của thú cưng! Người nhặt được sẽ thấy thông tin liên lạc và form báo tin.'
                    : 'Kích hoạt ngay khi bạn phát hiện thú cưng bị lạc để trang cứu hộ chuyển sang trạng thái cảnh báo màu đỏ với hướng dẫn giúp đỡ.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleLostMode}
              disabled={togglingLostMode}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-xs whitespace-nowrap ${
                lostMode
                  ? 'bg-white hover:bg-gray-100 text-red-600 border border-red-300'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {togglingLostMode ? 'Đang cập nhật...' : lostMode ? 'Tắt chế độ bị lạc' : 'Bật chế độ khẩn cấp ngay'}
            </button>
          </div>
        </div>

        {/* Emergency QR Badge Section (Printable) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Printable Collar Tag Mockup */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base">
                  <QrCode className="w-5 h-5 text-indigo-600" /> Thẻ QR thông minh cho thú cưng
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Hoạt động 24/7
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-6">
                In mã này và đính kèm vào vòng cổ của {pet.name}. Bất kỳ ai sử dụng Camera điện thoại thông thường đều có thể quét để xem thông tin y bạ khẩn cấp mà không cần cài đặt ứng dụng.
              </p>

              {/* QR Preview Card */}
              <div className="bg-slate-50 border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center max-w-xs mx-auto">
                <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-center">
                  {qrImageUrl ? (
                    <img src={qrImageUrl} alt="Pet Emergency QR" className="w-full h-full object-contain" />
                  ) : (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  )}
                </div>
                <div className="mt-4">
                  <h4 className="font-extrabold text-base text-gray-900">{pet.name}</h4>
                  <p className="text-xs text-gray-500 font-medium">PetCare Digital Emergency Passport</p>
                  <p className="text-[10px] text-gray-400 mt-1 font-mono">{qrToken?.substring(0, 16)}...</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-gray-700 font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Đã sao chép link!' : 'Sao chép link cứu hộ'}
              </button>
              {publicEmergencyUrl && (
                <a
                  href={publicEmergencyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <ExternalLink className="w-4 h-4" /> Xem trước
                </a>
              )}
            </div>
          </div>

          {/* Lost Reports Received */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Thông tin báo tin tìm thấy ({lostReports.length})</h3>
                <p className="text-xs text-gray-500">Các tin nhắn gửi từ người dân khi quét mã QR</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3">
              {lostReports.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ShieldAlert className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-semibold text-gray-600">Chưa có thông báo tìm thấy nào</p>
                  <p className="text-xs text-gray-400 mt-0.5">Khi có người quét thẻ và gửi vị trí, thông báo sẽ hiển thị ở đây.</p>
                </div>
              ) : (
                lostReports.map((report) => (
                  <div key={report.id} className="bg-slate-50 border border-gray-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Tin báo mới
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(report.created_at).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      {report.contact_phone && (
                        <div className="flex items-center gap-2 font-bold text-gray-900">
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                          <span>SĐT người tìm thấy: <a href={`tel:${report.contact_phone}`} className="text-blue-600 underline">{report.contact_phone}</a></span>
                        </div>
                      )}
                      {report.contact_email && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail className="w-3.5 h-3.5 text-gray-500" />
                          <span>Email: {report.contact_email}</span>
                        </div>
                      )}
                      {report.last_seen_location && (
                        <div className="flex items-center gap-2 text-gray-800 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-red-500" />
                          <span>Vị trí: {report.last_seen_location}</span>
                        </div>
                      )}
                    </div>

                    {report.message && (
                      <div className="bg-white p-2.5 rounded-xl border border-gray-100 text-xs text-gray-700 italic">
                        &quot;{report.message}&quot;
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
