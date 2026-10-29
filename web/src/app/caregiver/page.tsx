'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calendar, Activity, CheckCircle, Clock, HeartPulse } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function CaregiverDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    assigned: 0,
    in_progress: 0,
    completed: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apptsRes = await api.get('/api/v1/appointments');
        const appts = apptsRes.data;
        setStats({
          assigned: appts.filter((a: any) => a.status === 'CONFIRMED' || a.status === 'CHECKED_IN').length,
          in_progress: appts.filter((a: any) => a.status === 'IN_PROGRESS').length,
          completed: appts.filter((a: any) => a.status === 'COMPLETED').length,
        });
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Xin chào, Điều dưỡng {user?.full_name || 'Chăm Sóc'} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Tổng quan công việc và các ca chăm sóc được phân công hôm nay.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Ca chờ thực hiện', value: stats.assigned, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { title: 'Đang chăm sóc', value: stats.in_progress, icon: HeartPulse, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { title: 'Đã hoàn thành', value: stats.completed, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 flex flex-col gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/caregiver/sessions" className="block group">
          <div className="glass-panel p-8 rounded-3xl h-full transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-indigo-500/20">
            <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-400 rounded-2xl flex items-center justify-center shadow-lg mb-6">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Quản lý Ca chăm sóc</h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
              Xem danh sách lịch hẹn được phân công, đọc AI Care Brief, cập nhật quá trình (Live Tracking) và viết báo cáo hoàn thành.
            </p>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold group-hover:translate-x-1 inline-block transition-transform">
              Mở ca chăm sóc &rarr;
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
