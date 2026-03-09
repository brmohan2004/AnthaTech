-- ============================================
-- Antha Tech — Final Production Schema
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================
-- 1. site_config — Global Key-Value Settings
-- ============================================
CREATE TABLE site_config (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key         TEXT UNIQUE NOT NULL,
    value       TEXT,
    updated_at  TIMESTAMPTZ DEFAULT now()
);

INSERT INTO site_config (key, value) VALUES
    ('contact',          '{"businessEmail":"info.anthatech@gmail.com","phone":"+91 99624 42165","address":"Chennai, India","mapUrl":""}'),
    ('social',           '{"instagram":"https://instagram.com/anthatech","linkedin":"https://linkedin.com/company/anthatech","twitter":"https://twitter.com/anthatech","behance":"","github":"https://github.com/brmohan2004?tab=repositories"}'),
    ('seo',              '{"siteName":"Antha Tech","defaultTitle":"Antha Tech — Digital Agency","defaultDesc":"Transform ideas into digital experiences","ogImage":"","perPage":[]}'),
    ('maintenance',      '{"isEnabled":false,"title":"We will be back soon","message":"We are performing scheduled maintenance.","expectedBackAt":"","allowedIPs":"","activeSince":null,"activationReason":""}'),
    ('password_policy',  '{"minLength":12,"requireUpper":true,"requireNumber":true,"requireSpecial":true,"expiry":0,"preventReuse":0,"lockThreshold":5,"lockDuration":15}'),
    ('api_keys',         '[]'),
    ('business_hours',   '{"start":"09:00","end":"18:00","tz":"Asia/Kolkata","days":["Mon","Tue","Wed","Thu","Fri"]}'),
    ('dismissed_alerts', '[]');

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read site_config"  ON site_config FOR SELECT USING (true);
CREATE POLICY "Admin can manage site_config" ON site_config FOR ALL    USING (auth.role() = 'authenticated');


-- ============================================
-- 2. hero_content — Landing Page Hero (singleton)
-- ============================================
CREATE TABLE hero_content (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    badge               TEXT DEFAULT 'Development agency',
    title1              TEXT DEFAULT 'Turning pixels into',
    title2              TEXT DEFAULT 'digital mastery',
    subtitle1           TEXT DEFAULT 'Transform ideas into impactful digital experiences',
    subtitle2           TEXT DEFAULT 'that captivate your audience and fuel business growth.',
    primary_cta_text    TEXT DEFAULT 'Our Services',
    primary_cta_link    TEXT DEFAULT '/services',
    secondary_cta_text  TEXT DEFAULT 'Get in Touch',
    logos               JSONB DEFAULT '[]'::jsonb,
    updated_at          TIMESTAMPTZ DEFAULT now()
);

INSERT INTO hero_content (badge) VALUES ('Development agency');

ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read hero"  ON hero_content FOR SELECT USING (true);
CREATE POLICY "Admin can manage hero" ON hero_content FOR ALL    USING (auth.role() = 'authenticated');


-- ============================================
-- 3. about_content — About Sections (about1 & about2)
--    All fields stored inside a single JSONB `content` column.
--    about1 content: { logoUrl, paragraph1[], paragraph2[], button1Text, button2Text }
--    about2 content: { badge, title1, title2, buttonText, stats[] }
-- ============================================
CREATE TABLE about_content (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section     TEXT NOT NULL CHECK (section IN ('about1', 'about2')),
    content     JSONB DEFAULT '{}'::jsonb,
    updated_at  TIMESTAMPTZ DEFAULT now()
);

INSERT INTO about_content (section, content) VALUES
    ('about1', '{"logoUrl":"","paragraph1":[],"paragraph2":[],"button1Text":"About Us","button2Text":"Our Services"}'::jsonb),
    ('about2', '{"badge":"Our Impact","title1":"Numbers that","title2":"speak volumes","buttonText":"","stats":[]}'::jsonb);

ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read about"  ON about_content FOR SELECT USING (true);
CREATE POLICY "Admin can manage about" ON about_content FOR ALL    USING (auth.role() = 'authenticated');


