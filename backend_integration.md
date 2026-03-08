# Backend Integration — Admin Panel ↔ Public Website
### Using Supabase + Cloudflare R2 (Stay Free Forever Strategy)

---

## 1. Architecture Overview

```
PUBLIC WEBSITE                          ADMIN PANEL
(CF Pages — www.anthatech.com)         (CF Pages — admin.anthatech.com)
         │                                       │
         ▼                                       ▼
  Cloudflare CDN/Workers                  Direct API calls
  (cache layer — no free limit burn)      (low traffic — safe)
  [Same Cloudflare network — zero        [Protected by Cloudflare Access
   extra latency, native integration]     — no public exposure]
         │                                       │
         ▼                                       ▼
  Supabase REST API   ◄──── Same DB ────► Supabase REST API
  (read-heavy, cached)                   (write-heavy, no cache)
         │                                       │
         ▼                                       ▼
   Supabase PostgreSQL                    Supabase Auth
   (content tables)                       (admin JWT sessions)
         │
         ▼
  Cloudflare R2
  (ALL media — images, videos, files)
  [Native R2 binding — no egress fees,
   direct Workers R2 API access]
```

> **Why Cloudflare Pages is better than Vercel for this stack:**
> - Public site, Admin panel, Workers, R2 and CDN are all on the **same Cloudflare network** — zero inter-service latency
> - **Native R2 bindings** in Pages Functions — no extra API calls needed to reach R2
> - **Cloudflare Access** can gate the admin panel subdomain at the network layer — blocks unauthenticated requests before they even reach your app
> - All free tier limits are shared within one Cloudflare account — simpler billing monitoring
> - Automatic global CDN for static assets — no additional configuration

---

## 2. Supabase Database — Table Structure

Each table directly feeds one or more sections of the public website and is managed from the corresponding admin panel section.

---

### 2.1 `site_config` — Global Site Settings
**Admin Section:** Site Settings (Contact / Social / SEO)

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| key | text (unique) | Config key — e.g. `contact_email`, `instagram_url` |
| value | text | Config value |
| updated_at | timestamp | Last updated |

**Usage:**
- Admin writes: `UPDATE site_config SET value = '...' WHERE key = 'contact_email'`
- Public site reads via Cloudflare Worker cache (refreshes every 24 hours)

---

### 2.2 `hero_content` — Landing Page Hero
**Admin Section:** Content > Hero Section

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| badge_text | text | Pill badge text |
| title_line_1 | text | Main title line 1 |
| title_line_2 | text | Gradient text line |
| subtitle_1 | text | Sub-description line 1 |
| subtitle_2 | text | Sub-description line 2 |
| cta_primary_text | text | Primary button label |
| cta_primary_route | text | Button route |
| cta_secondary_text | text | Secondary button label |
| client_logos | jsonb | Array of R2 URLs for client logos |
| updated_at | timestamp | Last updated |

---

### 2.3 `about_content` — About Sections
**Admin Section:** Content > About

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| section | text | `about1` or `about2` |
| logo_url | text | R2 URL (about1 logo) |
| paragraph_1 | jsonb | Array of {text, color} word groups |
| paragraph_2 | jsonb | Array of {text, color} word groups |
| btn_primary | text | Button 1 text |
| btn_secondary | text | Button 2 text |
| badge_text | text | about2 badge |
| title_1 | text | about2 title line 1 |
| title_2 | text | about2 title line 2 |
| stats | jsonb | Array of {dot_color, number, label} |
| updated_at | timestamp | |

---

### 2.4 `projects` — All Projects
**Admin Section:** Content > Projects

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| slug | text (unique) | URL slug — e.g. `recruiterone` |
| title | text | Project name |
| category_pill | text | Category badge text |
| cover_image_url | text | R2 image URL |
| hero_description | text | Long description for detail page |
| challenges | jsonb | Array of challenge strings |
| gallery_urls | jsonb | Array of R2 image URLs |
| solutions | jsonb | Array of solution strings |
| review_quote | text | Client review |
| review_author | text | Client name |
| review_role | text | Client role |
| review_company | text | Client company |
| review_avatar_url | text | Optional R2 avatar URL |
| related_project_slugs | jsonb | Array of other project slugs |
| status | text | `published` / `draft` / `scheduled` |
| publish_at | timestamp | Scheduled publish datetime (UTC); null if not scheduled |
| display_order | int2 | Order in carousel/grid |
| created_at | timestamp | |
| updated_at | timestamp | |

