-- ==============================================================================
-- AKSARA & LENSA - ROW LEVEL SECURITY (RLS) POLICIES
-- Migrasi: 20261023_002_rls_policies.sql
-- ==============================================================================

-- Aktifkan RLS di seluruh tabel
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 1. KEBIJAKAN AKSES PUBLIK (ANONYMOUS READ-ONLY UNTUK KONTEN PUBLIK)
-- ------------------------------------------------------------------------------

-- Profil & Pengaturan Situs dapat dibaca oleh publik
CREATE POLICY "Public read profiles" ON profiles
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public read site_settings" ON site_settings
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public read published pages" ON pages
    FOR SELECT TO anon, authenticated USING (is_published = true);

CREATE POLICY "Public read categories" ON categories
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public read tags" ON tags
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public read albums" ON albums
    FOR SELECT TO anon, authenticated USING (true);

-- Foto: Pengunjung anonim HANYA boleh membaca foto berstatus is_public = true
CREATE POLICY "Public read public media" ON media
    FOR SELECT TO anon, authenticated USING (is_public = true);

-- Artikel: Pengunjung anonim HANYA boleh membaca post published dan published_at <= sekarang
CREATE POLICY "Public read published posts" ON posts
    FOR SELECT TO anon, authenticated USING (
        status = 'published' AND (published_at IS NULL OR published_at <= timezone('Asia/Jakarta', now()))
    );

CREATE POLICY "Public read post_media" ON post_media
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public read post_categories" ON post_categories
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public read post_tags" ON post_tags
    FOR SELECT TO anon, authenticated USING (true);

-- Portofolio dapat dibaca oleh publik
CREATE POLICY "Public read portfolios" ON portfolios
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public read portfolio_media" ON portfolio_media
    FOR SELECT TO anon, authenticated USING (true);

-- Formulir Kontak: Publik diizinkan mengirim pesan (INSERT saja)
CREATE POLICY "Public insert contact_messages" ON contact_messages
    FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 2. KEBIJAKAN AKSES KHUSUS PEMILIK/ADMIN (AUTHENTICATED FULL ACCESS)
-- ------------------------------------------------------------------------------

CREATE POLICY "Admin full access profiles" ON profiles
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access site_settings" ON site_settings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access pages" ON pages
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access categories" ON categories
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access tags" ON tags
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access albums" ON albums
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access media" ON media
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access posts" ON posts
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access post_media" ON post_media
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access post_categories" ON post_categories
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access post_tags" ON post_tags
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access post_revisions" ON post_revisions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access portfolios" ON portfolios
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access portfolio_media" ON portfolio_media
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access ai_generations" ON ai_generations
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access audit_logs" ON audit_logs
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access contact_messages" ON contact_messages
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