-- ============================================
-- 4. projects — Portfolio Projects
-- ============================================
CREATE TABLE projects (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug              TEXT UNIQUE NOT NULL,
    title             TEXT NOT NULL,
    category          TEXT,
    image             TEXT,
    hero_description  TEXT,
    challenges        JSONB DEFAULT '[]'::jsonb,
    gallery           JSONB DEFAULT '[]'::jsonb,
    solutions         JSONB DEFAULT '[]'::jsonb,
    review            JSONB DEFAULT '{}'::jsonb,         -- { quote, author, role, company }
    related_projects  JSONB DEFAULT '[]'::jsonb,
    preview_link      TEXT,
    status            TEXT DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'scheduled')),
    publish_at        TIMESTAMPTZ,
    display_order     INT2 DEFAULT 0,
    created_at        TIMESTAMPTZ DEFAULT now(),
    updated_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published projects" ON projects FOR SELECT USING (status = 'published');
CREATE POLICY "Admin full access projects"         ON projects FOR ALL    USING (auth.role() = 'authenticated');


-- ============================================
-- 5. services — Service Offerings
-- ============================================
CREATE TABLE services (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug            TEXT UNIQUE NOT NULL,
    name            TEXT NOT NULL,
    description     TEXT,
    tags            JSONB DEFAULT '[]'::jsonb,
    theme           TEXT DEFAULT 'Charcoal',
    hero_bg_color   TEXT DEFAULT '#1a1a2e',
    graphic         TEXT,
    offers          JSONB DEFAULT '[]'::jsonb,
    process         JSONB DEFAULT '[]'::jsonb,
    benefits        JSONB DEFAULT '[]'::jsonb,
    status          TEXT DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
    display_order   INT2 DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published services" ON services FOR SELECT USING (status = 'published');
CREATE POLICY "Admin full access services"         ON services FOR ALL    USING (auth.role() = 'authenticated');


-- ============================================
-- 6. highlights_content — Highlights Section (singleton)
-- ============================================
CREATE TABLE highlights_content (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    header      JSONB DEFAULT '[]'::jsonb,
    items       JSONB DEFAULT '[]'::jsonb,
    updated_at  TIMESTAMPTZ DEFAULT now()
);

INSERT INTO highlights_content (header) VALUES ('[]'::jsonb);

ALTER TABLE highlights_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read highlights"  ON highlights_content FOR SELECT USING (true);
CREATE POLICY "Admin can manage highlights" ON highlights_content FOR ALL    USING (auth.role() = 'authenticated');


-- ============================================
-- 7. process_steps — How We Work (singleton)
-- ============================================
CREATE TABLE process_steps (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    badge       TEXT DEFAULT 'How we work',
    title1      TEXT DEFAULT 'Our proven',
    title2      TEXT DEFAULT 'process',
    cta_text    TEXT DEFAULT 'Start a Project',
    steps       JSONB DEFAULT '[]'::jsonb,
    updated_at  TIMESTAMPTZ DEFAULT now()
);

INSERT INTO process_steps (badge) VALUES ('How we work');

ALTER TABLE process_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read process"  ON process_steps FOR SELECT USING (true);
CREATE POLICY "Admin can manage process" ON process_steps FOR ALL    USING (auth.role() = 'authenticated');


-- ============================================
-- 8. reviews — Testimonials
-- ============================================
CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote           TEXT NOT NULL,
    author          TEXT NOT NULL,
    role            TEXT,
    company         TEXT,
    avatar          TEXT,
    status          TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    display_order   INT2 DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active reviews" ON reviews FOR SELECT USING (status = 'active');
CREATE POLICY "Admin full access reviews"      ON reviews FOR ALL    USING (auth.role() = 'authenticated');


-- ============================================
-- 9. community_content — Community Sections
--    All section-specific fields stored inside `content` JSONB.
--    teaser:       { title1, title2, description, ctaText, tracks[], stats[] }
--    how_it_works: { title1, title2, steps[] }
--    perks:        { title1, title2, perks[] }
-- ============================================
CREATE TABLE community_content (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section     TEXT NOT NULL CHECK (section IN ('teaser', 'how_it_works', 'perks')),
    content     JSONB DEFAULT '{}'::jsonb,
    updated_at  TIMESTAMPTZ DEFAULT now()
);

INSERT INTO community_content (section, content) VALUES
    ('teaser',       '{"title1":"Join our","title2":"community","description":"","ctaText":"Apply Now","tracks":[],"stats":[]}'::jsonb),
    ('how_it_works', '{"title1":"How it","title2":"works","steps":[]}'::jsonb),
    ('perks',        '{"title1":"Member","title2":"perks","perks":[]}'::jsonb);

ALTER TABLE community_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read community"  ON community_content FOR SELECT USING (true);
CREATE POLICY "Admin can manage community" ON community_content FOR ALL    USING (auth.role() = 'authenticated');


-- ============================================
-- 10. community_applications — Join Applications
-- ============================================
CREATE TABLE community_applications (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name   TEXT NOT NULL,
    email       TEXT NOT NULL,
    track       TEXT CHECK (track IN ('student', 'professional')),
    message     TEXT,
    status      TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    applied_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE community_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can submit applications"   ON community_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can read applications"      ON community_applications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can update applications"    ON community_applications FOR UPDATE USING (auth.role() = 'authenticated');


-- ============================================
-- 11. blog_posts — Insights / Blog
-- ============================================
CREATE TABLE blog_posts (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug        TEXT UNIQUE NOT NULL,
    title       TEXT NOT NULL,
    short_desc  TEXT,
    content     TEXT,
    url         TEXT,
    cover       TEXT,
    date_label  TEXT,
    tags        JSONB DEFAULT '[]'::jsonb,
    status      TEXT DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'scheduled')),
    publish_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published posts" ON blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Admin full access blog"          ON blog_posts FOR ALL    USING (auth.role() = 'authenticated');


-- ============================================
-- 12. contact_messages — Contact Form Submissions
-- ============================================
CREATE TABLE contact_messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_name     TEXT NOT NULL,
    sender_email    TEXT NOT NULL,
    message         TEXT NOT NULL,
    status          TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
    received_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can submit contact"   ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can read messages"     ON contact_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can update messages"   ON contact_messages FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can delete messages"   ON contact_messages FOR DELETE USING (auth.role() = 'authenticated');


-- ============================================
-- 13. content_history — Version Snapshots
-- ============================================
CREATE TABLE content_history (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name      TEXT NOT NULL,
    record_id       UUID NOT NULL,
    snapshot_data   JSONB NOT NULL,
    version_number  INT2 DEFAULT 1,
    saved_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    saved_at        TIMESTAMPTZ DEFAULT now(),
    change_summary  TEXT
);

CREATE INDEX idx_content_history_lookup ON content_history (table_name, record_id, version_number DESC);

ALTER TABLE content_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can read history"   ON content_history FOR SELECT      USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can insert history" ON content_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- ============================================
-- 14. audit_log — Admin Activity Log
-- ============================================
CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type      TEXT CHECK (event_type IN ('auth', 'content', 'security', 'system')),
    description     TEXT,
    target_table    TEXT,
    target_id       UUID,
    ip_address      TEXT,
    user_agent      TEXT,
    result          TEXT CHECK (result IN ('success', 'failure')),
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_log_type_date ON audit_log (event_type, created_at DESC);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can read audit"   ON audit_log FOR SELECT      USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can insert audit" ON audit_log FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- ============================================
-- 15. admin_sessions — Active Session Tracking
-- ============================================
CREATE TABLE admin_sessions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device      TEXT,
    browser     TEXT,
    os          TEXT,
    ip_address  TEXT,
    location    TEXT,
    login_at    TIMESTAMPTZ DEFAULT now(),
    last_active TIMESTAMPTZ DEFAULT now(),
    is_current  BOOLEAN DEFAULT false,
    jwt_id      TEXT,
    revoked_at  TIMESTAMPTZ
);

