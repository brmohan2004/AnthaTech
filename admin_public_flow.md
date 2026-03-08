# Admin ↔ Public Website — Function-by-Function Flow Guide
### How every feature works end-to-end: Admin Panel → Backend → Public Website

---

## How to Read This Document

Each section follows a consistent structure:

```
[Admin Action]  →  [Backend Operation]  →  [Public Website Result]
```

Three layers are always shown:
- **🖥 Admin Panel** — what the logged-in admin does
- **⚙ Backend** — Supabase DB / Edge Functions / Cloudflare R2 / Worker Cache
- **🌐 Public Website** — what a visitor sees as a result

---

## 0. Master Data Flow — Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│  🖥 ADMIN PANEL (admin.anthatech.com)                                │
│  Protected by: Cloudflare Access → Supabase Auth (JWT + MFA)         │
└───────────────────────┬──────────────────────────────────────────────┘
                        │  Direct API calls (no cache, always fresh)
                        ▼
┌──────────────────────────────────────────────────────────────────────┐
│  ⚙ SUPABASE                                                          │
│  ├── PostgreSQL (all content tables)                                  │
│  ├── Auth (admin sessions, JWT, MFA)                                  │
│  └── Edge Functions (presigned URLs, cache purge, notifications…)     │
│                                                                       │
│  CLOUDFLARE R2                                                        │
│  └── All media files (images, videos) — zero egress cost              │
└───────────────┬────────────────────────────────────────────────────────┘
                │
        ┌───────┴────────────────┐
        │                        │
        ▼                        ▼
┌───────────────┐    ┌───────────────────────────────────┐
│  Cache MISS   │    │  Cloudflare Worker KV Cache        │
│  → Supabase   │    │  (serves 95%+ of public reads)     │
│  responds     │    │  TTL: 15 min – 120 min per route   │
└───────────────┘    └───────────────────────────────────┘
                                  │
                                  ▼
              ┌────────────────────────────────────────────┐
              │  🌐 PUBLIC WEBSITE (www.anthatech.com)      │
              │  Visitor sees live, up-to-date content      │
              └────────────────────────────────────────────┘
```

**Key rule:** Admin panel bypasses the cache entirely — always reads/writes fresh data. The public website always reads through the Cloudflare Worker cache to protect Supabase free tier bandwidth.

---

## 1. HERO SECTION (Landing Page)

### What it controls on the public website
The full-screen hero on the homepage: badge text, headline (2 lines), subtitle (2 lines), 2 CTA buttons, and the trusted-by client logo carousel.

### End-to-End Flow

```
🖥 Admin                    ⚙ Backend                    🌐 Public Site
──────────────────────────────────────────────────────────────────────
1. Opens Content > Hero     
2. Edits badge, headline,   →  UPDATE hero_content row     
   subtitle, CTA texts,          in Supabase PostgreSQL
   client logos (URLs/names)
3. Clicks [Save Changes]    →  Edge Fn: invalidate-cache   →  Cloudflare Worker cache
                                 purges /api/hero route          purged — next visitor
                            →  audit_log INSERT (content         request hits Supabase
                               update event)                      and gets fresh data
                            →  content_history INSERT        →  Visitor sees updated
                               (version snapshot saved)           hero immediately
```

### Data Involved
| DB Column | Admin Control | Public Display |
|-----------|--------------|----------------|
| `badge_text` | Badge input field | Blue badge above headline |
| `title_line_1/2` | Title textarea | Large hero headline |
| `subtitle_line_1/2` | Subtitle textarea | Subtext below headline |
| `cta_primary_text/link` | CTA 1 | Primary button |
| `cta_secondary_text/link` | CTA 2 | Secondary button |
| `client_logos` (jsonb) | Logo manager (name + R2 URL) | Scrolling client logo row |

---

## 2. ABOUT SECTIONS (About1 & About2)

### What it controls on the public website
- **About1:** Company logo, 2 rich-text paragraphs with colour-highlighted words, 2 buttons
- **About2:** Badge, section title, 3 animated stats (dot-colour, number, label)

### End-to-End Flow

```
🖥 Admin                    ⚙ Backend                    🌐 Public Site
──────────────────────────────────────────────────────────────────────
1. Opens Content > About    
   (Tab 1: About1 / Tab 2: About2)
2. About1: Edits logo URL,  →  UPDATE about_content        
   rich-text paragraphs          WHERE section = 'about1'
   (marks highlight words),  
   button texts/links
3. About2: Edits badge,     →  UPDATE about_content        
   heading, 3 stats               WHERE section = 'about2'
   (dot colour, number, label)
4. Clicks [Save]            →  Edge Fn: invalidate-cache   →  Worker cache purged
                            →  audit_log INSERT            →  Visitors see updated
                            →  content_history INSERT           about section
