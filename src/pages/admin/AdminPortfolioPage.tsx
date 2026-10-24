import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Portfolio, MediaItem } from '../../types';
import { FolderGit2, Plus, Edit, Trash2, ExternalLink, Github, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

export const AdminPortfolioPage: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  // Editor Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Rekayasa Perangkat Lunak');
  const [role, setRole] = useState('');
  const [period, setPeriod] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [learningOutcomes, setLearningOutcomes] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [featuredMediaId, setFeaturedMediaId] = useState<string | undefined>(undefined);
  const [isFeatured, setIsFeatured] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [portData, medData] = await Promise.all([
        api.getAdminPortfolios(),
        api.getAdminMedia({ limit: 50 }),
      ]);
      setPortfolios(portData || []);
      setMediaList(medData.media || []);
    } catch (err: any) {
      console.error('Error loading portfolios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setCategory('Rekayasa Perangkat Lunak');
    setRole('');
    setPeriod('');
    setSummary('');
    setDescription('');
    setLearningOutcomes('');
    setProjectUrl('');
    setGithubUrl('');
    setFeaturedMediaId(undefined);
    setIsFeatured(false);
    setShowModal(true);
  };

  const openEditModal = (p: Portfolio) => {
    setEditingId(p.id);
    setTitle(p.title);
    setSlug(p.slug);
    setCategory(p.category);
    setRole(p.role || '');
    setPeriod(p.period || '');
    setSummary(p.summary || '');
    setDescription(p.description || '');
    setLearningOutcomes(p.learning_outcomes || '');
    setProjectUrl(p.project_url || '');
    setGithubUrl(p.github_url || '');
    setFeaturedMediaId(p.featured_media_id);
    setIsFeatured(p.is_featured);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category.trim() || !description.trim()) {
      alert('Judul, kategori, dan deskripsi proyek wajib diisi.');
      return;
    }

    const payload = {
      title: title.trim(),
      slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: category.trim(),
      role: role.trim() || undefined,
      period: period.trim() || undefined,
      summary: summary.trim(),
      description: description.trim(),
      learning_outcomes: learningOutcomes.trim() || undefined,
      project_url: projectUrl.trim() || undefined,
      github_url: githubUrl.trim() || undefined,
      featured_media_id: featuredMediaId || undefined,
      media_ids: featuredMediaId ? [featuredMediaId] : [],
      is_featured: isFeatured,
    };

    try {
      if (editingId) {
        await api.updateAdminPortfolio(editingId, payload);
        setNotice('Portofolio berhasil diperbarui.');
      } else {
        await api.createAdminPortfolio(payload);
        setNotice('Portofolio baru berhasil ditambahkan.');
      }
      setShowModal(false);
      loadData();
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert(`Gagal menyimpan: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, portTitle: string) => {
    if (!window.confirm(`Hapus portofolio "${portTitle}" dari database?`)) return;
    try {
      await api.deleteAdminPortfolio(id);
      setNotice('Portofolio berhasil dihapus.');
      loadData();
      setTimeout(() => setNotice(null), 3000);
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
            Kelola Portofolio Kegiatan &amp; Proyek
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Total {portfolios.length} item portofolio terdata secara persisten di database.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Tambah Portofolio
        </button>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Portfolios Table / Cards */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-zinc-500 text-xs">Memuat portofolio...</p>
          </div>
        ) : portfolios.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm">
            Belum ada item portofolio yang tersimpan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Judul Proyek / Kegiatan</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Periode</th>
                  <th className="py-3 px-4">Peran Pemilik</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {portfolios.map(item => (
                  <tr key={item.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-zinc-900 text-sm font-serif">
                        {item.title}
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono truncate mt-0.5">
                        /{item.slug}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap">
                      {item.period || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600">
                      {item.role || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                          title="Sunting"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-zinc-200 max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="font-serif font-bold text-lg text-zinc-900">
                {editingId ? 'Sunting Portofolio' : 'Tambah Portofolio Baru'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-zinc-900 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="overflow-y-auto flex-1 space-y-4 p-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Nama Kegiatan / Proyek *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => {
                    setTitle(e.target.value);
                    if (!editingId && !slug) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  placeholder="e.g. Arsitektur Layanan Terdistribusi"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700">Kategori *</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="e.g. Rekayasa Perangkat Lunak, Dokumentasi Visual"
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700">Periode</label>
                  <input
                    type="text"
                    value={period}
                    onChange={e => setPeriod(e.target.value)}
                    placeholder="e.g. 2025 - 2026"
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700">Peran Pemilik</label>
                  <input
                    type="text"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    placeholder="e.g. Lead Developer, Fotografer"
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700">Foto Sampul Utama</label>
                  <select
                    value={featuredMediaId || ''}
                    onChange={e => setFeaturedMediaId(e.target.value || undefined)}
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                  >
                    <option value="">-- Pilih dari Media Library --</option>
                    {mediaList.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.caption || m.filename}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Ringkasan Singkat (Summary) *</label>
                <textarea
                  rows={2}
                  required
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  placeholder="2-3 kalimat penjelasan ringkas tentang kegiatan..."
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Deskripsi Lengkap (Markdown) *</label>
                <textarea
                  rows={5}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ceritakan proses pelaksanaan, tantangan nyata, dan solusi..."
                  className="w-full p-3 rounded-lg border border-zinc-200 text-xs font-mono bg-zinc-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Hasil &amp; Pembelajaran Nyata (Autentik)</label>
                <textarea
                  rows={2}
                  value={learningOutcomes}
                  onChange={e => setLearningOutcomes(e.target.value)}
                  placeholder="Pelajaran objektif atau dampak nyata yang didapat..."
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700">Tautan Proyek (Opsional)</label>
                  <input
                    type="url"
                    value={projectUrl}
                    onChange={e => setProjectUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700">Tautan GitHub / Kode (Opsional)</label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={e => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="port_featured"
                  checked={isFeatured}
                  onChange={e => setIsFeatured(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="port_featured" className="text-xs font-medium text-zinc-700">
                  Tampilkan di Beranda (Featured Portfolio)
                </label>
              </div>

              <div className="pt-4 border-t border-zinc-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
                >
                  Simpan Portofolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
