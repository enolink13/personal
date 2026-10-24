import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Link, useRouter } from '../../lib/router';
import { Category, Tag } from '../../types';
import { Search, Calendar, Clock, Tag as TagIcon, X, ArrowLeft, ArrowRight } from 'lucide-react';

export const PostsPage: React.FC = () => {
  const { query, navigate } = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const selectedCategory = query.get('kategori') || '';
  const selectedTag = query.get('tag') || '';
  const searchQuery = query.get('q') || '';
  const page = parseInt(query.get('halaman') || '1');
  const limit = 6;
  const offset = (page - 1) * limit;

  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [catData, tagData] = await Promise.all([
          api.getPublicCategories(),
          api.getPublicTags(),
        ]);
        setCategories(catData);
        setTags(tagData);
      } catch (err) {
        console.error('Error loading metadata:', err);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      try {
        const data = await api.getPublicPosts({
          category_id: selectedCategory || undefined,
          tag_id: selectedTag || undefined,
          search: searchQuery || undefined,
          limit,
          offset,
        });
        setPosts(data.posts || []);
        setTotal(data.total || 0);
      } catch (err) {
        console.error('Error loading posts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, [selectedCategory, selectedTag, searchQuery, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newQuery = new URLSearchParams(window.location.search);
    if (searchInput.trim()) {
      newQuery.set('q', searchInput.trim());
    } else {
      newQuery.delete('q');
    }
    newQuery.set('halaman', '1');
    navigate(`/tulisan?${newQuery.toString()}`);
  };

  const handleCategoryClick = (catId: string) => {
    const newQuery = new URLSearchParams(window.location.search);
    if (selectedCategory === catId) {
      newQuery.delete('kategori');
    } else {
      newQuery.set('kategori', catId);
    }
    newQuery.set('halaman', '1');
    navigate(`/tulisan?${newQuery.toString()}`);
  };

  const handleTagClick = (tagId: string) => {
    const newQuery = new URLSearchParams(window.location.search);
    if (selectedTag === tagId) {
      newQuery.delete('tag');
    } else {
      newQuery.set('tag', tagId);
    }
    newQuery.set('halaman', '1');
    navigate(`/tulisan?${newQuery.toString()}`);
  };

  const clearFilters = () => {
    setSearchInput('');
    navigate('/tulisan');
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-zinc-900 tracking-tight">
          Daftar Tulisan
        </h1>
        <p className="text-zinc-600 text-base max-w-2xl">
          Eksplorasi gagasan tentang arsitektur perangkat lunak, refleksi kehidupan, dan catatan editorial.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4 bg-white p-5 rounded-xl border border-zinc-200 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Cari artikel berdasarkan judul atau kata kunci..."
            className="w-full pl-10 pr-24 py-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm bg-zinc-50/50"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-zinc-900 text-white rounded-md text-xs font-medium hover:bg-zinc-800 transition-colors"
          >
            Cari
          </button>
        </form>

        {/* Categories Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-medium text-zinc-500 mr-1">Kategori:</span>
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  isSelected
                    ? 'bg-zinc-900 text-white border-zinc-900 font-medium'
                    : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                {cat.name}
              </button>
            );
          })}

          {(selectedCategory || selectedTag || searchQuery) && (
            <button
              onClick={clearFilters}
              className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium ml-auto"
            >
              <X className="w-3.5 h-3.5" /> Bersihkan Filter
            </button>
          )}
        </div>
      </div>

      {/* Content State */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-zinc-500 text-sm">Memuat artikel...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-zinc-300 space-y-3">
          <p className="text-zinc-700 font-medium">Tidak ada tulisan yang cocok dengan kriteria pencarian.</p>
          <p className="text-xs text-zinc-500">Silakan ubah kata kunci atau hapus filter kategori.</p>
          <button
            onClick={clearFilters}
            className="mt-2 px-4 py-2 rounded-lg bg-zinc-100 text-zinc-800 text-xs font-semibold hover:bg-zinc-200 transition-colors"
          >
            Tampilkan Semua Tulisan
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map(post => (
              <article
                key={post.id}
                className="group flex flex-col justify-between p-6 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm transition-all"
              >
                <div className="space-y-3">
                  {post.featured_image?.url && (
                    <div className="rounded-xl overflow-hidden aspect-[16/10] bg-zinc-100 mb-2">
                      <img
                        src={post.featured_image.url}
                        alt={post.featured_image.alt || post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span className="font-semibold text-blue-900 uppercase tracking-wide">
                      {post.category?.name || 'Umum'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {post.read_time_minutes} mnt baca
                    </span>
                  </div>

                  <h2 className="text-xl font-serif font-bold text-zinc-900 leading-snug group-hover:text-blue-900 transition-colors">
                    <Link to={`/tulisan/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>

                  <p className="text-sm text-zinc-600 leading-relaxed line-clamp-3 font-sans">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {post.published_at ? new Date(post.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Baru'}
                  </span>
                  <Link
                    to={`/tulisan/${post.slug}`}
                    className="font-semibold text-zinc-900 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1"
                  >
                    Baca Artikel &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-8 border-t border-zinc-200">
              <button
                disabled={page <= 1}
                onClick={() => {
                  const newQuery = new URLSearchParams(window.location.search);
                  newQuery.set('halaman', (page - 1).toString());
                  navigate(`/tulisan?${newQuery.toString()}`);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-200 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Sebelumnya
              </button>

              <span className="text-xs text-zinc-500">
                Halaman {page} dari {totalPages} ({total} total artikel)
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => {
                  const newQuery = new URLSearchParams(window.location.search);
                  newQuery.set('halaman', (page + 1).toString());
                  navigate(`/tulisan?${newQuery.toString()}`);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-200 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Berikutnya <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