```

### Data Involved
| Section | Key Fields | Public Effect |
|---------|-----------|---------------|
| About1 | `logo_url`, `para_1_rich` (jsonb), `para_2_rich` (jsonb), `btn_1/2_text/link` | Left panel logo + coloured paragraph text |
| About2 | `badge_text`, `title`, `stats` (jsonb array: dotColor, number, label) | Stats row with animated counters |

---

## 3. PROJECTS

### What it controls on the public website
- Landing page horizontal project carousel
- All Projects page grid
- Individual Project Detail pages (hero, challenges, gallery, solutions, review)

### End-to-End Flow

```
🖥 Admin                    ⚙ Backend                    🌐 Public Site
──────────────────────────────────────────────────────────────────────
ADD FLOW
1. Opens Content > Projects
2. Clicks [+ Add Project]
3. Fills form: title, slug, →  Media: presigned R2 URL     →  Admin browser uploads
   category pill, cover       from Edge Fn                      directly to R2 bucket
   image → uploads via       →  UPSERT projects row
   media picker               (status = draft/published)
4. Fills detail tabs:        →  Gallery images → R2
   challenges, gallery,      →  audit_log INSERT
   solutions, review quote   →  content_history INSERT
5. Sets status = Published   →  project visible to anon      →  Appears in carousel +
   → Clicks [Publish]             SELECT (status=published)        grid + has own page

EDIT FLOW
1. Clicks ✏️ on existing row →  Loads project row
2. Modifies any field        →  UPSERT projects
3. Saves                     →  Edge Fn: invalidate-cache    →  Updated on all 3 
                                  /api/projects & :slug            public pages
                             →  content_history INSERT           (Old version in history)

DELETE FLOW
1. Clicks 🗑 → Confirm       →  DELETE projects row          →  Removed from carousel,
                             →  audit_log INSERT                  grid, route returns 404
```

### Status Lifecycle
```
[Draft] ──────→ [Published] ──────→ [Scheduled] (future date set)
   ↑                │                     │
   └────────────────┘                     │
        Unpublish                         ▼
                                   Auto-published by
                                   scheduled-publish-cron
                                   Edge Function (every 15 min)
```

---

## 4. SERVICES

### What it controls on the public website
- Landing page services sticky-scroll section
- Services page list
- Individual Service Detail pages (hero, what we offer, our process, benefits)

### End-to-End Flow

```
🖥 Admin                    ⚙ Backend                    🌐 Public Site
──────────────────────────────────────────────────────────────────────
1. Opens Content > Services
2. Adds/edits a service:
   Tab 1 — Overview         →  UPSERT services
   (title, short_desc,           (slug, theme, tags,
   tags, theme, graphic)          graphic_url → R2)
   Tab 2 — What We Offer    →  Saves offers (jsonb array)
   Tab 3 — Our Process      →  Saves process_steps (jsonb array)
   Tab 4 — Benefits         →  Saves benefits (jsonb array)
3. Clicks [Publish]         →  status = 'published'         →  Visible on Services page
                            →  Edge Fn: invalidate-cache    →  Worker cache purged
                            →  audit_log + history INSERT   →  Detail page available
```

---

## 5. HIGHLIGHTS SECTION

### What it controls on the public website
Large bold header with highlighted words + 4 icon-based highlight items row.

### End-to-End Flow

```
🖥 Admin                    ⚙ Backend                    🌐 Public Site
──────────────────────────────────────────────────────────────────────
1. Opens Content > Highlights
2. Edits header rich-text    →  UPDATE highlights_content
   (marks highlighted words)      header_rich_text (jsonb)
3. Edits 4 highlight items   →  UPDATE items (jsonb array):
   (SVG icon code, title          {svg_code, title_line1,
   line 1, title line 2)           title_line2}
4. Clicks [Save]             →  Edge Fn: invalidate-cache   →  Worker cache purged
                             →  audit_log + history INSERT  →  Updated highlights section
```

---

## 6. PROCESS STEPS (How We Work)

### What it controls on the public website
The scroll-animated "How We Work" section: badge, 2-line title, CTA, and 4 step cards (number, title, description, image).

### End-to-End Flow

```
🖥 Admin                    ⚙ Backend                    🌐 Public Site
──────────────────────────────────────────────────────────────────────
1. Opens Content > Process
2. Edits section badge,      →  UPDATE process_steps
   title lines, CTA text
3. Edits each step card:     →  Updates steps (jsonb array)
   - Drag ↕ to reorder       →  display_order updated
   - Edit title, description      
   - Upload step image       →  R2 presigned upload
                                  image_url saved in jsonb
