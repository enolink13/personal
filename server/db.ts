import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  Profile,
  SiteSettings,
  MediaItem,
  Album,
  Category,
  Tag,
  Post,
  PostRevision,
  Portfolio,
  AIGenerationRecord,
  AuditLog,
  ContactMessage,
} from './types.js';

interface DatabaseSchema {
  version: number;
  admin: {
    id: string;
    username: string;
    password_hash: string;
    salt: string;
    session_tokens: string[];
    updated_at: string;
  };
  profile: Profile;
  site_settings: SiteSettings;
  categories: Category[];
  tags: Tag[];
  albums: Album[];
  media: MediaItem[];
  posts: Post[];
  post_revisions: PostRevision[];
  portfolios: Portfolio[];
  ai_generations: AIGenerationRecord[];
  audit_logs: AuditLog[];
  contact_messages: ContactMessage[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function getInitialData(): DatabaseSchema {
  const salt = crypto.randomBytes(16).toString('hex');
  // Default master password is 'admin123' for initial configuration
  const password_hash = hashPassword('admin123', salt);
  const now = new Date().toISOString();

  return {
    version: 1,
    admin: {
      id: crypto.randomUUID(),
      username: 'admin',
      password_hash,
      salt,
      session_tokens: [],
      updated_at: now,
    },
    profile: {
      id: crypto.randomUUID(),
      name: 'Sumarjiyono',
      headline: 'Software Engineer & Visual Documentarian',
      short_bio: 'Menulis tentang rekayasa perangkat lunak, arsitektur data, dan dokumentasi visual keseharian.',
      full_bio: 'Saya adalah seorang software engineer dengan ketertarikan mendalam pada sistem terdistribusi, arsitektur web modern, dan fotografi dokumenter. Melalui website ini, saya mengabadikan pemikiran teknis, refleksi personal, dan rekaman visual dari setiap perjalanan.',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      interests: [
        'Distributed Systems',
        'TypeScript & React',
        'Visual Storytelling',
        'Coffee & Editorial Writing',
        'Open Source Software',
      ],
      principles: [
        'Kejujuran dalam dokumentasi: menyajikan fakta apa adanya tanpa melebih-lebihkan.',
        'Kode yang bersih dan berkelanjutan lebih berharga daripada solusi rumit yang sulit dipahami.',
        'Refleksi berkala adalah jembatan antara pengalaman dan kedewasaan berpikir.',
      ],
      experiences: [
        {
          period: '2022 - Sekarang',
          role: 'Lead Full-Stack Engineer',
          organization: 'Digital Studio Tech',
          description: 'Merancang arsitektur aplikasi web modern, memimpin tim pengembangan, dan mengintegrasikan model AI untuk otomasi alur kerja editorial.',
        },
        {
          period: '2019 - 2022',
          role: 'Senior Software Engineer',
          organization: 'Archipelago Software',
          description: 'Mengembangkan sistem berbasis microservices dan REST/GraphQL API dengan keandalan tinggi.',
        },
      ],
      social_links: {
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        instagram: 'https://instagram.com',
      },
      contact_email: 'sumarjiyono13@gmail.com',
      contact_note: 'Terbuka untuk diskusi kolaborasi teknologi, penulisan editorial, dan proyek dokumentasi.',
      updated_at: now,
    },
    site_settings: {
      id: crypto.randomUUID(),
      site_title: 'Aksara & Lensa',
      tagline: 'Jejak Pemikiran, Rekayasa, dan Narasi Visual',
      site_description: 'Ruang personal untuk membagikan pemikiran tentang teknologi, dokumentasi fotografi, dan catatan perjalanan hidup yang autentik.',
      hero_greeting: 'Halo, selamat datang.',
      hero_title: 'Merekam jejak pemikiran teknis dan cerita di balik dokumentasi.',
      hero_subtitle: 'Sebuah ruang personal untuk berbagi tulisan, opini reflektif, dan dokumentasi visual yang dikurasi secara jujur.',
      hero_bio: 'Saya merancang sistem web dan mengabadikan peristiwa melalui lensa. Di sini Anda akan menemukan artikel teknologi, esai reflektif, serta portofolio kegiatan.',
      footer_text: '© 2026 Sumarjiyono. Seluruh tulisan dan foto dilindungi hak cipta.',
      default_og_image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
      posts_per_page: 6,
      contact_form_enabled: true,
      allow_comments: false,
      updated_at: now,
    },
    categories: [
      {
        id: 'cat-1',
        name: 'Teknologi & Kode',
        slug: 'teknologi-kode',
        description: 'Pembahasan arsitektur web, performa sistem, dan rekayasa perangkat lunak.',
        color: '#2563eb',
        created_at: now,
      },
      {
        id: 'cat-2',
        name: 'Refleksi & Esai',
        slug: 'refleksi-esai',
        description: 'Pemikiran personal mengenai produktivitas, pembelajaran hidup, dan kebiasaan.',
        color: '#475569',
        created_at: now,
      },
      {
        id: 'cat-3',
        name: 'Catatan Perjalanan',
        slug: 'catatan-perjalanan',
        description: 'Dokumentasi aktivitas, eksplorasi tempat, dan cerita di balik lensa kamera.',
        color: '#0891b2',
        created_at: now,
      },
    ],
    tags: [
      { id: 'tag-1', name: 'Software Engineering', slug: 'software-engineering', created_at: now },
      { id: 'tag-2', name: 'Fotografi', slug: 'fotografi', created_at: now },
      { id: 'tag-3', name: 'Produktivitas', slug: 'produktivitas', created_at: now },
      { id: 'tag-4', name: 'Arsitektur Web', slug: 'arsitektur-web', created_at: now },
      { id: 'tag-5', name: 'AI & Otomasi', slug: 'ai-otomasi', created_at: now },
    ],
    albums: [
      {
        id: 'alb-1',
        name: 'Dokumentasi Lapangan & Perjalanan',
        slug: 'dokumentasi-lapangan',
        description: 'Foto-foto kegiatan eksplorasi dan riset lapangan.',
        created_at: now,
      },
      {
        id: 'alb-2',
        name: 'Ruang Kerja & Rekayasa',
        slug: 'ruang-kerja-rekayasa',
        description: 'Dokumentasi proses kerja, setup perangkat keras, dan konferensi.',
        created_at: now,
      },
    ],
    media: [
      {
        id: 'med-1',
        filename: 'workspace-editorial.jpg',
        storage_path: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
        mime_type: 'image/jpeg',
        size_bytes: 420000,
        width: 1200,
        height: 800,
        alt_text: 'Laptop dan catatan kerja di meja kayu',
        caption: 'Meja kerja saat merancang arsitektur sistem baru',
        description: 'Foto dokumentasi ruang kerja untuk proyek sistem terdistribusi.',
        doc_date: '2026-03-15',
        location: 'Jakarta',
        album_id: 'alb-2',
        is_public: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'med-2',
        filename: 'travel-mountains.jpg',
        storage_path: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
        mime_type: 'image/jpeg',
        size_bytes: 580000,
        width: 1200,
        height: 800,
        alt_text: 'Pemandangan pegunungan berkabut di pagi hari',
        caption: 'Refleksi pagi di kaki gunung',
        description: 'Momen hening sebelum memulai perjalanan eksplorasi akhir pekan.',
        doc_date: '2026-02-10',
        location: 'Jawa Barat',
        album_id: 'alb-1',
        is_public: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'med-3',
        filename: 'conference-hall.jpg',
        storage_path: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        mime_type: 'image/jpeg',
        size_bytes: 650000,
        width: 1200,
        height: 800,
        alt_text: 'Sesi presentasi konferensi teknologi',
        caption: 'Berbagi pengalaman optimasi basis data pada temu komunitas',
        description: 'Dokumentasi sesi presentasi arsitektur cloud.',
        doc_date: '2026-01-20',
        location: 'Yogyakarta',
        album_id: 'alb-2',
        is_public: true,
        created_at: now,
        updated_at: now,
      },
    ],
    posts: [
      {
        id: 'post-1',
        title: 'Membangun Arsitektur Web yang Bersih dan Tahan Uji',
        slug: 'membangun-arsitektur-web-bersih-dan-tahan-uji',
        excerpt: 'Bagaimana memisahkan tanggung jawab antara lapisan data, antarmuka pengguna, dan integrasi eksternal agar aplikasi tetap mudah dirawat dalam jangka panjang.',
        body: `Arsitektur perangkat lunak yang baik bukanlah arsitektur yang menggunakan alat paling mutakhir tanpa alasan, melainkan struktur yang memungkinkan tim memahami alur data dengan mudah dan meminimalkan ketergantungan yang tidak perlu.

### 1. Batasan yang Jelas Antar Lapisan

Ketika kita membangun aplikasi skala produksi, pemisahan lapisan (separation of concerns) menjadi fondasi paling mendasar:
- **Lapisan Penyimpanan Data:** Harus memiliki kontrak skema yang tegas dan tidak dibebani logika tampilan.
- **Lapisan Bisnis:** Memvalidasi aturan sebelum data disimpan atau diubah.
- **Lapisan Antarmuka:** Bertugas menampilkan informasi secara intuitif dan menangani interaksi pengguna tanpa membocorkan rahasia server.

### 2. Mengendalikan Kompleksitas

Sering kali pengembang tergoda menambahkan pustaka eksternal untuk masalah sederhana. Dalam pengalaman saya, menulis logika dasar yang spesifik untuk domain masalah kita kerap kali jauh lebih tahan uji dibanding bergantung pada puluhan dependensi yang sulit diaudit.

### 3. Dokumentasi yang Hidup

Kode yang baik berbicara melalui penamaan variabel dan struktur folder, namun narasi di balik *mengapa* sebuah keputusan diambil tetap memerlukan dokumentasi tertulis. Website ini adalah salah satu upaya saya mendokumentasikan keputusan-keputusan teknis tersebut.`,
        featured_media_id: 'med-1',
        supplementary_media_ids: ['med-3'],
        status: 'published',
        category_id: 'cat-1',
        tag_ids: ['tag-1', 'tag-4'],
        published_at: '2026-03-20T10:00:00.000Z',
        meta_title: 'Membangun Arsitektur Web yang Bersih dan Tahan Uji | Sumarjiyono',
        meta_description: 'Prinsip memisahkan tanggung jawab lapisan data dan antarmuka untuk aplikasi web tahan uji.',
        image_alt_text: 'Laptop dan buku catatan di meja kerja',
        read_time_minutes: 5,
        is_featured: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'post-2',
        title: 'Seni Memperlambat Tempo di Tengah Hiruk-Pikuk Digital',
        slug: 'seni-memperlambat-tempo-di-tengah-hiruk-pikuk-digital',
        excerpt: 'Mengapa menyisihkan waktu tanpa notifikasi dan kembali mengamati lingkungan sekitar justru mempertajam fokus saat kembali memecahkan masalah kompleks.',
        body: `Di era di mana notifikasi dan umpan balik serba instan, kemampuan untuk diam dan memikirkan satu masalah secara mendalam menjadi keterampilan yang kian langka.

Setiap akhir pekan, saya membiasakan diri membawa kamera mekanik atau sekadar berjalan kaki tanpa earphone. Memperhatikan ritme kota, bayangan yang terbentuk di dinding gedung, atau riak air di danau bukan sekadar rekreasi visual, melainkan kalibrasi pikiran.

Ketika kita kembali ke depan monitor pada hari Senin, masalah-masalah algoritma yang sebelumnya tampak buntu sering kali menemukan sudut pandang penyelesaian baru. Kejernihan berpikir lahir dari ruang jeda yang kita sediakan secara sadar.`,
        featured_media_id: 'med-2',
        supplementary_media_ids: [],
        status: 'published',
        category_id: 'cat-2',
        tag_ids: ['tag-2', 'tag-3'],
        published_at: '2026-02-15T08:30:00.000Z',
        meta_title: 'Seni Memperlambat Tempo di Tengah Hiruk-Pikuk Digital | Sumarjiyono',
        meta_description: 'Catatan reflektif tentang pentingnya ruang jeda dan observasi nyata untuk kejernihan berpikir.',
        image_alt_text: 'Pemandangan pegunungan berkabut di pagi hari',
        read_time_minutes: 4,
        is_featured: true,
        created_at: now,
        updated_at: now,
      },
    ],
    post_revisions: [
      {
        id: crypto.randomUUID(),
        post_id: 'post-1',
        title: 'Membangun Arsitektur Web yang Bersih dan Tahan Uji',
        body: 'Draf awal artikel arsitektur web.',
        excerpt: 'Draf pendahuluan.',
        saved_by: 'admin',
        note: 'Versi pertama draf artikel',
        created_at: now,
      },
    ],
    portfolios: [
      {
        id: 'port-1',
        title: 'Sistem Manajemen Editorial & Arsip Media Terintegrasi',
        slug: 'sistem-manajemen-editorial-arsip-media',
        category: 'Rekayasa Perangkat Lunak',
        role: 'Arsitek Solusi & Full-Stack Developer',
        period: '2025 - 2026',
        summary: 'Pembangunan platform manajemen konten editorial dengan analitik terstruktur, penanganan media terenkripsi, dan alur publikasi bertahap.',
        description: 'Proyek ini berfokus pada penyederhanaan alur kerja redaksi independen. Menangani pemrosesan gambar otomatis, penataan metadata SEO, serta validasi konten berlapis sebelum publikasi.',
        learning_outcomes: 'Pentingnya merancang skema basis data yang fleksibel terhadap perubahan struktur konten tanpa mengorbankan performa query pencarian.',
        project_url: 'https://example.com/editorial-system',
        featured_media_id: 'med-1',
        media_ids: ['med-1', 'med-3'],
        is_featured: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'port-2',
        title: 'Eksplorasi Dokumentasi Visual Lanskap Pegunungan',
        slug: 'eksplorasi-dokumentasi-visual-lanskap',
        category: 'Dokumentasi Visual',
        role: 'Fotografer & Kurator',
        period: '2026',
        summary: 'Koleksi esai foto yang merekam keheningan kawasan pegunungan dan interaksi masyarakat lereng.',
        description: 'Seri dokumentasi foto hitam putih dan warna alami yang menangkap gradasi cahaya fajar dan aktivitas harian warga setempat.',
        learning_outcomes: 'Mendengarkan cerita subjek terlebih dahulu menghasilkan tangkapan foto yang jauh lebih bernyawa dibanding hanya memburu komposisi estetis.',
        featured_media_id: 'med-2',
        media_ids: ['med-2'],
        is_featured: true,
        created_at: now,
        updated_at: now,
      },
    ],
    ai_generations: [],
    audit_logs: [
      {
        id: crypto.randomUUID(),
        action: 'SYSTEM_INIT',
        entity_type: 'system',
        entity_id: 'root',
        details: 'Basis data sistem personal branding berhasil diinisialisasi.',
        created_at: now,
      },
    ],
    contact_messages: [],
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error loading db.json, creating initial state:', err);
    }
    const initial = getInitialData();
    this.save(initial);
    return initial;
  }

  private save(data?: DatabaseSchema) {
    if (data) {
      this.data = data;
    }
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  // --- Admin & Auth ---
  getAdmin() {
    return this.data.admin;
  }

  updateAdminPassword(newPasswordHash: string, newSalt: string) {
    this.data.admin.password_hash = newPasswordHash;
    this.data.admin.salt = newSalt;
    this.data.admin.session_tokens = []; // Invalidate existing sessions
    this.data.admin.updated_at = new Date().toISOString();
    this.save();
  }

  addSessionToken(token: string) {
    this.data.admin.session_tokens.push(token);
    // Keep max 20 active sessions
    if (this.data.admin.session_tokens.length > 20) {
      this.data.admin.session_tokens.shift();
    }
    this.save();
  }

  removeSessionToken(token: string) {
    this.data.admin.session_tokens = this.data.admin.session_tokens.filter(t => t !== token);
    this.save();
  }

  verifySession(token: string): boolean {
    if (!token) return false;
    return this.data.admin.session_tokens.includes(token);
  }

  // --- Profile & Settings ---
  getProfile(): Profile {
    return this.data.profile;
  }

  updateProfile(update: Partial<Profile>): Profile {
    this.data.profile = {
      ...this.data.profile,
      ...update,
      updated_at: new Date().toISOString(),
    };
    this.save();
    return this.data.profile;
  }

  getSiteSettings(): SiteSettings {
    return this.data.site_settings;
  }

  updateSiteSettings(update: Partial<SiteSettings>): SiteSettings {
    this.data.site_settings = {
      ...this.data.site_settings,
      ...update,
      updated_at: new Date().toISOString(),
    };
    this.save();
    return this.data.site_settings;
  }

  // --- Posts ---
  getPosts(options?: {
    status?: string;
    category_id?: string;
    tag_id?: string;
    search?: string;
    limit?: number;
    offset?: number;
    publicOnly?: boolean;
  }) {
    let posts = [...this.data.posts];

    if (options?.publicOnly) {
      const now = new Date().toISOString();
      posts = posts.filter(
        p => p.status === 'published' && (!p.published_at || p.published_at <= now)
      );
    } else if (options?.status && options.status !== 'all') {
      posts = posts.filter(p => p.status === options.status);
    }

    if (options?.category_id) {
      posts = posts.filter(p => p.category_id === options.category_id);
    }

    if (options?.tag_id) {
      posts = posts.filter(p => p.tag_ids && p.tag_ids.includes(options.tag_id!));
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      posts = posts.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.body.toLowerCase().includes(q)
      );
    }

    // Sort by published_at or created_at descending
    posts.sort((a, b) => {
      const dateA = new Date(a.published_at || a.created_at).getTime();
      const dateB = new Date(b.published_at || b.created_at).getTime();
      return dateB - dateA;
    });

    const total = posts.length;
    const offset = options?.offset || 0;
    const limit = options?.limit || posts.length;
    const paginated = posts.slice(offset, offset + limit);

    return {
      posts: paginated,
      total,
      offset,
      limit,
    };
  }

  getPostById(id: string): Post | undefined {
    return this.data.posts.find(p => p.id === id);
  }

  getPostBySlug(slug: string, publicOnly = false): Post | undefined {
    const post = this.data.posts.find(p => p.slug === slug);
    if (!post) return undefined;
    if (publicOnly) {
      const now = new Date().toISOString();
      if (post.status !== 'published' || (post.published_at && post.published_at > now)) {
        return undefined;
      }
    }
    return post;
  }

  createPost(post: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Post {
    const now = new Date().toISOString();
    const newPost: Post = {
      ...post,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
    };
    this.data.posts.unshift(newPost);
    this.addRevision(newPost.id, newPost.title, newPost.body, newPost.excerpt, 'Draf awal dibuat');
    this.save();
    return newPost;
  }

  updatePost(id: string, update: Partial<Post>, revisionNote?: string): Post | undefined {
    const idx = this.data.posts.findIndex(p => p.id === id);
    if (idx === -1) return undefined;

    const existing = this.data.posts[idx];
    const now = new Date().toISOString();
    const updatedPost: Post = {
      ...existing,
      ...update,
      updated_at: now,
    };

    this.data.posts[idx] = updatedPost;

    if (revisionNote || (update.body && update.body !== existing.body)) {
      this.addRevision(
        updatedPost.id,
        updatedPost.title,
        updatedPost.body,
        updatedPost.excerpt,
        revisionNote || 'Pembaruan konten artikel'
      );
    }

    this.save();
    return updatedPost;
  }

  deletePost(id: string): boolean {
    const idx = this.data.posts.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.data.posts.splice(idx, 1);
    this.data.post_revisions = this.data.post_revisions.filter(r => r.post_id !== id);
    this.save();
    return true;
  }

  addRevision(postId: string, title: string, body: string, excerpt: string, note: string) {
    const revision: PostRevision = {
      id: crypto.randomUUID(),
      post_id: postId,
      title,
      body,
      excerpt,
      saved_by: 'admin',
      note,
      created_at: new Date().toISOString(),
    };
    this.data.post_revisions.unshift(revision);
    // Keep max 30 revisions per post
    const postRevisions = this.data.post_revisions.filter(r => r.post_id === postId);
    if (postRevisions.length > 30) {
      const oldestId = postRevisions[postRevisions.length - 1].id;
      this.data.post_revisions = this.data.post_revisions.filter(r => r.id !== oldestId);
    }
  }

  getPostRevisions(postId: string): PostRevision[] {
    return this.data.post_revisions.filter(r => r.post_id === postId);
  }

  // --- Categories & Tags ---
  getCategories(): Category[] {
    return this.data.categories;
  }

  getCategoryById(id: string): Category | undefined {
    return this.data.categories.find(c => c.id === id);
  }

  createCategory(name: string, slug: string, description: string, color?: string): Category {
    const now = new Date().toISOString();
    const cat: Category = {
      id: crypto.randomUUID(),
      name,
      slug,
      description,
      color: color || '#2563eb',
      created_at: now,
    };
    this.data.categories.push(cat);
    this.save();
    return cat;
  }

  updateCategory(id: string, update: Partial<Category>): Category | undefined {
    const cat = this.data.categories.find(c => c.id === id);
    if (!cat) return undefined;
    Object.assign(cat, update);
    this.save();
    return cat;
  }

  deleteCategory(id: string): { success: boolean; inUseCount: number } {
    const inUse = this.data.posts.filter(p => p.category_id === id).length;
    if (inUse > 0) {
      return { success: false, inUseCount: inUse };
    }
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    this.save();
    return { success: true, inUseCount: 0 };
  }

  getTags(): Tag[] {
    return this.data.tags;
  }

  createTag(name: string, slug: string): Tag {
    const tag: Tag = {
      id: crypto.randomUUID(),
      name,
      slug,
      created_at: new Date().toISOString(),
    };
    this.data.tags.push(tag);
    this.save();
    return tag;
  }

  deleteTag(id: string): { success: boolean; inUseCount: number } {
    const inUse = this.data.posts.filter(p => p.tag_ids?.includes(id)).length;
    if (inUse > 0) {
      return { success: false, inUseCount: inUse };
    }
    this.data.tags = this.data.tags.filter(t => t.id !== id);
    this.save();
    return { success: true, inUseCount: 0 };
  }

  // --- Media & Albums ---
  getMedia(options?: {
    is_public?: boolean;
    album_id?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    let media = [...this.data.media];

    if (options?.is_public !== undefined) {
      media = media.filter(m => m.is_public === options.is_public);
    }

    if (options?.album_id) {
      media = media.filter(m => m.album_id === options.album_id);
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      media = media.filter(
        m =>
          m.filename.toLowerCase().includes(q) ||
          m.alt_text.toLowerCase().includes(q) ||
          m.caption.toLowerCase().includes(q) ||
          m.location?.toLowerCase().includes(q)
      );
    }

    media.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = media.length;
    const offset = options?.offset || 0;
    const limit = options?.limit || media.length;
    const paginated = media.slice(offset, offset + limit);

    return {
      media: paginated,
      total,
      offset,
      limit,
    };
  }

  getMediaById(id: string): MediaItem | undefined {
    return this.data.media.find(m => m.id === id);
  }

  createMedia(media: Omit<MediaItem, 'id' | 'created_at' | 'updated_at'>): MediaItem {
    const now = new Date().toISOString();
    const item: MediaItem = {
      ...media,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
    };
    this.data.media.unshift(item);
    this.save();
    return item;
  }

  updateMedia(id: string, update: Partial<MediaItem>): MediaItem | undefined {
    const item = this.data.media.find(m => m.id === id);
    if (!item) return undefined;
    Object.assign(item, update, { updated_at: new Date().toISOString() });
    this.save();
    return item;
  }

  deleteMedia(id: string): { success: boolean; inUsePosts: number; inUsePortfolios: number } {
    const inUsePosts = this.data.posts.filter(
      p => p.featured_media_id === id || p.supplementary_media_ids?.includes(id)
    ).length;

    const inUsePortfolios = this.data.portfolios.filter(
      p => p.featured_media_id === id || p.media_ids?.includes(id)
    ).length;

    if (inUsePosts > 0 || inUsePortfolios > 0) {
      return { success: false, inUsePosts, inUsePortfolios };
    }

    const item = this.data.media.find(m => m.id === id);
    if (item && item.storage_path.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), item.storage_path);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('Could not delete file from disk:', e);
        }
      }
    }