CREATE INDEX idx_admin_sessions_active ON admin_sessions (admin_id) WHERE revoked_at IS NULL;

ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can read own sessions"   ON admin_sessions FOR SELECT USING (auth.uid() = admin_id);
CREATE POLICY "Admin can update own sessions" ON admin_sessions FOR UPDATE USING (auth.uid() = admin_id);
CREATE POLICY "Admin can insert sessions"     ON admin_sessions FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- ============================================
-- 16. ip_blocklist — IP Block / Whitelist
-- ============================================
CREATE TABLE ip_blocklist (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address      TEXT NOT NULL,
    reason          TEXT,
    is_whitelisted  BOOLEAN DEFAULT false,
    blocked_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    blocked_at      TIMESTAMPTZ DEFAULT now(),
    expires_at      TIMESTAMPTZ
);

ALTER TABLE ip_blocklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access blocklist" ON ip_blocklist FOR ALL USING (auth.role() = 'authenticated');


-- ============================================
-- 17. webhooks — Outgoing Webhooks
-- ============================================
CREATE TABLE webhooks (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                TEXT NOT NULL,
    url                 TEXT NOT NULL,
    secret              TEXT,
    events              JSONB DEFAULT '[]'::jsonb,
    status              TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused')),
    last_triggered_at   TIMESTAMPTZ,
    last_result         TEXT,
    created_at          TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access webhooks" ON webhooks FOR ALL USING (auth.role() = 'authenticated');


-- ============================================
-- 18. notifications — In-Panel Notification Feed
-- ============================================
CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type        TEXT CHECK (type IN ('message', 'application', 'security', 'backup', 'system')),
    title       TEXT NOT NULL,
    body        TEXT,
    link        TEXT,
    is_read     BOOLEAN DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can read notifications"   ON notifications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can update notifications" ON notifications FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can delete notifications" ON notifications FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can insert notifications" ON notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- ============================================
-- 19. admin_profiles — Admin User Preferences
-- ============================================
CREATE TABLE admin_profiles (
    id                      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email                   TEXT,
    full_name               TEXT,
    role                    TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'editor', 'viewer')),
    status                  TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
    mfa_enabled             BOOLEAN DEFAULT false,
    mfa_enforced_by_super   BOOLEAN DEFAULT false,
    password_last_changed   TIMESTAMPTZ DEFAULT now()
);

