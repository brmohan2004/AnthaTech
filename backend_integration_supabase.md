# Backend Integration — Supabase Storage Edition
### Migration from Cloudflare R2 → Supabase Storage (No Credit Card Needed)

---

## What Changed from Original Plan

The original `backend_integration.md` uses **Cloudflare R2** for all media storage.
Since R2 requires a credit card, we use **Supabase Storage** instead — with an
abstraction layer so you can switch to R2 later with a single config change.

### Comparison

| Feature | Original (R2) | Current (Supabase Storage) |
|---------|---------------|---------------------------|
| **Storage** | Cloudflare R2 bucket | Supabase Storage bucket |
| **Free limit** | 10 GB storage, unlimited egress | 1 GB storage, 2 GB bandwidth/mo |
| **Card needed** | Yes | No |
| **Upload method** | Presigned URL → direct R2 upload | Supabase JS client → direct upload |
| **Public URLs** | `https://pub-xxx.r2.dev/...` | `https://[project].supabase.co/storage/v1/object/public/media/...` |
| **CDN** | Cloudflare CDN (native) | Supabase CDN (built-in) |

### What Stays the Same
- All database tables, RLS policies, and schemas — **identical**
- Auth flow (Supabase Auth + JWT + MFA) — **identical**
- Admin panel UI and features — **identical**
- Public website fetch logic — **identical**
- Edge Functions (scheduled publish, notifications, etc.) — **identical**

---

## Architecture (Updated)

```
PUBLIC WEBSITE                          ADMIN PANEL
(localhost / CF Pages)                  (localhost / CF Pages)
         │                                       │
         ▼                                       ▼
  Supabase REST API                       Supabase REST API
  (read-heavy, public anon key)           (write-heavy, auth JWT)
         │                                       │
         ▼                                       ▼
   Supabase PostgreSQL  ◄──── Same DB ────► Supabase PostgreSQL
   (content tables)                         (content + admin tables)
         │                                       │
         ▼                                       ▼
  Supabase Storage                        Supabase Storage
  (public "media" bucket)                 (upload via admin auth)
```

> **Future upgrade:** When you get a credit card, add Cloudflare R2 + Workers
> in front for caching. The storage abstraction layer makes this a config change.

---

## Supabase Storage Setup

### Bucket: `media`
- **Type:** Public (anyone can read, only authenticated can write)
- **Create in:** Supabase Dashboard → Storage → New Bucket → name: `media` → Public: ON

### Folder Structure (inside `media` bucket)
```
media/
├── projects/
│   ├── covers/          ← Project cover images
│   └── galleries/       ← Project gallery images
│       └── [slug]/
├── services/
│   └── graphics/        ← Service section images
├── blogs/
│   └── covers/          ← Blog post cover images
├── process/
│   └── steps/           ← Progress step images
├── clients/
│   └── logos/           ← Trusted-by client logos
├── team/
│   └── avatars/         ← Review/team avatars
├── about/
│   └── logo.png         ← Company logo
└── og/
    └── images/          ← OG/meta images per page
```

### Storage RLS Policies
```sql
-- Anyone can view files (public bucket)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Only authenticated admins can upload
CREATE POLICY "Admin upload access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Only authenticated admins can delete
CREATE POLICY "Admin delete access"
ON storage.objects FOR DELETE
USING (bucket_id = 'media' AND auth.role() = 'authenticated');
```

### Upload Flow (Supabase Storage vs R2)
```
ORIGINAL (R2):
Admin → Edge Function (presigned URL) → Direct R2 upload → R2 public URL saved in DB

NEW (Supabase Storage):
Admin → supabase.storage.from('media').upload(path, file) → Public URL saved in DB
```

One line of code. No Edge Function needed for uploads.

### Public URL Format
```
https://qwkkeufxsrfofhmwytcm.supabase.co/storage/v1/object/public/media/projects/covers/recruiterone.jpg
```

---

## Environment Variables (Simplified)

### Admin Panel `.env`
```env
VITE_SUPABASE_URL=https://qwkkeufxsrfofhmwytcm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_STORAGE_PROVIDER=supabase
VITE_EDGE_FN_URL=https://qwkkeufxsrfofhmwytcm.supabase.co/functions/v1
BREVO_API_KEY=xkeysib-...
```