4. Clicks [Save]             →  Edge Fn: invalidate-cache   →  Worker cache purged
                             →  audit_log + history INSERT  →  Updated process section
```

---

## 7. REVIEWS / TESTIMONIALS

### What it controls on the public website
The infinite-scroll testimonial strip on the landing page: quote, author name, role, company, optional avatar.

### End-to-End Flow

```
🖥 Admin                    ⚙ Backend                    🌐 Public Site
──────────────────────────────────────────────────────────────────────
ADD
1. Clicks [+ Add Review]
2. Fills quote, author info  →  INSERT reviews row
3. Uploads avatar (optional) →  R2 presigned upload
                                  avatar_url saved
4. Sets status = Active      →  Visible to anon SELECT       →  Appears in testimonial
   Sets display_order             (status = 'active')              strip on landing page

DEACTIVATE
1. Clicks 🚫 on a review     →  UPDATE status = 'inactive'   →  Removed from strip
                             →  Edge Fn: invalidate-cache         on next cache refresh
```

---

## 8. COMMUNITY SECTION

### What it controls on the public website
The community teaser on the landing page and the full Community page (hero, how it works, tracks, perks, apply form).

### End-to-End Flow — Content Side

```
🖥 Admin                    ⚙ Backend                    🌐 Public Site
──────────────────────────────────────────────────────────────────────
1. Opens Content > Community
   Tab 1 — Teaser            →  UPDATE community_content
   (stats, tracks, CTA)           WHERE section = 'teaser'
   Tab 2 — How It Works      →  UPDATE community_content
   (steps jsonb)                   WHERE section = 'how_it_works'
   Tab 3 — Perks             →  UPDATE community_content
   (perks jsonb)                   WHERE section = 'perks'
2. Saves any tab             →  Edge Fn: invalidate-cache   →  Worker cache purged
                             →  audit_log + history INSERT  →  Community page updated
```

### End-to-End Flow — Applications Side

```
🖥 Admin                    ⚙ Backend                    🌐 Public Site
──────────────────────────────────────────────────────────────────────
PUBLIC SUBMISSION FLOW
Visitor clicks [Apply] form  →  INSERT community_applications
                                  (status = 'pending')        ←  No cache — direct write
                             →  Edge Fn: send-application-notification
                                  → Email sent to admin
                             →  INSERT notifications
                                  (type = 'application')

ADMIN REVIEW FLOW
1. Opens Community > Tab 4:  →  SELECT community_applications
   Members                        (filter: pending/approved)
2. Reviews application
3. Clicks [Approve]          →  UPDATE status = 'approved'
                             →  Edge Fn: approve-community-member
                                  → Welcome email sent to applicant
                             →  audit_log INSERT
   OR clicks [Reject]        →  UPDATE status = 'rejected'
```

---

## 9. BLOG / INSIGHTS

### What it controls on the public website
The Insights page blog list and individual blog post pages: cover image, date, title, description, full content, tags.

### End-to-End Flow

```
🖥 Admin                    ⚙ Backend                    🌐 Public Site
──────────────────────────────────────────────────────────────────────
DRAFT FLOW
1. Opens Content > Blog
2. Clicks [+ New Post]
3. Writes title, slug,       →  INSERT blog_posts
   cover image (→ R2),            (status = 'draft')
   full content, tags,
   short description
4. Saves draft               →  Row exists but invisible     →  Not visible to visitors
                                  (status = 'draft')               (anon SELECT blocked)

PUBLISH NOW FLOW
1. Sets status = Published   →  UPDATE status = 'published'
2. Clicks [Publish]          →  Edge Fn: invalidate-cache   →  Worker cache purged
                             →  trigger-webhook (BlogPub     →  Post appears on Insights
                                  event) if webhooks set          page immediately
                             →  INSERT notification
                             →  audit_log + history INSERT

SCHEDULED PUBLISH FLOW
1. Sets status = Scheduled   →  UPDATE status = 'scheduled'
   Sets publish_at datetime       publish_at = chosen datetime
2. Saves                     →  No immediate cache action    →  Still invisible to public
                             
[15 min later - Edge Fn cron]
   scheduled-publish-cron   →  SELECT blog_posts WHERE
   runs every 15 minutes         status='scheduled'
                                  AND publish_at <= now()
                             →  UPDATE status = 'published'  →  Post goes live
                             →  Edge Fn: invalidate-cache
                             →  trigger-webhook
                             →  INSERT notification

EDIT PUBLISHED POST
1. Edits content             →  Edge Fn: save-version-snapshot
                                  (saves current state to
                                   content_history before write)
2. Saves                     →  UPSERT blog_posts
                             →  Edge Fn: invalidate-cache   →  Public sees updated post
