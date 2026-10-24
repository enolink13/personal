import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { ClipboardList, Clock, ShieldCheck, User } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getAuditLogs();
        setLogs(data || []);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-zinc-900 tracking-tight">
          Log Audit &amp; Rekam Jejak Sistem
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Catatan kronologis seluruh aksi penting (pembuatan artikel, publikasi, upload media, generasi AI, pergantian kata sandi).
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-zinc-500 text-xs">Memuat rekam jejak sistem...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm">
            Belum ada log audit.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 text-xs">
            {logs.map(log => (
              <div key={log.id} className="p-4 hover:bg-zinc-50/50 transition-colors space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-zinc-100 text-zinc-800">
                      {log.action}
                    </span>
                    <span className="text-zinc-500">entitas: {log.entity_type}</span>
                  </div>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(log.created_at).toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-zinc-800 font-medium pt-0.5">{log.details}</p>
                {log.ip && <p className="text-[10px] text-zinc-400 font-mono">IP: {log.ip}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
