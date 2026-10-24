import React, { useState } from 'react';
import { Link, useRouter } from '../../lib/router';
import { api, authStorage } from '../../lib/api';
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Image as ImageIcon,
  FolderGit2,
  Tags,
  Settings,
  Mail,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldAlert,
  ClipboardList,
} from 'lucide-react';

export const AdminLayout: React.FC<{ children: React.ReactNode; currentTab?: string }> = ({
  children,
}) => {
  const { path, navigate } = useRouter();
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari CMS?')) {
      await api.logout();
      navigate('/admin/login');
    }
  };

  const navItems = [
    { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
    { label: 'Kelola Artikel', to: '/admin/artikel', icon: FileText },
    { label: 'AI Studio (Photo-to-Story)', to: '/admin/ai-studio', icon: Sparkles, highlight: true },
    { label: 'Media Library', to: '/admin/media', icon: ImageIcon },
    { label: 'Portofolio', to: '/admin/portofolio', icon: FolderGit2 },
    { label: 'Kategori & Tag', to: '/admin/kategori', icon: Tags },
    { label: 'Pengaturan Halaman', to: '/admin/pengaturan', icon: Settings },
    { label: 'Pesan Masuk', to: '/admin/pesan', icon: Mail },
    { label: 'Log Aktivitas', to: '/admin/audit-logs', icon: ClipboardList },
  ];

  const isActive = (to: string) => {
    if (to === '/admin') return path === '/admin';
    return path.startsWith(to);
  };

  return (
    <div className="min-h-screen bg-zinc-100/70 text-zinc-900 flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <header className="md:hidden bg-zinc-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-blue-600 text-white font-serif font-bold text-sm flex items-center justify-center">
            A
          </div>
          <span className="font-serif font-bold text-sm">CMS Aksara &amp; Lensa</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/" target="_blank" className="p-1.5 text-zinc-300 hover:text-white" title="Lihat Website">
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setMobileSidebar(!mobileSidebar)}
            className="p-1.5 text-zinc-300 hover:text-white"
          >
            {mobileSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar Desktop & Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-zinc-900 text-zinc-300 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static shrink-0 flex flex-col justify-between ${
          mobileSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo & Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-blue-600 text-white font-serif font-bold text-base flex items-center justify-center shadow-sm">
                A
              </div>
              <div>
                <span className="font-serif font-bold text-white text-base block leading-tight">
                  CMS Aksara
                </span>
                <span className="text-[10px] text-zinc-400 tracking-wider uppercase font-semibold">
                  Admin Workspace
                </span>
              </div>
            </Link>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-1">
            {navItems.map(item => {
              const active = isActive(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileSidebar(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : item.highlight
                      ? 'text-amber-300 hover:bg-zinc-800 hover:text-amber-200'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${item.highlight && !active ? 'text-amber-400' : ''}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-zinc-800 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" /> Lihat Website Publik
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Keluar Sesi Admin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">{children}</div>
      </main>

      {/* Backdrop for mobile */}
      {mobileSidebar && (
        <div
          onClick={() => setMobileSidebar(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}
    </div>
  );
};
