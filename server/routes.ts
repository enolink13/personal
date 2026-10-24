import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { db, hashPassword, generateToken } from './db.js';
import { generateNarrativeFromPhotos, reviseNarrativeWithAI } from './gemini.js';
import { PostStatus } from './types.js';

export const apiRouter = express.Router();

// --- Rate Limiter for sensitive routes ---
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();

function rateLimitLogin(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (record) {
    if (now - record.firstAttempt > 15 * 60 * 1000) {
      loginAttempts.set(ip, { count: 1, firstAttempt: now });
      return next();
    }
    if (record.count >= 10) {
      return res.status(429).json({
        error: 'Terlalu banyak percobaan masuk. Silakan tunggu 15 menit.',
      });
    }
    record.count++;
  } else {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
  }
  next();
}

// --- Multer Storage Configuration ---
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg';
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${safeExt}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10,
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar (JPEG, PNG, WebP, GIF) yang diizinkan.'));
    }
  },
});

// --- Auth Middleware ---
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Akses ditolak: Autentikasi diperlukan.' });
  }

  const token = authHeader.split(' ')[1];
  if (!db.verifySession(token)) {
    return res.status(401).json({ error: 'Sesi kedaluwarsa atau tidak valid. Silakan login kembali.' });
  }

  next();
}

// ==========================================
// 1. AUTH ROUTES
// ==========================================

apiRouter.post('/auth/login', rateLimitLogin, (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan kata sandi wajib diisi.' });
  }

  const admin = db.getAdmin();
  if (username !== admin.username) {
    return res.status(401).json({ error: 'Username atau kata sandi tidak cocok.' });
  }

  const calculatedHash = hashPassword(password, admin.salt);
  if (calculatedHash !== admin.password_hash) {
    db.logAudit('AUTH_FAIL', 'user', admin.id, `Gagal login untuk user ${username}`, req.ip);
    return res.status(401).json({ error: 'Username atau kata sandi tidak cocok.' });
  }

  const token = generateToken();
  db.addSessionToken(token);
  db.logAudit('AUTH_SUCCESS', 'user', admin.id, `Admin ${username} berhasil masuk`, req.ip);

  res.json({
    token,
    user: {
      id: admin.id,
      username: admin.username,
    },
  });
});

apiRouter.post('/auth/logout', requireAdmin, (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    db.removeSessionToken(token);
  }
  res.json({ success: true, message: 'Berhasil keluar.' });
});

apiRouter.get('/auth/me', requireAdmin, (_req: Request, res: Response) => {
  const admin = db.getAdmin();
  res.json({
    user: {
      id: admin.id,
      username: admin.username,
    },
  });
});

apiRouter.post('/auth/change-password', requireAdmin, (req: Request, res: Response) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password || new_password.length < 6) {
    return res.status(400).json({ error: 'Kata sandi baru minimal 6 karakter.' });
  }

  const admin = db.getAdmin();
  const currentHash = hashPassword(current_password, admin.salt);
  if (currentHash !== admin.password_hash) {
    return res.status(400).json({ error: 'Kata sandi saat ini tidak tepat.' });
  }

  const newSalt = crypto.randomBytes(16).toString('hex');
  const newHash = hashPassword(new_password, newSalt);
  db.updateAdminPassword(newHash, newSalt);
  db.logAudit('PASSWORD_CHANGE', 'user', admin.id, 'Kata sandi admin berhasil diperbarui.', req.ip);

  res.json({ success: true, message: 'Kata sandi berhasil diubah. Silakan masuk kembali.' });
});

// ==========================================
// 2. ADMIN DASHBOARD & STATS
// ==========================================

apiRouter.get('/admin/dashboard/stats', requireAdmin, (_req: Request, res: Response) => {
  const stats = db.getDashboardStats();
  const recentPosts = db.getPosts({ limit: 5 }).posts;
  const auditLogs = db.getAuditLogs(10);
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');

  res.json({
    stats,
    recent_posts: recentPosts,
    recent_activities: auditLogs,
    gemini_status: {
      connected: geminiConfigured,
      model: 'gemini-3.8-flash',
    },
  });
});

