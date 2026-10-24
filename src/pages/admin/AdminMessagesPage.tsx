import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Mail, Check, Clock, User } from 'lucide-react';

export const AdminMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await api.getContactMessages();
      setMessages(data || []);
    } catch (err) {
      console.error('Failed to load contact messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markContactMessageRead(id);
      loadMessages();
    } catch (err: any) {
      alert(`Gagal menandai pesan: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-zinc-900 tracking-tight">
          Pesan Masuk dari Formulir Kontak
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Daftar pesan langsung yang dikirim oleh pengunjung melalui halaman /kontak.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-zinc-500 text-xs">Memuat pesan...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm space-y-2">
            <Mail className="w-8 h-8 text-zinc-300 mx-auto" />
            <p>Belum ada pesan masuk.</p>
          </div>
        ) : (
          <div className="space-y-4 divide-y divide-zinc-100">
            {messages.map(msg => (
              <div key={msg.id} className="pt-4 first:pt-0 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-900 text-sm">{msg.name}</span>
                    <span className="text-blue-900">&lt;{msg.email}&gt;</span>
                    {!msg.is_read && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                        Pesan Baru
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(msg.created_at).toLocaleString('id-ID')}
                    </span>
                    {!msg.is_read && (
                      <button
                        onClick={() => handleMarkRead(msg.id)}
                        className="px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium cursor-pointer"
                      >
                        Tandai Dibaca
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-xs font-semibold text-zinc-800">
                  Subjek: {msg.subject}
                </div>

                <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-sans bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                  {msg.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