### Public Website `.env`
```env
VITE_SUPABASE_URL=https://qwkkeufxsrfofhmwytcm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

No Cloudflare Worker URL needed initially — public site calls Supabase directly.
Cache layer can be added later.

---

## Database Tables — No Changes

All 19 tables from `backend_integration.md` remain exactly the same:

| # | Table | Purpose |
|---|-------|---------|
| 1 | `site_config` | Global settings (contact, social, SEO) |
| 2 | `hero_content` | Landing page hero section |
| 3 | `about_content` | About1 + About2 sections |
| 4 | `projects` | All projects with full detail |
| 5 | `services` | All services with full detail |
| 6 | `highlights_content` | Highlights section |
| 7 | `process_steps` | How We Work steps |
| 8 | `reviews` | Testimonials |
| 9 | `community_content` | Community page sections |
| 10 | `community_applications` | Join applications |
| 11 | `blog_posts` | Insights/blog articles |
| 12 | `contact_messages` | Contact form submissions |
| 13 | `content_history` | Version snapshots |
| 14 | `audit_log` | Admin activity log |
| 15 | `admin_sessions` | Active session tracking |
| 16 | `ip_blocklist` | IP block/whitelist |
| 17 | `webhooks` | Outgoing webhook configs |
| 18 | `notifications` | In-panel notification feed |
| 19 | `admin_profiles` | Admin security preferences |

All `_url` columns store Supabase Storage public URLs instead of R2 URLs.

---

## Storage Abstraction Layer

File: `admin-panel/src/api/media.js`

The media API module abstracts storage operations so switching providers
requires only changing `VITE_STORAGE_PROVIDER`:

```js
// Current: supabase → uses supabase.storage
// Future:  r2       → uses presigned URL Edge Function
```

### Supported Operations
| Method | Description |
|--------|-------------|
| `uploadFile(path, file)` | Upload file, returns public URL |
| `deleteFile(path)` | Delete file from storage |
| `getPublicUrl(path)` | Get CDN-ready public URL |
| `listFiles(folder)` | List all files in a folder |

---

## Edge Functions Still Needed

Even without R2, these Edge Functions are still required:

| Function | Purpose |
|----------|---------|
| `scheduled-publish-cron` | Auto-publish scheduled posts every 15 min |
| `send-contact-notification` | Email admin on new contact message |
| `send-application-notification` | Email admin on new community application |
| `approve-community-member` | Update status + send welcome email |
| `save-version-snapshot` | Auto-save content version on edit |
| `purge-old-audit-logs` | Daily cleanup of 90+ day audit logs |

### No Longer Needed (R2-specific)
| Function | Why removed |
|----------|-------------|
| `generate-r2-presigned-url` | Supabase Storage handles uploads directly |
| `invalidate-cache` | No Cloudflare Worker cache layer yet |
| `trigger-webhook` | Deferred — added when webhooks are built |

---

## Migration Path: Supabase Storage → R2 (Later)

When you get a credit card and want to migrate:

1. Create R2 bucket `anthatech-media`
2. Get R2 API tokens
3. Change `.env`: `VITE_STORAGE_PROVIDER=r2`
4. Add R2 credentials to `.env`
5. Deploy `generate-r2-presigned-url` Edge Function
6. Run migration script to copy files from Supabase → R2
7. Update all `_url` columns in DB to R2 URLs
8. Done — no frontend code changes needed

---

## Free Tier Budget (Updated)

### Supabase Free Limits vs Projected Usage

| Resource | Free Limit | Projected Use | Buffer |
|----------|-----------|---------------|--------|
| Database | 500 MB | ~25–60 MB | 88%+ left |
| Bandwidth | 2 GB | ~400–800 MB (no CF cache) | 60%+ left |
| Auth MAU | 50,000 | 2–5 admins | Negligible |
| Edge Functions | 500K/mo | <10K/mo | Negligible |
| **Storage** | **1 GB** | **200–500 MB** | **50%+ left** |
| Storage bandwidth | **2 GB** | **500 MB–1.5 GB** | **25%+ left** |

> ⚠️ Storage bandwidth is the tightest constraint. If traffic grows,
> add Cloudflare R2 to offload media serving.
