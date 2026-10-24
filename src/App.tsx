import React, { useEffect, useState } from 'react';
import { useRouter, RouterProvider, matchPath, Link } from './lib/router';
import { authStorage, api } from './lib/api';
import { Navbar } from './components/public/Navbar';
import { Footer } from './components/public/Footer';
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { PostsPage } from './pages/public/PostsPage';
import { PostDetailPage } from './pages/public/PostDetailPage';
import { PortfolioPage } from './pages/public/PortfolioPage';
import { PortfolioDetailPage } from './pages/public/PortfolioDetailPage';
import { GalleryPage } from './pages/public/GalleryPage';
import { ContactPage } from './pages/public/ContactPage';

import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminPostsPage } from './pages/admin/AdminPostsPage';
import { AdminPostEditorPage } from './pages/admin/AdminPostEditorPage';
import { AdminAIStudioPage } from './pages/admin/AdminAIStudioPage';
import { AdminMediaPage } from './pages/admin/AdminMediaPage';
import { AdminPortfolioPage } from './pages/admin/AdminPortfolioPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminMessagesPage } from './pages/admin/AdminMessagesPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

import { Profile, SiteSettings } from './types';
import { ArrowLeft } from 'lucide-react';

function AppContent() {
  const { path, navigate } = useRouter();
  const [profile, setProfile] = useState<Profile | undefined>(undefined);
  const [settings, setSettings] = useState<SiteSettings | undefined>(undefined);

  useEffect(() => {
    // Only fetch public info if on public route
    if (!path.startsWith('/admin')) {
      api.getPublicSettings().then(setSettings).catch(() => {});
      api.getPublicProfile().then(setProfile).catch(() => {});
    }
  }, [path]);

  // ================= ADMIN ROUTING =================
  if (path.startsWith('/admin')) {
    const isLoginPage = path === '/admin/login';
    const hasToken = authStorage.isAuthenticated();

    if (!hasToken && !isLoginPage) {
      return <AdminLoginPage />;
    }

    if (isLoginPage) {
      if (hasToken) {
        navigate('/admin');
        return null;
      }
      return <AdminLoginPage />;
    }

    // Match Admin Sub-routes
    let content: React.ReactNode = null;

    if (path === '/admin') {
      content = <AdminDashboardPage />;
    } else if (path === '/admin/artikel/baru') {
      content = <AdminPostEditorPage />;
    } else {
      const matchEditPost = matchPath('/admin/artikel/:id', path);
      if (matchEditPost.matches) {
        content = <AdminPostEditorPage postId={matchEditPost.params.id} />;
      } else if (path === '/admin/artikel') {
        content = <AdminPostsPage />;
      } else if (path === '/admin/ai-studio') {
        content = <AdminAIStudioPage />;
      } else if (path === '/admin/media') {
        content = <AdminMediaPage />;
      } else if (path === '/admin/portofolio') {
        content = <AdminPortfolioPage />;
      } else if (path === '/admin/kategori') {
        content = <AdminCategoriesPage />;
      } else if (path === '/admin/pengaturan' || path === '/admin/halaman') {
        content = <AdminSettingsPage />;
      } else if (path === '/admin/pesan') {
        content = <AdminMessagesPage />;
      } else if (path === '/admin/audit-logs') {
        content = <AdminAuditLogsPage />;
      } else {
        content = <AdminDashboardPage />;
      }
    }

    return <AdminLayout>{content}</AdminLayout>;
  }

  // ================= PUBLIC ROUTING =================
  let publicPage: React.ReactNode = null;

  if (path === '/') {
    publicPage = <HomePage />;
  } else if (path === '/tentang') {
    publicPage = <AboutPage />;
  } else if (path === '/tulisan') {
    publicPage = <PostsPage />;
  } else {
    const matchPost = matchPath('/tulisan/:slug', path);
    if (matchPost.matches) {
      publicPage = <PostDetailPage slug={matchPost.params.slug} />;
    } else if (path === '/portofolio') {
      publicPage = <PortfolioPage />;
    } else {
      const matchPort = matchPath('/portofolio/:slug', path);
      if (matchPort.matches) {
        publicPage = <PortfolioDetailPage slug={matchPort.params.slug} />;
      } else if (path === '/galeri') {
        publicPage = <GalleryPage />;
      } else if (path === '/kontak') {
        publicPage = <ContactPage />;
      } else {
        publicPage = (
          <div className="max-w-xl mx-auto px-4 py-32 text-center space-y-4">
            <span className="text-4xl font-serif font-bold text-zinc-900 block">404</span>
            <h1 className="text-2xl font-serif font-bold text-zinc-900">
              Halaman Tidak Ditemukan
            </h1>
            <p className="text-zinc-600 text-sm">
              Tautan yang Anda tuju mungkin telah dipindahkan atau belum pernah dipublikasikan.
            </p>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Beranda
              </Link>
            </div>
          </div>
        );
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#fcfbfa] text-zinc-900 flex flex-col justify-between selection:bg-zinc-200">
      <Navbar siteTitle={settings?.site_title} tagline={settings?.tagline} />
      <main className="flex-1 min-w-0">{publicPage}</main>
      <Footer profile={profile} settings={settings} />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}