```

---

## 10. CONTACT FORM (Messages Inbox)

### What it controls on the public website
The contact modal / section: visitor submits name, email, message.

### End-to-End Flow

```
🌐 Public Site               ⚙ Backend                    🖥 Admin
──────────────────────────────────────────────────────────────────────
SUBMISSION FLOW
1. Visitor opens Contact     
   modal on public site
2. Fills name, email,        →  INSERT contact_messages      →  n/a
   message and submits            (status = 'new')
                             →  Edge Fn: send-contact-notification
                                  → Admin gets email (Resend/Brevo)
                             →  INSERT notifications
                                  (type = 'message')           →  Bell badge increments

ADMIN INBOX FLOW
1. Admin opens Messages      →  SELECT contact_messages
   Inbox (sorted by date,         ORDER BY received_at DESC
   filtered by New/Read)
2. Clicks a message to       →  UPDATE status = 'read'
   open detail drawer        →  audit_log INSERT
3. Clicks [Archive]          →  UPDATE status = 'archived'
4. Clicks [Delete]           →  DELETE contact_messages row
                             →  audit_log INSERT
```

---

## 11. MEDIA LIBRARY (Cloudflare R2)

### What it controls on the public website
All images and media files used across every public page — project images, blog covers, service graphics, avatars, logos.

### End-to-End Flow

```
🖥 Admin                    ⚙ Backend / R2               🌐 Public Site
──────────────────────────────────────────────────────────────────────
UPLOAD FLOW
1. Opens Media Library or
   uses Media Picker inside
   any content editor
2. Selects file(s) to upload →  Admin panel calls Edge Fn:
                                  generate-r2-presigned-url
                             →  Edge Fn returns: time-limited
                                  R2 upload URL (5 min TTL)
3. Browser uploads file      →  File goes DIRECTLY to R2     →  File available at
   directly to R2 URL             (never touches Supabase)        R2 public URL
4. Success → R2 URL saved    →  URL stored in relevant DB        immediately via
   in DB column                   column (e.g. cover_image_url)   Cloudflare CDN

DELETE FLOW
1. Admin selects file(s)     →  R2 object deleted
   → Clicks [Delete]         →  DB column url set to null
                             →  audit_log INSERT

WHY NO SUPABASE STORAGE
- R2 has unlimited free egress (Cloudflare-to-browser = free)
- Supabase Storage counts against 2 GB/month bandwidth limit
- R2 files served via same Cloudflare CDN as the website = fastest load
```

### R2 Bucket Folder Map
```
anthatech-media/
├── projects/covers/          → src of <ProjectCard> cover image
├── projects/galleries/[slug] → src of gallery images in Project Detail
├── services/graphics/        → src of service section graphic
├── blogs/covers/             → src of <BlogCard> cover image
├── process/steps/            → src of step images in How We Work
├── clients/logos/            → src of client logos in Hero carousel
├── team/avatars/             → src of review author avatar
├── about/                    → company logo
├── og/images/                → Open Graph images (SEO previews)
└── backups/weekly/           → JSON backup snapshots (admin use only)
```

---

## 12. SITE SETTINGS

### What it controls on the public website
Contact info (email, phone, address), all social media links in footer, and SEO meta tags (title, description, OG image) per page.

### End-to-End Flow

```
🖥 Admin                    ⚙ Backend                    🌐 Public Site
──────────────────────────────────────────────────────────────────────
1. Opens Settings
   Tab 1 — Contact           →  UPDATE site_config
   (email, phone, address)        WHERE key IN
                                  ('contact_email', 'contact_phone', …)
   Tab 2 — Social Links      →  UPDATE site_config
   (Instagram, LinkedIn…)         WHERE key IN ('instagram_url', …)
   Tab 3 — SEO / Meta        →  UPDATE site_config
   (title, desc, OG image         WHERE key IN
   per page dropdown)              ('seo_home_title', 'og_home_image', …)
   
2. Saves any tab             →  Edge Fn: invalidate-cache   →  Worker cache purged
                             →  audit_log INSERT                (cache TTL: 120 min)
                                                            →  Footer shows new social
                                                               links / contact details
                                                            →  Google/social previews
                                                               use updated meta tags
```

---

## 13. CONTENT VERSION HISTORY & ROLLBACK

### What it does
Every time any content is saved (projects, blog, services, hero, about…), a full snapshot of the row is saved automatically. Admins can preview old versions and restore any of the last 20.

### End-to-End Flow

```
🖥 Admin                    ⚙ Backend                    🌐 Public Site
──────────────────────────────────────────────────────────────────────
AUTO-SNAPSHOT ON SAVE
Any content save event       →  Edge Fn: save-version-snapshot
                                  runs BEFORE the UPDATE
                             →  INSERT content_history
                                  (table_name, record_id,
                                   snapshot_data as JSONB,
                                   version_number incremented,
                                   saved_by, saved_at)
                             →  Then the actual UPDATE happens