**RLS Policy (Row Level Security):**
- **Public:** Can SELECT where `status = 'published'`
- **Admin:** Full CRUD access (authenticated JWT)

---

### 2.5 `services` — Services
**Admin Section:** Content > Services

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| slug | text (unique) | e.g. `branding`, `product-design` |
| title | text | Service name |
| short_description | text | Used on landing page ServiceCard |
| tags | jsonb | Array of tag strings |
| theme | text | `theme-dark-green` / `theme-indigo-blue` / `theme-charcoal-black` |
| hero_bg_color | text | Hex color for detail page hero |
| graphic_url | text | R2 URL for service graphic image |
| offers | jsonb | Array of {icon, title, text} |
| process_steps | jsonb | Array of {step, title, text} |
| benefits | jsonb | Array of benefit strings |
| status | text | `published` / `draft` |
| display_order | int2 | |
| updated_at | timestamp | |

---

### 2.6 `highlights_content` — Highlights Section
**Admin Section:** Content > Highlights

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| header_rich_text | jsonb | Array of {text, highlight: bool} |
| items | jsonb | Array of {svg_code, title_line1, title_line2} |
| updated_at | timestamp | |

---

### 2.7 `process_steps` — How We Work Steps
**Admin Section:** Content > Process Steps

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| badge_text | text | Section badge |
| title_1 | text | Section title line 1 |
| title_2 | text | Section title line 2 |
| cta_text | text | Button text |
| steps | jsonb | Array of {step, title, description, image_url (R2)} |
| updated_at | timestamp | |

---

### 2.8 `reviews` — Testimonials
**Admin Section:** Content > Reviews

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| quote | text | Review text (max 300 chars) |
| author_name | text | Client name |
| author_role | text | Client role |
| company | text | Company name |
| avatar_url | text | Optional R2 avatar URL |
| status | text | `active` / `inactive` |
| display_order | int2 | |
| created_at | timestamp | |

---

### 2.9 `community_content` — Community Sections
**Admin Section:** Content > Community

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| section | text | `teaser` / `how_it_works` / `perks` |
| title_1 | text | Section title line 1 |
| title_2 | text | Section title line 2 |
| description | text | Paragraph text |
| cta_text | text | Button text |
| tracks | jsonb | Array of {icon, label, desc} |
| stats | jsonb | Array of {value, label} |
| steps | jsonb | (how_it_works) Array of {step, title, desc, icon} |
| perks | jsonb | (perks) Array of {icon, title, desc} |
| updated_at | timestamp | |

---

### 2.10 `community_applications` — Join Applications
**Admin Section:** Content > Community > Members Tab

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| full_name | text | Applicant name |
| email | text | Applicant email |
| track | text | `student` / `professional` |
| message | text | Optional message |
| status | text | `pending` / `approved` / `rejected` |
| applied_at | timestamp | Submission date |

**RLS Policy:**
- **Public:** Can INSERT only (submit form)
- **Admin:** Full SELECT, UPDATE access

---

### 2.11 `blog_posts` — Insights / Blog
**Admin Section:** Content > Blog/Insights

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| slug | text (unique) | URL slug |
| title | text | Post title (max 100 chars) |
| cover_image_url | text | R2 URL or external URL |
| date_label | text | "1 year ago" / actual date string |
| short_description | text | Shown on BlogCard (max 200 chars) |
| full_content | text | WYSIWYG HTML/Markdown content |
| tags | jsonb | Array of tag strings |
| link | text | Internal route like `/insights/slug` |
| status | text | `published` / `draft` / `scheduled` |
| publish_at | timestamp | Scheduled publish datetime (UTC); null if not scheduled |
| created_at | timestamp | |
| updated_at | timestamp | |

