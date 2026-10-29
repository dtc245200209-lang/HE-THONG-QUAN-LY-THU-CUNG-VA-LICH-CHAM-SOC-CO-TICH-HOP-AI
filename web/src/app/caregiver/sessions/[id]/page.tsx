'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, Clock, Activity, Camera, FileText, Send, 
  Brain, CheckCircle2, ShieldAlert, Sparkles, RefreshCw,
  HeartPulse, AlertCircle, Wifi, WifiOff, Check
} from 'lucide-react';
import Link from 'next/link';

interface CareEvent {
  id: string;
  session_id: string;
  event_type: 'TEXT' | 'PHOTO' | 'VIDEO' | 'VITALS_UPDATE' | 'SYSTEM';
  content: string;
  media_url?: string | null;
  timestamp: string;
}

export default function CaregiverSessionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [session, setSession] = useState<any>(null);
  const [appointment, setAppointment] = useState<any>(null);
  const [events, setEvents] = useState<CareEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // WebSocket state
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // New Event Form State
  const [eventType, setEventType] = useState<'TEXT' | 'PHOTO' | 'VITALS_UPDATE'>('TEXT');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [submittingEvent, setSubmittingEvent] = useState(false);

  // AI Brief
  const [brief, setBrief] = useState<string | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);

  // AI Care Report State
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportDraft, setReportDraft] = useState<{ summary: string; recommendations: string; metrics: any } | null>(null);
  const [confirmingReport, setConfirmingReport] = useState(false);

  const fetchCareBrief = async (petId: string) => {
    setBriefLoading(true);
    try {
      const res = await api.get(`/api/v1/care-sessions/brief/${petId}`);
      setBrief(res.data.brief);
    } catch {
      setBrief("Không có tóm tắt đặc biệt từ AI.");
    } finally {
      setBriefLoading(false);
    }
  };

  // Fetch initial session & appointment data
  useEffect(() => {
    if (authLoading) return;
    const fetchSessionData = async () => {
      try {
        setLoading(true);
        // id might be session_id or appointment_id
        let sessionRes;
        try {
          sessionRes = await api.get(`/api/v1/care-sessions/${id}`);
        } catch {
          sessionRes = await api.get(`/api/v1/care-sessions/appointment/${id}`);
        }
        
        const sessData = sessionRes.data;
        setSession(sessData);
        if (sessData.events) {
          setEvents(sessData.events);
        }

        // Fetch appointment details
        if (sessData.appointment_id) {
          const apptRes = await api.get(`/api/v1/appointments/${sessData.appointment_id}`);
          setAppointment(apptRes.data);
          
          // Fetch AI care brief if pet_id exists
          if (apptRes.data?.pet_id) {
            fetchCareBrief(apptRes.data.pet_id);
          }
        }
      } catch (err: any) {
        console.error("Lỗi khi tải phiên chăm sóc:", err);
        setError("Không thể tải thông tin ca chăm sóc.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [id, authLoading]);

  // Connect WebSocket
  useEffect(() => {
    if (!session?.id) return;

    const wsHost = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8001/api/v1/ws';
    const socket = new WebSocket(`${wsHost}/care-sessions/${session.id}`);
    wsRef.current = socket;

    socket.onopen = () => {
      setWsConnected(true);
      console.log("WebSocket connected to session room:", session.id);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'NEW_CARE_EVENT' && data.event) {
          setEvents((prev) => {
            if (prev.some((e) => e.id === data.event.id)) return prev;
            return [data.event, ...prev];
          });
        } else if (data.type === 'SESSION_COMPLETED') {
          setSession((prev: any) => ({ ...prev, status: 'COMPLETED', ended_at: data.ended_at }));
        }
      } catch (e) {
        console.error("Error parsing WebSocket message:", e);
      }
    };

    socket.onclose = () => {
      setWsConnected(false);
    };

    return () => {
      socket.close();
    };
  }, [session?.id]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !mediaUrl.trim()) return;

    setSubmittingEvent(true);
    try {
      const payload: any = {
        event_type: eventType,
        content: content.trim(),
        media_url: mediaUrl.trim() || undefined,
      };

      const res = await api.post(`/api/v1/care-sessions/${session.id}/events`, payload);
      // If WebSocket already appended it, prevent duplicate
      setEvents((prev) => {
        if (prev.some((item) => item.id === res.data.id)) return prev;
        return [res.data, ...prev];
      });

      setContent('');
      setMediaUrl('');
    } catch (err: any) {
      alert("Lỗi khi thêm sự kiện chăm sóc: " + (err.response?.data?.detail || err.message));
    } finally {
      setSubmittingEvent(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!session?.id) return;
    setGeneratingReport(true);
    try {
      const res = await api.post(`/api/v1/care-sessions/${session.id}/report/generate`, {
        events_count: events.length,
        notes: events.map(e => e.content).join("\n")
      });
      setReportDraft({
        summary: res.data.summary || "Ca chăm sóc diễn ra thuận lợi, thú cưng vui vẻ và hợp tác tốt.",
        recommendations: res.data.recommendations || "Cho uống đủ nước, nghỉ ngơi sau buổi chăm sóc.",
        metrics: res.data.metrics || { mood: "Happy", appetite: "Good" }
      });
    } catch (err: any) {
      alert("Lỗi khi tạo báo cáo AI: " + (err.response?.data?.detail || err.message));
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleConfirmReport = async () => {
    if (!session?.id || !reportDraft) return;
    setConfirmingReport(true);
    try {
      await api.post(`/api/v1/care-sessions/${session.id}/report/confirm`, {
        summary: reportDraft.summary,
        recommendations: reportDraft.recommendations,
        health_metrics_json: reportDraft.metrics
      });
      setSession((prev: any) => ({ ...prev, status: 'COMPLETED' }));
      alert("Đã lưu báo cáo chăm sóc và hoàn tất ca làm việc thành công!");
    } catch (err: any) {
      alert("Lỗi khi xác nhận báo cáo: " + (err.response?.data?.detail || err.message));
    } finally {
      setConfirmingReport(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">{error || "Không tìm thấy ca chăm sóc"}</h2>
        <Link href="/caregiver/sessions" className="text-indigo-600 hover:underline font-medium">
          &larr; Quay lại danh sách ca làm việc
        </Link>
      </div>
    );
  }

  const isCompleted = session.status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/caregiver/sessions" className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold text-gray-900">
                  Ca chăm sóc thú cưng {appointment?.pet?.name ? `(${appointment.pet.name})` : ''}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isCompleted ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700 animate-pulse'
                }`}>
                  {isCompleted ? 'Đã hoàn thành' : 'Đang diễn ra'}
                </span>
              </div>
              <p className="text-xs text-gray-500">Mã ca: {session.id.split('-')[0]}</p>
            </div>
          </div>

          {/* WebSocket Status Indicator */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              wsConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {wsConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Realtime Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Đang kết nối lại...</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: AI Brief & Add Care Event */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* AI Care Brief Card */}
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-purple-200" />
                </div>
                <h3 className="font-bold text-sm text-purple-100">AI Care Brief</h3>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-white/10 px-2 py-0.5 rounded-full text-purple-200">
                Gợi ý chuyên sâu
              </span>
            </div>
            
            <div className="bg-white/10 rounded-xl p-3.5 text-xs text-purple-100 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap border border-white/10">
              {briefLoading ? (
                <div className="flex items-center justify-center gap-2 py-4">
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-300" />
                  Đang tải hồ sơ AI...
                </div>
              ) : (
                brief || "Không có cảnh báo dị ứng hoặc bệnh lý đặc biệt cho thú cưng này."
              )}
            </div>
          </div>

          {/* Add Care Event Form */}
          {!isCompleted && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4 text-indigo-600" /> Cập nhật sự kiện trực tiếp
              </h3>
              
              <form onSubmit={handleAddEvent} className="space-y-4">
                {/* Event Type selector */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEventType('TEXT')}
                    className={`py-2 px-2 text-xs font-semibold rounded-xl border flex flex-col items-center gap-1 transition ${
                      eventType === 'TEXT' 
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <FileText className="w-4 h-4" /> Ghi chú
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventType('PHOTO')}
                    className={`py-2 px-2 text-xs font-semibold rounded-xl border flex flex-col items-center gap-1 transition ${
                      eventType === 'PHOTO' 
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Camera className="w-4 h-4" /> Hình ảnh
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventType('VITALS_UPDATE')}
                    className={`py-2 px-2 text-xs font-semibold rounded-xl border flex flex-col items-center gap-1 transition ${
                      eventType === 'VITALS_UPDATE' 
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <HeartPulse className="w-4 h-4" /> Chỉ số
                  </button>
                </div>

                {/* Content Input */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {eventType === 'VITALS_UPDATE' ? 'Chỉ số (Nhiệt độ, Nhịp tim, Tình trạng ăn)' : 'Nội dung cập nhật'}
                  </label>
                  <textarea
                    rows={3}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={
                      eventType === 'VITALS_UPDATE'
                        ? 'Ví dụ: Thân nhiệt 38.5°C, nhịp tim 90 bpm, phản xạ tốt...'
                        : eventType === 'PHOTO'
                        ? 'Mô tả hình ảnh: Milo đang được sấy lông và massage...'
                        : 'Nhập ghi chú: Đã cho uống nước và hoàn thành bài vận động...'
                    }
                    className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Media URL Input if PHOTO */}
                {eventType === 'PHOTO' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      URL Hình ảnh chụp thực tế
                    </label>
                    <input
                      type="url"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full text-sm p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingEvent}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {submittingEvent ? 'Đang gửi...' : 'Phát sự kiện (Live Push)'}
                </button>
              </form>
            </div>
          )}

          {/* AI Report Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-purple-600" /> Báo cáo tổng kết ca
              </h3>
            </div>

            {!isCompleted ? (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">
                  Sau khi hoàn thành các bước chăm sóc, hãy sử dụng AI để tự động tổng hợp toàn bộ nhật ký thành báo cáo y tế gửi cho khách hàng.
                </p>

                {!reportDraft ? (
                  <button
                    onClick={handleGenerateReport}
                    disabled={generatingReport}
                    className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-semibold py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    {generatingReport ? 'AI đang phân tích nhật ký...' : 'Tạo Care Report bằng AI'}
                  </button>
                ) : (
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Tóm tắt (Summary):</label>
                      <textarea
                        rows={3}
                        value={reportDraft.summary}
                        onChange={(e) => setReportDraft({ ...reportDraft, summary: e.target.value })}
                        className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Khuyến nghị cho chủ nuôi:</label>
                      <textarea
                        rows={2}
                        value={reportDraft.recommendations}
                        onChange={(e) => setReportDraft({ ...reportDraft, recommendations: e.target.value })}
                        className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={handleConfirmReport}
                      disabled={confirmingReport}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      {confirmingReport ? 'Đang lưu...' : 'Xác nhận & Hoàn tất ca'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-emerald-50 text-emerald-800 rounded-xl p-4 border border-emerald-200 text-xs">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ca chăm sóc đã kết thúc
                </div>
                Báo cáo y tế và dòng sự kiện đã được lưu trữ vĩnh viễn và đồng bộ đến Sổ sức khỏe số của thú cưng.
              </div>
            )}
          </div>

        </div>

        {/* Right column: Live Timeline Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Dòng thời gian trực tiếp (Live Care Timeline)</h2>
                <p className="text-xs text-gray-500 mt-0.5">Tất cả sự kiện phát sóng tức thì đến điện thoại của chủ nuôi</p>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {events.length} cập nhật
              </span>
            </div>

            {events.length === 0 ? (
              <div className="text-center py-16">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-800 mb-1">Chưa có sự kiện nào trong ca</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Hãy thêm ghi chú, hình ảnh hoạt động hoặc chỉ số sinh tồn của thú cưng để bắt đầu phát sóng trực tiếp.
                </p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100">
                {events.map((ev, index) => (
                  <div key={ev.id || index} className="relative group">
                    {/* Timeline bullet */}
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
                          {ev.event_type === 'PHOTO' ? 'Hình ảnh hoạt động' : ev.event_type === 'VITALS_UPDATE' ? 'Chỉ số sinh tồn' : 'Ghi chú chăm sóc'}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(ev.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-800 leading-relaxed font-medium">
                        {ev.content}
                      </p>

                      {ev.media_url && (
                        <div className="mt-3 rounded-xl overflow-hidden max-w-md border border-gray-200">
                          <img src={ev.media_url} alt="Care Event" className="w-full h-auto max-h-80 object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

      </main>
    </div>
  );
}
