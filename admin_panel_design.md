# Admin Panel — Granular UI & UX Design Specification

---

## 1. Design Philosophy

The admin panel must feel **purposeful, minimal, and fast**. It is a power-user tool — not a showcase. Every screen should serve one clear task without distraction.

- **Visual Language:** Clean white/light-grey base, blue accent (`#1a3c5e` / `#3B82F6`), danger red (`#F05A63`) for destructive actions
- **Typography:** Same font family as public site — consistent brand feel
- **Density:** Moderate — not too sparse, not too cramped. Tables use comfortable row height
- **Feedback:** Every action gives instant visual feedback (toast notifications, inline validation, loading states)
- **Responsiveness:** Desktop-first (admins use desktop), but still functional on tablet

---

## 2. Global Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  TOP BAR  [ Logo | Page Title ]         [ Avatar | Logout ]  │
├──────────────┬──────────────────────────────────────────┤
│              │                                          │
│   SIDEBAR    │           MAIN CONTENT AREA             │
│  (240px)     │           (fluid width)                 │
│              │                                          │
│  Navigation  │   Breadcrumb > Section Title            │
│  Items       │                                          │
│              │   [ Content Panels / Tables / Forms ]   │
│              │                                          │
└──────────────┴──────────────────────────────────────────┘
```

---

## 3. Top Bar

| Element | Description |
|---------|-------------|
| **Logo** | Small Antha Tech logo (left) — links to admin dashboard |
| **Page Title** | Dynamic — shows current section name |
| **Environment Badge** | Small badge: "ADMIN" in blue — clearly distinguishes from public site |
| **Notification Bell** | Icon with red dot for unread contact form submissions |
| **Admin Avatar** | Circle avatar with admin name initials — click opens dropdown |
| **Dropdown Menu** | Profile Settings / Change Password / Logout |

---

## 4. Sidebar Navigation

The sidebar is **collapsible** (icon-only mode on smaller screens).

### Navigation Sections & Items

```
📊  Dashboard                   ← Overview & stats

📁  Content Management
    ├── 🏠  Hero Section
    ├── 🏢  About
    ├── 📂  Projects
    ├── 🔧  Services
    ├── 🌟  Highlights
    ├── ⚙️   Process Steps
    ├── ⭐  Reviews / Testimonials
    ├── 👥  Community
    └── 📝  Blog / Insights

📬  Messages                    ← Contact form submissions

🖼️  Media Library               ← Cloudflare R2 file manager

⚙️  Site Settings
    ├── 📞  Contact Info
    ├── 🔗  Social Links
    └── 🏷️  SEO / Meta Tags

👤  Admin Users                 ← Manage admin accounts

🔐  Security                    ← Sessions, audit log
```

### Sidebar Item States
- **Default:** Light grey text, transparent background
- **Hover:** Light blue background tint, dark blue text
- **Active:** Blue left border accent (`4px solid #3B82F6`), blue background tint, bold blue text
- **Sub-menu:** Indent 16px, smaller font size (13px)

---

## 5. Dashboard Page

The **first screen after login.** Gives a complete, at-a-glance view of the site's status.

### 5.1 Stats Cards Row (4 cards)

Each card:
- **Icon** (top left, colored)
- **Big Number** (center, 32px bold)
- **Label** (below, 13px grey)
- **Trend Indicator** (small arrow + % change — green up, red down)

| Card | Metric |
|------|--------|
| 1 | Total Projects |
| 2 | Total Blog Posts |
| 3 | Unread Messages |
| 4 | Community Members |

### 5.2 Recent Messages Table

- Columns: Name / Email / Message Preview / Date / Status (New / Read)
- Row click → opens message detail modal
- Status badge: `New` (blue), `Read` (grey)
- Limit: Show last 5 — link to "View All Messages"

### 5.3 Quick Actions Panel

Large clickable action tiles arranged in a 2×3 grid:
- ➕ Add New Project
- ✍️ Add New Blog Post
- 📋 View All Messages
- 🖼️ Upload Media
- ✏️ Edit Hero Section
- ⚙️ Site Settings

### 5.4 Recent Activity Log

- Timeline list of last 10 admin actions
- E.g. "Project 'RecruiterOne' was updated — 2 hours ago"
- Small avatar + action text + timestamp

