import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Link, useRouter } from '../../lib/router';
import { Post, Category } from '../../types';
import { Plus, Search, Edit, Trash2, Eye, Archive, CheckCircle, Clock, Filter, AlertCircle } from 'lucide-react';

export const AdminPostsPage: React.FC = () => {
  const { navigate } = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const [postRes, catRes] = await Promise.all([
        api.getAdminPosts({
          status: statusFilter === 'all' ? undefined : statusFilter,
          category_id: categoryFilter === 'all' ? undefined : categoryFilter,
          search: searchTerm.trim() || undefined,
          limit: 50,
        }),
        api.getAdminCategories(),
      ]);
      setPosts(postRes.posts || []);
      setTotal(postRes.total || 0);
      setCategories(catRes || []);
    } catch (err: any) {
      console.error('Error fetching admin posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [statusFilter, categoryFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPosts();
  };

  const handlePublish = async (id: string) => {
    try {
      await api.publishPost(id);
      setActionNotice('Artikel berhasil dipublikasikan ke website publik.');
      loadPosts();
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err: any) {
      alert(`Gagal mempublikasikan: ${err.message}`);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await api.archivePost(id);
      setActionNotice('Artikel berhasil diarsipkan.');
      loadPosts();
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err: any) {
      alert(`Gagal mengarsipkan: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAdminPost(id);
      setDeleteConfirmId(null);
      setActionNotice('Artikel berhasil dihapus dari database.');
      loadPosts();
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-zinc-900 tracking-tight">
            Manajemen Artikel &amp; Tulisan
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Total {total} artikel terdata di database. Publikasi memerlukan aksi eksplisit pemilik.
          </p>
        </div>

        <Link
          to="/admin/artikel/baru"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-500 transition-colors shadow-sm w-fit"
        >
          <Plus className="w-4 h-4" /> Tulis Artikel Baru
        </Link>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {['all', 'draft', 'in_review', 'scheduled', 'published', 'archived'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {s === 'all'
                ? 'Semua'
                : s === 'draft'
                ? 'Draft'
                : s === 'in_review'
                ? 'In Review'
                : s === 'scheduled'
                ? 'Terjadwal'
                : s === 'published'
                ? 'Published'
                : 'Arsip'}
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50 focus:outline-none"
          >
            <option value="all">Semua Kategori</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <form onSubmit={handleSearch} className="relative flex-1 sm:w-60">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari artikel..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2" />
          </form>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-zinc-500 text-xs">Memuat data artikel...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm">
            Tidak ada artikel yang cocok dengan filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Judul Artikel</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Waktu Publikasi</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {posts.map(post => {
                  const cat = categories.find(c => c.id === post.category_id);
                  return (
                    <tr key={post.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3.5 px-4 max-w-sm">
                        <Link
                          to={`/admin/artikel/${post.id}`}
                          className="font-semibold text-zinc-900 hover:text-blue-900 line-clamp-1 text-sm font-serif"
                        >
                          {post.title}
                        </Link>
                        <p className="text-[11px] text-zinc-400 font-mono truncate mt-0.5">
                          /{post.slug}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-600 whitespace-nowrap">
                        {cat ? (
                          <span className="px-2 py-0.5 rounded bg-zinc-100 font-medium">
                            {cat.name}
                          </span>
                        ) : (
                          <span className="text-zinc-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
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
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap text-[11px]">
                        {post.published_at ? (
                          new Date(post.published_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        ) : post.scheduled_at ? (
                          `Terjadwal: ${new Date(post.scheduled_at).toLocaleDateString('id-ID')}`
                        ) : (
                          <span className="text-zinc-400">Belum Terbit</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {post.status === 'published' && (
                            <Link
                              to={`/tulisan/${post.slug}`}
                              target="_blank"
                              className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded"
                              title="Lihat Halaman Publik"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <Link
                            to={`/admin/artikel/${post.id}`}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="Edit Artikel"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          {post.status !== 'published' ? (
                            <button
                              onClick={() => handlePublish(post.id)}
                              className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded cursor-pointer"
                              title="Terbitkan Sekarang"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleArchive(post.id)}
                              className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded cursor-pointer"
                              title="Arsipkan"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteConfirmId(post.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                            title="Hapus Artikel"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-serif font-bold text-lg text-zinc-900">Konfirmasi Hapus</h3>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Tindakan ini permanen. Artikel beserta riwayat revisinya akan dihapus dari database. Apakah Anda yakin?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
