import React, { useEffect, useState, useRef } from 'react';
import { api } from '../../lib/api';
import { MediaItem, Album } from '../../types';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Edit2,
  Calendar,
  MapPin,
  Lock,
  Globe,
  CheckCircle,
  AlertCircle,
  Search,
  FolderPlus,
} from 'lucide-react';

export const AdminMediaPage: React.FC = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedAlbum, setSelectedAlbum] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Edit Metadata Modal State
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [editAlt, setEditAlt] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editAlbumId, setEditAlbumId] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(true);

  // New Album Modal State
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDesc, setNewAlbumDesc] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const [medRes, albRes] = await Promise.all([
        api.getAdminMedia({
          album_id: selectedAlbum === 'all' ? undefined : selectedAlbum,
          search: searchTerm.trim() || undefined,
          limit: 60,
        }),
        api.getAdminAlbums(),
      ]);
      setMedia(medRes.media || []);
      setTotal(medRes.total || 0);
      setAlbums(albRes || []);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat media library.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [selectedAlbum]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    setNotice(null);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('photos', files[i]);
    }
    if (selectedAlbum !== 'all') {
      formData.append('album_id', selectedAlbum);
    }

    try {
      const res = await api.uploadMedia(formData);
      setNotice(`${res.media.length} foto berhasil diunggah dan disimpan ke server.`);
      loadMedia();
    } catch (err: any) {
      setError(err.message || 'Gagal mengunggah gambar.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setNotice(null), 3500);
    }
  };

  const handleEditClick = (item: MediaItem) => {
    setEditingItem(item);
    setEditAlt(item.alt_text || '');
    setEditCaption(item.caption || '');
    setEditDesc(item.description || '');
    setEditLocation(item.location || '');
    setEditDate(item.doc_date || '');
    setEditAlbumId(item.album_id || '');
    setEditIsPublic(item.is_public);
  };

  const handleSaveMetadata = async () => {
    if (!editingItem) return;
    try {
      await api.updateMedia(editingItem.id, {
        alt_text: editAlt.trim(),
        caption: editCaption.trim(),
        description: editDesc.trim(),
        location: editLocation.trim(),
        doc_date: editDate || undefined,
        album_id: editAlbumId || undefined,
        is_public: editIsPublic,
      });
      setNotice('Metadata foto berhasil diperbarui.');
      setEditingItem(null);
      loadMedia();
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert(`Gagal menyimpan metadata: ${err.message}`);
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!window.confirm(`Hapus foto "${item.filename}" secara permanen? Sistem akan memeriksa apakah foto masih digunakan di artikel/portofolio.`)) {
      return;
    }
    try {
      await api.deleteMedia(item.id);
      setNotice('Foto berhasil dihapus.');
      loadMedia();
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;
    try {
      await api.createAlbum(newAlbumName.trim(), newAlbumDesc.trim());
      setShowAlbumModal(false);
      setNewAlbumName('');
      setNewAlbumDesc('');
      setNotice('Album dokumentasi berhasil dibuat.');
      loadMedia();
    } catch (err: any) {
      alert(`Gagal membuat album: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-zinc-900 tracking-tight">
            Media Library &amp; Arsip Foto
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Total {total} file foto tersimpan di server. Mendukung upload jamak, drag-and-drop, serta penandaan metadata.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAlbumModal(true)}
            className="px-3.5 py-2 rounded-xl border border-zinc-300 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 flex items-center gap-1.5 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-zinc-600" /> Buat Album
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Mengunggah...' : 'Unggah Foto'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={e => handleFileUpload(e.target.files)}
            className="hidden"
          />
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Album filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setSelectedAlbum('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedAlbum === 'all'
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Semua Album
          </button>
          {albums.map(alb => (
            <button
              key={alb.id}
              onClick={() => setSelectedAlbum(alb.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedAlbum === alb.id
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {alb.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <form
            onSubmit={e => {
              e.preventDefault();
              loadMedia();
            }}
            className="relative flex-1 sm:w-60"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari foto..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2" />
          </form>
        </div>
      </div>

      {/* Media Grid */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-zinc-500 text-xs">Memuat foto...</p>
          </div>
        ) : media.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm space-y-2">
            <ImageIcon className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
            <p>Belum ada foto dalam galeri.</p>
            <p className="text-xs text-zinc-400">Klik "Unggah Foto" untuk menambahkan dokumentasi baru.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {media.map(item => (
              <div
                key={item.id}
                className="group rounded-xl overflow-hidden border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div className="aspect-[4/3] bg-zinc-100 overflow-hidden relative">
                  <img
                    src={item.storage_path}
                    alt={item.alt_text}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    {item.is_public ? (
                      <span className="p-1 rounded bg-zinc-900/70 text-emerald-400 block" title="Publik">
                        <Globe className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="p-1 rounded bg-zinc-900/70 text-amber-400 block" title="Privat">
                        <Lock className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 space-y-1">
                  <p className="text-xs font-semibold text-zinc-900 truncate">
                    {item.caption || item.alt_text || item.filename}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate">
                    {item.filename} • {Math.round(item.size_bytes / 1024)} KB
                  </p>
                </div>

                <div className="p-2 pt-0 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                  <button
                    onClick={() => handleEditClick(item)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Metadata Modal */}
      {editingItem && (
        <div
          onClick={() => setEditingItem(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-zinc-200"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="font-serif font-bold text-lg text-zinc-900">
                Sunting Metadata Foto
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-zinc-500 hover:text-zinc-900 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Alt Text (Aksesibilitas)</label>
                <input
                  type="text"
                  value={editAlt}
                  onChange={e => setEditAlt(e.target.value)}
                  placeholder="Deskripsi objektif gambar..."
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Caption Foto</label>
                <input
                  type="text"
                  value={editCaption}
                  onChange={e => setEditCaption(e.target.value)}
                  placeholder="Judul / caption singkat..."
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Deskripsi Lengkap</label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  placeholder="Keterangan konteks foto..."
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700">Tanggal Dokumentasi</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700">Lokasi</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={e => setEditLocation(e.target.value)}
                    placeholder="Kota atau nama tempat"
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Album</label>
                <select
                  value={editAlbumId}
                  onChange={e => setEditAlbumId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                >
                  <option value="">-- Tanpa Album --</option>
                  {albums.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_public_check"
                  checked={editIsPublic}
                  onChange={e => setEditIsPublic(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="is_public_check" className="text-xs font-medium text-zinc-700">
                  Tampilkan di Galeri Publik Website
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveMetadata}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 shadow-xs"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Album Modal */}
      {showAlbumModal && (
        <div
          onClick={() => setShowAlbumModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-zinc-200"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <h3 className="font-serif font-bold text-base text-zinc-900">
                Buat Album Baru
              </h3>
              <button onClick={() => setShowAlbumModal(false)} className="text-zinc-400 hover:text-zinc-900">✕</button>
            </div>

            <form onSubmit={handleCreateAlbum} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Nama Album *</label>
                <input
                  type="text"
                  required
                  value={newAlbumName}
                  onChange={e => setNewAlbumName(e.target.value)}
                  placeholder="e.g. Riset Lapangan 2026"
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={newAlbumDesc}
                  onChange={e => setNewAlbumDesc(e.target.value)}
                  placeholder="Keterangan tentang koleksi ini..."
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAlbumModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800"
                >
                  Buat Album
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
