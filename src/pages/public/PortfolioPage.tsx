import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Link } from '../../lib/router';
import { Portfolio } from '../../types';
import { FolderGit2, ArrowRight, ExternalLink, Calendar, UserCheck } from 'lucide-react';

export const PortfolioPage: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState<string>('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getPublicPortfolios();
        setPortfolios(data);
      } catch (err) {
        console.error('Failed to load portfolios:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categories = ['all', ...Array.from(new Set(portfolios.map(p => p.category)))];
  const filtered = selectedCat === 'all' ? portfolios : portfolios.filter(p => p.category === selectedCat);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-zinc-900 tracking-tight">
          Portofolio &amp; Dokumentasi Kegiatan
        </h1>
        <p className="text-zinc-600 text-base max-w-2xl leading-relaxed">
          Koleksi proyek rekayasa perangkat lunak, eksplorasi riset teknologi, dan dokumentasi kurasi visual.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-4">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedCat === cat
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            {cat === 'all' ? 'Semua Kategori' : cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-zinc-500 text-sm">Memuat portofolio...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-zinc-300">
          <p className="text-zinc-600 text-sm">Belum ada portofolio pada kategori ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map(item => (
            <div
              key={item.id}
              className="group rounded-2xl border border-zinc-200 bg-white overflow-hidden hover:border-zinc-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {item.featured_media?.url && (
                  <div className="aspect-[16/10] bg-zinc-100 overflow-hidden">
                    <img
                      src={item.featured_media.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    {item.period && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {item.period}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-serif font-bold text-zinc-900 group-hover:text-blue-900 transition-colors">
                    <Link to={`/portofolio/${item.slug}`}>{item.title}</Link>
                  </h2>

                  <p className="text-sm text-zinc-600 leading-relaxed line-clamp-3">
                    {item.summary}
                  </p>

                  {item.role && (
                    <div className="text-xs text-zinc-500 flex items-center gap-1 pt-1 font-medium">
                      <UserCheck className="w-3.5 h-3.5" /> Peran: {item.role}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 pt-0 mt-2 border-t border-zinc-100 flex items-center justify-between">
                <Link
                  to={`/portofolio/${item.slug}`}
                  className="text-xs font-semibold text-zinc-900 hover:text-blue-900 inline-flex items-center gap-1.5"
                >
                  Detail &amp; Dokumentasi <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {item.project_url && (
                  <a
                    href={item.project_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1"
                  >
                    Tautan Luar <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