---

## 6. Content Management — Each Section

---

### 6.1 Hero Section Manager

**Purpose:** Edit the landing page Hero content.

#### Form Fields
| Field | Input Type | Description |
|-------|-----------|-------------|
| Badge Text | Text Input | "Development agency" pill text |
| Main Title Line 1 | Text Input | "Turning pixels into" |
| Main Title Line 2 | Text Input | Gradient text — "digital mastery" |
| Subtitle Line 1 | Text Input | Sub-description line 1 |
| Subtitle Line 2 | Text Input | Sub-description line 2 |
| Primary CTA Button Text | Text Input | "Our Services" |
| Primary CTA Link | Dropdown/URL | Route selector |
| Secondary CTA Button Text | Text Input | "Get in Touch" |
| Trusted By — Client Logos | Media Picker | Upload/replace client logos (R2) |

#### UI Behavior
- Live **character counter** on title fields
- **Preview Panel** (right side, 40% width) — shows approximate visual output
- **Save** button is disabled until changes are made (dirty state detection)
- **Revert Changes** link — resets to last saved

---

### 6.2 About Section Manager (About1 + About2)

#### About1 — "Digital Design Studio" section
| Field | Input Type |
|-------|-----------|
| Logo Image | Media Picker (R2) |
| Paragraph 1 — Text Blocks | Rich text with color tagging (blue/dark toggle per word group) |
| Paragraph 2 — Text Blocks | Same as above |
| Primary Button Text | Text Input |
| Secondary Button Text | Text Input |

#### About2 — "Numbers that drive success" section
| Field | Input Type |
|-------|-----------|
| Section Badge Text | Text Input |
| Section Title Line 1 | Text Input |
| Section Title Line 2 | Text Input |
| Stats (repeatable) | Repeatable Row: [Dot Color Picker] [Number] [Label] |

**Repeatable Row UI:**
- ➕ Add Stat button
- Drag handle to reorder
- ✕ Delete stat button
- Max 6 stats enforced with tooltip warning

---

### 6.3 Projects Manager

**Two views:** List View (default) / Grid View toggle

#### Projects Table (List View)
| Column | Details |
|--------|---------|
| # | Row number |
| Thumbnail | Small image (48×48 from R2) |
| Title | Clickable → opens Edit form |
| Category Pill | Badge with category text |
| Status | Toggle — Published / Draft |
| Date | Date modified |
| Actions | Edit icon / Delete icon |

#### Add / Edit Project Form
| Field | Input Type |
|-------|-----------|
| Project ID / Slug | Text Input (auto-generated, editable) |
| Project Title | Text Input |
| Category Pill Text | Text Input |
| Cover Image | Media Picker → R2 Upload |
| Hero Description | Textarea |
| Challenges (repeatable) | Rich Text Editor per challenge |
| Gallery Images | Multi-image Media Picker → R2 |
| Solutions (repeatable) | Rich Text Editor per solution |
| Client Review | Quote Text + Author Name + Role + Company |
| Related Projects | Multi-select from existing projects |
| Status | Radio: Published / Draft |

#### Validations
- Title: required, max 60 chars
- Cover Image: required, shows preview before save
- Slug: unique validation with real-time availability check (green ✓ / red ✗)

---

### 6.4 Services Manager

#### Services Table
| Column | Details |
|--------|---------|
| Service Name | Clickable |
| Theme Color | Color swatch preview |
| Tags | Comma-separated badge list |
| Status | Published / Draft toggle |
| Actions | Edit / Delete |

#### Edit Service Form
| Field | Input Type |
|-------|-----------|
| Service Title | Text Input |
| Service Slug | Text Input (used in route `/service/[slug]`) |
| Short Description | Textarea (shown on landing page ServiceCard) |
| Tags | Tag input (add/remove chips) |
| Theme | Dropdown with color preview: Dark Green / Indigo Blue / Charcoal Black |
| Service Graphic Image | Media Picker → R2 |
| What We Offer (repeatable) | Icon Picker + Title + Text per item |
| Our Process Steps (repeatable) | Step Number + Title + Text (max 4) |
| Benefits (repeatable) | Text Input list |
| Hero Background Color | Color Picker |

---

