import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { MediaItem, Album } from '../../types';
import { Image as ImageIcon, MapPin, Calendar, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [activeModalIdx, setActiveModalIdx] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [albumData, mediaData] = await Promise.all([
          api.getPublicAlbums(),
          api.getPublicGallery(selectedAlbum === 'all' ? undefined : selectedAlbum),
        ]);
        setAlbums(albumData);
        setMedia(mediaData.media || []);
      } catch (err) {
        console.error('Failed to load gallery:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedAlbum]);

  const currentPhoto = activeModalIdx !== null ? media[activeModalIdx] : null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeModalIdx !== null && activeModalIdx > 0) {
      setActiveModalIdx(activeModalIdx - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeModalIdx !== null && activeModalIdx < media.length - 1) {
      setActiveModalIdx(activeModalIdx + 1);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-zinc-900 tracking-tight">
          Galeri Dokumentasi Visual
        </h1>
        <p className="text-zinc-600 text-base max-w-2xl leading-relaxed">
          Kumpulan momen visual autentik dari riset, perjalanan, dan keseharian kerja.
        </p>
      </div>

      {/* Album Filter */}
      {albums.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-4">
          <button
            onClick={() => setSelectedAlbum('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedAlbum === 'all'
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            Semua Foto ({media.length})
          </button>
          {albums.map(alb => (
            <button
              key={alb.id}
              onClick={() => setSelectedAlbum(alb.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedAlbum === alb.id
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              {alb.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center">
          <div className="inline-block w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-zinc-500 text-sm">Memuat galeri...</p>
        </div>
      ) : media.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-zinc-300">
          <ImageIcon className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
          <p className="text-zinc-600 text-sm font-medium">Belum ada foto publik dalam album ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {media.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setActiveModalIdx(idx)}
              className="group cursor-pointer rounded-2xl overflow-hidden border border-zinc-200 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="aspect-[4/3] bg-zinc-100 overflow-hidden relative">
                <img
                  src={item.storage_path}
                  alt={item.alt_text || item.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 p-1.5 rounded-full bg-zinc-900/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="p-4 space-y-1.5">
                <p className="text-sm font-serif font-semibold text-zinc-900 line-clamp-1">
                  {item.caption || item.alt_text || item.filename}
                </p>
                {item.description && (
                  <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-100">
                  {item.doc_date ? (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {item.doc_date}
                    </span>
                  ) : (
                    <span>Foto Dokumenter</span>
                  )}
                  {item.location && (
                    <span className="flex items-center gap-1 text-zinc-500">
                      <MapPin className="w-3 h-3" /> {item.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {currentPhoto && activeModalIdx !== null && (
        <div
          onClick={() => setActiveModalIdx(null)}
          className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row text-white border border-zinc-800"
          >
            {/* Close button */}
            <button
              onClick={() => setActiveModalIdx(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Image viewer */}
            <div className="flex-1 bg-black flex items-center justify-center relative min-h-[300px] md:min-h-[460px]">
              <img
                src={currentPhoto.storage_path}
                alt={currentPhoto.alt_text}
                className="max-h-[70vh] w-auto object-contain"
              />

              {/* Prev / Next buttons */}
              {activeModalIdx > 0 && (
                <button
                  onClick={handlePrev}
                  className="absolute left-3 p-2 rounded-full bg-zinc-800/70 hover:bg-zinc-700 text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {activeModalIdx < media.length - 1 && (
                <button
                  onClick={handleNext}
                  className="absolute right-3 p-2 rounded-full bg-zinc-800/70 hover:bg-zinc-700 text-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Metadata panel */}
            <div className="w-full md:w-80 p-6 flex flex-col justify-between space-y-4 bg-zinc-900 border-t md:border-t-0 md:border-l border-zinc-800">
              <div className="space-y-3">
                <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                  Foto {activeModalIdx + 1} dari {media.length}
                </span>

                <h3 className="font-serif font-bold text-lg text-white">
                  {currentPhoto.caption || currentPhoto.alt_text || currentPhoto.filename}
                </h3>

                {currentPhoto.description && (
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    {currentPhoto.description}
                  </p>
                )}

                <div className="space-y-1.5 pt-4 border-t border-zinc-800 text-xs text-zinc-400">
                  {currentPhoto.doc_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Tanggal: {currentPhoto.doc_date}</span>
                    </div>
                  )}
                  {currentPhoto.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Lokasi: {currentPhoto.location}</span>
                    </div>
                  )}
                  {currentPhoto.alt_text && (
                    <div className="pt-2 text-[11px] text-zinc-400">
                      <strong className="text-zinc-300">Alt Text:</strong> {currentPhoto.alt_text}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 text-[11px] text-zinc-500">
                Arsip visual autentik • Bebas dari fabrikasi data
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