-- Helper to check super_admin without triggering RLS recursion
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can read own profile"  ON admin_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin can update own profile" ON admin_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Super admin can read all profiles" ON admin_profiles FOR SELECT USING (is_super_admin());
CREATE POLICY "Super admin can update all profiles" ON admin_profiles FOR UPDATE USING (is_super_admin());
CREATE POLICY "System can insert profiles" ON admin_profiles FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- ============================================
-- Auto-update updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON site_config         FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON hero_content        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON about_content       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON projects            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON services            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON highlights_content  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON process_steps       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON community_content   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON blog_posts          FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================
-- Storage bucket for media uploads
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

CREATE POLICY "Public read media"  ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Admin upload media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');
CREATE POLICY "Admin update media" ON storage.objects FOR UPDATE USING (bucket_id = 'media' AND auth.role() = 'authenticated');
CREATE POLICY "Admin delete media" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND auth.role() = 'authenticated');


-- ============================================
-- Done! 19 tables + storage bucket created.
--
-- Column naming matches admin panel form payloads exactly.
-- The public website API layer maps these to the names
-- its components expect.
--
-- Status values are lowercase: 'draft', 'published', 'active', etc.
--
-- Next steps:
--   1. Create your first admin user in Supabase Auth
--      (Dashboard → Authentication → Users → Add User)
--   2. Insert a row in admin_profiles for that user (already done below)
--   3. Populate content via the admin panel

-- Super admin profile seed (run once after creating the auth user):
INSERT INTO admin_profiles (id, email, full_name, role)
VALUES ('3c6159ce-0675-4dd6-bb6b-6bce1e3aa91d', 'info.anthatech@gmail.com', 'MOHAN B R', 'super_admin');
--   3. Populate content via the admin panel
-- ============================================

-- step 2: 
-- 1. Create the helper function that bypasses RLS
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Drop the broken recursive policies
DROP POLICY IF EXISTS "Super admin can read all profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Super admin can update all profiles" ON admin_profiles;

-- 3. Re-create them using the safe function
CREATE POLICY "Super admin can read all profiles" ON admin_profiles FOR SELECT USING (is_super_admin());
CREATE POLICY "Super admin can update all profiles" ON admin_profiles FOR UPDATE USING (is_super_admin());