import React, { useState } from 'react';
import { Link, useRouter } from '../../lib/router';
import { Menu, X, Shield, BookOpen } from 'lucide-react';

export const Navbar: React.FC<{ siteTitle?: string; tagline?: string }> = ({
  siteTitle = 'Aksara & Lensa',
}) => {
  const { path } = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Beranda', to: '/' },
    { label: 'Tentang', to: '/tentang' },
    { label: 'Tulisan', to: '/tulisan' },
    { label: 'Portofolio', to: '/portofolio' },
    { label: 'Galeri', to: '/galeri' },
    { label: 'Kontak', to: '/kontak' },
  ];

  const isActive = (to: string) => {
    if (to === '/') return path === '/';
    return path.startsWith(to);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fcfbfa]/90 backdrop-blur-md border-b border-zinc-200/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded bg-zinc-900 text-white flex items-center justify-center font-serif text-lg font-bold shadow-sm group-hover:bg-blue-950 transition-colors">
            A
          </div>
          <div>
            <span className="font-serif font-bold text-lg text-zinc-900 tracking-tight block leading-tight">
              {siteTitle}
            </span>
            <span className="text-[11px] text-zinc-500 hidden sm:block tracking-wide">
              Jejak Pemikiran &amp; Dokumentasi
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map(link => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  active
                    ? 'text-zinc-950 bg-zinc-200/60 font-semibold'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/70'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="h-4 w-px bg-zinc-300 mx-2" />

          {/* Admin shortcut */}
          <Link
            to="/admin"
            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
            title="Masuk ke CMS Admin"
          >
            <Shield className="w-4 h-4" />
          </Link>
        </nav>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            to="/admin"
            className="p-1.5 text-zinc-500 hover:text-zinc-900"
            title="Admin"
          >
            <Shield className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-zinc-700 hover:text-zinc-900 rounded-md focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-zinc-200 bg-[#fcfbfa] px-4 pt-2 pb-4 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {navLinks.map(link => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  active
                    ? 'text-zinc-950 bg-zinc-200/70 font-semibold'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-zinc-200 flex items-center justify-between px-3">
            <span className="text-xs text-zinc-500">Panel Administrator</span>
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="text-xs font-medium text-blue-900 flex items-center gap-1"
            >
              <Shield className="w-3.5 h-3.5" /> Akses CMS
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