---

### 2.12 `contact_messages` — Contact Form Submissions
**Admin Section:** Messages Inbox

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| sender_name | text | Contact person name |
| sender_email | text | Contact email |
| message | text | Full message |
| status | text | `new` / `read` |
| received_at | timestamp | Submission time |

**RLS Policy:**
- **Public:** INSERT only (submit form — no auth needed)
- **Admin:** Full SELECT, UPDATE, DELETE (authenticated)

---

### 2.13 `content_history` — Version Snapshots
**Admin Section:** Version History drawer (all content editors)

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| table_name | text | Source table — e.g. `projects`, `blog_posts` |
| record_id | uuid | FK to the row being versioned |
| snapshot_data | jsonb | Full row JSON at time of save |
| version_number | int2 | Incrementing per record |
| saved_by | uuid | FK to auth.users (admin who saved) |
| saved_at | timestamp | When snapshot was taken |
| change_summary | text | Optional description — auto or manual |

**RLS Policy:**
- **Public:** No access
- **Admin:** SELECT (view history), INSERT (system only — triggered on save)

---

### 2.14 `audit_log` — Forensic Admin Activity Log
**Admin Section:** Security > Audit Log

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| admin_id | uuid | FK to auth.users |
| event_type | text | `auth` / `content` / `security` / `system` |
| description | text | Human-readable event summary |
| target_table | text | Affected table (nullable) |
| target_id | uuid | Affected row ID (nullable) |
| ip_address | text | Admin's IP at time of event |
| user_agent | text | Browser/OS info |
| result | text | `success` / `failure` |
| created_at | timestamp | |

> Purge policy: rows older than 90 days auto-deleted via Edge Function cron to control table growth.

**RLS Policy:**
- **Public:** No access
- **Admin:** SELECT (read logs), INSERT (system triggers only)

---

### 2.15 `admin_sessions` — Active Session Tracking
**Admin Section:** Security > Active Sessions

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| admin_id | uuid | FK to auth.users |
| device | text | Detected device type (Windows PC, MacBook…) |
| browser | text | Browser name |
| os | text | Operating system |
| ip_address | text | Session IP |
| location | text | Geo-resolved country/city |
| login_at | timestamp | Session start time |
| last_active | timestamp | Last API call time |
| is_current | boolean | True for the active session making the request |
| jwt_id | text | JWT jti claim — used to revoke specific session |
| revoked_at | timestamp | Null if active; set when manually revoked |

**RLS Policy:**
- **Public:** No access
- **Admin:** SELECT (own rows), UPDATE (set revoked_at), no other writes from client

---

### 2.16 `ip_blocklist` — IP Block / Whitelist
**Admin Section:** Security > IP Blocklist

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| ip_address | text | IPv4 or IPv6 address |
| reason | text | Why blocked — e.g. `5x failed login` |
| is_whitelisted | boolean | True = bypass rate limits; false = blocked |
| blocked_by | uuid | FK auth.users (null = auto-blocked) |
| blocked_at | timestamp | |
| expires_at | timestamp | Null = permanent; set = auto-unblock time |

**RLS Policy:**
- **Public:** No access (checked only via Edge Function / Worker)
- **Admin:** Full CRUD access

---

### 2.17 `webhooks` — Registered Outgoing Webhooks
**Admin Section:** Settings > Webhooks

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Friendly name — e.g. `Slack Notifications` |
| endpoint_url | text | Encrypted target URL |
| secret_key | text | HMAC signing key (encrypted at rest) |
| events | jsonb | Array of event strings to trigger on |
| status | text | `active` / `paused` |
| last_triggered_at | timestamp | |
| last_result | text | `200 OK` / `500 Error` / null |
| created_at | timestamp | |

**RLS Policy:**
- **Public:** No access
- **Admin:** Full CRUD (secret_key masked in SELECT — revealed via separate auth-gated function)

---