VIEWING HISTORY
1. Admin opens any editor
2. Clicks [🕐 History]       →  SELECT content_history
                                  WHERE record_id = current row
                                  ORDER BY version_number DESC
                             →  History drawer opens on right
3. Clicks [Preview] on a     →  Edge Fn: generate-preview-token
   past version                   → Signed JWT (15 min TTL)
                                  containing snapshot data     →  Preview tab opens:
                                                                   iframe shows draft
                                                                   content using token

RESTORE FLOW
1. Clicks [Restore This]     
2. Confirmation modal        →  snapshot_data JSONB written
   Admin confirms                 back to the live table row
                             →  Current state auto-saved as    →  Public sees restored
                                  new snapshot version              content immediately
                             →  Edge Fn: invalidate-cache
                             →  audit_log INSERT (restore event)
```

---

## 14. SCHEDULED PUBLISHING

### What it does
Admin sets a future date/time on any Project or Blog Post. A cron Edge Function runs every 15 minutes and automatically publishes items when their time arrives.

### End-to-End Flow

```
🖥 Admin                    ⚙ Backend (cron)             🌐 Public Site
──────────────────────────────────────────────────────────────────────
SETTING A SCHEDULE
1. Admin edits project/post
2. Sets status = Scheduled   →  UPDATE projects/blog_posts:
   Sets publish_at datetime       status = 'scheduled'
3. Saves                          publish_at = '2026-03-15T09:00:00Z'
                             →  audit_log INSERT

WHILE WAITING
                             →  Item has status='scheduled'   →  Not visible to public
                                  anon SELECT only returns          (WHERE status='published'
                                  status='published' rows           RLS blocks it)

EVERY 15 MINUTES
                             →  Edge Fn: scheduled-publish-cron
                                  runs via Supabase cron
                             →  SELECT WHERE status='scheduled'
                                  AND publish_at <= now()
                             →  UPDATE status = 'published'   →  Item goes live
                             →  Edge Fn: invalidate-cache          on public site
                             →  Edge Fn: trigger-webhook
                                  (BlogPub / ProjPub events)
                             →  INSERT notifications
                                  (type = 'system',
                                   "Post X went live")         →  Admin sees bell notif
```

---

## 15. CONTENT PREVIEW (Draft Preview)

### What it does
Lets admin preview draft or unpublished content on the real public website before publishing, without affecting what visitors see.

### End-to-End Flow

```
🖥 Admin                    ⚙ Backend                    🌐 Public Site
──────────────────────────────────────────────────────────────────────
1. Admin edits content
   (can be a draft or saved
   but unpublished item)
2. Clicks [Preview ▾]        →  Edge Fn: generate-preview-token
   Selects breakpoint             creates JWT containing:
   (Desktop / Tablet / Mobile)    - record_id
                                  - snapshot of current state
                                  - exp: now + 15 minutes   →  New browser tab opens:
                                                                 www.anthatech.com/...
                                                                 ?preview_token=xxxxx

PUBLIC WEBSITE — PREVIEW MODE
                                                            →  Public site reads token
                                                               from query param
                                                            →  Validates JWT signature
                                                               (must be signed by
                                                                Supabase service key)
                                                            →  Decodes draft content
                                                               from token payload
                                                            →  Renders page with DRAFT
                                                               data (not from DB)
                                                            →  Normal visitors without
                                                               token see live version
                                                               (completely unaffected)

TOKEN EXPIRY
After 15 min, token invalid  →  Public site shows 403       →  Admin clicks
                                  "Preview expired"               [Get New Token]
```

---

## 16. MAINTENANCE MODE

### What it does
Takes the entire public website offline (shows a custom maintenance page to all visitors). Admin and whitelisted IPs can still access the live site. Managed at the Cloudflare Worker level — faster than any DB toggle.

### End-to-End Flow

```
🖥 Admin                    ⚙ Backend / Worker           🌐 Public Site
──────────────────────────────────────────────────────────────────────
ACTIVATE
1. Opens Settings >          →  UPDATE site_config
   Maintenance Mode               WHERE key = 'maintenance_mode'
2. Toggles ON                     value = 'true'
3. Fills: title, message,    →  UPDATE site_config
   expected-back time             (maintenance_title,
                                   maintenance_message,
                                   maintenance_back_at)
4. Saves                     →  Cloudflare Worker reads         →  ALL public visitors
                                  site_config on next request       now see maintenance
                             →  Worker returns 503 +                page (503 response)
                                  maintenance page HTML         →  Whitelisted IPs
                             →  audit_log INSERT                    still see live site
                                  (Super Admin only event)

