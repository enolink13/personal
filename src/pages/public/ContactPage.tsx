import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Profile, SiteSettings } from '../../types';
import { Mail, Send, Github, Linkedin, Twitter, Instagram, CheckCircle2, AlertCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    website_hp: '', // Honeypot field for bot protection
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [profData, settData] = await Promise.all([
          api.getPublicProfile(),
          api.getPublicSettings(),
        ]);
        setProfile(profData);
        setSettings(settData);
      } catch (err) {
        console.error('Failed to load contact info:', err);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus({ type: 'error', message: 'Harap isi nama, alamat email, dan pesan Anda.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.sendContactMessage(formData);
      setStatus({ type: 'success', message: res.message || 'Pesan Anda berhasil dikirimkan.' });
      setFormData({ name: '', email: '', subject: '', message: '', website_hp: '' });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Gagal mengirim pesan. Silakan coba lagi.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-zinc-900 tracking-tight">
          Hubungi Saya
        </h1>
        <p className="text-zinc-600 text-base max-w-xl leading-relaxed">
          Terbuka untuk diskusi kolaborasi teknologi, penulisan esai, kritik konstruktif, atau sekadar berbagi pandangan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
        {/* Info Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
            <h3 className="font-serif font-bold text-lg text-zinc-900">
              Saluran Komunikasi
            </h3>

            {profile?.contact_email && (
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Email
                </span>
                <p className="text-sm font-medium text-zinc-900">
                  <a
                    href={`mailto:${profile.contact_email}`}
                    className="hover:underline text-blue-900"
                  >
                    {profile.contact_email}
                  </a>
                </p>
              </div>
            )}

            <div className="space-y-1 pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Catatan
              </span>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {profile?.contact_note ||
                  'Pesan Anda akan masuk ke inbox CMS admin dan saya berupaya membalas dalam kurun waktu 1-2 hari kerja.'}
              </p>
            </div>

            {profile?.social_links && (
              <div className="pt-3 border-t border-zinc-200">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-2">
                  Jejaring Sosial
                </span>
                <div className="flex items-center gap-2">
                  {profile.social_links.github && (
                    <a
                      href={profile.social_links.github}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700 transition-colors"
                      title="GitHub"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {profile.social_links.linkedin && (
                    <a
                      href={profile.social_links.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700 transition-colors"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {profile.social_links.twitter && (
                    <a
                      href={profile.social_links.twitter}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700 transition-colors"
                      title="Twitter / X"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {profile.social_links.instagram && (
                    <a
                      href={profile.social_links.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700 transition-colors"
                      title="Instagram"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Column */}
        <div className="md:col-span-3">
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 rounded-2xl border border-zinc-200 bg-white shadow-xs space-y-4"
          >
            <h3 className="font-serif font-bold text-xl text-zinc-900 pb-2 border-b border-zinc-100">
              Kirim Pesan Langsung
            </h3>

            {status && (
              <div
                className={`p-4 rounded-xl text-sm flex items-start gap-2.5 ${
                  status.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {status.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                )}
                <span>{status.message}</span>
              </div>
            )}

            {/* Honeypot field (hidden from genuine users, traps spam bots) */}
            <div className="hidden" aria-hidden="true">
              <input
                type="text"
                name="website_hp"
                tabIndex={-1}
                autoComplete="off"
                value={formData.website_hp}
                onChange={e => setFormData({ ...formData, website_hp: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                  Nama Anda *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama lengkap atau panggilan"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                  Email Anda *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="nama@domain.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                Subjek
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Topik atau judul pesan"
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                Pesan *
              </label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tuliskan pesan Anda secara ringkas dan jelas..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Mengirim Pesan...' : 'Kirim Pesan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