### 2.18 `notifications` — In-Panel Notification Feed
**Admin Section:** Topbar bell → Notification Center

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| type | text | `message` / `application` / `security` / `backup` / `system` |
| title | text | Short notification title |
| body | text | Full notification description |
| link | text | Deep link — e.g. `/admin/messages` |
| is_read | boolean | Has admin dismissed/read this |
| created_at | timestamp | |

**RLS Policy:**
- **Public:** No access
- **Admin:** SELECT, UPDATE (mark as read), DELETE

---

### 2.19 `admin_profiles` — Admin Security Preferences
**Admin Section:** Security > Password Policy / MFA settings

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (= auth.users id) |
| role | text | `super_admin` / `admin` / `editor` |
| full_name | text | Display name |
| mfa_enabled | boolean | Whether TOTP MFA is active |
| mfa_enforced_by_super | boolean | Set by super admin — cannot be disabled |
| password_last_changed | timestamp | For "must change every X days" policy |
| min_password_age_days | int2 | How long before password can be changed again |
| require_uppercase | boolean | Password policy flags |
| require_number | boolean | |
| require_special | boolean | |
| min_length | int2 | Default: 12 |

**RLS Policy:**
- **Public:** No access
- **Admin:** SELECT + UPDATE own row; Super Admin can UPDATE any row

---

## 3. Cloudflare R2 — File Storage Strategy

### Bucket Structure

```
anthatech-media/
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
├── og/
│   └── images/          ← OG/meta images per page
└── backups/
    └── weekly/          ← Auto-backup JSON snapshots (retain last 4)
```

### R2 Upload Flow (Admin Panel)
1. Admin selects file in Media Library or form Media Picker
2. Admin panel requests a **presigned upload URL** from Supabase Edge Function
3. Edge function generates a time-limited R2 presigned URL (valid 5 min)
4. Admin panel uploads directly to R2 via presigned URL (**never touches Supabase bandwidth**)
5. Edge function saves the final public R2 URL to the relevant DB table
6. Public website uses R2 URL directly — served via Cloudflare CDN

### Why This Keeps Supabase Free
- Zero file traffic through Supabase Storage (R2 handles all files)
- Supabase only stores the R2 text URL in a DB column — negligible storage

---

## 4. Caching Strategy — Cloudflare Workers

### Why Caching is Critical for Public Site
The public website is read-heavy. Without caching, every page load = Supabase API call = bandwidth consumed. Caching eliminates this.

### Cloudflare Worker Cache Rules

```
Route                          Cache Duration    Reasoning
─────────────────────────────────────────────────────────────
/api/hero                      60 minutes        Rarely changes
/api/about                     60 minutes        Rarely changes
/api/projects (list)           30 minutes        Moderate change
/api/projects/:slug            30 minutes        Moderate change
/api/services (list)           60 minutes        Rarely changes
/api/services/:slug            60 minutes        Rarely changes
/api/highlights                120 minutes       Very stable
/api/process-steps             120 minutes       Very stable
/api/reviews                   30 minutes        Occasional adds
/api/community/content         60 minutes        Moderate change
/api/blog (list)               15 minutes        Active additions
/api/blog/:slug                30 minutes        After publish
/api/config (social, contact)  120 minutes       Very stable
─────────────────────────────────────────────────────────────
Admin panel routes             NEVER CACHE        Always fresh
Contact form POST              NEVER CACHE        Write operation
Community apply POST           NEVER CACHE        Write operation
```

### Cache Invalidation (Admin Panel Triggers)
When admin saves any content change:
1. Admin panel calls Supabase Edge Function: `POST /api/cache/invalidate`
2. Edge function sends a **Cloudflare Cache Purge API** call for affected routes
3. Next public request hits Supabase fresh, then re-caches

---

## 5. Supabase Auth — Admin Panel Security

### Auth Flow

```
Admin → Login Form
     → Supabase Auth (email + password)
     → MFA check (TOTP via Supabase Auth MFA)
     → JWT issued (1 hour expiry)
     → Stored in HttpOnly cookie
     → All admin API requests include JWT in Authorization header
     → Supabase RLS validates JWT on every request
```