DEACTIVATE
1. Toggles OFF               →  UPDATE site_config
2. Saves                          maintenance_mode = 'false'    →  Public site live again
                             →  audit_log INSERT                →  All visitors instantly
                                                                    see live content
```

---

## 17. BACKUP & EXPORT

### What it does
Creates a full JSON snapshot of all content DB tables. Can be downloaded, stored in R2, or used to restore the site if data is ever lost.

### End-to-End Flow

```
🖥 Admin                    ⚙ Backend / R2               🌐 Public Site
──────────────────────────────────────────────────────────────────────
MANUAL BACKUP
1. Opens Backup & Export
2. Clicks [Export All        →  Edge Fn: create-backup
   Content as JSON]               SELECT * from all 19 content
                                  tables
                             →  Serialises to single JSON
                             →  Uploads to R2:
                                  backups/manual/
                                  anthatech-backup-YYYY-MM-DD.json
                             →  Signed download URL returned   →  Admin downloads file
                                  (5 min TTL)                       to local machine

AUTO-BACKUP (Weekly)
                             →  Edge Fn cron: every Sunday
                                  02:00 AM
                             →  Same as manual but uploads to
                                  backups/weekly/ folder
                             →  Keeps last 4 → deletes oldest
                             →  INSERT notifications
                                  (type = 'backup', "Backup done")

RESTORE FLOW
1. Admin uploads JSON        →  Edge Fn validates JSON schema
2. Diff preview shown             (matches expected table shape)
   in admin panel            →  Shows count of rows that
                                  will be overwritten
3. Types RESTORE, confirms   →  Edge Fn: DELETE then INSERT
                                  all rows from JSON into
                                  each table (within transaction)
                             →  Edge Fn: invalidate-cache      →  Public sees restored
                                  (ALL routes)                      content live
                             →  audit_log INSERT
                                  (restore event, by whom)
```

---

## 18. WEBHOOKS

### What it does
Sends automatic HMAC-signed HTTP POST notifications to any external service (Slack, Zapier, Make, custom CRM) when specific events happen.

### End-to-End Flow

```
🖥 Admin                    ⚙ Backend                    External Service
──────────────────────────────────────────────────────────────────────
SETUP
1. Opens Settings > Webhooks
2. Clicks [+ Add Webhook]
3. Fills endpoint URL,       →  INSERT webhooks row
   chooses trigger events,        (endpoint_url encrypted,
   sets name                       secret_key generated + stored)

TRIGGER (automatic)
Any matching event fires:    →  Edge Fn: trigger-webhook
e.g. New contact message          reads all active webhooks
                                  matching the event type
                             →  For each webhook:
                                  Build payload:
                                  {event, timestamp, data}
                                  Sign with HMAC-SHA256
                                  (X-AnthaTech-Signature header)   →  POST to endpoint URL
                             →  UPDATE webhooks
                                  last_triggered_at,              →  Slack / Zapier / CRM
                                  last_result (200 OK / error)        processes event

TEST FLOW
1. Admin clicks [Test]       →  Edge Fn sends sample payload     →  Admin can verify
   in Webhook modal               to endpoint immediately             endpoint is live
                             →  Response + latency shown
                                  in modal
```

### Events Available
| Event Key | Triggered When |
|-----------|---------------|
| `new_contact_message` | Visitor submits contact form |
| `new_community_application` | Visitor applies to community |
| `project_published` | Project status → published |
| `blog_post_published` | Blog post status → published |
| `maintenance_mode_on` | Admin activates maintenance mode |
| `security_alert` | Suspicious login / IP blocked |

---

## 19. SECURITY CENTER

### 19A — Active Sessions

```
🖥 Admin                    ⚙ Backend                    Action
──────────────────────────────────────────────────────────────────────
On every admin login         →  INSERT admin_sessions row
                                  (device, browser, IP, location,
                                   login_at, jwt_id)
Admin opens Security >       →  SELECT admin_sessions
Sessions                          WHERE admin_id = current user
                             →  Shows all active sessions
Admin clicks [Revoke]        →  UPDATE admin_sessions
on a session                      SET revoked_at = now()
                             →  Edge Fn: revoke-session
                                  invalidates that JWT jti
                             →  INSERT audit_log (revoke event)   Revoked session gets
                                                                   401 on next request
```

### 19B — Brute Force & IP Blocklist

```
🌐 Login attempt             ⚙ Backend / Worker
──────────────────────────────────────────────────────────────────────
Any login attempt            →  Edge Fn checks ip_blocklist:
                                  is this IP blocked AND
                                  not expired?
If blocked                   →  Return 403 immediately
                                  (never reaches Supabase Auth)