### 6.5 Highlights Manager

**Purpose:** Edit the "We blend cutting-edge technology..." section items

#### Form
| Field | Input Type |
|-------|-----------|
| Header Text (rich) | Rich text with highlight color toggle |
| Highlight Items (repeatable, max 4) | Icon SVG Code + Title Line 1 + Title Line 2 |

**Icon Field:** Textarea for raw SVG code + live mini preview

---

### 6.6 Process Steps Manager

**Purpose:** Edit the "How we bring ideas to life" section (4 steps)

#### Steps Table (always 4 rows, reorderable)
| Field | Input Type |
|-------|-----------|
| Step Number | Auto (01–04) |
| Title | Text Input |
| Description | Textarea |
| Step Image | Media Picker → R2 |

- Drag-and-drop to reorder
- Cannot delete below 2 steps or above 6 steps
- Image preview shown inline

---

### 6.7 Reviews / Testimonials Manager

#### Reviews Table
| Column | Details |
|--------|---------|
| Author | Name + avatar initial |
| Role | Text |
| Company | Text |
| Quote Preview | Truncated text |
| Status | Active / Inactive |
| Actions | Edit / Delete |

#### Add / Edit Review Form
| Field | Input Type |
|-------|-----------|
| Quote Text | Textarea (max 300 chars with counter) |
| Author Name | Text Input |
| Author Role | Text Input |
| Company Name | Text Input |
| Avatar Image | Media Picker (optional) → R2 |
| Status | Active / Inactive toggle |

---

### 6.8 Community Manager

#### Stats Editor
| Field | Input Type |
|-------|-----------|
| Stat 1 — Value | Text Input ("500+") |
| Stat 1 — Label | Text Input ("Members Worldwide") |
| Stat 2 — Value | Text Input |
| Stat 2 — Label | Text Input |
| Stat 3 — Value | Text Input |
| Stat 3 — Label | Text Input |

#### Tracks Editor (repeatable, max 4)
| Field | Input Type |
|-------|-----------|
| Icon | Emoji Picker |
| Label | Text Input |
| Description | Textarea |

#### Community Applications Table
| Column | Details |
|--------|---------|
| Name | Text |
| Email | Text |
| Track | Student / Professional badge |
| Applied Date | Date |
| Status | Pending / Approved / Rejected |
| Actions | View / Approve / Reject |

#### HowItWorks Steps (repeatable)
- Step Number (auto) / Title / Description / Icon

#### Perks (repeatable)
- Icon / Title / Description

---

### 6.9 Blog / Insights Manager

#### Blog Posts Table
| Column | Details |
|--------|---------|
| # | Number |
| Cover Image | Thumbnail |
| Title | Clickable |
| Date | Published date |
| Status | Published / Draft |
| Actions | Edit / Delete |

#### Add / Edit Blog Post Form
| Field | Input Type |
|-------|-----------|
| Cover Image | Media Picker → R2 (Unsplash URL or upload) |
| Title | Text Input (max 100 chars) |
| Slug | Auto-generated, editable |
| Date Label | Text Input ("1 year ago" or actual date) |
| Short Description | Textarea (shown on BlogCard) |
| Full Article Content | Rich Text Editor (WYSIWYG) |
| Tags | Tag Input chips |
| Internal Link / URL | Text Input |
| Status | Published / Draft |

---

## 7. Messages (Contact Submissions)

### Inbox Table
| Column | Details |
|--------|---------|
| # | Row |
| Status Badge | New (blue) / Read (grey) |
| Sender Name | Bold if unread |
| Email | Clickable mail link |
| Message Preview | First 80 chars |
| Received Date | Relative time ("2 hours ago") |
| Actions | View / Delete |

### Message Detail Modal / Drawer
- Full message text
- Sender details (name, email)
- Received timestamp
- **Reply via Email** button (opens mailto or integrated email service)
- **Mark as Read** / **Delete** buttons
- Status changes to Read automatically on open

---

## 8. Media Library (Cloudflare R2 Manager)

### Layout
- **Grid View** (default): 4-column image grid with filenames below
- **List View**: Table with filename / type / size / date uploaded / actions

### Upload Area
- Large dashed **drag-and-drop zone** at top
- Supports: JPG, PNG, WebP, SVG, MP4, PDF
- Progress bar per file during upload
- Shows thumbnail preview after upload