// ==========================================
// 3. ADMIN ARTICLES (POSTS)
// ==========================================

apiRouter.get('/admin/posts', requireAdmin, (req: Request, res: Response) => {
  const { status, category_id, tag_id, search, limit, offset } = req.query;
  const result = db.getPosts({
    status: status as string,
    category_id: category_id as string,
    tag_id: tag_id as string,
    search: search as string,
    limit: limit ? parseInt(limit as string) : 20,
    offset: offset ? parseInt(offset as string) : 0,
    publicOnly: false,
  });
  res.json(result);
});

apiRouter.get('/admin/posts/:id', requireAdmin, (req: Request, res: Response) => {
  const post = db.getPostById(req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Artikel tidak ditemukan.' });
  }
  const revisions = db.getPostRevisions(post.id);
  res.json({ post, revisions });
});

apiRouter.post('/admin/posts', requireAdmin, (req: Request, res: Response) => {
  const {
    title,
    slug,
    excerpt,
    body,
    featured_media_id,
    supplementary_media_ids,
    status,
    category_id,
    tag_ids,
    meta_title,
    meta_description,
    image_alt_text,
    scheduled_at,
  } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'Judul dan isi artikel wajib diisi.' });
  }

  const generatedSlug = slug
    ? slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // Check slug uniqueness
  const existingWithSlug = db.getPostBySlug(generatedSlug);
  const finalSlug = existingWithSlug ? `${generatedSlug}-${Date.now().toString().slice(-4)}` : generatedSlug;

  const wordCount = body.trim().split(/\s+/).length;
  const read_time_minutes = Math.max(1, Math.ceil(wordCount / 200));

  let published_at: string | undefined = undefined;
  if (status === 'published') {
    published_at = new Date().toISOString();
  }

  const post = db.createPost({
    title,
    slug: finalSlug,
    excerpt: excerpt || '',
    body,
    featured_media_id,
    supplementary_media_ids: Array.isArray(supplementary_media_ids) ? supplementary_media_ids : [],
    status: (status as PostStatus) || 'draft',
    category_id,
    tag_ids: Array.isArray(tag_ids) ? tag_ids : [],
    published_at,
    scheduled_at: scheduled_at || undefined,
    meta_title: meta_title || title,
    meta_description: meta_description || excerpt || '',
    image_alt_text: image_alt_text || '',
    read_time_minutes,
    is_featured: false,
  });

  db.logAudit('CREATE_POST', 'post', post.id, `Artikel dibuat: "${post.title}" [${post.status}]`, req.ip);
  res.status(201).json(post);
});

apiRouter.patch('/admin/posts/:id', requireAdmin, (req: Request, res: Response) => {
  const post = db.getPostById(req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Artikel tidak ditemukan.' });
  }

  const update = { ...req.body };
  if (update.body) {
    const wordCount = update.body.trim().split(/\s+/).length;
    update.read_time_minutes = Math.max(1, Math.ceil(wordCount / 200));
  }

  // Handle publishing transition
  if (update.status === 'published' && post.status !== 'published' && !post.published_at) {
    update.published_at = new Date().toISOString();
  }

  const revisionNote = req.body.revision_note || 'Pembaruan artikel';
  delete update.revision_note;

  const updated = db.updatePost(req.params.id, update, revisionNote);
  db.logAudit('UPDATE_POST', 'post', req.params.id, `Artikel diperbarui: "${updated?.title}"`, req.ip);

  res.json(updated);
});

apiRouter.post('/admin/posts/:id/publish', requireAdmin, (req: Request, res: Response) => {
  const post = db.getPostById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Artikel tidak ditemukan.' });

  const published = db.updatePost(
    req.params.id,
    {
      status: 'published',
      published_at: post.published_at || new Date().toISOString(),
    },
    'Dipublikasikan secara manual oleh pemilik.'
  );

  db.logAudit('PUBLISH_POST', 'post', req.params.id, `Artikel dipublikasikan: "${post.title}"`, req.ip);
  res.json({ success: true, post: published });
});