### Admin Role Setup in Supabase

```sql
-- In Supabase: create admin role claim on JWT
-- profiles table
id          uuid  references auth.users
role        text  ('super_admin' | 'admin' | 'editor')
full_name   text
```

- RLS policies check `auth.jwt() ->> 'role'` to allow/deny
- **Public tables** (projects, services, blog): `SELECT` open, `INSERT/UPDATE/DELETE` admin-only
- **Private tables** (contact_messages, community_applications): `INSERT` open, `SELECT/UPDATE/DELETE` admin-only

---

## 6. Supabase Edge Functions — Key Functions

Edge functions handle logic that shouldn't run client-side. Free tier: **500K invocations/month** — safe for this scale.

| Function Name | Trigger | Purpose |
|--------------|---------|---------|
| `generate-r2-presigned-url` | Admin uploads file | Create short-lived R2 upload URL |
| `invalidate-cache` | Admin saves content | Purge Cloudflare cache for affected route |
| `send-contact-notification` | New contact message | Email admin via Resend/Brevo |
| `send-application-notification` | New community apply | Email admin of new applicant |
| `approve-community-member` | Admin approves member | Update status + send welcome email |
| `scheduled-publish-cron` | Every 15 minutes (cron) | Flip `scheduled→published` where `publish_at <= now()`, invalidate cache, insert notification |
| `create-backup` | Manual or weekly cron | Dump all content tables to JSON, upload to R2 `backups/` folder |
| `trigger-webhook` | Content publish / message / application events | Send HMAC-SHA256 signed POST payload to all active matching webhooks |
| `send-suspicious-activity-alert` | Failed logins, new-IP login, unusual action | Email admin + INSERT notification of type `security` |
| `revoke-session` | Admin clicks Revoke in Sessions panel | Set `revoked_at` on `admin_sessions`, log entry in `audit_log` |
| `generate-preview-token` | Admin clicks Preview in editor | Issue signed 15-minute JWT preview token; public site validates token to show draft content |
| `save-version-snapshot` | Any content table UPDATE | INSERT into `content_history`, increment `version_number` for that record |
| `purge-old-audit-logs` | Daily cron | DELETE `audit_log` rows older than 90 days to control table growth |

---

## 7. Public Website → Supabase Data Flow

### Per-Page Data Source Map

| Public Page / Section | DB Table(s) | Cache |
|----------------------|-------------|-------|
| Landing — Hero | `hero_content` | 60 min |
| Landing — Projects carousel | `projects` (published, ordered) | 30 min |
| Landing — About1 | `about_content` (section=about1) | 60 min |
| Landing — Services | `services` (published, ordered) | 60 min |
| Landing — About2 / Stats | `about_content` (section=about2) | 60 min |
| Landing — Highlights | `highlights_content` | 120 min |
| Landing — Process | `process_steps` | 120 min |
| Landing — Reviews | `reviews` (active, ordered) | 30 min |
| Landing — Community teaser | `community_content` (section=teaser) | 60 min |
| Projects Page — List | `projects` (published) | 30 min |
| Project Detail Page | `projects` (by slug) | 30 min |
| Services Page | `services` (published) | 60 min |
| Service Detail Page | `services` (by slug) | 60 min |
| About Page | Re-uses About, Highlights, Process | (same cache) |
| Insights Page — Blog List | `blog_posts` (published) | 15 min |
| Community Page | `community_content` (all sections) | 60 min |
| Contact Section | → `contact_messages` INSERT | No cache |
| Community Apply | → `community_applications` INSERT | No cache |
| Footer / Social | `site_config` (social keys) | 120 min |
| Contact info | `site_config` (contact keys) | 120 min |

---

## 8. Admin Panel → Supabase Data Flow

Admin panel bypasses all caches and hits Supabase directly. This is safe because admin traffic is minimal (1–2 users max).

