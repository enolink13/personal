import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Link } from '../../lib/router';
import { Portfolio, MediaItem } from '../../types';
import { MarkdownRenderer } from '../../components/public/MarkdownRenderer';
import { ArrowLeft, ExternalLink, Github, Calendar, UserCheck, Lightbulb, Image as ImageIcon } from 'lucide-react';

export const PortfolioDetailPage: React.FC<{ slug: string }> = ({ slug }) => {
  const [data, setData] = useState<{
    portfolio: Portfolio;
    featured_media: MediaItem | null;
    documents: MediaItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.getPublicPortfolioDetail(slug);
        setData(res);
        if (res.portfolio?.title) {
          document.title = `${res.portfolio.title} | Portofolio Sumarjiyono`;
        }
      } catch (err: any) {
        setError(err.message || 'Portofolio tidak ditemukan.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-zinc-500 text-sm">Memuat portofolio...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-zinc-900">Portofolio Tidak Ditemukan</h2>
        <p className="text-zinc-600 text-sm">{error || 'Data yang Anda cari tidak tersedia.'}</p>
        <Link
          to="/portofolio"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Portofolio
        </Link>
      </div>
    );
  }

  const { portfolio, featured_media, documents } = data;

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
      <div>
        <Link
          to="/portofolio"
          className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Portofolio
        </Link>
      </div>

      <header className="space-y-4 border-b border-zinc-200 pb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <span className="font-semibold text-blue-900 uppercase tracking-wide bg-blue-50 px-2.5 py-0.5 rounded">
            {portfolio.category}
          </span>
          {portfolio.period && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {portfolio.period}
              </span>
            </>
          )}
          {portfolio.role && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> {portfolio.role}
              </span>
            </>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-zinc-900 leading-tight">
          {portfolio.title}
        </h1>

        <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-sans">
          {portfolio.summary}
        </p>

        {(portfolio.project_url || portfolio.github_url) && (
          <div className="flex items-center gap-3 pt-2">
            {portfolio.project_url && (
              <a
                href={portfolio.project_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
              >
                Kunjungi Proyek <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {portfolio.github_url && (
              <a
                href={portfolio.github_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-300 text-zinc-800 text-xs font-semibold hover:bg-zinc-100 transition-colors"
              >
                <Github className="w-3.5 h-3.5" /> Kode Sumber
              </a>
            )}
          </div>
        )}
      </header>

      {featured_media && (
        <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100 aspect-[16/10]">
          <img
            src={featured_media.storage_path}
            alt={featured_media.alt_text || portfolio.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Description */}
      <section className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-zinc-900 border-b border-zinc-200 pb-2">
          Deskripsi &amp; Konteks Kegiatan
        </h2>
        <MarkdownRenderer content={portfolio.description} />
      </section>

      {/* Learning Outcomes */}
      {portfolio.learning_outcomes && (
        <section className="p-6 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
            <Lightbulb className="w-4 h-4 text-amber-700" /> Hasil &amp; Pembelajaran Nyata
          </div>
          <p className="text-sm text-zinc-700 leading-relaxed font-sans">
            {portfolio.learning_outcomes}
          </p>
        </section>
      )}

      {/* Documents and photos */}
      {documents && documents.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-zinc-200">
          <h2 className="text-xl font-serif font-bold text-zinc-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-zinc-700" /> Dokumentasi Kegiatan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {documents.map(doc => (
              <div key={doc.id} className="rounded-xl overflow-hidden border border-zinc-200 bg-white">
                <img
                  src={doc.storage_path}
                  alt={doc.alt_text}
                  className="w-full h-48 object-cover"
                />
                {(doc.caption || doc.location) && (
                  <div className="p-3 bg-white text-xs text-zinc-600 border-t border-zinc-100">
                    {doc.caption && <p className="italic">{doc.caption}</p>}
                    {doc.location && <p className="text-[11px] text-zinc-400 mt-0.5">{doc.location}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};