### File Actions
- Click image → opens fullscreen preview modal
- **Copy R2 URL** button (one click copies URL to clipboard)
- **Delete** (with confirmation dialog)
- **Search** by filename
- **Filter** by type (Images / Videos / Documents)

---

## 9. Site Settings

### 9.1 Contact Info
| Field | Input |
|-------|-------|
| Business Email | Email Input |
| Phone Number | Text Input |
| Physical Address | Textarea |
| Map Embed URL | URL Input |

### 9.2 Social Links
| Field | Input |
|-------|-------|
| Instagram URL | URL Input |
| LinkedIn URL | URL Input |
| Twitter/X URL | URL Input |
| Behance URL | URL Input |
| GitHub URL | URL Input |

### 9.3 SEO / Meta Tags
| Field | Input |
|-------|-------|
| Site Name | Text Input |
| Default Meta Title | Text Input (max 60 chars with counter) |
| Default Meta Description | Textarea (max 160 chars with counter) |
| Default OG Image | Media Picker → R2 |
| Per-Page Meta (table) | Page Name / Title / Description / OG Image |

---

## 10. Admin Users Management

| Column | Details |
|--------|---------|
| Avatar | Circle initials |
| Name | Admin full name |
| Email | Login email |
| Role | Super Admin / Admin / Editor |
| Last Login | Relative date |
| Status | Active / Suspended |
| Actions | Edit / Suspend / Delete |

### Add Admin Form
| Field | Input |
|-------|-------|
| Full Name | Text Input |
| Email | Email Input |
| Role | Dropdown |
| Send Invite | Toggle (sends invitation email) |

> ⚠️ Only **Super Admin** can create/delete admin users. Regular admins see this section as read-only.

---

## 11. Security Center

### Active Sessions
- Table: Device / Browser / IP / Location / Login Time / Actions (Revoke)

### Audit Log
- Timeline table: Who / Action / Target / IP / Timestamp
- Filter by: User / Date Range / Action Type
- Export as CSV button

---

## 12. UX Patterns & Micro-interactions

### Toast Notifications
- **Success:** Green bottom-right toast, auto-dismiss 3s — "Project saved successfully"
- **Error:** Red toast, stays until dismissed — "Failed to save. Please try again."
- **Warning:** Yellow toast — "You have unsaved changes"

### Confirmation Dialogs
- All DELETE actions require confirmation modal
- Modal: Icon + Warning text + Cancel button (grey) + Delete button (red)
- Destructive button labeled exactly "Delete [Item Name]" — no ambiguity

### Loading States
- Skeleton loaders for tables (grey animated rows)
- Button spinner during save/submit
- Full-page overlay with spinner during auth actions

### Empty States
- Custom illustration + text + CTA button per section
- E.g., "No projects yet. Add your first project →"

### Form Dirty State
- Browser navigation blocked with "You have unsaved changes — Leave page?" dialog
- Save button shows "Saving…" while in-flight, then "Saved ✓"

### Pagination
- All tables paginated — 10 / 25 / 50 rows per page selector
- "Showing 1–10 of 47 results" counter

---

## 13. Login Page (Admin Auth)

### Layout
- Centered card on full-page gradient background
- Card: Logo + "Admin Panel" label + Form

### Form Fields
| Field | Type |
|-------|------|
| Email | Email Input |
| Password | Password Input (with show/hide toggle) |
| Remember Me | Checkbox |
| Login Button | Full-width blue button |

### States
- **Error:** Red inline error below form — "Invalid credentials"
- **Loading:** Button shows spinner
- **Locked:** After 5 failed attempts, show "Account locked. Try again in 10 minutes."
- **MFA Step:** After correct password, shows OTP input screen (if MFA enabled)

---

## 14. Color & Status System

| Type | Color | Usage |
|------|-------|-------|
| Primary Blue | `#3B82F6` | Buttons, active nav, links |
| Dark Navy | `#1a3c5e` | Headers, section titles |
| Success Green | `#4ADE80` | Published status, success toasts |
| Warning Yellow | `#FBBF24` | Draft status, warnings |
| Danger Red | `#F05A63` | Delete actions, errors |
| Grey | `#6B7280` | Labels, inactive, secondary text |
| Background | `#F9FAFB` | Page background |
| Card Background | `#FFFFFF` | Content cards, panels |
| Border | `#E5E7EB` | Table rows, card borders |