Failed login attempt         →  INSERT audit_log (failed login)
5th consecutive failure      →  Edge Fn: send-suspicious-activity-alert
from same IP within 10 min        → Admin email + notification
                             →  INSERT ip_blocklist
                                  (auto-block, 10 min expiry)

Admin manual block           →  INSERT ip_blocklist
                                  (is_whitelisted = false,
                                   expires_at = null / chosen time)
```

### 19C — Audit Log

```
Every admin action           →  INSERT audit_log:
                                  - admin_id (who)
                                  - event_type (auth/content/security)
                                  - description (what)
                                  - target_table + target_id (which row)
                                  - ip_address, user_agent
                                  - result (success/failure)

Daily cron                   →  Edge Fn: purge-old-audit-logs
                                  DELETE WHERE created_at < now() - 90 days

Admin opens Audit Log        →  SELECT audit_log with filters
                                  (event_type, date range, user)
Clicks [Export CSV]          →  Edge Fn generates CSV download
```

### 19D — MFA Flow (Login)

```
🌐/🖥 Login                  ⚙ Supabase Auth
──────────────────────────────────────────────────────────────────────
1. Admin enters email +      →  Supabase Auth validates credentials
   password                  →  If MFA is enabled on account:
                                  Returns MFA challenge
2. Admin enters 6-digit      →  Supabase Auth validates TOTP code
   code from authenticator   →  Issues JWT on success:
   app (Google Auth, Authy)       exp: 1 hour
                                  includes: user.id, role claim
                             →  INSERT admin_sessions row
                             →  INSERT audit_log
                                  (event_type = 'auth', Login success)
```

---

## 20. ANALYTICS DASHBOARD

### What it does
Shows traffic, performance, and free-tier usage data pulled from Cloudflare analytics (no cookies, no Google Analytics, GDPR-safe).

### End-to-End Flow

```
🖥 Admin                    ⚙ Cloudflare API             Data Source
──────────────────────────────────────────────────────────────────────
Admin opens Analytics >      →  Admin panel calls Cloudflare
Traffic                           Analytics API (using CF API token)
                             →  Returns: page views, unique
                                  visitors, countries, top URLs,
                                  bandwidth served by CF edge
Admin opens Analytics >      →  Calls Cloudflare API:
Performance                       cache hit rate, error rate,
                             →  Calls Supabase API:
                                  current DB storage used,
                                  API request count (month)
                             →  Calls R2 API:
                                  storage used, class A/B ops

Free Tier Usage Bars         →  Calculated client-side:
                                  (used / limit) × 100
                                  Colour: green < 60%, yellow< 80%,
                                  red ≥ 80%
```

> Analytics data is **read-only** — admin views it, public site is unaffected. No personal visitor data is stored anywhere (Cloudflare analytics is privacy-first).

---

## 21. NOTIFICATION CENTER

### What generates notifications and where they show

```
Event                        ⚙ Backend Insert               🖥 Admin
──────────────────────────────────────────────────────────────────────
New contact form submission  →  INSERT notifications
                                  type='message'              →  Bell badge +1
                                  title='New message from X'      Dropdown shows entry
                                  link='/admin/messages'          Click → goes to inbox

New community application    →  INSERT notifications
                                  type='application'          →  Bell badge +1
                                  link='/admin/content/community'

Scheduled post went live     →  INSERT notifications
                                  type='system'               →  Informational entry
                                  "Blog X went live"

Failed login / security alert→  INSERT notifications
                                  type='security' 🔴          →  Red-coloured entry
                                  link='/admin/security/alerts'   Badge turns red

Backup completed             →  INSERT notifications
                                  type='backup' ✅            →  Green entry
                                  link='/admin/backup'

Admin clicks notification    →  UPDATE notifications
                                  SET is_read = true          →  Badge count decrements

Admin clicks [Mark All Read] →  UPDATE notifications
                                  SET is_read = true          →  Badge clears
                                  WHERE is_read = false
```

---

## 22. ADMIN USERS MANAGEMENT

### What it controls
Which people can log into the admin panel and what they can do.

### End-to-End Flow

```
🖥 Super Admin               ⚙ Backend                    New Admin
──────────────────────────────────────────────────────────────────────
INVITE
1. Opens Admin Users
2. Clicks [+ Invite Admin]
3. Enters email + role       →  Supabase Auth: send invite email
   (super_admin / admin /    →  INSERT admin_profiles
    editor)                       (id, role, full_name)       →  New admin gets invite
                                                                   email with signup link
New admin signs up           →  Supabase Auth creates user
                             →  admin_profiles row updated
                             →  audit_log INSERT (invite event)

SUSPEND
1. Clicks [🚫 Suspend]       →  Supabase Auth: disable user   →  Suspended admin gets
   on an admin row                account                          401 on next request
                             →  audit_log INSERT

