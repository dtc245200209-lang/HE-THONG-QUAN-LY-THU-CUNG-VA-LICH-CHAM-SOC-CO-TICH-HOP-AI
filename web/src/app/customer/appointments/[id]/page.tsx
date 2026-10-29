'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { 
  Calendar, Clock, MapPin, User, Stethoscope, ArrowLeft, 
  XCircle, Wifi, WifiOff, Camera, HeartPulse, FileText, 
  Sparkles, CheckCircle2, ShieldCheck, Activity, CreditCard,
  QrCode, ExternalLink, Copy, Video, Check
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { loading: authLoading } = useAuth();
  
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Payment State
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'VIETQR' | 'MOMO' | 'VNPAY'>('VIETQR');
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Live Care Session State
  const [careSession, setCareSession] = useState<any>(null);
  const [careEvents, setCareEvents] = useState<any[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchPayments = async () => {
    try {
      const res = await api.get('/api/v1/payments');
      const apptPayments = res.data.filter((p: any) => p.appointment_id === id);
      setPayments(apptPayments);
    } catch (e) {
      console.error('Failed to load payments', e);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    const fetchAppointment = async () => {
      try {
        const response = await api.get(`/api/v1/appointments/${id}`);
        setAppointment(response.data);
        fetchPayments();

        // Check if there is an active/completed care session
        try {
          const sessionRes = await api.get(`/api/v1/care-sessions/appointment/${id}`);
          if (sessionRes.data) {
            setCareSession(sessionRes.data);
            if (sessionRes.data.events) {
              setCareEvents(sessionRes.data.events);
            }
          }
        } catch {
          // No session yet
        }
      } catch (err: any) {
        console.error("Failed to fetch appointment:", err);
        setError("Không tìm thấy thông tin lịch hẹn hoặc bạn không có quyền truy cập.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [id, authLoading]);

  // Connect WebSocket to Care Session when available
  useEffect(() => {
    if (!careSession?.id) return;

    const wsHost = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8001/api/v1/ws';
    const socket = new WebSocket(`${wsHost}/care-sessions/${careSession.id}`);
    wsRef.current = socket;

    socket.onopen = () => {
      setWsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'NEW_CARE_EVENT' && data.event) {
          setCareEvents((prev) => {
            if (prev.some((e) => e.id === data.event.id)) return prev;
            return [data.event, ...prev];
          });
        } else if (data.type === 'SESSION_COMPLETED') {
          setCareSession((prev: any) => ({ ...prev, status: 'COMPLETED' }));
          setAppointment((prev: any) => ({ ...prev, status: 'COMPLETED' }));
        }
      } catch (err) {
        console.error("Error reading live WS event:", err);
      }
    };

    socket.onclose = () => {
      setWsConnected(false);
    };

    return () => {
      socket.close();
    };
  }, [careSession?.id]);

  const handleCancel = async () => {
    if (!confirm("Bạn có chắc chắn muốn hủy lịch hẹn này?")) return;
    
    setCancelLoading(true);
    try {
      await api.put(`/api/v1/appointments/${id}/status`, { status: "CANCELLED" });
      setAppointment((prev: any) => ({ ...prev, status: "CANCELLED" }));
    } catch (err: any) {
      alert("Lỗi khi hủy lịch hẹn. " + (err.response?.data?.detail || ""));
    } finally {
      setCancelLoading(false);
    }
  };

  const handleOpenPayment = async (method: 'VIETQR' | 'MOMO' | 'VNPAY' = 'VIETQR') => {
    setPaymentMethod(method);
    setPaymentModalOpen(true);
    setCheckoutLoading(true);
    try {
      const res = await api.post('/api/v1/payments/checkout-session', {
        appointment_id: id,
        amount: appointment?.total_price || 200000,
        method: method
      });
      setCheckoutData(res.data);
    } catch (err: any) {
      alert("Không thể khởi tạo cổng thanh toán: " + (err.response?.data?.detail || "Lỗi kết nối"));
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleConfirmOnline = async () => {
    if (!checkoutData?.payment_id) return;
    setConfirmingPayment(true);
    try {
      await api.post(`/api/v1/payments/${checkoutData.payment_id}/confirm-online`);
      alert("Thanh toán trực tuyến thành công! Lịch hẹn của bạn đã được xác nhận.");
      setPaymentModalOpen(false);
      const response = await api.get(`/api/v1/appointments/${id}`);
      setAppointment(response.data);
      fetchPayments();
    } catch (err: any) {
      alert("Lỗi khi xác nhận thanh toán: " + (err.response?.data?.detail || ""));
    } finally {
      setConfirmingPayment(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isPaid = payments.some((p: any) => p.status === 'COMPLETED' || p.status === 'PAID');

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      PENDING: { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-700' },
      CONFIRMED: { label: 'Đã xác nhận', className: 'bg-blue-100 text-blue-700' },
      CHECKED_IN: { label: 'Đã đến', className: 'bg-purple-100 text-purple-700' },
      IN_PROGRESS: { label: 'Đang chăm sóc trực tiếp', className: 'bg-indigo-100 text-indigo-700 animate-pulse' },
      COMPLETED: { label: 'Hoàn thành', className: 'bg-green-100 text-green-700' },
      CANCELLED: { label: 'Đã hủy', className: 'bg-red-100 text-red-700' },
    };
    
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
    return <span className={`px-3 py-1 text-xs font-bold rounded-full ${config.className}`}>{config.label}</span>;
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy dữ liệu</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link href="/customer/appointments" className="text-primary hover:underline font-medium">
          &larr; Quay lại danh sách lịch hẹn
        </Link>
      </div>
    );
  }

  const isCancellable = appointment.status === 'PENDING' || appointment.status === 'CONFIRMED';
  const isInProgressOrDone = appointment.status === 'IN_PROGRESS' || appointment.status === 'COMPLETED' || careSession;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <header className="bg-white border-b border-gray-100 mb-8 sticky top-0 z-20 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="font-bold text-lg text-gray-900">Chi Tiết Lịch Hẹn</span>
          </div>

          {careSession && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              wsConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600'
            }`}>
              {wsConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Cập nhật trực tiếp</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Ngoại tuyến</span>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 space-y-6">
        
        {/* Main Appointment Summary Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Lịch hẹn của {appointment.pet?.name || 'Thú cưng'}
              </h1>
              <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                <span>Mã lịch hẹn:</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                  #APPT-{appointment.id.replace(/-/g, '').substring(0, 8).toUpperCase()}
                </span>
              </p>
            </div>
            <div>
              {getStatusBadge(appointment.status)}
            </div>
          </div>

          {/* Info Grid */}
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Thời gian & Địa điểm</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-900">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="font-medium">{new Date(appointment.scheduled_time).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-900">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="font-medium">{new Date(appointment.scheduled_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-900">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>PetCare Center, 123 Đường ABC</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Chuyên viên phụ trách</h3>
                <div className="flex items-center gap-3 text-gray-900">
                  <Stethoscope className="w-5 h-5 text-primary" />
                  <span>{appointment.caregiver ? (appointment.caregiver.full_name || appointment.caregiver.email) : 'Chuyên viên PetCare'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Dịch vụ đã chọn</h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                {appointment.services?.map((svc: any) => (
                  <div key={svc.service?.id || svc.id} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-900">{svc.service?.name || 'Dịch vụ chăm sóc'}</span>
                    <span className="text-primary font-semibold">{svc.price_at_booking?.toLocaleString('vi-VN')} ₫</span>
                  </div>
                ))}
                
                <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Tổng cộng</span>
                  <span className="font-bold text-primary text-lg">{appointment.total_price?.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>
              
              {appointment.notes && (
                <div className="mt-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Ghi chú của bạn</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-xl text-sm border border-gray-100">{appointment.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {isPaid ? (
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Đã thanh toán ({payments[0]?.payment_method || 'Online'})</span>
                </div>
              ) : appointment.status !== 'CANCELLED' ? (
                <button 
                  onClick={() => handleOpenPayment('VIETQR')}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-xs transition text-sm cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Thanh toán VietQR / MoMo</span>
                </button>
              ) : null}

              {/* Video Call button */}
              {appointment.status !== 'CANCELLED' && (
                <Link
                  href={`/customer/telehealth/${appointment.id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-xs transition text-sm cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>Khám từ xa (Video Call)</span>
                </Link>
              )}
            </div>

            {isCancellable && (
              <button 
                onClick={handleCancel}
                disabled={cancelLoading}
                className="flex items-center gap-2 px-4 py-2 text-red-600 font-medium bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50 text-sm ml-auto"
              >
                <XCircle className="w-4 h-4" />
                {cancelLoading ? 'Đang hủy...' : 'Hủy lịch hẹn'}
              </button>
            )}
          </div>
        </div>

        {/* Live Care Updates Section (WebSockets) */}
        {isInProgressOrDone && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    Nhật ký chăm sóc trực tiếp (Live Care)
                    {appointment.status === 'IN_PROGRESS' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-600 animate-pulse">
                        LIVE
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Cập nhật thời gian thực từ chuyên viên chăm sóc cho {appointment.pet?.name || 'thú cưng'}
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {careEvents.length} cập nhật
              </span>
            </div>

            {careEvents.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-gray-200">
                <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">Chưa có cập nhật mới</p>
                <p className="text-xs text-gray-400 mt-0.5">Người chăm sóc sẽ sớm đăng tải hình ảnh và nhật ký hoạt động.</p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100">
                {careEvents.map((ev, index) => (
                  <div key={ev.id || index} className="relative group">
                    <div className="absolute -left-[27px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center shadow-xs">
                      {ev.event_type === 'PHOTO' ? (
                        <Camera className="w-3 h-3 text-indigo-600" />
                      ) : ev.event_type === 'VITALS_UPDATE' ? (
                        <HeartPulse className="w-3 h-3 text-red-500" />
                      ) : (
                        <FileText className="w-3 h-3 text-indigo-600" />
                      )}
                    </div>

                    <div className="bg-slate-50 border border-gray-100 rounded-xl p-4 transition hover:bg-slate-100/80">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          ev.event_type === 'PHOTO' 
                            ? 'bg-blue-100 text-blue-700'
                            : ev.event_type === 'VITALS_UPDATE'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {ev.event_type === 'PHOTO' ? 'Hình ảnh thực tế' : ev.event_type === 'VITALS_UPDATE' ? 'Chỉ số sức khỏe' : 'Ghi chú'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(ev.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-sm text-gray-800 font-medium">
                        {ev.content}
                      </p>

                      {ev.media_url && (
                        <div className="mt-3 rounded-xl overflow-hidden max-w-sm border border-gray-200 shadow-xs">
                          <img src={ev.media_url} alt="Care update" className="w-full h-auto object-cover max-h-72" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* AI Care Report if completed */}
            {careSession?.report && (
              <div className="mt-8 pt-6 border-t border-gray-100 bg-gradient-to-br from-indigo-50/60 to-purple-50/60 rounded-2xl p-6 border border-indigo-100">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Báo Cáo Tổng Kết Chăm Sóc (AI Care Report)</h3>
                    <p className="text-xs text-gray-500">Được tạo tự động và xác thực bởi chuyên viên PetCare</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <h4 className="font-semibold text-gray-900 text-xs uppercase tracking-wider mb-1 text-indigo-600">Tổng kết ca chăm sóc:</h4>
                    <p className="text-gray-700 leading-relaxed">{careSession.report.summary}</p>
                  </div>

                  {careSession.report.recommendations && (
                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                      <h4 className="font-semibold text-gray-900 text-xs uppercase tracking-wider mb-1 text-emerald-600">Khuyến nghị cho chủ nuôi:</h4>
                      <p className="text-gray-700 leading-relaxed">{careSession.report.recommendations}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Online Payment Modal */}
        {paymentModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Thanh Toán Trực Tuyến
                  </h3>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Hỗ trợ VietQR Napas247, Ví MoMo và Cổng VNPay
                  </p>
                </div>
                <button 
                  onClick={() => setPaymentModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
                >
                  &times;
                </button>
              </div>

              {/* Method Switcher */}
              <div className="flex border-b border-gray-100 bg-gray-50/70 p-2 gap-2">
                <button
                  onClick={() => handleOpenPayment('VIETQR')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethod === 'VIETQR' 
                      ? 'bg-white text-emerald-700 shadow-xs border border-gray-200' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                  VietQR (Napas247)
                </button>
                <button
                  onClick={() => handleOpenPayment('MOMO')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethod === 'MOMO' 
                      ? 'bg-white text-pink-700 shadow-xs border border-gray-200' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                  Ví MoMo
                </button>
                <button
                  onClick={() => handleOpenPayment('VNPAY')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethod === 'VNPAY' 
                      ? 'bg-white text-blue-700 shadow-xs border border-gray-200' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  Cổng VNPAY
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {checkoutLoading ? (
                  <div className="py-16 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-3"></div>
                    <p className="text-sm font-semibold text-gray-700">Đang khởi tạo phiên thanh toán...</p>
                  </div>
                ) : paymentMethod === 'VIETQR' ? (
                  <div className="space-y-4">
                    {checkoutData?.qr_code_url && (
                      <div className="flex flex-col items-center p-3 bg-slate-50 rounded-2xl border border-gray-200">
                        <img 
                          src={checkoutData.qr_code_url} 
                          alt="VietQR Napas247" 
                          className="w-56 h-auto rounded-xl shadow-xs"
                        />
                        <span className="text-[11px] text-gray-500 mt-2 font-medium">
                          Mở app Ngân hàng bất kỳ & quét mã QR để chuyển khoản
                        </span>
                      </div>
                    )}

                    <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-xs border border-gray-100">
                      <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                        <span className="text-gray-500">Ngân hàng:</span>
                        <span className="font-bold text-gray-900">{checkoutData?.bank_info?.bank_name}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                        <span className="text-gray-500">Số tài khoản:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gray-900">{checkoutData?.bank_info?.account_no}</span>
                          <button 
                            onClick={() => copyToClipboard(checkoutData?.bank_info?.account_no, 'account_no')}
                            className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-800"
                            title="Sao chép STK"
                          >
                            {copiedField === 'account_no' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                        <span className="text-gray-500">Chủ tài khoản:</span>
                        <span className="font-bold text-gray-900">{checkoutData?.bank_info?.account_name}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                        <span className="text-gray-500">Số tiền:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-700 text-sm">{checkoutData?.amount?.toLocaleString('vi-VN')} ₫</span>
                          <button 
                            onClick={() => copyToClipboard(String(checkoutData?.amount), 'amount')}
                            className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-800"
                            title="Sao chép số tiền"
                          >
                            {copiedField === 'amount' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-gray-500">Nội dung CK:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{checkoutData?.bank_info?.transfer_content}</span>
                          <button 
                            onClick={() => copyToClipboard(checkoutData?.bank_info?.transfer_content, 'content')}
                            className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-800"
                            title="Sao chép nội dung"
                          >
                            {copiedField === 'content' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleConfirmOnline}
                      disabled={confirmingPayment}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {confirmingPayment ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>{confirmingPayment ? 'Đang xác nhận...' : 'Tôi đã chuyển khoản thành công'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 py-4 text-center">
                    <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-gray-100">
                      <CreditCard className="w-8 h-8 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">
                        {paymentMethod === 'MOMO' ? 'Cổng thanh toán MoMo' : 'Cổng thanh toán VNPay Sandbox'}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Số tiền thanh toán: <span className="font-bold text-emerald-700 text-sm">{checkoutData?.amount?.toLocaleString('vi-VN')} ₫</span>
                      </p>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-2xl text-xs text-amber-800 border border-amber-200 text-left">
                      💡 Môi trường Sandbox thử nghiệm: Bạn có thể nhấn nút bên dưới để xác nhận thanh toán trực tuyến tức thời cho lịch hẹn này.
                    </div>

                    <button
                      onClick={handleConfirmOnline}
                      disabled={confirmingPayment}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {confirmingPayment ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>{confirmingPayment ? 'Đang xử lý...' : 'Xác nhận thanh toán ngay'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