```
Admin Action                   Supabase Operation          R2 Operation
────────────────────────────────────────────────────────────────────────
Edit Hero content           →  UPDATE hero_content          —
Add / Edit Project          →  UPSERT projects              Upload cover/gallery
Add / Edit Service          →  UPSERT services              Upload service graphic
Edit About section          →  UPDATE about_content         Maybe upload logo
Edit Highlights             →  UPDATE highlights_content    —
Edit Process Steps          →  UPDATE process_steps         Maybe upload step images
Add / Edit Review           →  UPSERT reviews               Maybe upload avatar
Edit Community content      →  UPDATE community_content     —
Approve/Reject Application  →  UPDATE community_applications —
Add / Edit Blog Post        →  UPSERT blog_posts            Upload cover image
Read contact messages       →  SELECT contact_messages      —
Mark message as read        →  UPDATE contact_messages      —
Delete message              →  DELETE contact_messages      —
Upload media                →  (presigned URL Edge Fn)      DIRECT R2 upload
Update site settings        →  UPDATE site_config           Maybe upload OG image
```

---

## 9. Free Tier Consumption Estimate

### Supabase Free Limits vs Projected Usage

| Resource | Free Limit | Projected Monthly Use | Safety Buffer |
|----------|-----------|----------------------|---------------|
| Database Storage | 500 MB | ~25–60 MB (original tables + 7 new tables — all text/JSONB, no files) | ✅ 88%+ left |
| Bandwidth | 2 GB | ~200–400 MB (with Cloudflare caching) | ✅ 80% left |
| API Requests | Unlimited* | Millions (cached at edge) | ✅ Safe |
| Auth MAU | 50,000 | 2–5 (admin users only) | ✅ Negligible |
| Edge Functions | 500,000 | <10,000/month (incl. new crons + webhooks) | ✅ Negligible |
| Storage | 1 GB | 0 MB (all files in R2) | ✅ 0% used |

> **New table impact:** `content_history`, `audit_log`, `admin_sessions`, `ip_blocklist`, `webhooks`, `notifications`, `admin_profiles` add ~5–10 MB total. `audit_log` is auto-purged after 90 days to prevent unbounded growth.

### Cloudflare R2 Free Limits vs Projected Usage

| Resource | Free Limit | Projected Monthly Use | Safety Buffer |
|----------|-----------|----------------------|---------------|
| Storage | 10 GB | 1–3 GB (images only) | ✅ 70%+ left |
| Class A Ops (writes) | 1M/month | ~500–2000 (admin uploads) | ✅ Negligible |
| Class B Ops (reads) | 10M/month | ~50,000–200,000 | ✅ 98% left |
| Egress | Free (unlimited) | All media served free | ✅ No limit |

### Cloudflare Workers Free Limits vs Projected Usage

| Resource | Free Limit | Projected Monthly Use |
|----------|-----------|----------------------|
| Requests | 100,000/day | ~1,000–5,000/day | ✅ 95% left |
| KV Reads | 100,000/day | ~1,000–10,000/day | ✅ Safe |

---

## 10. Key Rules Implementation Checklist

Mapped from "Stay Free Forever" rules to concrete implementation:

---

### ✅ Rule 1: R2 for ALL Media
- **Implemented via:** R2 bucket + presigned upload URL Edge Function
- **Enforced by:** Admin panel Media Library uploads to R2 only — no Supabase Storage buttons available
- **Tables:** All `_url` / `_urls` columns store R2 URLs exclusively

---

### ✅ Rule 2: Cache Aggressively
- **Implemented via:** Cloudflare Workers sits in front of all public Supabase API reads
- **Enforced by:** Worker checks `Cache-Control` / KV store before forwarding to Supabase
- **Result:** 95%+ of public website reads never hit Supabase

---

### ✅ Rule 3: Admin Traffic is Low — No Cache Needed
- **Implemented via:** Admin panel domain bypasses Cloudflare Worker
- **Enforced by:** CORS rules allow only `admin.anthatech.com` to call admin API directly
- **Result:** Admin always gets fresh data; Supabase write traffic minimal

---