apiRouter.post('/admin/posts/:id/archive', requireAdmin, (req: Request, res: Response) => {
  const post = db.getPostById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Artikel tidak ditemukan.' });

  const archived = db.updatePost(
    req.params.id,
    { status: 'archived' },
    'Diarsipkan oleh pemilik.'
  );

  db.logAudit('ARCHIVE_POST', 'post', req.params.id, `Artikel diarsipkan: "${post.title}"`, req.ip);
  res.json({ success: true, post: archived });
});

apiRouter.delete('/admin/posts/:id', requireAdmin, (req: Request, res: Response) => {
  const post = db.getPostById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Artikel tidak ditemukan.' });

  db.deletePost(req.params.id);
  db.logAudit('DELETE_POST', 'post', req.params.id, `Artikel dihapus: "${post.title}"`, req.ip);
  res.json({ success: true, message: 'Artikel berhasil dihapus.' });
});

// ==========================================
// 4. ADMIN MEDIA LIBRARY
// ==========================================

apiRouter.get('/admin/media', requireAdmin, (req: Request, res: Response) => {
  const { is_public, album_id, search, limit, offset } = req.query;
  const result = db.getMedia({
    is_public: is_public !== undefined ? is_public === 'true' : undefined,
    album_id: album_id as string,
    search: search as string,
    limit: limit ? parseInt(limit as string) : 24,
    offset: offset ? parseInt(offset as string) : 0,
  });
  res.json(result);
});

apiRouter.post('/admin/media/upload', requireAdmin, upload.array('photos', 10), (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) || [];
  if (files.length === 0) {
    return res.status(400).json({ error: 'Tidak ada file gambar yang diunggah.' });
  }

  const { alt_text, caption, description, doc_date, location, album_id, is_public } = req.body;

  const createdItems = files.map(file => {
    return db.createMedia({
      filename: file.originalname,
      storage_path: `/uploads/${file.filename}`,
      mime_type: file.mimetype,
      size_bytes: file.size,
      alt_text: alt_text || file.originalname,
      caption: caption || '',
      description: description || '',
      doc_date: doc_date || undefined,
      location: location || undefined,
      album_id: album_id || undefined,
      is_public: is_public !== 'false',
    });
  });

  db.logAudit('UPLOAD_MEDIA', 'media', createdItems[0].id, `${createdItems.length} foto berhasil diunggah.`, req.ip);
  res.status(201).json({ success: true, media: createdItems });
});

apiRouter.patch('/admin/media/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateMedia(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Media tidak ditemukan.' });
  res.json(updated);
});

apiRouter.delete('/admin/media/:id', requireAdmin, (req: Request, res: Response) => {
  const check = db.deleteMedia(req.params.id);
  if (!check.success) {
    return res.status(400).json({
      error: `Foto tidak dapat dihapus karena sedang digunakan dalam ${check.inUsePosts} artikel dan ${check.inUsePortfolios} portofolio.`,
    });
  }
  db.logAudit('DELETE_MEDIA', 'media', req.params.id, 'Foto dihapus dari media library.', req.ip);
  res.json({ success: true, message: 'Foto berhasil dihapus.' });
});

// Albums
apiRouter.get('/admin/albums', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.getAlbums());
});

