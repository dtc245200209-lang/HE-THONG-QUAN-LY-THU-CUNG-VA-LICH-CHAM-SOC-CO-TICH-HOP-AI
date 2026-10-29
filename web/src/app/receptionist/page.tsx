'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Activity, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function ReceptionistDashboard() {
  const [stats, setStats] = useState({
    appointments: 0,
    customers: 0,
    pending: 0,
    completed: 0
  });

  useEffect(() => {
    // In a real app we'd fetch this from a `/api/v1/stats` endpoint
    // For now we'll mock the data fetching or fetch the lists and count
    const fetchData = async () => {
      try {
        const [apptsRes, usersRes] = await Promise.all([
          api.get('/api/v1/appointments'),
          api.get('/api/v1/users')
        ]);
        
        const appts = apptsRes.data;
        setStats({
          appointments: appts.length,
          customers: usersRes.data.filter((u: any) => u.roles.some((r: any) => r.name === 'CUSTOMER')).length,
          pending: appts.filter((a: any) => a.status === 'PENDING').length,
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Bàn làm việc Lễ tân</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Tổng quan hoạt động phòng khám hôm nay.</p>
        </div>
        <Link href="/receptionist/appointments" className="glass bg-primary/90 hover:bg-primary text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-blue-500/30">
          + Tạo lịch hẹn mới
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Tổng lịch hẹn', value: stats.appointments, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { title: 'Chờ xử lý', value: stats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { title: 'Đã hoàn thành', value: stats.completed, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
          { title: 'Khách hàng', value: stats.customers, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
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
        <Link href="/receptionist/appointments" className="block group">
          <div className="glass-panel p-8 rounded-3xl h-full transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-blue-500/20">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg mb-6">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Quản lý Lịch hẹn</h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
              Xem lịch hẹn hôm nay, check-in thú cưng khi khách đến và phân công cho Bác sĩ/Người chăm sóc phù hợp.
            </p>
            <span className="text-primary dark:text-blue-400 font-semibold group-hover:translate-x-1 inline-block transition-transform">
              Truy cập quản lý lịch hẹn &rarr;
            </span>
          </div>
        </Link>

        <Link href="/receptionist/customers" className="block group">
          <div className="glass-panel p-8 rounded-3xl h-full transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-purple-500/20">
            <div className="w-14 h-14 bg-gradient-to-tr from-purple-500 to-pink-400 rounded-2xl flex items-center justify-center shadow-lg mb-6">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Quản lý Khách hàng</h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
              Tạo hồ sơ khách hàng mới, thêm thú cưng và xem lịch sử khám/chăm sóc (Digital Pet Passport) của từng thú cưng.
            </p>
            <span className="text-purple-600 dark:text-purple-400 font-semibold group-hover:translate-x-1 inline-block transition-transform">
              Truy cập hồ sơ khách hàng &rarr;
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
