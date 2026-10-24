import React from 'react';
import { Link } from '../../lib/router';
import { Github, Linkedin, Twitter, Instagram, Mail, Rss, ArrowUp } from 'lucide-react';
import { Profile, SiteSettings } from '../../types';

export const Footer: React.FC<{ profile?: Profile; settings?: SiteSettings }> = ({
  profile,
  settings,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50/60 mt-20 pt-16 pb-12 text-zinc-600">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand & bio */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="font-serif font-bold text-xl text-zinc-900">
              {settings?.site_title || 'Aksara & Lensa'}
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed max-w-md">
              {profile?.short_bio ||
                'Ruang personal untuk membagikan pemikiran tentang teknologi, dokumentasi fotografi, dan catatan perjalanan hidup yang autentik.'}
            </p>
            <div className="flex items-center space-x-3 pt-2">
              {profile?.social_links?.github && (
                <a
                  href={profile.social_links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/50 rounded-full transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {profile?.social_links?.linkedin && (
                <a
                  href={profile.social_links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/50 rounded-full transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {profile?.social_links?.twitter && (
                <a
                  href={profile.social_links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/50 rounded-full transition-colors"
                  aria-label="Twitter / X"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {profile?.social_links?.instagram && (
                <a
                  href={profile.social_links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/50 rounded-full transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {profile?.contact_email && (
                <a
                  href={`mailto:${profile.contact_email}`}
                  className="p-2 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/50 rounded-full transition-colors"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-4">
              Navigasi Utama
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-zinc-950 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/tentang" className="hover:text-zinc-950 transition-colors">
                  Tentang Saya
                </Link>
              </li>
              <li>
                <Link to="/tulisan" className="hover:text-zinc-950 transition-colors">
                  Daftar Tulisan
                </Link>
              </li>
              <li>
                <Link to="/portofolio" className="hover:text-zinc-950 transition-colors">
                  Portofolio Kegiatan
                </Link>
              </li>
              <li>
                <Link to="/galeri" className="hover:text-zinc-950 transition-colors">
                  Galeri Dokumentasi
                </Link>
              </li>
              <li>
                <Link to="/kontak" className="hover:text-zinc-950 transition-colors">
                  Hubungi Saya
                </Link>
              </li>
            </ul>
          </div>

          {/* Sistem & Sitemap */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-4">
              Struktur &amp; Akses
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-zinc-950 transition-colors"
                >
                  <Rss className="w-3.5 h-3.5" /> Sitemap XML
                </a>
              </li>
              <li>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-zinc-950 transition-colors"
                >
                  Robots.txt
                </a>
              </li>
              <li>
                <Link to="/admin" className="hover:text-zinc-950 transition-colors font-medium text-blue-900">
                  Panel Admin CMS
                </Link>
              </li>
            </ul>

            <div className="mt-6">
              <button
                onClick={scrollToTop}
                className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 transition-colors border border-zinc-200 px-2.5 py-1 rounded bg-white"
              >
                <ArrowUp className="w-3 h-3" /> Kembali ke Atas
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-200/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-3">
          <p>{settings?.footer_text || '© 2026 Sumarjiyono. Seluruh tulisan dan foto dilindungi hak cipta.'}</p>
          <p className="flex items-center gap-1 text-[11px]">
            Arsitektur Web Autentik • Ditenagai Model Gemini Server-Side
          </p>
        </div>
      </div>
    </footer>
  );
};
