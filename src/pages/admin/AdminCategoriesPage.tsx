import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Category, Tag } from '../../types';
import { Tags, Plus, Trash2, Edit2, CheckCircle, AlertCircle } from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  // New Category Form
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catColor, setCatColor] = useState('#2563eb');

  // New Tag Form
  const [tagName, setTagName] = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [catData, tagData] = await Promise.all([
        api.getAdminCategories(),
        api.getAdminTags(),
      ]);
      setCategories(catData || []);
      setTags(tagData || []);
    } catch (err: any) {
      console.error('Failed to load categories/tags:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    try {
      await api.createCategory(catName.trim(), catDesc.trim(), catColor);
      setCatName('');
      setCatDesc('');
      setNotice('Kategori baru berhasil ditambahkan.');
      loadAll();
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert(`Gagal menambah kategori: ${err.message}`);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Hapus kategori "${name}"? Sistem akan menolak jika ada artikel yang menggunakannya.`)) return;
    try {
      const res = await api.deleteCategory(id);
      setNotice('Kategori berhasil dihapus.');
      loadAll();
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;
    try {
      await api.createTag(tagName.trim());
      setTagName('');
      setNotice('Tag baru berhasil ditambahkan.');
      loadAll();
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert(`Gagal menambah tag: ${err.message}`);
    }
  };

  const handleDeleteTag = async (id: string, name: string) => {
    if (!window.confirm(`Hapus tag "${name}"? Sistem akan memeriksa relasi artikel.`)) return;
    try {
      await api.deleteTag(id);
      setNotice('Tag berhasil dihapus.');
      loadAll();
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-zinc-900 tracking-tight">
          Pengelolaan Kategori &amp; Tag
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Kelola taksonomi konten artikel. Sistem mencegah penghapusan jika kategori/tag masih digunakan pada artikel aktif.
        </p>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Kategori Column */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-4">
            <h2 className="font-serif font-bold text-base text-zinc-900 border-b border-zinc-100 pb-2">
              Tambah Kategori Baru
            </h2>
            <form onSubmit={handleAddCategory} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  placeholder="e.g. Catatan Perjalanan"
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Deskripsi Kategori</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={e => setCatDesc(e.target.value)}
                  placeholder="Penjelasan topik bahasan..."
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Kategori
              </button>
            </form>
          </div>

          {/* List Categories */}
          <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-3">
            <h3 className="font-serif font-bold text-sm text-zinc-900">
              Daftar Kategori ({categories.length})
            </h3>
            {categories.length === 0 ? (
              <p className="text-xs text-zinc-400 py-3 text-center">Belum ada kategori.</p>
            ) : (
              <div className="divide-y divide-zinc-100">
                {categories.map(cat => (
                  <div key={cat.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-800">{cat.name}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">slug: {cat.slug}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                      title="Hapus Kategori"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tag Column */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-4">
            <h2 className="font-serif font-bold text-base text-zinc-900 border-b border-zinc-100 pb-2">
              Tambah Tag Baru
            </h2>
            <form onSubmit={handleAddTag} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Nama Tag *</label>
                <input
                  type="text"
                  required
                  value={tagName}
                  onChange={e => setTagName(e.target.value)}
                  placeholder="e.g. AI & Otomasi"
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Tag
              </button>
            </form>
          </div>

          {/* List Tags */}
          <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-3">
            <h3 className="font-serif font-bold text-sm text-zinc-900">
              Daftar Tag ({tags.length})
            </h3>
            {tags.length === 0 ? (
              <p className="text-xs text-zinc-400 py-3 text-center">Belum ada tag.</p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {tags.map(tag => (
                  <div
                    key={tag.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-700"
                  >
                    <span>#{tag.name}</span>
                    <button
                      onClick={() => handleDeleteTag(tag.id, tag.name)}
                      className="text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Hapus Tag"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
