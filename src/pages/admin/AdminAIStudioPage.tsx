import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useRouter } from '../../lib/router';
import { MediaItem, AIGeneratedContent, Category, Tag } from '../../types';
import { MarkdownRenderer } from '../../components/public/MarkdownRenderer';
import {
  Sparkles,
  Image as ImageIcon,
  Send,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Clock,
  Tag as TagIcon,
  Wand2,
  ChevronDown,
  ChevronUp,
  History,
  Info,
} from 'lucide-react';

export const AdminAIStudioPage: React.FC = () => {
  const { navigate } = useRouter();

  // Media & options state
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [geminiConnected, setGeminiConnected] = useState(true);

  // Form Inputs
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [contentType, setContentType] = useState('Cerita kehidupan');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [eventContext, setEventContext] = useState('');
  const [storyBehind, setStoryBehind] = useState('');
  const [mainMessage, setMainMessage] = useState('');
  const [perspective, setPerspective] = useState('Orang pertama tunggal');
  const [tone, setTone] = useState('Natural dan santai');
  const [length, setLength] = useState('Artikel 600–900 kata');

  // Generation & Results
  const [generating, setGenerating] = useState(false);
  const [revising, setRevising] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Active AI Result and Revision History Stack
  const [activeDraft, setActiveDraft] = useState<AIGeneratedContent | null>(null);
  const [historyStack, setHistoryStack] = useState<AIGeneratedContent[]>([]);
  const [customRevisionInstruction, setCustomRevisionInstruction] = useState('');
  const [showMediaModal, setShowMediaModal] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [dashData, medData, catData, tagData] = await Promise.all([
          api.getDashboardStats(),
          api.getAdminMedia({ limit: 50 }),
          api.getAdminCategories(),
          api.getAdminTags(),
        ]);
        setGeminiConnected(dashData.gemini_status.connected);
        setMediaList(medData.media || []);
        setCategories(catData || []);
        setTags(tagData || []);
      } catch (err) {
        console.error('Error loading AI Studio resources:', err);
      }
    }
    load();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    if (!eventContext.trim() && !storyBehind.trim()) {
      setError('Harap masukkan konteks kejadian atau cerita di balik foto agar narasi tidak mengarang fakta bebas.');
      return;
    }

    setGenerating(true);
    try {
      const result = await api.generateAINarrative({
        photos: selectedPhotos,
        contentType,
        eventDate: eventDate || undefined,
        location: location || undefined,
        eventContext: eventContext.trim(),
        storyBehind: storyBehind.trim(),
        mainMessage: mainMessage.trim(),
        perspective,
        tone,
        length,
      });

      setActiveDraft(result);
      setHistoryStack([result]);
      setSuccessNotice('Draf narasi terstruktur berhasil dihasilkan oleh model Gemini.');
    } catch (err: any) {
      setError(err.message || 'Gagal menghasilkan narasi.');
    } finally {
      setGenerating(false);
    }
  };

  const handleRevisionAction = async (action: string) => {
    if (!activeDraft) return;
    setError(null);
    setSuccessNotice(null);
    setRevising(true);

    try {
      const revised = await api.reviseAINarrative({
        currentDraft: activeDraft,
        action,
        customInstruction: customRevisionInstruction.trim() || undefined,
      });

      setHistoryStack(prev => [revised, ...prev]);
      setActiveDraft(revised);
      setSuccessNotice(`Revisi AI berhasil diterapkan: "${action}".`);
      setCustomRevisionInstruction('');
    } catch (err: any) {
      setError(err.message || 'Gagal merevisi narasi.');
    } finally {
      setRevising(false);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!activeDraft) return;
    setSavingDraft(true);
    setError(null);

    // Find suggested category id if exists
    const matchedCategory = categories.find(
      c => c.name.toLowerCase().includes(activeDraft.suggested_category.toLowerCase()) ||
           activeDraft.suggested_category.toLowerCase().includes(c.name.toLowerCase())
    );

    // Match tags
    const matchedTagIds = tags
      .filter(t => activeDraft.suggested_tags.some(st => st.toLowerCase().includes(t.name.toLowerCase())))
      .map(t => t.id);

    try {
      const res = await api.saveAIDraftAsPost({
        aiResult: activeDraft,
        featured_media_id: undefined,
        category_id: matchedCategory?.id,
        tag_ids: matchedTagIds,
      });

      setSuccessNotice('Draf artikel berhasil disimpan di database CMS (Status: Draft). Mengalihkan ke editor...');
      setTimeout(() => {
        navigate(`/admin/artikel/${res.post.id}`);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan draf.');
      setSavingDraft(false);
    }
  };

  const togglePhotoSelection = (path: string) => {
    if (selectedPhotos.includes(path)) {
      setSelectedPhotos(selectedPhotos.filter(p => p !== path));
    } else {
      if (selectedPhotos.length >= 4) {
        alert('Maksimal 4 foto per analisis untuk kontrol biaya dan token.');
        return;
      }
      setSelectedPhotos([...selectedPhotos, path]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-4">
        <div className="flex items-center gap-2 text-amber-600 mb-1">
          <Sparkles className="w-5 h-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            AI Content Assistant
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 tracking-tight">
          AI Studio: Photo-to-Story Generator
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-2xl leading-relaxed">
          Ubah dokumentasi foto dan konteks kejadian menjadi draf narasi, esai, refleksi, serta metadata SEO dalam Bahasa Indonesia yang autentik dan bebas klise.
        </p>
      </div>

      {!geminiConnected && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Layanan Gemini API Belum Terhubung</p>
            <p className="text-amber-800 leading-relaxed">
              Kunci API belum dikonfigurasi di environment server. Pastikan variabel <code>GEMINI_API_KEY</code> telah diset di panel Secrets atau file <code>.env</code>.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Main Grid: Form Input (Left) and Generated Output (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Photo & Context Input */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-6">
          <h2 className="font-serif font-bold text-lg text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-blue-600" /> Masukan Foto &amp; Konteks Faktual
          </h2>

          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Foto Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                  Foto Dokumentasi ({selectedPhotos.length}/4)
                </label>
                <button
                  type="button"
                  onClick={() => setShowMediaModal(true)}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Pilih dari Media Library
                </button>
              </div>

              {selectedPhotos.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setShowMediaModal(true)}
                  className="w-full py-8 border-2 border-dashed border-zinc-300 rounded-xl text-center space-y-2 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-8 h-8 text-zinc-400 mx-auto" />
                  <span className="text-xs text-zinc-600 block font-medium">
                    Pilih 1 - 4 Foto untuk Dianalisis
                  </span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {selectedPhotos.map((path, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden aspect-[4/3] border border-zinc-200 group">
                      <img src={path} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => togglePhotoSelection(path)}
                        className="absolute top-1.5 right-1.5 p-1 rounded bg-black/70 text-white text-[10px] hover:bg-rose-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Content Type & Tone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Jenis Konten</label>
                <select
                  value={contentType}
                  onChange={e => setContentType(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                >
                  <option value="Cerita kehidupan">Cerita kehidupan</option>
                  <option value="Opini dan refleksi">Opini dan refleksi</option>
                  <option value="Perjalanan dan aktivitas">Perjalanan dan aktivitas</option>
                  <option value="Pengalaman profesional">Pengalaman profesional</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Gaya Bahasa</label>
                <select
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                >
                  <option value="Natural dan santai">Natural dan santai</option>
                  <option value="Reflektif dan personal">Reflektif dan personal</option>
                  <option value="Profesional dan informatif">Profesional dan informatif</option>
                </select>
              </div>
            </div>

            {/* Perspective & Length */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Sudut Pandang</label>
                <select
                  value={perspective}
                  onChange={e => setPerspective(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                >
                  <option value="Orang pertama tunggal">Orang pertama tunggal (Saya)</option>
                  <option value="Orang pertama jamak">Orang pertama jamak (Kami/Kita)</option>
                  <option value="Orang ketiga">Orang ketiga (Dia/Mereka)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Target Panjang</label>
                <select
                  value={length}
                  onChange={e => setLength(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                >
                  <option value="Caption singkat">Caption singkat</option>
                  <option value="Artikel 600–900 kata">Artikel 600–900 kata</option>
                  <option value="Artikel 1.000–1.500 kata">Artikel 1.000–1.500 kata</option>
                </select>
              </div>
            </div>

            {/* Tanggal & Lokasi Opsional */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Tanggal Kejadian (Opsional)</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={e => setEventDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Lokasi Nyata (Opsional)</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Yogyakarta, Bandung"
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                />
              </div>
            </div>

            {/* Konteks Kejadian */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-zinc-700 uppercase tracking-wide">
                  Konteks Kejadian Faktual *
                </label>
                <span className="text-[11px] text-zinc-400">Sumber fakta utama AI</span>
              </div>
              <textarea
                rows={3}
                required
                value={eventContext}
                onChange={e => setEventContext(e.target.value)}
                placeholder="Ceritakan apa yang sebenarnya terjadi saat foto diambil: siapa saja yang hadir, dalam rangka apa, situasi nyata..."
                className="w-full p-3 rounded-lg border border-zinc-200 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-zinc-50"
              />
            </div>

            {/* Cerita di balik foto */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                Cerita di Balik Foto / Hal Menarik
              </label>
              <textarea
                rows={2}
                value={storyBehind}
                onChange={e => setStoryBehind(e.target.value)}
                placeholder="Detail non-visual, percakapan bermakna, atau momen tak terduga..."
                className="w-full p-3 rounded-lg border border-zinc-200 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-zinc-50"
              />
            </div>

            {/* Pesan Utama */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                Pesan / Refleksi Utama
              </label>
              <input
                type="text"
                value={mainMessage}
                onChange={e => setMainMessage(e.target.value)}
                placeholder="Apa kesimpulan atau gagasan inti yang ingin dibagikan?"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-zinc-50"
              />
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {generating ? 'Menganalisis & Menyusun Narasi...' : 'Buat Narasi dengan Gemini'}
            </button>
          </form>
        </div>

        {/* Right Output: Narrative Result & 10 AI Revision Tools */}
        <div className="lg:col-span-7 space-y-6">
          {!activeDraft ? (
            <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-zinc-300 space-y-3">
              <Sparkles className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="font-serif font-bold text-lg text-zinc-900">
                Studio Narasi Masih Kosong
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                Pilih foto dokumentasi di sebelah kiri, lengkapi konteks faktual, dan tekan tombol <strong>"Buat Narasi"</strong> untuk memulai generasi.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Needs Context Alert Banner if model flagged missing data */}
              {activeDraft.needs_context && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    <span>Perhatian: AI Membutuhkan Konteks Tambahan</span>
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    Informasi berikut belum tersedia dari data input Anda, sehingga tulisan dibatasi agar tidak mengarang fakta:
                  </p>
                  {activeDraft.missing_context && activeDraft.missing_context.length > 0 && (
                    <ul className="list-disc pl-5 space-y-0.5 pt-1 text-[11px]">
                      {activeDraft.missing_context.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* 10 AI Revision Actions Toolbar */}
              <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-blue-600" /> Alat Revisi Narasi AI (10 Aksi)
                  </span>
                  {historyStack.length > 1 && (
                    <span className="text-[11px] text-zinc-400">
                      Riwayat: Versi ke-{historyStack.length}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Perbaiki Alur', action: 'perbaiki_alur' },
                    { label: 'Buat Lebih Natural', action: 'buat_natural' },
                    { label: 'Ringkas Tulisan', action: 'ringkas' },
                    { label: 'Perpanjang Narasi', action: 'perpanjang' },
                    { label: 'Perbaiki Ejaan & EYD', action: 'perbaiki_ejaan' },
                    { label: 'Alternatif Judul', action: 'alternatif_judul' },
                    { label: 'Buat Caption Tajam', action: 'buat_caption' },
                    { label: 'Perbarui Ringkasan', action: 'buat_ringkasan' },
                    { label: 'Versi Baru', action: 'versi_baru' },
                  ].map(tool => (
                    <button
                      key={tool.action}
                      disabled={revising}
                      onClick={() => handleRevisionAction(tool.action)}
                      className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {tool.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={customRevisionInstruction}
                    onChange={e => setCustomRevisionInstruction(e.target.value)}
                    placeholder="Instruksi tambahan (misal: 'tekankan peran arsitektur server')..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
                  />
                  <button
                    disabled={revising}
                    onClick={() => handleRevisionAction('ubah_gaya')}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
                  >
                    Terapkan
                  </button>
                </div>
              </div>

              {/* Draf Card & Editor */}
              <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-semibold text-blue-900 uppercase tracking-wider">
                      Saran Kategori: {activeDraft.suggested_category}
                    </span>
                    <h2 className="font-serif font-bold text-xl sm:text-2xl text-zinc-900">
                      {activeDraft.title}
                    </h2>
                  </div>

                  <button
                    onClick={handleSaveAsDraft}
                    disabled={savingDraft}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingDraft ? 'Menyimpan...' : 'Simpan sebagai Draf'}
                  </button>
                </div>

                {/* Alternative Titles */}
                {activeDraft.alternative_titles && activeDraft.alternative_titles.length > 0 && (
                  <div className="p-3 bg-zinc-50 rounded-xl space-y-1">
                    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                      Alternatif Judul:
                    </span>
                    <ul className="space-y-1 text-xs text-zinc-700">
                      {activeDraft.alternative_titles.map((t, idx) => (
                        <li
                          key={idx}
                          onClick={() => setActiveDraft({ ...activeDraft, title: t })}
                          className="cursor-pointer hover:text-blue-900 flex items-center gap-1"
                        >
                          <span>•</span> <span>{t}</span> <span className="text-[10px] text-zinc-400 font-sans">(klik untuk pakai)</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Excerpt */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                    Ringkasan Editorial (Excerpt)
                  </label>
                  <textarea
                    rows={2}
                    value={activeDraft.excerpt}
                    onChange={e => setActiveDraft({ ...activeDraft, excerpt: e.target.value })}
                    className="w-full p-3 rounded-lg border border-zinc-200 text-xs sm:text-sm text-zinc-700 bg-zinc-50 focus:outline-none"
                  />
                </div>

                {/* Caption */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                    Caption Foto Utama
                  </label>
                  <input
                    type="text"
                    value={activeDraft.caption}
                    onChange={e => setActiveDraft({ ...activeDraft, caption: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-700 bg-zinc-50"
                  />
                </div>

                {/* Body Markdown */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                      Isi Narasi Lengkap (Markdown)
                    </label>
                    <span className="text-[11px] text-zinc-400">Dapat diedit langsung</span>
                  </div>
                  <textarea
                    rows={12}
                    value={activeDraft.body_markdown}
                    onChange={e => setActiveDraft({ ...activeDraft, body_markdown: e.target.value })}
                    className="w-full p-4 rounded-xl border border-zinc-200 font-mono text-xs leading-relaxed text-zinc-800 bg-zinc-50/50 focus:outline-none"
                  />
                </div>

                {/* Preview Card */}
                <div className="border-t border-zinc-100 pt-4 space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Pratinjau Tampilan Pembaca:
                  </span>
                  <div className="p-6 rounded-xl border border-zinc-200 bg-[#fcfbfa]">
                    <MarkdownRenderer content={activeDraft.body_markdown} />
                  </div>
                </div>

                {/* Tags & SEO */}
                <div className="border-t border-zinc-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-semibold text-zinc-600 block mb-1">Saran Tag:</span>
                    <div className="flex flex-wrap gap-1">
                      {activeDraft.suggested_tags?.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-600 block mb-1">Saran Slug:</span>
                    <code className="text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">
                      /{activeDraft.slug_suggestion}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Media Picker Modal */}
      {showMediaModal && (
        <div
          onClick={() => setShowMediaModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-zinc-200 max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="font-serif font-bold text-lg text-zinc-900">
                Pilih Foto dari Media Library (Maks 4)
              </h3>
              <button
                onClick={() => setShowMediaModal(false)}
                className="text-zinc-500 hover:text-zinc-900 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
              {mediaList.map(item => {
                const isSelected = selectedPhotos.includes(item.storage_path);
                return (
                  <div
                    key={item.id}
                    onClick={() => togglePhotoSelection(item.storage_path)}
                    className={`group cursor-pointer rounded-xl overflow-hidden border-2 transition-all aspect-[4/3] bg-zinc-100 relative ${
                      isSelected ? 'border-amber-500 ring-2 ring-amber-500' : 'border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    <img
                      src={item.storage_path}
                      alt={item.alt_text}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                      {isSelected ? 'Batal Pilih' : 'Pilih Foto'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                {selectedPhotos.length} foto dipilih
              </span>
              <button
                onClick={() => setShowMediaModal(false)}
                className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
