import React, { useEffect, useState } from 'react';
import { Link } from '../../lib/router';
import { api } from '../../lib/api';
import { Profile, SiteSettings, Post, Portfolio, MediaItem } from '../../types';
import { ArrowRight, Calendar, Clock, MapPin, Sparkles, FolderGit2, Image as ImageIcon } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [gallery, setGallery] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [profData, settData, postsData, portData, galData] = await Promise.all([
          api.getPublicProfile(),
          api.getPublicSettings(),
          api.getPublicPosts({ limit: 4 }),
          api.getPublicPortfolios(),
          api.getPublicGallery(),
        ]);
        setProfile(profData);
        setSettings(settData);
        setPosts(postsData.posts || []);
        setPortfolios((portData || []).slice(0, 3));
        setGallery((galData.media || []).slice(0, 6));
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-500 font-sans text-sm">Memuat halaman beranda...</p>
      </div>
    );
  }

  const featuredPost = posts.find(p => p.is_featured) || posts[0];
  const regularPosts = posts.filter(p => p.id !== featuredPost?.id);

  return (
    <div className="space-y-20 sm:space-y-28">
      {/* 1. HERO SECTION */}
      <section className="pt-10 sm:pt-16 pb-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-8 sm:gap-12">
            <div className="space-y-5 flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {settings?.hero_greeting || 'Halo, selamat datang.'}
              </div>

              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-zinc-900 tracking-tight leading-[1.15]">
                {settings?.hero_title || profile?.headline || 'Merekam jejak pemikiran teknis dan narasi visual.'}
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-xl">
                {settings?.hero_bio || profile?.short_bio}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/tulisan"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm"
                >
                  Jelajahi Tulisan <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/tentang"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-zinc-300 text-zinc-800 text-sm font-medium hover:bg-zinc-100 transition-colors"
                >
                  Tentang Saya
                </Link>
              </div>
            </div>

            {profile?.avatar_url && (
              <div className="shrink-0">
                <div className="relative group">
                  <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border border-zinc-200/80 shadow-md bg-zinc-100">
                    <img
                      src={profile.avatar_url}
                      alt={profile.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-white/95 px-2.5 py-1 rounded-md text-[11px] font-medium border border-zinc-200 shadow-sm text-zinc-700">
                    {profile.name}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. FEATURED ARTICLE */}
      {featuredPost && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="border border-zinc-200 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-center p-6 sm:p-8">
              {featuredPost.featured_image?.url && (
                <div className="rounded-xl overflow-hidden aspect-[16/10] bg-zinc-100 border border-zinc-100">
                  <img
                    src={featuredPost.featured_image.url}
                    alt={featuredPost.featured_image.alt || featuredPost.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span className="font-semibold text-blue-900 uppercase tracking-wider">
                    {featuredPost.category?.name || 'Artikel Unggulan'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {featuredPost.read_time_minutes} menit baca
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 leading-snug">
                  <Link to={`/tulisan/${featuredPost.slug}`} className="hover:text-blue-900 transition-colors">
                    {featuredPost.title}
                  </Link>
                </h2>

                <p className="text-zinc-600 text-sm sm:text-base leading-relaxed line-clamp-3">
                  {featuredPost.excerpt}
                </p>

                <div className="pt-2">
                  <Link
                    to={`/tulisan/${featuredPost.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900 hover:text-blue-900 transition-colors"
                  >
                    Baca Selengkapnya <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. LATEST ARTICLES */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between border-b border-zinc-200 pb-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900">
              Tulisan Terbaru
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              Refleksi pemikiran, esai teknis, dan catatan autentik.
            </p>
          </div>
          <Link
            to="/tulisan"
            className="text-sm font-medium text-zinc-700 hover:text-zinc-950 flex items-center gap-1 transition-colors"
          >
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="p-8 text-center bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
            <p className="text-zinc-500 text-sm">Belum ada artikel yang dipublikasikan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.slice(0, 3).map((post: any) => (
              <article
                key={post.id}
                className="group flex flex-col justify-between p-5 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm transition-all"
              >
                <div className="space-y-3">
                  {post.featured_image?.url && (
                    <div className="rounded-lg overflow-hidden aspect-[16/10] bg-zinc-100">
                      <img
                        src={post.featured_image.url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="text-zinc-600 font-medium">
                      {post.category?.name || 'Catatan'}
                    </span>
                    <span>•</span>
                    <span>{post.read_time_minutes} mnt</span>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-zinc-900 leading-snug group-hover:text-blue-900 transition-colors">
                    <Link to={`/tulisan/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-zinc-600 text-sm line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {post.published_at ? new Date(post.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Baru'}
                  </span>
                  <Link
                    to={`/tulisan/${post.slug}`}
                    className="font-medium text-zinc-900 group-hover:translate-x-0.5 transition-transform inline-flex items-center"
                  >
                    Baca &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 4. VISUAL DOCUMENTATION & GALLERY */}
      {gallery.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between border-b border-zinc-200 pb-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-zinc-700" /> Dokumentasi Pilihan
              </h2>
              <p className="text-sm text-zinc-500 mt-1">
                Rekaman visual autentik dari aktivitas, riset lapangan, dan suasana kerja.
              </p>
            </div>
            <Link
              to="/galeri"
              className="text-sm font-medium text-zinc-700 hover:text-zinc-950 flex items-center gap-1 transition-colors"
            >
              Galeri Lengkap <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {gallery.map(item => (
              <div
                key={item.id}
                className="group relative rounded-xl overflow-hidden aspect-[4/3] bg-zinc-100 border border-zinc-200"
              >
                <img
                  src={item.storage_path}
                  alt={item.alt_text || item.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-white">
                  <p className="text-xs font-medium line-clamp-1">{item.caption || item.alt_text}</p>
                  {item.location && (
                    <span className="text-[10px] text-zinc-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {item.location}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. PORTFOLIO SHOWCASE */}
      {portfolios.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between border-b border-zinc-200 pb-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 flex items-center gap-2">
                <FolderGit2 className="w-6 h-6 text-zinc-700" /> Portofolio Pilihan
              </h2>
              <p className="text-sm text-zinc-500 mt-1">
                Kegiatan nyata, arsitektur perangkat lunak, dan proyek kurasi.
              </p>
            </div>
            <Link
              to="/portofolio"
              className="text-sm font-medium text-zinc-700 hover:text-zinc-950 flex items-center gap-1 transition-colors"
            >
              Semua Portofolio <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portfolios.map(item => (
              <div
                key={item.id}
                className="p-6 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 font-medium text-zinc-700">
                      {item.category}
                    </span>
                    {item.period && <span>{item.period}</span>}
                  </div>
                  <h3 className="text-xl font-serif font-bold text-zinc-900 hover:text-blue-900 transition-colors">
                    <Link to={`/portofolio/${item.slug}`}>{item.title}</Link>
                  </h3>
                  <p className="text-sm text-zinc-600 leading-relaxed line-clamp-3">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-medium">Peran: {item.role || 'Inisiator'}</span>
                  <Link
                    to={`/portofolio/${item.slug}`}
                    className="text-xs font-semibold text-zinc-900 hover:text-blue-900 inline-flex items-center gap-1"
                  >
                    Detail Proyek <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. CALLOUT & PHILOSOPHY */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-2xl bg-zinc-900 text-white shadow-lg space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-200 border border-zinc-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Prinsip Dokumentasi Autentik
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            Menuliskan apa yang benar-benar terjadi, tanpa bumbu klaim kosong.
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
            Di website ini, seluruh dokumentasi visual dan tulisan dirawat dengan integritas tinggi.
            Bantuan kecerdasan buatan Gemini dimanfaatkan sebagai mitra penulisan untuk menguraikan
            konteks dari foto menjadi draf terstruktur—yang kemudian selalu disunting dan diverifikasi
            secara manual oleh saya sebelum dipublikasikan.
          </p>
          <div className="pt-2 flex items-center gap-4">
            <Link
              to="/tentang"
              className="text-xs font-semibold uppercase tracking-wider text-white underline underline-offset-4 hover:text-zinc-300 transition-colors"
            >
              Baca Filosofi Lengkap &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