### ✅ Rule 4: Monitor Monthly
- **Implemented via:** Supabase Dashboard usage widget checked weekly
- **Alert setup:** Cloudflare Analytics email digest for R2 + Worker usage
- **Action plan:** If bandwidth approaches 1.5 GB, extend cache TTLs or purge bloom data

---

### ✅ Rule 5: Cloudflare as Shield
- **Implemented via:** All public traffic → Cloudflare → Worker → Supabase
- **DDoS protection:** Cloudflare free WAF absorbs spikes automatically
- **Rate limiting:** Worker rejects >100 req/min from same IP on public write endpoints

---

## 11. Supabase RLS Policy Summary

```
Table                    Public (anon)           Admin (authenticated)
───────────────────────────────────────────────────────────────────────────
hero_content             SELECT                  SELECT, UPDATE
about_content            SELECT                  SELECT, UPDATE
projects                 SELECT (published only) ALL
services                 SELECT (published only) ALL
highlights_content       SELECT                  SELECT, UPDATE
process_steps            SELECT                  SELECT, UPDATE
reviews                  SELECT (active only)    ALL
community_content        SELECT                  SELECT, UPDATE
community_applications   INSERT only             SELECT, UPDATE
blog_posts               SELECT (published only) ALL
contact_messages         INSERT only             SELECT, UPDATE, DELETE
site_config              SELECT                  SELECT, UPDATE
───────────────────────────────────────────────────────────────────────────
content_history          No public access        SELECT, INSERT (system only)
audit_log                No public access        SELECT, INSERT (system only)
admin_sessions           No public access        SELECT, UPDATE (own rows only)
ip_blocklist             No public access        ALL (Edge Function + Admin)
webhooks                 No public access        ALL
notifications            No public access        SELECT, UPDATE, DELETE
admin_profiles           No public access        SELECT + UPDATE own; SuperAdmin ALL
```

---

## 12. Environment Variables Setup

### Public Website (Cloudflare Pages)
Set in: Cloudflare Dashboard → Pages → [project] → Settings → Environment Variables
```
VITE_SUPABASE_URL           = https://[project].supabase.co
VITE_SUPABASE_ANON_KEY      = [public anon key — safe to expose]
VITE_CF_WORKER_URL          = https://api-cache.anthatech.workers.dev
```

### Admin Panel (Cloudflare Pages)
Set in: Cloudflare Dashboard → Pages → [admin-project] → Settings → Environment Variables
```
VITE_SUPABASE_URL           = https://[project].supabase.co
VITE_SUPABASE_ANON_KEY      = [public anon key]
VITE_R2_BUCKET_URL          = https://[bucket].r2.dev  (or custom domain)
VITE_EDGE_FN_URL            = https://[project].supabase.co/functions/v1
```

### Cloudflare Worker (Pages Functions or standalone Worker)
Set in: Cloudflare Dashboard → Workers & Pages → [worker] → Settings → Variables & Secrets
```
SUPABASE_URL                = [stored as encrypted secret]
SUPABASE_SERVICE_KEY        = [stored as encrypted secret — NOT exposed]
CF_CACHE_PURGE_KEY          = [Cloudflare API token for cache purge]
```

### Cloudflare Pages — Deployment Setup

| Project | Branch | Domain |
|---------|--------|--------|
| `anthatech-public` | `main` | `www.anthatech.com` |
| `anthatech-admin` | `main` | `admin.anthatech.com` |

**Build settings (both projects):**
```
Build command:   npm run build
Build output:    dist
Node version:    18
```

### Cloudflare Access — Admin Panel Gate
An extra security layer on top of your own admin auth:
- Dashboard → Zero Trust → Access → Applications → Add `admin.anthatech.com`
- Policy: Allow only specific email addresses (your admin emails)
- This blocks **all other traffic** at the network level before it even loads React
- Free tier: 50 seats — more than enough for 1–2 admins

> ⚠️ `SUPABASE_SERVICE_KEY` (bypasses RLS) lives ONLY in Cloudflare Worker/Pages Function secrets & Supabase Edge Functions. Never in any frontend bundle.