    this.data.media = this.data.media.filter(m => m.id !== id);
    this.save();
    return { success: true, inUsePosts: 0, inUsePortfolios: 0 };
  }

  getAlbums(): Album[] {
    return this.data.albums;
  }

  createAlbum(name: string, slug: string, description: string): Album {
    const album: Album = {
      id: crypto.randomUUID(),
      name,
      slug,
      description,
      created_at: new Date().toISOString(),
    };
    this.data.albums.push(album);
    this.save();
    return album;
  }

  // --- Portfolios ---
  getPortfolios(publicOnly = false) {
    let list = [...this.data.portfolios];
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  }

  getPortfolioById(id: string): Portfolio | undefined {
    return this.data.portfolios.find(p => p.id === id);
  }

  getPortfolioBySlug(slug: string): Portfolio | undefined {
    return this.data.portfolios.find(p => p.slug === slug);
  }

  createPortfolio(data: Omit<Portfolio, 'id' | 'created_at' | 'updated_at'>): Portfolio {
    const now = new Date().toISOString();
    const item: Portfolio = {
      ...data,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
    };
    this.data.portfolios.unshift(item);
    this.save();
    return item;
  }

  updatePortfolio(id: string, update: Partial<Portfolio>): Portfolio | undefined {
    const item = this.data.portfolios.find(p => p.id === id);
    if (!item) return undefined;
    Object.assign(item, update, { updated_at: new Date().toISOString() });
    this.save();
    return item;
  }

  deletePortfolio(id: string): boolean {
    const idx = this.data.portfolios.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.data.portfolios.splice(idx, 1);
    this.save();
    return true;
  }

  // --- AI Generations ---
  recordAIGeneration(record: Omit<AIGenerationRecord, 'id' | 'created_at'>): AIGenerationRecord {
    const item: AIGenerationRecord = {
      ...record,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    this.data.ai_generations.unshift(item);
    // Keep max 50 records
    if (this.data.ai_generations.length > 50) {
      this.data.ai_generations.pop();
    }
    this.save();
    return item;
  }

  getAIGenerationHistory(limit = 20): AIGenerationRecord[] {
    return this.data.ai_generations.slice(0, limit);
  }

  // --- Audit Logs ---
  logAudit(action: string, entity_type: string, entity_id: string, details: string, ip?: string) {
    const log: AuditLog = {
      id: crypto.randomUUID(),
      action,
      entity_type,
      entity_id,
      details,
      ip,
      created_at: new Date().toISOString(),
    };
    this.data.audit_logs.unshift(log);
    if (this.data.audit_logs.length > 200) {
      this.data.audit_logs.pop();
    }
    this.save();
  }

  getAuditLogs(limit = 50): AuditLog[] {
    return this.data.audit_logs.slice(0, limit);
  }

  // --- Contact Messages ---
  addContactMessage(name: string, email: string, subject: string, message: string): ContactMessage {
    const item: ContactMessage = {
      id: crypto.randomUUID(),
      name,
      email,
      subject,
      message,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    this.data.contact_messages.unshift(item);
    this.save();
    return item;
  }

  getContactMessages(): ContactMessage[] {
    return this.data.contact_messages;
  }

  markContactMessageRead(id: string) {
    const msg = this.data.contact_messages.find(m => m.id === id);
    if (msg) {
      msg.is_read = true;
      this.save();
    }
  }

  // --- Dashboard Stats ---
  getDashboardStats() {
    const now = new Date().toISOString();
    const posts = this.data.posts;
    const published = posts.filter(p => p.status === 'published' && (!p.published_at || p.published_at <= now)).length;
    const draft = posts.filter(p => p.status === 'draft').length;
    const in_review = posts.filter(p => p.status === 'in_review').length;
    const scheduled = posts.filter(p => p.status === 'scheduled').length;
    const archived = posts.filter(p => p.status === 'archived').length;

    return {
      total_posts: posts.length,
      published_posts: published,
      draft_posts: draft,
      in_review_posts: in_review,
      scheduled_posts: scheduled,
      archived_posts: archived,
      total_media: this.data.media.length,
      total_portfolios: this.data.portfolios.length,
      total_categories: this.data.categories.length,
      total_ai_generations: this.data.ai_generations.length,
      unread_messages: this.data.contact_messages.filter(m => !m.is_read).length,
    };
  }

  // --- Backup & Restore ---
  exportFullData() {
    return this.data;
  }

  restoreFullData(newData: DatabaseSchema) {
    if (!newData || typeof newData !== 'object' || !newData.profile || !Array.isArray(newData.posts)) {
      throw new Error('Format data backup tidak valid.');
    }
    this.data = newData;
    this.save();
  }
}

export const db = new Database();