---

## 15. Security Center (Expanded)

The Security Center is the most critical section for a production admin panel. It gives the admin full visibility and control over access, threats, and system integrity.

---

### 15.1 Security Dashboard Overview

A dedicated security overview page with real-time status indicators:

| Panel | Content |
|-------|---------|
| **Security Score** | Overall score out of 100 — updates as you enable/disable features (e.g. "87/100 — Enable MFA to reach 100") |
| **Active Sessions** | Count of currently logged-in admin sessions |
| **Failed Login Attempts** | Last 24 hours count — red if >5 |
| **Last Successful Login** | IP + Device + Timestamp |
| **MFA Status** | Enabled / Disabled with quick-enable button |
| **Cloudflare Access** | Connected / Not Connected status indicator |

---

### 15.2 Brute Force & Rate Limiting Control

- **Login Attempt Monitor** — Table: IP / Attempts / Last Try / Status (Active / Blocked)
- **Manual Block IP** — Admin can manually enter an IP to block indefinitely
- **Unblock IP** — Release blocked IPs with reason log entry
- **Auto-lock threshold** — Configurable: lock account after N failed attempts (default: 5)
- **Lock duration** — Configurable: 10 / 30 / 60 minutes or "Until manually unlocked"
- **Whitelist IPs** — IPs that are NEVER rate-limited (e.g. office static IP)

---

### 15.3 Active Sessions Manager

- **Table columns:** Device name / Browser / OS / IP Address / Location (Country, City) / Login Time / Last Active
- **Current session** marked with a green "This device" badge
- **Revoke Session** button on each row — immediately invalidates that JWT
- **Revoke All Other Sessions** — nuclear option, keeps only current session alive
- On revoke: Supabase JWT blacklisted + admin notified via email

---

### 15.4 MFA (Multi-Factor Authentication) Management

- **Enable / Disable MFA** toggle — requires password re-confirmation to change
- **TOTP Setup Wizard** (when enabling):
  1. Show QR code (for Google Authenticator / Authy)
  2. Manual entry key shown below QR code
  3. Verify with first 6-digit code before activating
  4. Generate and display **10 backup codes** (one-time use) — warn to save them
- **Backup Codes** section — regenerate codes (invalidates old ones), shown masked with "Reveal" button
- **Enforce MFA for all admins** toggle (Super Admin only)

---

### 15.5 Password Policy Manager (Super Admin Only)

| Setting | Options |
|---------|---------|
| Minimum password length | 8 / 12 / 16 / Custom |
| Require uppercase | Toggle |
| Require number | Toggle |
| Require special character | Toggle |
| Password expiry | Never / 30 / 60 / 90 days |
| Prevent reuse of last N passwords | 0 / 3 / 5 / 10 |

- When policy changes, admins are forced to update password on next login
- Password strength meter shown on Change Password form

---

### 15.6 Audit Log (Enhanced)

Beyond basic activity logging — a forensic-grade event trail:

**Logged Events:**
- All content CREATE / UPDATE / DELETE operations
- Login success / failure (with IP + User Agent)
- Password changes
- MFA enable / disable
- Session revocations
- Settings changes
- IP block / unblock actions
- Bulk operations (e.g. "Deleted 3 messages")
- Media uploads / deletions
- Cache invalidation triggers

**Audit Log Table Columns:**

| Column | Details |
|--------|---------|
| Timestamp | Exact datetime (with timezone) |
| Admin User | Name + email |
| Event Type | Color-coded badge (Auth / Content / Security / Settings) |
| Description | Human-readable action string |
| Target | Affected resource (e.g. "Project: RecruiterOne") |
| IP Address | Clickable → shows geo lookup |
| User Agent | Browser + OS string |
| Result | ✅ Success / ❌ Failed |

**Filters:** Date range / User / Event type / Result
**Export:** Download as CSV / JSON

---

### 15.7 Suspicious Activity Alerts

Admin receives in-panel notifications (bell icon) AND email alerts for:

| Trigger | Alert Level |
|---------|-------------|
| Login from new country/IP | ⚠️ Warning |
| 3+ failed login attempts | ⚠️ Warning |
| 5+ failed attempts (account locked) | 🔴 Critical |
| Admin account password changed | ℹ️ Info |
| New admin user created | ℹ️ Info |
| Admin user deleted | ⚠️ Warning |
| MFA disabled on any account | 🔴 Critical |
| Bulk delete operation (>5 items) | ⚠️ Warning |
| Login outside business hours (configurable) | ℹ️ Info |

**Alert notification UI:**
- Red pulsing badge on Security sidebar item when critical alerts exist
- Alert detail card: What happened / When / Which account / Recommended action
- Dismiss button (requires admin to acknowledge, logged in audit trail)

---

### 15.8 API Key Management

For any integrations (e.g. Resend email, external webhooks):

| Column | Details |
|--------|---------|
| Key Name | Human label (e.g. "Resend Production") |
| Service | Tag (Email / Storage / Webhook / Custom) |
| Created | Date |
| Last Used | Relative time |
| Status | Active / Revoked |
| Actions | View (masked) / Revoke |

- API keys stored **encrypted at rest** in `site_config` table
- Displayed masked: `rse_••••••••••••••••••••Ab3x`
- **Reveal** button requires password re-entry
- On revoke: confirmation dialog with key name repeated for confirmation

---

## 16. Website Analytics Dashboard

Read-only analytics overview pulled from Cloudflare Analytics (free, no cookies, GDPR-compliant — no Google Analytics needed).

### 16.1 Traffic Overview Panel

| Metric | Display |
|--------|---------|
| Total Page Views | Big number + sparkline (last 30 days) |
| Unique Visitors | Big number + trend |
| Top Countries | Bar chart (top 5) |
| Top Pages | Table — URL / Views / % of total |
| Traffic Sources | Pie chart — Direct / Search / Social / Referral |
| Bandwidth Served | GB served this month (from Cloudflare) |

### 16.2 Performance Metrics Panel

| Metric | Source | Display |
|--------|--------|---------|
| Cache Hit Rate | Cloudflare | % gauge — green if >80% |
| Avg Response Time | Cloudflare Worker | ms number |
| Error Rate (4xx/5xx) | Cloudflare | % — red if >1% |
| R2 Requests Used | Cloudflare R2 API | Out of monthly free limit |
| Supabase Bandwidth | Supabase API | Progress bar — out of 2 GB |

### 16.3 Contact Form Analytics

- Total submissions this month
- Submissions per week (bar chart)
- Peak submission day/time
- New vs Read ratio donut chart

### 16.4 Community Analytics

- Total applications this month
- Approval rate %
- Student vs Professional split (donut chart)
- Applications over time (line chart)

---

## 17. Content Version History & Rollback

Every content save creates a versioned snapshot — admins can roll back any section to a previous state.

### How it Works
- On every `UPDATE` to a content table, the old row is copied to a `content_history` table with a timestamp and admin user ID
- Retain last **20 versions** per content item (older auto-purged to save DB space)

### Version History UI (per content section)

- **History button** (clock icon) on every content editor page
- Opens a side drawer with a **timeline of versions**:
  - Version number / Admin who saved / Timestamp / Short diff summary
- **Preview Version** — opens a read-only modal showing that version's content
- **Restore This Version** — replaces current content with selected version (requires confirmation) — the restore itself is logged in audit trail

---

## 18. Scheduled Publishing

Admins can set a future publish date/time for projects and blog posts instead of publishing immediately.

### Scheduled Publish UI

On Add/Edit Project and Add/Edit Blog Post forms:

**Status field options extended:**
- ● Published (live now)
- ○ Draft (not live)
- 🕐 Scheduled — shows date/time picker: `[ March 15, 2026 ] [ 09:00 AM ]`

### Implementation
- Status stored as `scheduled` in DB with `publish_at` timestamp column
- Supabase Edge Function runs on a cron schedule (every 15 min) — checks for rows where `status = 'scheduled' AND publish_at <= now()` and flips them to `published`
- Cache invalidation triggered automatically when status flips
- Admin receives in-panel notification: "Blog post 'Mobile Design' went live as scheduled"