apiRouter.post('/admin/albums', requireAdmin, (req: Request, res: Response) => {
  const { name, slug, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Nama album wajib diisi.' });
  const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const album = db.createAlbum(name, finalSlug, description || '');
  res.status(201).json(album);
});

// ==========================================
// 5. AI STUDIO
// ==========================================

apiRouter.post('/admin/ai/generate', requireAdmin, async (req: Request, res: Response) => {
  const {
    photos,
    contentType,
    eventDate,
    location,
    eventContext,
    storyBehind,
    mainMessage,
    perspective,
    tone,
    length,
  } = req.body;

  if (!eventContext && !storyBehind) {
    return res.status(400).json({
      error: 'Harap berikan konteks kejadian atau cerita di balik foto agar AI dapat menyusun narasi autentik.',
    });
  }

  try {
    const result = await generateNarrativeFromPhotos({
      photos: photos || [],
      contentType: contentType || 'Cerita kehidupan',
      eventDate,
      location,
      eventContext: eventContext || '',
      storyBehind: storyBehind || '',
      mainMessage: mainMessage || '',
      perspective: perspective || 'Orang pertama tunggal',
      tone: tone || 'Natural dan santai',
      length: length || 'Artikel 600–900 kata',
    });

    db.recordAIGeneration({
      status: 'success',
      input_context: {
        photo_urls: photos || [],
        content_type: contentType || '',
        event_date: eventDate,
        location,
        event_context: eventContext || '',
        story_behind: storyBehind || '',
        main_message: mainMessage || '',
        perspective: perspective || '',
        tone: tone || '',
        length: length || '',
      },
      output_json: result,
      model: 'gemini-3.8-flash',
    });

    db.logAudit('AI_GENERATE', 'ai', 'gemini-3.8-flash', `Generasi narasi AI berhasil: "${result.title}"`, req.ip);
    res.json(result);
  } catch (err: any) {
    console.error('AI Generation Error:', err);
    db.recordAIGeneration({
      status: 'failed',
      input_context: {
        photo_urls: photos || [],
        content_type: contentType || '',
        event_context: eventContext || '',
        story_behind: storyBehind || '',
        main_message: mainMessage || '',
        perspective: perspective || '',
        tone: tone || '',
        length: length || '',
      },
      output_json: null,
      model: 'gemini-3.8-flash',
      error_message: err.message,
    });
    res.status(500).json({ error: err.message || 'Gagal menghasilkan narasi AI.' });
  }
});

apiRouter.post('/admin/ai/revise', requireAdmin, async (req: Request, res: Response) => {
  const { currentDraft, action, customInstruction } = req.body;
  if (!currentDraft || !action) {
    return res.status(400).json({ error: 'Draf aktif dan jenis revisi wajib disertakan.' });
  }

  try {
    const revised = await reviseNarrativeWithAI({
      currentDraft,
      action,
      customInstruction,
    });

    db.logAudit('AI_REVISE', 'ai', 'gemini-3.8-flash', `Revisi draf dengan aksi: ${action}`, req.ip);
    res.json(revised);
  } catch (err: any) {
    console.error('AI Revision Error:', err);
    res.status(500).json({ error: err.message || 'Gagal merevisi narasi AI.' });
  }
});

apiRouter.get('/admin/ai/history', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.getAIGenerationHistory());
});

apiRouter.post('/admin/ai/save-draft', requireAdmin, (req: Request, res: Response) => {
  const { aiResult, featured_media_id, category_id, tag_ids } = req.body;
  if (!aiResult || !aiResult.title || !aiResult.body_markdown) {
    return res.status(400).json({ error: 'Data hasil AI tidak lengkap.' });
  }

  const generatedSlug = aiResult.slug_suggestion
    ? aiResult.slug_suggestion.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    : aiResult.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const post = db.createPost({
    title: aiResult.title,
    slug: `${generatedSlug}-${Date.now().toString().slice(-4)}`,
    excerpt: aiResult.excerpt || '',
    body: aiResult.body_markdown,
    featured_media_id: featured_media_id || undefined,
    supplementary_media_ids: [],
    status: 'draft', // NEVER auto-publish AI results! Always draft!
    category_id,
    tag_ids: tag_ids || [],
    meta_title: aiResult.meta_title || aiResult.title,
    meta_description: aiResult.meta_description || aiResult.excerpt || '',
    image_alt_text: aiResult.image_alt_text || '',
    read_time_minutes: Math.max(1, Math.ceil(aiResult.body_markdown.split(/\s+/).length / 200)),
    is_featured: false,
  });

  db.logAudit('SAVE_AI_DRAFT', 'post', post.id, `Draf dari hasil AI disimpan: "${post.title}"`, req.ip);
  res.status(201).json({ success: true, post });
});

