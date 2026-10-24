import { GoogleGenAI, Type } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { AIGeneratedContent } from './types.js';

const SYSTEM_INSTRUCTION = `Anda adalah asisten penulisan personal yang membantu mengubah dokumentasi foto menjadi narasi Bahasa Indonesia yang autentik.

Tugas Anda adalah menyusun draf berdasarkan dua sumber:
1. Informasi visual yang benar-benar tampak pada foto.
2. Konteks faktual yang diberikan pengguna.

Jangan menciptakan kejadian, tanggal, lokasi, identitas, dialog, emosi, hubungan, prestasi, atau pengalaman pribadi yang tidak didukung informasi.
Jangan mengidentifikasi orang dalam foto.
Jika konteks tidak cukup, tandai informasi yang belum tersedia melalui needs_context dan missing_context.
Utamakan tulisan natural, tidak klise, tidak repetitif, dan sesuai gaya bahasa yang dipilih pengguna.
Hindari ungkapan klise seperti: "Dalam perjalanan hidup ini...", "Setiap momen memiliki cerita...", "Di era digital yang semakin berkembang...", "Bukan sekadar ..., tetapi juga ...", "Pada akhirnya kita belajar bahwa...".
Jangan mengubah ketidakpastian menjadi fakta.
Keluarkan hanya data yang sesuai dengan schema JSON yang ditentukan. Jangan menyertakan markdown fence atau penjelasan di luar objek JSON.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'Judul artikel yang lugas, menarik, dan sesuai konteks tanpa sensasionalisme.',
    },
    alternative_titles: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Daftar 3 variasi judul alternatif dengan sudut pandang berbeda.',
    },
    excerpt: {
      type: Type.STRING,
      description: 'Ringkasan editorial 2-3 kalimat yang menggambarkan isi artikel secara tajam.',
    },
    body_markdown: {
      type: Type.STRING,
      description: 'Isi lengkap draf tulisan dalam format Markdown dengan sub-heading semantik (##, ###).',
    },
    caption: {
      type: Type.STRING,
      description: 'Teks caption ringkas untuk foto utama (1-2 kalimat).',
    },
    suggested_category: {
      type: Type.STRING,
      description: 'Saran kategori tulisan yang paling tepat.',
    },
    suggested_tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Daftar 3-5 saran tag relevan.',
    },
    image_alt_text: {
      type: Type.STRING,
      description: 'Deskripsi aksesibilitas gambar yang objektif berdasarkan visual nyata.',
    },
    slug_suggestion: {
      type: Type.STRING,
      description: 'Saran URL slug yang bersih (lowercase dengan tanda hubung).',
    },
    meta_title: {
      type: Type.STRING,
      description: 'Judul SEO ramah mesin pencari (maksimal 60 karakter).',
    },
    meta_description: {
      type: Type.STRING,
      description: 'Deskripsi meta SEO yang informatif (120-155 karakter).',
    },
    needs_context: {
      type: Type.BOOLEAN,
      description: 'True jika konteks dari pengguna masih kurang untuk menyusun narasi utuh.',
    },
    missing_context: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Poin-poin spesifik informasi yang belum lengkap atau masih diperlukan.',
    },
  },
  required: [
    'title',
    'alternative_titles',
    'excerpt',
    'body_markdown',
    'caption',
    'suggested_category',
    'suggested_tags',
    'image_alt_text',
    'slug_suggestion',
    'meta_title',
    'meta_description',
    'needs_context',
  ],
};

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function resolveImagePart(photoPathOrBase64: string): { inlineData: { mimeType: string; data: string } } | null {
  try {
    if (photoPathOrBase64.startsWith('data:')) {
      const parts = photoPathOrBase64.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      return {
        inlineData: {
          mimeType,
          data: parts[1],
        },
      };
    }

    if (photoPathOrBase64.startsWith('/uploads/')) {
      const fullPath = path.join(process.cwd(), photoPathOrBase64);
      if (fs.existsSync(fullPath)) {
        const buffer = fs.readFileSync(fullPath);
        const ext = path.extname(fullPath).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
        return {
          inlineData: {
            mimeType,
            data: buffer.toString('base64'),
          },
        };
      }
    }
  } catch (err) {
    console.error('Error resolving image part for AI:', err);
  }
  return null;
}

export async function generateNarrativeFromPhotos(params: {
  photos: string[];
  contentType: string;
  eventDate?: string;
  location?: string;
  eventContext: string;
  storyBehind: string;
  mainMessage: string;
  perspective: string;
  tone: string;
  length: string;
}): Promise<AIGeneratedContent> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY belum dikonfigurasi pada server. Silakan hubungkan API key di panel Secrets.');
  }

  // Cost controls & bounds
  const limitedPhotos = (params.photos || []).slice(0, 4);
  const parts: any[] = [];

  for (const p of limitedPhotos) {
    const part = resolveImagePart(p);
    if (part) {
      parts.push(part);
    }
  }

  const promptText = `