### Scheduled Items View
- Dedicated "Scheduled" filter tab on Projects and Blog tables
- Shows countdown: "Goes live in 3 days, 4 hours"

---

## 19. Maintenance Mode

A single global toggle that puts the public website into maintenance mode.

### Maintenance Mode Panel (in Settings)

| Element | Description |
|---------|-------------|
| **Master Toggle** | Large prominent ON/OFF switch — red when active |
| **Maintenance Page Title** | { We'll be back soon } |
| **Maintenance Message** | Textarea — shown to public visitors |
| **Expected Back At** | Date/time picker — shown as countdown on maintenance page |
| **Allowed IPs** | Text area — IPs that bypass maintenance and see the live site (for admin preview) |
| **Active Since** | Shown when ON — "Active for 23 minutes" |

### Security Behavior
- When ON: Cloudflare Worker intercepts ALL public requests and returns the maintenance page
- Admin panel (`admin.anthatech.com`) is **unaffected** — admin can still work
- Whitelisted IPs see the live site normally
- Maintenance mode toggle requires **Super Admin** role
- Activation logged in audit trail with reason field

---

## 20. Backup & Export Center

Protects against accidental data loss or Supabase downtime.

### Manual Backup

- **Export All Content** button — generates a JSON snapshot of all content tables
- **Export Media Index** — CSV of all R2 file URLs and metadata
- Backup file named: `anthatech-backup-2026-03-07.json`
- Stored: user downloads it — optionally auto-uploaded to a dedicated R2 backup folder

### Scheduled Auto-Backup (optional)

- Toggle: Enable weekly auto-backup
- Backup saved to R2: `anthatech-media/backups/weekly/`
- Retain last 4 weekly backups (auto-purge older ones)
- Admin notified by email when backup completes or fails

### Restore from Backup

- Upload a backup JSON file
- System shows a diff preview: "This will overwrite 12 projects, 3 blog posts, 8 reviews"
- Requires typing `RESTORE` in a confirmation input before proceeding
- Existing data is backed up automatically before restore starts

---

## 21. Webhook Manager

For integrating with external services (Slack, Zapier, custom endpoints) when content events occur.

### Webhooks Table

| Column | Details |
|--------|---------|
| Name | Human label |
| Endpoint URL | Destination URL (masked after save) |
| Events | Comma-separated event badges |
| Status | Active / Paused |
| Last Triggered | Relative time + result (✅/❌) |
| Actions | Edit / Test / Pause / Delete |

### Add Webhook Form

| Field | Input |
|-------|-------|
| Name | Text Input |
| Endpoint URL | URL Input |
| Secret Key | Auto-generated HMAC secret (for signature verification) |
| Events | Multi-checkbox: New Message / New Application / Project Published / Blog Published / Maintenance ON |
| Status | Active / Paused |

### Test Webhook Button
- Sends a sample payload to the endpoint
- Shows response status code + body in an inline panel
- Response: ✅ 200 OK — "Webhook is working" / ❌ 500 — "Endpoint returned error"

---

## 22. Dark Mode

The admin panel supports a system-synced dark mode — admins who spend hours in the panel benefit significantly from reduced eye strain.

### Dark Mode Color Overrides

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Page Background | `#F9FAFB` | `#0F172A` |
| Card Background | `#FFFFFF` | `#1E293B` |
| Sidebar Background | `#FFFFFF` | `#0F172A` |
| Border | `#E5E7EB` | `#334155` |
| Primary Text | `#111827` | `#F1F5F9` |
| Secondary Text | `#6B7280` | `#94A3B8` |
| Active Nav Item | Blue tint | Darker blue tint |
| Input Background | `#FFFFFF` | `#1E293B` |
| Input Border | `#D1D5DB` | `#475569` |
| Table Row Hover | `#F3F4F6` | `#1E293B` |

**Toggle:** Sun/Moon icon in Top Bar — preference saved in localStorage

---

## 23. Keyboard Shortcuts

Power-user keyboard shortcuts for faster navigation:

| Shortcut | Action |
|----------|--------|
| `G` then `D` | Go to Dashboard |
| `G` then `P` | Go to Projects |
| `G` then `S` | Go to Services |
| `G` then `B` | Go to Blog |
| `G` then `M` | Go to Messages |
| `N` then `P` | New Project form |
| `N` then `B` | New Blog Post form |
| `Cmd/Ctrl + S` | Save current form |
| `Cmd/Ctrl + Z` | Revert unsaved changes |
| `Esc` | Close modal / cancel |
| `?` | Show keyboard shortcuts reference modal |

- Shortcut hint tooltip shown on first session: "Tip: Press ? to see keyboard shortcuts"
- Shortcut reference modal — full list with search

---

## 24. Bulk Operations

For managing multiple items efficiently across Projects, Blog, Reviews, and Messages.

### UI Pattern
- Checkbox column appears on hover in tables
- Selecting any row shows a **bulk action bar** at bottom of page (slides up):

```
┌─────────────────────────────────────────────────────────────────┐
│  ☑ 3 items selected   [Publish All]  [Draft All]  [Delete All]  │
│                                                [✕ Clear Select] │
└─────────────────────────────────────────────────────────────────┘
```

- **Publish All** — sets all selected to `published` (requires confirmation if any were drafts)
- **Draft All** — sets all selected to `draft`
- **Delete All** — confirmation modal: "You are about to delete 3 projects. Type DELETE to confirm." — logged in audit trail
- Bulk operations on Messages: **Mark All Read** / **Delete Selected**

---

## 25. Content Preview (Live Preview)

Before publishing, admins can preview exactly how content will appear on the public website.

### Preview Modes

| Mode | Description |
|------|-------------|
| **Desktop Preview** | Opens public site in an iframe (1440px width) with draft data injected via a short-lived preview token |
| **Mobile Preview** | Same iframe at 390px width |
| **Tablet Preview** | Same iframe at 768px width |

### Preview Token Security
- Preview URL: `www.anthatech.com?preview_token=abc123xyz`
- Token is valid for **15 minutes** only — auto-expires
- Token is a signed JWT — public site validates signature before rendering draft content
- Not shareable (tied to admin session) — logged in audit trail

### Preview Button Location
- Top-right of every content editor page — **"Preview"** button next to "Save" and "Publish"
- Opens in a new tab

---

## 26. In-Panel Notification Center

A structured notification feed accessible via the bell icon in the top bar.

### Notification Types

| Type | Icon | Color | Example |
|------|------|-------|---------|
| New Message | 📬 | Blue | "New contact from Lokesh Kumar" |
| New Application | 👥 | Purple | "Priya S. applied to join Community" |
| Scheduled Post Live | ✅ | Green | "Blog post 'Mobile Design' went live" |
| Security Alert | 🔴 | Red | "Failed login from IP 192.168.1.1" |
| Backup Completed | 💾 | Green | "Weekly backup completed successfully" |
| Backup Failed | ⚠️ | Yellow | "Weekly backup failed — check R2 permissions" |
| System Info | ℹ️ | Grey | "Supabase bandwidth at 75% of free limit" |

### Notification Panel UI
- Slide-in panel from top-right (not a full page)
- **Mark All Read** button
- Individual **Dismiss** per notification
- **View All** link → dedicated Notifications History page (last 100, paginated)
- Unread count badge on bell icon — resets on panel open

---

## 27. Sidebar Navigation (Updated — Full Feature Set)

```
📊  Dashboard

🔐  Security                    ← RED badge if critical alerts
    ├── Security Overview
    ├── Active Sessions
    ├── MFA Settings
    ├── Password Policy
    ├── IP Blocklist
    ├── Audit Log
    └── Suspicious Activity

📁  Content Management
    ├── 🏠  Hero Section
    ├── 🏢  About
    ├── 📂  Projects
    ├── 🔧  Services
    ├── 🌟  Highlights
    ├── ⚙️   Process Steps
    ├── ⭐  Reviews
    ├── 👥  Community
    └── 📝  Blog / Insights

📬  Messages
🖼️  Media Library

📊  Analytics
    ├── Traffic Overview
    ├── Performance
    ├── Contact Analytics
    └── Community Analytics

⚙️  Site Settings
    ├── Contact Info
    ├── Social Links
    ├── SEO / Meta Tags
    ├── Maintenance Mode
    └── Webhooks

🗝️  API Keys
💾  Backup & Export
👤  Admin Users
```
