import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Link } from '../../lib/router';
import { MarkdownRenderer } from '../../components/public/MarkdownRenderer';
import { Post, Category, Tag, MediaItem } from '../../types';
import { Calendar, Clock, Share2, Check, ArrowLeft, Tag as TagIcon, ArrowRight } from 'lucide-react';

export const PostDetailPage: React.FC<{ slug: string }> = ({ slug }) => {
  const [data, setData] = useState<{
    post: Post;
    category: Category | null;
    tags: Tag[];
    featured_media: MediaItem | null;
    supplementary_media: MediaItem[];
    related_posts: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getPublicPostDetail(slug);
        setData(res);
        // Dynamic title update
        if (res.post?.meta_title) {
          document.title = `${res.post.meta_title} | Aksara & Lensa`;
        }
      } catch (err: any) {
        setError(err.message || 'Artikel tidak ditemukan.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-zinc-500 text-sm">Memuat artikel...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-zinc-900">Artikel Tidak Tersedia</h2>
        <p className="text-zinc-600 text-sm">{error || 'Artikel yang Anda cari tidak ditemukan.'}</p>
        <Link
          to="/tulisan"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar Tulisan
        </Link>
      </div>
    );
  }

  const { post, category, tags, featured_media, supplementary_media, related_posts } = data;

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
      {/* Back button */}
      <div>
        <Link
          to="/tulisan"
          className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Tulisan
        </Link>
      </div>

      {/* Article Header */}
      <header className="space-y-4 border-b border-zinc-200 pb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          {category && (
            <span className="font-semibold text-blue-900 uppercase tracking-wide bg-blue-50 px-2 py-0.5 rounded">
              {category.name}
            </span>
          )}
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {post.published_at
              ? new Date(post.published_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : 'Draf'}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {post.read_time_minutes} menit membaca
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-zinc-900 leading-[1.2] tracking-tight">
          {post.title}
        </h1>

        <p className="text-lg sm:text-xl text-zinc-600 leading-relaxed font-sans font-normal italic pt-1">
          {post.excerpt}
        </p>

        {/* Share & Actions */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-200 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied ? 'Tautan Disalin!' : 'Bagikan Tautan'}
            </button>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {featured_media && (
        <div className="space-y-2">
          <div className="rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-sm aspect-[16/10]">
            <img
              src={featured_media.storage_path}
              alt={post.image_alt_text || featured_media.alt_text || post.title}
              className="w-full h-full object-cover"
            />
          </div>
          {(featured_media.caption || post.image_alt_text) && (
            <p className="text-xs text-zinc-500 italic text-center font-serif">
              {featured_media.caption || post.image_alt_text}
            </p>
          )}
        </div>
      )}

      {/* Body Content */}
      <section className="pt-2">
        <MarkdownRenderer content={post.body} />
      </section>

      {/* Supplementary Photos */}
      {supplementary_media && supplementary_media.length > 0 && (
        <section className="pt-8 border-t border-zinc-200 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900">
            Dokumentasi Terkait
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {supplementary_media.map(media => (
              <div key={media.id} className="rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50">
                <img
                  src={media.storage_path}
                  alt={media.alt_text}
                  className="w-full h-48 object-cover"
                />
                {media.caption && (
                  <p className="p-2.5 text-xs text-zinc-600 italic bg-white border-t border-zinc-100">
                    {media.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="pt-6 border-t border-zinc-200 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-zinc-500 mr-1 flex items-center gap-1">
            <TagIcon className="w-3.5 h-3.5" /> Topik:
          </span>
          {tags.map(tag => (
            <Link
              key={tag.id}
              to={`/tulisan?tag=${tag.id}`}
              className="px-2.5 py-1 rounded-md text-xs bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* Related Posts */}
      {related_posts && related_posts.length > 0 && (
        <section className="pt-10 border-t border-zinc-200 space-y-5">
          <h3 className="text-xl font-serif font-bold text-zinc-900">
            Tulisan Terkait
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {related_posts.map(item => (
              <div
                key={item.id}
                className="p-5 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-serif font-bold text-base text-zinc-900 hover:text-blue-900 transition-colors">
                    <Link to={`/tulisan/${item.slug}`}>{item.title}</Link>
                  </h4>
                  <p className="text-xs text-zinc-600 mt-2 line-clamp-2 leading-relaxed">
                    {item.excerpt}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-zinc-100">
                  <Link
                    to={`/tulisan/${item.slug}`}
                    className="text-xs font-semibold text-zinc-900 inline-flex items-center gap-1"
                  >
                    Baca Selengkapnya <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};