ANALISIS FOTO DAN KONTEKS:
- Jenis Konten: ${params.contentType || 'Cerita kehidupan'}
- Tanggal Kejadian: ${params.eventDate || 'Tidak disebutkan secara eksplisit'}
- Lokasi: ${params.location || 'Tidak disebutkan'}
- Sudut Pandang Penulisan: ${params.perspective || 'Orang pertama tunggal (Saya)'}
- Gaya Bahasa: ${params.tone || 'Natural dan santai'}
- Target Panjang Tulisan: ${params.length || 'Artikel 600–900 kata'}

KONTEKS FAKTUAL DARI PENGGUNA:
Konteks Kejadian:
"""
${params.eventContext ? params.eventContext.slice(0, 3000) : 'Tidak ada keterangan tambahan.'}
"""

Cerita di Balik Foto:
"""
${params.storyBehind ? params.storyBehind.slice(0, 3000) : 'Tidak ada keterangan tambahan.'}
"""

Pesan Utama yang Ingin Disampaikan:
"""
${params.mainMessage ? params.mainMessage.slice(0, 1500) : 'Tidak ada pesan khusus.'}
"""

Tugas Anda:
1. Analisis objek dan suasana nyata pada foto.
2. Gabungkan secara jujur dengan konteks faktual pengguna.
3. Tulis draf narasi berbahasa Indonesia sesuai parameter di atas.
4. Jika konteks masih minim untuk membuat artikel panjang, berikan tulisan terbatas dan tandai needs_context: true beserta missing_context.
5. Hasilkan JSON sesuai schema tanpa teks di luar JSON.
`;

  parts.push({ text: promptText });

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const rawJson = response.text?.trim() || '';
  if (!rawJson) {
    throw new Error('Model Gemini tidak mengembalikan respon teks.');
  }

  try {
    const parsed: AIGeneratedContent = JSON.parse(rawJson);
    return parsed;
  } catch (err: any) {
    console.error('Failed to parse AI JSON:', rawJson);
    throw new Error(`Format keluaran AI tidak valid: ${err.message}`);
  }
}

export async function reviseNarrativeWithAI(params: {
  currentDraft: AIGeneratedContent;
  action: string;
  customInstruction?: string;
}): Promise<AIGeneratedContent> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY belum dikonfigurasi pada server.');
  }

  const promptText = `
DRAF SAAT INI:
Judul: ${params.currentDraft.title}
Ringkasan: ${params.currentDraft.excerpt}
Isi Tulisan:
"""
${params.currentDraft.body_markdown}
"""
Caption: ${params.currentDraft.caption}

PERMINTAAN REVISI:
Jenis Revisi: ${params.action}
Instruksi Tambahan Pengguna: ${params.customInstruction || 'Tidak ada'}

Aturan:
- Pertahankan fakta yang sudah ada. Jangan mengarang fakta baru.
- Lakukan revisi spesifik sesuai jenis aksi:
  * "perbaiki_alur": perhalus transisi antarparagraf dan logika penceritaan.
  * "buat_natural": hilangkan kalimat kaku dan klise, gunakan pilihan kata yang wajar.
  * "ringkas": padatkan narasi dengan memangkas repetisi.
  * "perpanjang": elaborasi poin-poin yang sudah disebutkan tanpa mengarang fakta fiktif.
  * "ubah_gaya": sesuaikan diksi sesuai instruksi tambahan.
  * "perbaiki_ejaan": perbaiki tata bahasa, tanda baca, dan EYD V.
  * "alternatif_judul": hasilkan judul-judul baru yang lebih kuat.
  * "buat_caption": buat beberapa variasi caption tajam.
  * "buat_ringkasan": perbarui excerpt agar lebih memikat.
  * "versi_baru": tulis ulang dengan struktur pembuka dan penutup yang segar.

Hasilkan objek JSON baru yang lengkap sesuai schema.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: promptText,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const rawJson = response.text?.trim() || '';
  try {
    return JSON.parse(rawJson) as AIGeneratedContent;
  } catch (err: any) {
    console.error('Failed to parse AI revision JSON:', rawJson);
    throw new Error(`Format keluaran revisi AI tidak valid: ${err.message}`);
  }
}
