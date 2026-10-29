'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Brain, PlayCircle, CheckCircle, Flame, ShieldAlert, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Appointment {
  id: string;
  customer_id: string;
  pet_id: string;
  scheduled_time: string;
  status: string;
}

export default function CaregiverSessionsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [briefLoading, setBriefLoading] = useState(false);
  const [activeBrief, setActiveBrief] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await api.get('/api/v1/appointments');
      setAppointments(res.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFetchBrief = async (petId: string) => {
    setBriefLoading(true);
    setActiveBrief(null);
    try {
      const res = await api.get(`/api/v1/care-sessions/brief/${petId}`);
      setActiveBrief(res.data.brief);
    } catch (error) {
      setActiveBrief("Không thể tải AI Care Brief. Vui lòng thử lại sau.");
    } finally {
      setBriefLoading(false);
    }
  };

  const handleStartSession = async (appointmentId: string) => {
    try {
      await api.post(`/api/v1/care-sessions/${appointmentId}/start`);
      window.location.href = `/caregiver/sessions/${appointmentId}`;
    } catch (error) {
      alert("Lỗi khi bắt đầu");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'CONFIRMED': return 'bg-blue-100 text-primary/90 border-blue-200';
      case 'CHECKED_IN': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'IN_PROGRESS': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Ca chăm sóc của tôi</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Xem lịch làm việc và đọc phân tích AI trước khi bắt đầu ca.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.map((appt) => (
          <div key={appt.id} className="glass-card flex flex-col transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
            <div className="p-6 border-b border-white/20">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <Badge variant="outline" className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(appt.status)}`}>
                  {appt.status}
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {new Date(appt.scheduled_time).toLocaleString('vi-VN', {
                  hour: '2-digit', minute: '2-digit',
                  day: '2-digit', month: '2-digit', year: 'numeric'
                })}
              </h3>
            </div>
            
            <div className="p-6 space-y-4 flex-1">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Khách hàng ID</p>
                  <p className="font-mono font-medium">{appt.customer_id.substring(0, 8)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="w-8 h-8 rounded-full bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center">
                  <PawPrintIcon className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pet ID</p>
                  <p className="font-mono font-medium">{appt.pet_id.substring(0, 8)}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/40 dark:bg-black/20 rounded-b-2xl border-t border-white/20 flex flex-col gap-3">
              <Dialog>
                <DialogTrigger 
                  onClick={() => handleFetchBrief(appt.pet_id)}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
                >
                  <Brain className="w-5 h-5" /> Xem AI Care Brief
                </DialogTrigger>
                <DialogContent className="glass-panel border-white/20 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Brain className="w-6 h-6 text-purple-600" /> 
                      </div>
                      AI Care Brief
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 p-6 glass rounded-2xl min-h-[150px] whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 leading-relaxed border border-white/30">
                    {briefLoading ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-8 text-purple-600 dark:text-purple-400 font-medium">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        AI đang tổng hợp bệnh án và phân tích...
                      </div>
                    ) : (
                      activeBrief
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {(appt.status === 'CHECKED_IN' || appt.status === 'CONFIRMED') && (
                <button 
                  onClick={() => handleStartSession(appt.id)}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <PlayCircle className="w-5 h-5" /> Bắt đầu chăm sóc
                </button>
              )}
              {appt.status === 'IN_PROGRESS' && (
                <div className="flex flex-col gap-2">
                  <a 
                    href={`/caregiver/sessions/${appt.id}`}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all text-center"
                  >
                    <Flame className="w-5 h-5 text-orange-300" /> Vào phòng chăm sóc trực tiếp
                  </a>
                </div>
              )}
              {appt.status === 'COMPLETED' && (
                <button 
                  className="w-full bg-green-100 text-green-700 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-green-200 cursor-not-allowed"
                >
                  <Check className="w-5 h-5" /> Đã hoàn thành
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PawPrintIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="4" r="2" />
      <circle cx="18" cy="8" r="2" />
      <circle cx="20" cy="16" r="2" />
      <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
    </svg>
  )
}
