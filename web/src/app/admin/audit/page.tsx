'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ShieldCheck, Search, Filter, Clock, User, 
  Terminal, RefreshCw, FileText, AlertCircle 
} from 'lucide-react';

export default function AdminAuditPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/audit-logs');
      setLogs(res.data || []);
    } catch (err) {
      console.error("Lỗi lấy nhật ký audit:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchLogs();
  }, [authLoading]);

  const filteredLogs = logs.filter(l => {
    const actionMatch = (l.action || '').toLowerCase().includes(search.toLowerCase());
    const detailsMatch = typeof l.details === 'string' 
      ? l.details.toLowerCase().includes(search.toLowerCase()) 
      : JSON.stringify(l.details || {}).toLowerCase().includes(search.toLowerCase());
    return actionMatch || detailsMatch;
  });

  if (loading || authLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Nhật ký Hệ thống (Audit Logs)</h1>
          <p className="text-sm text-gray-500 mt-1">Ghi nhận các tác vụ bảo mật, chuyển quyền sở hữu và thay đổi cấu hình</p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition shadow-xs flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4 text-primary" />
          Làm mới
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center gap-3 shadow-xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm theo hành động (Action) hoặc chi tiết..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>
        <span className="text-xs text-gray-400">
          Hiển thị {filteredLogs.length} sự kiện gần nhất
        </span>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/80 text-xs uppercase font-bold text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Hành động</th>
                <th className="px-6 py-4">Người thực hiện (User ID)</th>
                <th className="px-6 py-4">Chi tiết sự kiện</th>
                <th className="px-6 py-4 text-right">Xem log JSON</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-sans">
                    <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    Chưa có sự kiện audit nào được ghi nhận
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition">
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(log.created_at).toLocaleString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md font-bold text-[11px] ${
                        log.action?.includes('TRANSFER')
                          ? 'bg-amber-100 text-amber-800'
                          : log.action?.includes('DELETE') || log.action?.includes('CANCEL')
                          ? 'bg-red-100 text-red-800'
                          : log.action?.includes('CREATE')
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {log.user_id ? log.user_id.substring(0, 8) + '...' : 'SYSTEM / CRON'}
                    </td>
                    <td className="px-6 py-4 font-sans text-gray-800 max-w-xs truncate">
                      {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '—')}
                    </td>
                    <td className="px-6 py-4 text-right font-sans">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg transition"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Viewer Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">Chi tiết Audit Log</h2>
              <span className="text-xs font-mono font-bold px-2.5 py-1 bg-gray-100 rounded-md text-gray-700">
                {selectedLog.action}
              </span>
            </div>
            
            <p className="text-xs text-gray-500 mb-3">
              Thời gian: {new Date(selectedLog.created_at).toLocaleString('vi-VN')}
            </p>

            <div className="bg-gray-900 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-80">
              <pre>{JSON.stringify(selectedLog, null, 2)}</pre>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
