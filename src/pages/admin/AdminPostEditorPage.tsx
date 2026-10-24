import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useRouter, Link } from '../../lib/router';
import { Post, Category, Tag, MediaItem, PostRevision, PostStatus } from '../../types';
import { MarkdownRenderer } from '../../components/public/MarkdownRenderer';
import {
  Save,
  Eye,
  CheckCircle,
  Archive,
  ArrowLeft,
  Image as ImageIcon,
  History,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';

export const AdminPostEditorPage: React.FC<{ postId?: string }> = ({ postId }) => {
  const { navigate } = useRouter();
  const isEditing = Boolean(postId);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<PostStatus>('draft');
  const [scheduledAt, setScheduledAt] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [featuredMediaId, setFeaturedMediaId] = useState<string | undefined>(undefined);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [imageAltText, setImageAltText] = useState('');
  const [revisionNote, setRevisionNote] = useState('');

  // Meta collections
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [revisions, setRevisions] = useState<PostRevision[]>([]);

  // Modals & Panels
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showRevisionsModal, setShowRevisionsModal] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Auto-generate slug when title changes unless user manually edited it
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!slugManuallyEdited && !isEditing) {
      const generated = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
    if (!metaTitle) {
      setMetaTitle(newTitle);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [catData, tagData, medData] = await Promise.all([
          api.getAdminCategories(),
          api.getAdminTags(),
          api.getAdminMedia({ limit: 50 }),
        ]);
        setCategories(catData || []);
        setTags(tagData || []);
        setMediaList(medData.media || []);

        if (isEditing && postId) {
          const res = await api.getAdminPost(postId);
          const p = res.post;
          setTitle(p.title);
          setSlug(p.slug);
          setSlugManuallyEdited(true);
          setExcerpt(p.excerpt || '');
          setBody(p.body || '');
          setStatus(p.status);
          setScheduledAt(p.scheduled_at || '');
          setCategoryId(p.category_id || '');
          setSelectedTagIds(p.tag_ids || []);
          setFeaturedMediaId(p.featured_media_id);
          setMetaTitle(p.meta_title || p.title);
          setMetaDesc(p.meta_description || p.excerpt);
          setImageAltText(p.image_alt_text || '');
          setRevisions(res.revisions || []);
        }
      } catch (err: any) {
        console.error('Error loading editor data:', err);
        setNotice(`Gagal memuat artikel: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [postId, isEditing]);

  const handleSave = async (overrideStatus?: PostStatus) => {
    if (!title.trim() || !body.trim()) {
      alert('Judul dan isi artikel wajib diisi.');
      return;
    }

    setSaving(true);
    setNotice(null);

    const postPayload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      body: body.trim(),
      status: overrideStatus || status,
      scheduled_at: status === 'scheduled' ? scheduledAt : undefined,
      category_id: categoryId || undefined,
      tag_ids: selectedTagIds,
      featured_media_id: featuredMediaId || undefined,
      meta_title: metaTitle.trim() || title.trim(),
      meta_description: metaDesc.trim() || excerpt.trim(),
      image_alt_text: imageAltText.trim(),
      revision_note: revisionNote.trim() || (isEditing ? 'Penyuntingan manual artikel' : 'Draf baru dibuat'),
    };

    try {
      if (isEditing && postId) {
        const updated = await api.updateAdminPost(postId, postPayload);
        setStatus(updated.status);
        setNotice('Perubahan artikel berhasil disimpan ke database.');
        // Refresh revisions
        const fresh = await api.getAdminPost(postId);
        setRevisions(fresh.revisions || []);
      } else {
        const created = await api.createAdminPost(postPayload);
        setNotice('Artikel baru berhasil disimpan ke database.');
        setTimeout(() => {
          navigate(`/admin/artikel/${created.id}`);
        }, 800);
      }
      setRevisionNote('');
    } catch (err: any) {
      alert(`Gagal menyimpan: ${err.message}`);
    } finally {
      setSaving(false);
      setTimeout(() => setNotice(null), 3500);
    }
  };

  const handleRestoreRevision = (rev: PostRevision) => {
    if (window.confirm(`Pulihkan versi dari "${rev.saved_by}" (${new Date(rev.created_at).toLocaleString('id-ID')})?`)) {
      setTitle(rev.title);
      setBody(rev.body);
      setExcerpt(rev.excerpt);
      setShowRevisionsModal(false);
      setRevisionNote(`Dipulihkan dari riwayat: ${rev.id.slice(0, 8)}`);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-zinc-500 text-sm">Menyiapkan editor artikel...</p>
      </div>
    );
  }

  const selectedFeaturedMedia = mediaList.find(m => m.id === featuredMediaId);

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/artikel"
            className="p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-900 bg-white"
            title="Kembali ke Daftar Artikel"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-zinc-900">
              {isEditing ? 'Sunting Artikel' : 'Tulis Artikel Baru'}
            </h1>
            <p className="text-xs text-zinc-500">
              Status: <span className="font-semibold uppercase tracking-wider">{status}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {isEditing && revisions.length > 0 && (
            <button
              onClick={() => setShowRevisionsModal(true)}
              className="px-3 py-2 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 flex items-center gap-1.5 cursor-pointer"
            >
              <History className="w-3.5 h-3.5" /> Riwayat Revisi ({revisions.length})
            </button>
          )}

          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-3 py-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
              previewMode
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> {previewMode ? 'Tutup Pratinjau' : 'Pratinjau'}
          </button>

          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="px-3.5 py-2 rounded-lg border border-zinc-300 text-xs font-semibold text-zinc-800 bg-white hover:bg-zinc-50 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" /> Simpan Draf
          </button>

          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Terbitkan Artikel
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* Editor Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Form (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Judul & Slug */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                Judul Artikel *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="Tulis judul artikel yang memikat dan jujur..."
                className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-base font-serif font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                Slug URL (Permalink)
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-zinc-400 font-mono">/tulisan/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={e => {
                    setSlug(e.target.value);
                    setSlugManuallyEdited(true);
                  }}
                  className="w-full px-3 py-1.5 rounded-md border border-zinc-200 text-xs font-mono text-zinc-800 bg-zinc-50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                Ringkasan Singkat (Excerpt) *
              </label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                placeholder="2-3 kalimat pengantar editorial untuk kartu artikel dan ringkasan..."
                className="w-full px-3.5 py-2 rounded-lg border border-zinc-200 text-xs sm:text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          </div>

          {/* Body Editor / Split Preview */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                Isi Artikel (Markdown) *
              </label>
              <span className="text-[11px] text-zinc-400">
                Mendukung heading (##, ###), quote (&gt;), list, code, dan tebal (**teks**)
              </span>
            </div>

            {previewMode ? (
              <div className="border border-zinc-200 rounded-xl p-6 bg-[#fcfbfa] min-h-[400px]">
                <MarkdownRenderer content={body || '*Belum ada isi konten.*'} />
              </div>
            ) : (
              <textarea
                rows={18}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Tuliskan draf artikel lengkap Anda di sini dalam format Markdown..."
                className="w-full p-4 rounded-xl border border-zinc-200 font-mono text-xs sm:text-sm leading-relaxed text-zinc-800 bg-zinc-50/50 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            )}
          </div>
        </div>

        {/* Sidebar Controls (Right 1 col) */}
        <div className="space-y-5">
          {/* Status & Publication Settings */}
          <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider border-b border-zinc-100 pb-2">
              Pengaturan Status
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-600 font-medium">Status Publikasi</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as PostStatus)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs bg-zinc-50 focus:outline-none"
              >
                <option value="draft">Draft (Draf Aktif)</option>
                <option value="in_review">In Review (Pemeriksaan)</option>
                <option value="scheduled">Scheduled (Terjadwal)</option>
                <option value="published">Published (Terbit di Website)</option>
                <option value="archived">Archived (Diarsipkan)</option>
              </select>
            </div>

            {status === 'scheduled' && (
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-600 font-medium">Jadwal Publikasi</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-600 font-medium">Kategori</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs bg-zinc-50 focus:outline-none"
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-600 font-medium">Pilih Tag Relevan</label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map(t => {
                  const isChecked = selectedTagIds.includes(t.id);
                  return (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => {
                        if (isChecked) {
                          setSelectedTagIds(selectedTagIds.filter(id => id !== t.id));
                        } else {
                          setSelectedTagIds([...selectedTagIds, t.id]);
                        }
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors ${
                        isChecked
                          ? 'bg-blue-600 text-white border-blue-600 font-medium'
                          : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      #{t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Featured Media Picker */}
          <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                Foto Utama Artikel
              </h3>
              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Pilih dari Library
              </button>
            </div>

            {selectedFeaturedMedia ? (
              <div className="space-y-2">
                <div className="rounded-xl overflow-hidden aspect-[16/10] bg-zinc-100 border border-zinc-200 relative group">
                  <img
                    src={selectedFeaturedMedia.storage_path}
                    alt={selectedFeaturedMedia.alt_text}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFeaturedMediaId(undefined)}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-zinc-900/80 text-white text-xs hover:bg-rose-600 transition-colors"
                  >
                    Hapus
                  </button>
                </div>
                <input
                  type="text"
                  value={imageAltText}
                  onChange={e => setImageAltText(e.target.value)}
                  placeholder="Alt text gambar untuk aksesibilitas..."
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                className="w-full py-8 border-2 border-dashed border-zinc-300 rounded-xl text-center space-y-2 hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-8 h-8 text-zinc-400 mx-auto" />
                <span className="text-xs text-zinc-600 block font-medium">
                  Klik untuk Memilih Foto Utama
                </span>
              </button>
            )}
          </div>

          {/* SEO Metadata Card */}
          <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider border-b border-zinc-100 pb-2">
              Optimasi SEO &amp; Meta
            </h3>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span>Meta Title</span>
                <span>{metaTitle.length}/60</span>
              </div>
              <input
                type="text"
                value={metaTitle}
                onChange={e => setMetaTitle(e.target.value)}
                maxLength={70}
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span>Meta Description</span>
                <span>{metaDesc.length}/155</span>
              </div>
              <textarea
                rows={3}
                value={metaDesc}
                onChange={e => setMetaDesc(e.target.value)}
                maxLength={165}
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div
          onClick={() => setShowMediaPicker(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-zinc-200 max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="font-serif font-bold text-lg text-zinc-900">
                Pilih Foto dari Media Library
              </h3>
              <button
                onClick={() => setShowMediaPicker(false)}
                className="text-zinc-500 hover:text-zinc-900 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
              {mediaList.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    setFeaturedMediaId(item.id);
                    if (!imageAltText) setImageAltText(item.alt_text || item.caption);
                    setShowMediaPicker(false);
                  }}
                  className={`group cursor-pointer rounded-xl overflow-hidden border-2 transition-all aspect-[4/3] bg-zinc-100 relative ${
                    featuredMediaId === item.id ? 'border-blue-600 ring-2 ring-blue-600' : 'border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <img
                    src={item.storage_path}
                    alt={item.alt_text}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                    Pilih Foto Ini
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Revisions History Modal */}
      {showRevisionsModal && (
        <div
          onClick={() => setShowRevisionsModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-zinc-200 max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="font-serif font-bold text-lg text-zinc-900 flex items-center gap-2">
                <History className="w-5 h-5 text-zinc-600" /> Riwayat Revisi Artikel
              </h3>
              <button
                onClick={() => setShowRevisionsModal(false)}
                className="text-zinc-500 hover:text-zinc-900 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 divide-y divide-zinc-100">
              {revisions.map(rev => (
                <div key={rev.id} className="pt-3 first:pt-0 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-800">{rev.note || 'Pembaruan'}</span>
                    <span className="text-zinc-400">
                      {new Date(rev.created_at).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 line-clamp-1 italic">
                    "{rev.title}"
                  </p>
                  <button
                    onClick={() => handleRestoreRevision(rev)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Pulihkan Versi Ini
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
