import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Profile } from '../../types';
import { Link } from '../../lib/router';
import { Github, Linkedin, Twitter, Instagram, Mail, CheckCircle2, Briefcase, Heart, Compass } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getPublicProfile();
        setProfile(data);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-500 text-sm">Memuat informasi profil...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-zinc-600">Informasi profil belum tersedia.</p>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-16">
      {/* Header Bio */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-zinc-200">
          {profile.avatar_url && (
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0 shadow-sm">
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-blue-900">
              Tentang Pemilik Website
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-zinc-900 tracking-tight">
              {profile.name}
            </h1>
            <p className="text-base text-zinc-600 font-medium">
              {profile.headline}
            </p>
            <div className="flex items-center gap-2 pt-2">
              {profile.social_links?.github && (
                <a
                  href={profile.social_links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {profile.social_links?.linkedin && (
                <a
                  href={profile.social_links.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {profile.social_links?.twitter && (
                <a
                  href={profile.social_links.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {profile.social_links?.instagram && (
                <a
                  href={profile.social_links.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {profile.contact_email && (
                <a
                  href={`mailto:${profile.contact_email}`}
                  className="p-1.5 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition-colors"
                >
                  <Mail className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Full Bio */}
        <div className="space-y-4 text-base sm:text-lg text-zinc-800 leading-relaxed font-sans">
          <p className="font-serif text-xl sm:text-2xl text-zinc-900 leading-snug font-normal italic">
            "{profile.short_bio}"
          </p>
          <div className="pt-2 text-zinc-700 space-y-4">
            {profile.full_bio.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Nilai dan Prinsip */}
      {profile.principles && profile.principles.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-zinc-200">
          <div className="flex items-center gap-2 text-zinc-900">
            <Compass className="w-5 h-5 text-blue-900" />
            <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
              Nilai &amp; Prinsip yang Dipegang
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3 pt-2">
            {profile.principles.map((principle, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-zinc-200 bg-white shadow-xs flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base text-zinc-800 leading-relaxed font-medium">
                  {principle}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bidang Minat */}
      {profile.interests && profile.interests.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-zinc-200">
          <div className="flex items-center gap-2 text-zinc-900">
            <Heart className="w-5 h-5 text-rose-700" />
            <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
              Fokus Minat &amp; Eksplorasi
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {profile.interests.map((interest, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-800 text-sm font-medium border border-zinc-200"
              >
                {interest}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Riwayat Pengalaman */}
      {profile.experiences && profile.experiences.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-zinc-200">
          <div className="flex items-center gap-2 text-zinc-900">
            <Briefcase className="w-5 h-5 text-zinc-700" />
            <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
              Riwayat Profesional &amp; Aktivitas
            </h2>
          </div>
          <div className="space-y-6 pt-2">
            {profile.experiences.map((exp, idx) => (
              <div
                key={idx}
                className="relative pl-6 sm:pl-8 border-l-2 border-zinc-200 space-y-1.5"
              >
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-zinc-900" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-500">
                  <span className="font-semibold text-zinc-900 text-sm">{exp.role}</span>
                  <span className="bg-zinc-100 px-2 py-0.5 rounded text-[11px] font-medium text-zinc-600 inline-block w-fit mt-1 sm:mt-0">
                    {exp.period}
                  </span>
                </div>
                <p className="text-xs font-medium text-blue-900">{exp.organization}</p>
                <p className="text-sm text-zinc-600 leading-relaxed pt-1">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Kontak Callout */}
      <section className="p-8 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-4">
        <h3 className="font-serif font-bold text-xl text-zinc-900">
          Ingin Berdiskusi atau Berkolaborasi?
        </h3>
        <p className="text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
          {profile.contact_note ||
            'Saya selalu terbuka untuk diskusi teknologi, penulisan editorial, maupun peluang riset bersama.'}
        </p>
        <div>
          <Link
            to="/kontak"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm"
          >
            Kirim Pesan ke Saya
          </Link>
        </div>
      </section>
    </article>
  );
};