// ==========================================
// 6. ADMIN PORTFOLIO
// ==========================================

apiRouter.get('/admin/portfolios', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.getPortfolios());
});

apiRouter.post('/admin/portfolios', requireAdmin, (req: Request, res: Response) => {
  const { title, slug, category, role, period, summary, description, learning_outcomes, project_url, github_url, featured_media_id, media_ids, is_featured } = req.body;
  if (!title || !category || !description) {
    return res.status(400).json({ error: 'Judul, kategori, dan deskripsi portofolio wajib diisi.' });
  }

  const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const portfolio = db.createPortfolio({
    title,
    slug: finalSlug,
    category,
    role,
    period,
    summary: summary || '',
    description,
    learning_outcomes,
    project_url,
    github_url,
    featured_media_id,
    media_ids: Array.isArray(media_ids) ? media_ids : [],
    is_featured: Boolean(is_featured),
  });

  db.logAudit('CREATE_PORTFOLIO', 'portfolio', portfolio.id, `Portofolio dibuat: "${portfolio.title}"`, req.ip);
  res.status(201).json(portfolio);
});

apiRouter.patch('/admin/portfolios/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updatePortfolio(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Portofolio tidak ditemukan.' });
  res.json(updated);
});

apiRouter.delete('/admin/portfolios/:id', requireAdmin, (req: Request, res: Response) => {
  const deleted = db.deletePortfolio(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Portofolio tidak ditemukan.' });
  res.json({ success: true, message: 'Portofolio berhasil dihapus.' });
});

// ==========================================
// 7. CATEGORIES & TAGS
// ==========================================

apiRouter.get('/admin/categories', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.getCategories());
});

apiRouter.post('/admin/categories', requireAdmin, (req: Request, res: Response) => {
  const { name, slug, description, color } = req.body;
  if (!name) return res.status(400).json({ error: 'Nama kategori wajib diisi.' });
  const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const cat = db.createCategory(name, finalSlug, description || '', color);
  res.status(201).json(cat);
});

apiRouter.patch('/admin/categories/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateCategory(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Kategori tidak ditemukan.' });
  res.json(updated);
});

apiRouter.delete('/admin/categories/:id', requireAdmin, (req: Request, res: Response) => {
  const result = db.deleteCategory(req.params.id);
  if (!result.success) {
    return res.status(400).json({
      error: `Kategori tidak dapat dihapus karena masih digunakan oleh ${result.inUseCount} artikel.`,
    });
  }
  res.json({ success: true, message: 'Kategori berhasil dihapus.' });
});

apiRouter.get('/admin/tags', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.getTags());
});

apiRouter.post('/admin/tags', requireAdmin, (req: Request, res: Response) => {
  const { name, slug } = req.body;
  if (!name) return res.status(400).json({ error: 'Nama tag wajib diisi.' });
  const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const tag = db.createTag(name, finalSlug);
  res.status(201).json(tag);
});

apiRouter.delete('/admin/tags/:id', requireAdmin, (req: Request, res: Response) => {
  const result = db.deleteTag(req.params.id);
  if (!result.success) {
    return res.status(400).json({
      error: `Tag tidak dapat dihapus karena masih digunakan oleh ${result.inUseCount} artikel.`,
    });
  }
  res.json({ success: true, message: 'Tag berhasil dihapus.' });
});

// ==========================================
// 8. PROFILE & SITE SETTINGS
// ==========================================

apiRouter.get('/admin/profile', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.getProfile());
});

apiRouter.patch('/admin/profile', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateProfile(req.body);
  db.logAudit('UPDATE_PROFILE', 'profile', updated.id, 'Profil pribadi diperbarui.', req.ip);
  res.json(updated);
});

apiRouter.get('/admin/settings', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.getSiteSettings());
});

apiRouter.patch('/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateSiteSettings(req.body);
  db.logAudit('UPDATE_SETTINGS', 'settings', updated.id, 'Pengaturan website diperbarui.', req.ip);
  res.json(updated);
});