ROLE CHANGE
1. Edits admin role          →  UPDATE admin_profiles
2. Saves                          SET role = 'editor'
                             →  JWT role claim refreshed      →  RLS policies update
                                  on next login                    on next request cycle
                             →  audit_log INSERT
```

### Role Permissions Summary
| Permission | Super Admin | Admin | Editor |
|-----------|------------|-------|--------|
| Manage other admins | ✅ | ❌ | ❌ |
| Maintenance Mode | ✅ | ❌ | ❌ |
| Delete content | ✅ | ✅ | ❌ |
| Publish content | ✅ | ✅ | ✅ |
| Edit content (draft) | ✅ | ✅ | ✅ |
| View analytics | ✅ | ✅ | ✅ |
| Manage IP blocklist | ✅ | ✅ | ❌ |
| Restore from backup | ✅ | ❌ | ❌ |

---

## 23. API KEY MANAGER

### What it does
Securely stores third-party API keys (email service, analytics, etc.) in encrypted DB columns. Keys are only revealed after re-entering the admin's own password.

### End-to-End Flow

```
🖥 Admin                    ⚙ Backend                    Service
──────────────────────────────────────────────────────────────────────
ADD KEY
1. Opens API Keys
2. Clicks [+ Add API Key]
3. Pastes key, names it,     →  Edge Fn encrypts key value
   selects service type           using service-side secret
                             →  INSERT into api_keys table
                                  (encrypted_value stored)    →  Key available for
                             →  audit_log INSERT                   Edge Function use

USE IN EDGE FUNCTION
Edge Function needs          →  SELECT api_keys WHERE
to send an email                  name = 'Resend Production'
                             →  Decrypts value server-side    →  API call made to
                                                                   Resend with key
                                                                   (key never in browser)

REVEAL IN ADMIN UI
1. Clicks [👁 Reveal]        →  Admin re-enters password
2. Password confirmed        →  Edge Fn decrypts + returns    →  Key shown in UI
                                  value (one-time response)        for 30 secs then
                             →  audit_log INSERT (reveal event)   re-masked
```

---

## 24. OVERALL CACHE INVALIDATION MAP

Whenever **any** admin publishes or updates content, the cache for the affected public routes must be purged. This is handled automatically by the `invalidate-cache` Edge Function.

```
Admin saves / publishes          →  invalidate-cache Edge Fn called with:
                                      - List of affected route patterns

Content Changed                 Routes Purged
────────────────────────────────────────────────────────────────────
Hero content                    /api/hero, /
About content                   /api/about, /, /about
Projects (add/edit/delete)      /api/projects, /api/projects/:slug
                                /projects, /projects/:slug
Services (add/edit/delete)      /api/services, /api/services/:slug
                                /services, /services/:slug
Highlights content              /api/highlights, /
Process steps                   /api/process, /, /about
Reviews                         /api/reviews, /
Community content               /api/community, /, /community
Blog posts                      /api/blog, /api/blog/:slug
                                /insights, /insights/:slug
Site config (contact/social)    /api/config, / (footer)
Site config (SEO/OG)            All pages with updated OG tags

After purge: Cloudflare Worker cache is empty for those routes.
Next visitor request → Worker fetches fresh data from Supabase.
Worker stores in KV cache for next TTL window.
All subsequent visitors → served from fresh cache.
```

---

## 25. SECURITY LAYER SUMMARY

```
Request to admin.anthatech.com

1. CLOUDFLARE ACCESS (network layer)
   → Only whitelisted email addresses allowed
   → All other traffic blocked before React app even loads

2. SUPABASE AUTH (application layer)
   → Email + password check
   → TOTP MFA check (if enabled)
   → JWT issued with role claim (super_admin / admin / editor)

3. CLOUDFLARE R2 PRESIGNED URLS (storage layer)
   → Files never uploaded through Supabase
   → Presigned URLs valid for 5 minutes only
   → Direct browser → R2 upload

4. ROW LEVEL SECURITY (database layer)
   → Every Supabase query validates JWT
   → Public tables: anon can only SELECT published rows
   → Private tables: anon can only INSERT (forms)
   → Admin tables: no public access at all

5. AUDIT LOG (forensic layer)
   → Every admin action logged with IP, timestamp, result
   → Retained 90 days, exportable as CSV
   → Immutable from admin UI (INSERT only via system)
```

---

*Document covers all 25 admin panel features. Cross-reference with:*
- [admin_panel_design.md](admin_panel_design.md) — UI/UX specification
- [layout_diagram.md](layout_diagram.md) — Visual page layouts
- [backend_integration.md](backend_integration.md) — Database schemas and RLS policies
