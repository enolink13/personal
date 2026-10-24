import React, { useState } from 'react';
import { api } from '../../lib/api';
import { useRouter, Link } from '../../lib/router';
import { Shield, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { navigate } = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.login(username.trim(), password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa username dan kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-serif font-bold text-2xl shadow-lg">
            A
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
            Masuk ke CMS Admin
          </h1>
          <p className="text-xs text-zinc-400">
            Aksara &amp; Lensa Personal Branding Content Management System
          </p>
        </div>

        <div className="bg-zinc-800 border border-zinc-700/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-5 text-white">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Nama Pengguna
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Shield className="w-4 h-4" />
              {loading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
            </button>
          </form>

          <div className="pt-4 border-t border-zinc-700/60 text-center">
            <p className="text-[11px] text-zinc-400">
              Kredensial inisial default: <code className="bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-300">admin</code> / <code className="bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-300">admin123</code>
            </p>
            <div className="mt-3">
              <Link to="/" className="text-xs text-zinc-400 hover:text-white inline-flex items-center gap-1">
                &larr; Kembali ke Website Publik
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
