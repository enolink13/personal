import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Link } from '../../lib/router';
import { DashboardStats, Post } from '../../types';
import {
  FileText,
  Sparkles,
  Image as ImageIcon,
  FolderGit2,
  CheckCircle2,
  Clock,
  Archive,
  ArrowRight,
  ExternalLink,
  Plus,
  Cpu,
  Mail,
  Activity,
  AlertTriangle,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<{
    stats: DashboardStats;
    recent_posts: Post[];
    recent_activities: any[];
    gemini_status: { connected: boolean; model: string };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getDashboardStats();
        setData(res);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !data) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-zinc-500 text-sm">Menyiapkan dashboard aktual...</p>
      </div>
    );
  }

  const { stats, recent_posts, recent_activities, gemini_status } = data;

  return (
    <div className="space-y-8">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 tracking-tight">
            Dashboard Administrator
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Ringkasan data aktual, aktivitas terbaru, dan pusat kendali publikasi editorial.
          </p>
        </div>

        {/* Gemini Service Status Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 ${
              gemini_status.connected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>
              Gemini AI ({gemini_status.model}):{' '}
              <strong>{gemini_status.connected ? 'Terhubung' : 'Kunci Belum Dikonfigurasi'}</strong>
            </span>
          </div>
        </div>
      </div>

      {!gemini_status.connected && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Kunci API Gemini Belum Ditemukan di Environment Server</p>
            <p className="text-amber-800 leading-relaxed">
              Untuk mengaktifkan asisten AI Photo-to-Story di backend, pastikan variabel <code>GEMINI_API_KEY</code> telah diset di panel Secrets atau file <code>.env</code>. Seluruh fungsi penulisan manual tetap bekerja normal 100%.
            </p>
          </div>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Link
          to="/admin/artikel/baru"
          className="p-3.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" /> Buat Artikel
        </Link>
        <Link
          to="/admin/ai-studio"
          className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 transition-colors flex items-center justify-center gap-2 text-xs font-semibold shadow-xs"
        >
          <Sparkles className="w-4 h-4" /> Narasi AI
        </Link>
        <Link
          to="/admin/media"
          className="p-3.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 text-xs font-semibold shadow-xs"
        >
          <ImageIcon className="w-4 h-4" /> Unggah Foto
        </Link>
        <Link
          to="/admin/portofolio"
          className="p-3.5 rounded-xl bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2 text-xs font-semibold"
        >
          <FolderGit2 className="w-4 h-4" /> Portofolio
        </Link>
        <Link
          to="/"
          target="_blank"
          className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2 text-xs font-semibold"
        >
          <ExternalLink className="w-4 h-4" /> Lihat Website
        </Link>
      </div>

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Total Artikel</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-zinc-900">{stats.total_posts}</div>
          <div className="text-[11px] text-zinc-400">Semua status</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Published</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-700">{stats.published_posts}</div>
          <div className="text-[11px] text-zinc-400">Tampil di publik</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Draf Aktif</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-amber-700">{stats.draft_posts}</div>
          <div className="text-[11px] text-zinc-400">Belum dipublikasikan</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Diarsipkan</span>
            <Archive className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-zinc-600">{stats.archived_posts}</div>
          <div className="text-[11px] text-zinc-400">Tidak tampil</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Foto Terverifikasi</span>
            <ImageIcon className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-zinc-900">{stats.total_media}</div>
          <div className="text-[11px] text-zinc-400">Tersimpan di storage</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Portofolio</span>
            <FolderGit2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-zinc-900">{stats.total_portfolios}</div>
          <div className="text-[11px] text-zinc-400">Kegiatan &amp; riset</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Generasi AI</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-zinc-900">{stats.total_ai_generations}</div>
          <div className="text-[11px] text-zinc-400">Catatan generasi narasi</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Pesan Masuk</span>
            <Mail className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-zinc-900">{stats.unread_messages}</div>
          <div className="text-[11px] text-zinc-400">Pesan belum dibaca</div>
        </div>
      </div>

      {/* Grid: Recent Articles & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Articles */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h2 className="font-serif font-bold text-lg text-zinc-900">
              Artikel Terbaru di Database
            </h2>
            <Link
              to="/admin/artikel"
              className="text-xs font-medium text-blue-900 hover:underline flex items-center gap-1"
            >
              Lihat Semua ({stats.total_posts}) &rarr;
            </Link>
          </div>

          {recent_posts.length === 0 ? (
            <p className="text-zinc-500 text-xs py-4 text-center">Belum ada artikel yang tersimpan.</p>
          ) : (
            <div className="divide-y divide-zinc-100">
              {recent_posts.map(post => (
                <div key={post.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-zinc-900 truncate">
                      <Link to={`/admin/artikel/${post.id}`} className="hover:text-blue-900">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Slug: <code className="text-zinc-600">{post.slug}</code>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        post.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : post.status === 'draft'
                          ? 'bg-amber-100 text-amber-800'
                          : post.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      {post.status}
                    </span>
                    <Link
                      to={`/admin/artikel/${post.id}`}
                      className="px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real Audit Logs */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h2 className="font-serif font-bold text-lg text-zinc-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-zinc-500" /> Log Aktivitas Terakhir
            </h2>
          </div>

          {recent_activities.length === 0 ? (
            <p className="text-zinc-400 text-xs py-4 text-center">Belum ada riwayat aktivitas.</p>
          ) : (
            <div className="space-y-3">
              {recent_activities.slice(0, 7).map((act: any) => (
                <div key={act.id} className="text-xs space-y-0.5 border-l-2 border-zinc-200 pl-3">
                  <div className="flex items-center justify-between text-zinc-400 text-[10px]">
                    <span className="font-semibold text-zinc-600">{act.action}</span>
                    <span>{new Date(act.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-zinc-700 leading-tight">{act.details}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
