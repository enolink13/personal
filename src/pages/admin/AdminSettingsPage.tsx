import React, { useEffect, useState, useRef } from 'react';
import { api } from '../../lib/api';
import { Profile, SiteSettings } from '../../types';
import {
  Settings,
  User,
  Shield,
  Download,
  Upload,
  FileDown,
  CheckCircle,
  AlertCircle,
  Save,
  Lock,
  Globe,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const restoreInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const [profData, settData] = await Promise.all([
          api.getAdminProfile(),
          api.getAdminSettings(),
        ]);
        setProfile(profData);
        setSettings(settData);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat pengaturan.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !settings) return;
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      await Promise.all([
        api.updateAdminProfile(profile),
        api.updateAdminSettings(settings),
      ]);
      setNotice('Semua pengaturan dan profil personal berhasil diperbarui di database.');
      setTimeout(() => setNotice(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordNotice(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Kata sandi baru minimal 6 karakter.');
      return;
    }

    try {
      await api.changePassword(currentPassword, newPassword);
      setPasswordNotice('Kata sandi admin berhasil diperbarui.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordNotice(null), 3500);
    } catch (err: any) {
      setPasswordError(err.message || 'Gagal mengubah kata sandi.');
    }
  };

  const handleRestoreJson = async (file: File | null) => {
    if (!file) return;
    if (!window.confirm('PERINGATAN: Memulihkan cadangan akan menimpa seluruh isi basis data saat ini. Lanjutkan?')) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      await api.restoreBackup(parsed);
      alert('Basis data berhasil dipulihkan dari cadangan. Halaman akan dimuat ulang.');
      window.location.reload();
    } catch (err: any) {
      alert(`Gagal memulihkan cadangan: ${err.message}`);
    } finally {
      if (restoreInputRef.current) restoreInputRef.current.value = '';
    }
  };

  if (loading || !profile || !settings) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-zinc-500 text-sm">Memuat pengaturan website...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-zinc-900 tracking-tight">
          Pengaturan Website, Profil &amp; Cadangan
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Kelola informasi identitas publik, tampilan beranda, keamanan akun, serta ekspor/impor data.
        </p>
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

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* 1. Pengaturan Identitas Global */}
        <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-4">
          <h2 className="font-serif font-bold text-base text-zinc-900 border-b border-zinc-100 pb-2 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" /> Identitas &amp; SEO Global Website
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700">Nama Situs (Site Title)</label>
              <input
                type="text"
                value={settings.site_title}
                onChange={e => setSettings({ ...settings, site_title: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700">Tagline Website</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={e => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700">Deskripsi Meta Global (SEO)</label>
            <textarea
              rows={2}
              value={settings.site_description}
              onChange={e => setSettings({ ...settings, site_description: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700">Teks Hak Cipta Footer</label>
            <input
              type="text"
              value={settings.footer_text}
              onChange={e => setSettings({ ...settings, footer_text: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
            />
          </div>
        </div>

        {/* 2. Hero Beranda */}
        <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-4">
          <h2 className="font-serif font-bold text-base text-zinc-900 border-b border-zinc-100 pb-2">
            Bagian Hero Beranda
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700">Teks Salam (Greeting)</label>
              <input
                type="text"
                value={settings.hero_greeting}
                onChange={e => setSettings({ ...settings, hero_greeting: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700">Judul Utama Hero</label>
              <input
                type="text"
                value={settings.hero_title}
                onChange={e => setSettings({ ...settings, hero_title: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700">Pengantar Singkat Hero</label>
            <textarea
              rows={2}
              value={settings.hero_bio}
              onChange={e => setSettings({ ...settings, hero_bio: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
            />
          </div>
        </div>

        {/* 3. Profil Personal */}
        <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-4">
          <h2 className="font-serif font-bold text-base text-zinc-900 border-b border-zinc-100 pb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-zinc-700" /> Profil Pribadi &amp; Halaman Tentang Saya
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700">Nama Pemilik *</label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700">Headline Profesional</label>
              <input
                type="text"
                value={profile.headline}
                onChange={e => setProfile({ ...profile, headline: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700">URL Foto Profil</label>
            <input
              type="text"
              value={profile.avatar_url}
              onChange={e => setProfile({ ...profile, avatar_url: e.target.value })}
              placeholder="https://... atau /uploads/..."
              className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700">Biografi Singkat (Short Bio)</label>
            <textarea
              rows={2}
              value={profile.short_bio}
              onChange={e => setProfile({ ...profile, short_bio: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700">Biografi Lengkap (Full Bio)</label>
            <textarea
              rows={5}
              value={profile.full_bio}
              onChange={e => setProfile({ ...profile, full_bio: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs leading-relaxed bg-zinc-50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700">Email Publik Kontak</label>
              <input
                type="email"
                value={profile.contact_email}
                onChange={e => setProfile({ ...profile, contact_email: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700">Catatan Kontak</label>
              <input
                type="text"
                value={profile.contact_note}
                onChange={e => setProfile({ ...profile, contact_note: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Menyimpan Perubahan...' : 'Simpan Semua Pengaturan'}
        </button>
      </form>

      {/* 4. Keamanan: Ganti Password Admin */}
      <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-4">
        <h2 className="font-serif font-bold text-base text-zinc-900 border-b border-zinc-100 pb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-rose-600" /> Keamanan Akun &amp; Kata Sandi Admin
        </h2>

        {passwordNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{passwordNotice}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700">Kata Sandi Saat Ini</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700">Kata Sandi Baru</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700">Konfirmasi Kata Sandi Baru</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" /> Perbarui Kata Sandi
          </button>
        </form>
      </div>

      {/* 5. Backup & Portabilitas (Section 14) */}
      <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-4">
        <h2 className="font-serif font-bold text-base text-zinc-900 border-b border-zinc-100 pb-2 flex items-center gap-2">
          <Download className="w-4 h-4 text-indigo-600" /> Cadangan &amp; Portabilitas Data Konten
        </h2>
        <p className="text-xs text-zinc-500 leading-relaxed max-w-xl">
          Sebagai pemilik situs, Anda berhak penuh atas seluruh data. Unduh arsip lengkap dalam format JSON atau bundle seluruh artikel dalam Markdown.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a
            href={api.downloadBackupUrl}
            download
            className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-xs font-semibold text-zinc-800 flex items-center gap-2 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-blue-600" /> Unduh Cadangan Penuh (JSON)
          </a>

          <a
            href={api.downloadMarkdownExportUrl}
            download
            className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-xs font-semibold text-zinc-800 flex items-center gap-2 shadow-xs transition-colors"
          >
            <FileDown className="w-4 h-4 text-emerald-600" /> Ekspor Seluruh Artikel (Markdown)
          </a>

          <button
            type="button"
            onClick={() => restoreInputRef.current?.click()}
            className="px-4 py-2.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-zinc-500" /> Pulihkan Data dari Cadangan JSON
          </button>
          <input
            ref={restoreInputRef}
            type="file"
            accept=".json,application/json"
            onChange={e => handleRestoreJson(e.target.files?.[0] || null)}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};