apiRouter.get('/admin/audit-logs', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.getAuditLogs());
});

apiRouter.get('/admin/contact-messages', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.getContactMessages());
});

apiRouter.patch('/admin/contact-messages/:id/read', requireAdmin, (req: Request, res: Response) => {
  db.markContactMessageRead(req.params.id);
  res.json({ success: true });
});

// ==========================================
// 9. BACKUP, EXPORT & RESTORE
// ==========================================

apiRouter.get('/admin/backup/export', requireAdmin, (_req: Request, res: Response) => {
  const fullData = db.exportFullData();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="aksara-lensa-backup-${Date.now()}.json"`);
  res.send(JSON.stringify(fullData, null, 2));
});

apiRouter.post('/admin/backup/restore', requireAdmin, (req: Request, res: Response) => {
  try {
    db.restoreFullData(req.body);
    db.logAudit('RESTORE_DATA', 'system', 'root', 'Pemulihan data penuh dilakukan.', req.ip);
    res.json({ success: true, message: 'Basis data berhasil dipulihkan dari cadangan.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Gagal memulihkan cadangan data.' });
  }
});

apiRouter.get('/admin/export/markdown', requireAdmin, (_req: Request, res: Response) => {
  const posts = db.getPosts({ status: 'all' }).posts;
  let markdownBundle = `# AKSARA & LENSA - ARSIP ARTIKEL\n\nTanggal Ekspor: ${new Date().toISOString()}\nTotal Artikel: ${posts.length}\n\n---\n\n`;

  posts.forEach(p => {
    markdownBundle += `## ${p.title}\n`;
    markdownBundle += `- **Slug**: ${p.slug}\n`;
    markdownBundle += `- **Status**: ${p.status}\n`;
    markdownBundle += `- **Dipublikasikan**: ${p.published_at || 'Belum'}\n`;
    markdownBundle += `- **Ringkasan**: ${p.excerpt}\n\n`;
    markdownBundle += `${p.body}\n\n---\n\n`;
  });

  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="semua-artikel-${Date.now()}.md"`);
  res.send(markdownBundle);
});

// ==========================================
// 10. PUBLIC ENDPOINTS
// ==========================================

apiRouter.get('/public/settings', (_req: Request, res: Response) => {
  const settings = db.getSiteSettings();
  res.json({
    site_title: settings.site_title,
    tagline: settings.tagline,
    site_description: settings.site_description,
    hero_greeting: settings.hero_greeting,
    hero_title: settings.hero_title,
    hero_subtitle: settings.hero_subtitle,
    hero_bio: settings.hero_bio,
    footer_text: settings.footer_text,
    default_og_image: settings.default_og_image,
    contact_form_enabled: settings.contact_form_enabled,
  });
});

apiRouter.get('/public/profile', (_req: Request, res: Response) => {
  const p = db.getProfile();
  res.json({
    name: p.name,
    headline: p.headline,
    short_bio: p.short_bio,
    full_bio: p.full_bio,
    avatar_url: p.avatar_url,
    interests: p.interests,
    principles: p.principles,
    experiences: p.experiences,
    social_links: p.social_links,
    contact_email: p.contact_email,
    contact_note: p.contact_note,
  });
});

apiRouter.get('/public/posts', (req: Request, res: Response) => {
  const { category_id, tag_id, search, limit, offset } = req.query;
  const result = db.getPosts({
    category_id: category_id as string,
    tag_id: tag_id as string,
    search: search as string,
    limit: limit ? parseInt(limit as string) : 10,
    offset: offset ? parseInt(offset as string) : 0,
    publicOnly: true,
  });

  const categories = db.getCategories();
  const mediaList = db.getMedia({ is_public: true }).media;

  // Enrich with category name and featured media url
  const enriched = result.posts.map(post => {
    const cat = categories.find(c => c.id === post.category_id);
    const media = mediaList.find(m => m.id === post.featured_media_id);
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      published_at: post.published_at,
      read_time_minutes: post.read_time_minutes,
      category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
      featured_image: media ? { url: media.storage_path, alt: post.image_alt_text || media.alt_text } : null,
      is_featured: post.is_featured,
    };
  });

  res.json({
    posts: enriched,
    total: result.total,
    offset: result.offset,
    limit: result.limit,
  });
});

apiRouter.get('/public/posts/:slug', (req: Request, res: Response) => {
  const post = db.getPostBySlug(req.params.slug, true);
  if (!post) {
    return res.status(404).json({ error: 'Artikel tidak ditemukan atau belum dipublikasikan.' });
  }

  const category = post.category_id ? db.getCategoryById(post.category_id) : null;
  const allTags = db.getTags();
  const postTags = allTags.filter(t => post.tag_ids?.includes(t.id));
  const featuredMedia = post.featured_media_id ? db.getMediaById(post.featured_media_id) : null;
  const supplementaryMedia = (post.supplementary_media_ids || [])
    .map(id => db.getMediaById(id))
    .filter(Boolean);

  // Related posts from same category
  const related = db
    .getPosts({ category_id: post.category_id, publicOnly: true, limit: 3 })
    .posts.filter(p => p.id !== post.id);

  res.json({
    post,
    category,
    tags: postTags,
    featured_media: featuredMedia,
    supplementary_media: supplementaryMedia,
    related_posts: related.map(r => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      excerpt: r.excerpt,
      published_at: r.published_at,
    })),
  });
});

apiRouter.get('/public/portfolios', (_req: Request, res: Response) => {
  const list = db.getPortfolios(true);
  const mediaList = db.getMedia({ is_public: true }).media;

  const enriched = list.map(item => {
    const featured = mediaList.find(m => m.id === item.featured_media_id);
    return {
      ...item,
      featured_media: featured ? { url: featured.storage_path, alt: featured.alt_text } : null,
    };
  });

  res.json(enriched);
});

apiRouter.get('/public/portfolios/:slug', (req: Request, res: Response) => {
  const portfolio = db.getPortfolioBySlug(req.params.slug);
  if (!portfolio) {
    return res.status(404).json({ error: 'Portofolio tidak ditemukan.' });
  }

  const featuredMedia = portfolio.featured_media_id ? db.getMediaById(portfolio.featured_media_id) : null;
  const docs = (portfolio.media_ids || []).map(id => db.getMediaById(id)).filter(Boolean);

  res.json({
    portfolio,
    featured_media: featuredMedia,
    documents: docs,
  });
});

apiRouter.get('/public/gallery', (req: Request, res: Response) => {
  const { album_id, limit, offset } = req.query;
  const result = db.getMedia({
    is_public: true,
    album_id: album_id as string,
    limit: limit ? parseInt(limit as string) : 30,
    offset: offset ? parseInt(offset as string) : 0,
  });

  res.json(result);
});

apiRouter.get('/public/albums', (_req: Request, res: Response) => {
  res.json(db.getAlbums());
});

apiRouter.get('/public/categories', (_req: Request, res: Response) => {
  res.json(db.getCategories());
});

apiRouter.get('/public/tags', (_req: Request, res: Response) => {
  res.json(db.getTags());
});

// Contact form with honeypot & server validation
apiRouter.post('/public/contact', (req: Request, res: Response) => {
  const { name, email, subject, message, website_hp } = req.body;

  // Bot honeypot check
  if (website_hp) {
    return res.status(200).json({ success: true, message: 'Pesan berhasil dikirim.' });
  }

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Nama, email, dan pesan wajib diisi.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Format alamat email tidak valid.' });
  }

  const msg = db.addContactMessage(name.trim(), email.trim(), subject ? subject.trim() : 'Pesan dari Website', message.trim());
  db.logAudit('CONTACT_MESSAGE', 'contact', msg.id, `Pesan baru dari ${name} (${email})`, req.ip);

  res.json({ success: true, message: 'Terima kasih, pesan Anda telah terkirim dan akan ditinjau.' });
});
