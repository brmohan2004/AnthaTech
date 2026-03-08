# Admin Panel — Build Prompts
### Page-by-page, section-by-section prompts with full backend integration steps

---

## HOW TO USE THIS FILE

Each prompt below is **self-contained** — paste it directly into your AI coding assistant (GitHub Copilot, Claude, ChatGPT) to build that specific page or feature. Every prompt includes:

- Full tech stack context
- Exact Supabase table schemas
- Component structure to create
- Integration steps numbered in order
- Edge cases and validations

**Tech Stack (referenced in every prompt):**
- React + JSX, React Router v6, plain CSS (per component)
- Supabase JS v2 client (`@supabase/supabase-js`)
- Cloudflare Pages deployment
- Cloudflare R2 for all media (presigned URL upload)
- Supabase Edge Functions for server-side logic

**Environment variables available in every component:**
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_R2_BUCKET_URL
VITE_EDGE_FN_URL
```

---

---

## PROMPT 01 — Project Setup & Supabase Client

```
You are building a React admin panel for a digital design agency called Antha Tech.
Tech stack: React + JSX, React Router v6, plain CSS modules (one .css per component),
Vite build tool, Supabase JS v2, deployed on Cloudflare Pages.

Do the following setup steps in order:

STEP 1 — Install dependencies
Run: npm install @supabase/supabase-js react-router-dom

STEP 2 — Create Supabase client
Create file: src/lib/supabaseClient.js
Content:
  import { createClient } from '@supabase/supabase-js'
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  export const supabase = createClient(supabaseUrl, supabaseAnonKey)

STEP 3 — Create environment file
Create .env.local at project root:
  VITE_SUPABASE_URL=https://[your-project].supabase.co
  VITE_SUPABASE_ANON_KEY=[your-anon-key]
  VITE_R2_BUCKET_URL=https://[bucket].r2.dev
  VITE_EDGE_FN_URL=https://[your-project].supabase.co/functions/v1

STEP 4 — Create Auth context
Create file: src/context/AuthContext.jsx
Provide:
  - currentUser (Supabase session user object)
  - userRole (fetched from admin_profiles table: 'super_admin' | 'admin' | 'editor')
  - isLoading (bool while session is being checked)
  - signOut() function
Use supabase.auth.onAuthStateChange to keep session reactive.
On each auth state change, if user exists, fetch their role:
  SELECT role FROM admin_profiles WHERE id = user.id

STEP 5 — Create route structure
Update src/main.jsx to use React Router.
All admin routes live under /admin/* and are wrapped in a ProtectedRoute component
that checks: if no session → redirect to /admin/login.
```

---

## PROMPT 02 — Global Shell (Sidebar + Topbar + Layout)

```
Build the global admin panel shell that wraps every authenticated page.
Tech stack: React + JSX, plain CSS, React Router v6 NavLink.

COMPONENT TO CREATE: src/admin/layout/AdminLayout.jsx + AdminLayout.css

The shell has three parts:

━━━ TOPBAR (fixed, full width, 64px height) ━━━
Left:   Small Antha Tech logo (use text "[AnthaTech]" as placeholder) + "|ADMIN|" badge in blue (#3B82F6)
Center: Dynamic page title — read from a context or passed as prop
Right (left-to-right):
  1. Dark/Light mode toggle button (☀ / 🌙) — toggles class on <html>
  2. Notification bell (🔔) with a red badge count — read from NotificationContext (build stub returning 0 for now)
  3. Admin avatar circle (shows initials from currentUser.email) with dropdown:
       - "Profile Settings" link
       - "Change Password" link
       - "Sign Out" button → calls supabase.auth.signOut() then navigate to /admin/login

━━━ SIDEBAR (240px wide, collapsible to 60px icon-only mode) ━━━
Full navigation structure (use React Router NavLink — active state = blue left border):

Section: (no header)
  ● Dashboard → /admin/dashboard

Section: Security  [shows red dot badge if there are unread security notifications]
  ● Security Overview → /admin/security/overview
  ● Sessions → /admin/security/sessions
  ● MFA → /admin/security/mfa
  ● Passwords → /admin/security/passwords
  ● IP Blocklist → /admin/security/ip-blocklist
  ● Audit Log → /admin/security/audit-log
  ● Alerts → /admin/security/alerts

Section: Content
  ● Hero → /admin/content/hero
  ● About → /admin/content/about
  ● Projects → /admin/content/projects
  ● Services → /admin/content/services
  ● Highlights → /admin/content/highlights
  ● Process → /admin/content/process
  ● Reviews → /admin/content/reviews
  ● Community → /admin/content/community
  ● Blog → /admin/content/blog

Section: (no header)
  ● Messages → /admin/messages
  ● Media Library → /admin/media

Section: Analytics
  ● Traffic → /admin/analytics/traffic
  ● Performance → /admin/analytics/performance
  ● Contact Stats → /admin/analytics/contact
  ● Community Stats → /admin/analytics/community

Section: Settings
  ● Contact Info → /admin/settings/contact
  ● Social Links → /admin/settings/social
  ● SEO / Meta → /admin/settings/seo
  ● Maintenance Mode → /admin/settings/maintenance
  ● Webhooks → /admin/settings/webhooks

Section: (no header)
  ● API Keys → /admin/api-keys
  ● Backup → /admin/backup
  ● Admin Users → /admin/users

Collapse button at sidebar bottom: [← ] — toggles sidebar width.
On collapse, show only icons (use emoji as icons for now).

━━━ MAIN CONTENT AREA ━━━
Fluid width (100% - sidebar width).
Includes:
  - Breadcrumb row at top (passed as prop or derived from route)
  - <Outlet /> for child routes

━━━ INTEGRATION STEPS ━━━
Step 1: Create AdminLayout.jsx with the three sections above.
Step 2: Create AdminLayout.css — sidebar transition: width 0.2s ease.
Step 3: Wrap all /admin/* routes in App.jsx with <AdminLayout>.
Step 4: Add a CollapsedContext so nested components can know sidebar state.
Step 5: Add CSS variable --sidebar-width that changes on collapse so main content shifts.
```

---

## PROMPT 03 — Login Page + MFA

```
Build the admin panel login page.
Tech stack: React + JSX, plain CSS, Supabase Auth with TOTP MFA.

COMPONENT: src/admin/auth/LoginPage.jsx + LoginPage.css
ROUTE: /admin/login (public — no auth required)

━━━ UI LAYOUT ━━━
Full viewport, gradient background (dark blue to near-black).
Centered card (480px wide, white, rounded 16px, shadow):
  - Antha Tech logo placeholder at top center
  - "Admin Panel" subtitle text
  - Divider line
  - STEP 1 FORM (email + password):
      Email input: type="email", placeholder="admin@anthatech.com"
      Password input: type="password" with toggle show/hide (👁 button)
      "Remember me" checkbox
      Primary blue button: "Sign In to Admin"
  - STEP 2 FORM (MFA, shown only after step 1 succeeds and MFA is required):
      Instruction: "Enter the 6-digit code from your authenticator app"
      OTP input: 6 digits, auto-focus, numeric only
      "Verify Code" button
      "Use a backup code instead" link (shows text input for backup code)
  - Error message area (red inline text, not a toast)

━━━ INTEGRATION STEPS ━━━
Step 1: On form submit, call:
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  If error → show error.message inline below the form.

Step 2: Check if MFA is required:
  If data.session is null AND data.user exists → MFA challenge required.
  Show Step 2 form.
  Store the mfa_challenge_id in local state.

Step 3: On OTP submit, call:
  const { data, error } = await supabase.auth.mfa.challengeAndVerify({
    factorId: [from enrolled factors list],
    code: otpValue
  })
  On success → navigate('/admin/dashboard')
  On error → show "Invalid code. Try again."

Step 4: If no MFA required (data.session exists after step 1) → navigate('/admin/dashboard') immediately.

Step 5: On mount, check if session already exists:
  const { data: { session } } = await supabase.auth.getSession()
  If session → navigate('/admin/dashboard') (already logged in)

Step 6: Add ProtectedRoute wrapper in router:
  Creates a component that checks session. If no session → <Navigate to="/admin/login" replace />
  If session exists → renders <Outlet />

VALIDATIONS:
- Email: required, must be valid email format
- Password: required, min 8 chars
- OTP: required, exactly 6 digits, numeric only
- Disable submit button while loading, show spinner inside button
```

---

## PROMPT 04 — Dashboard Page

```
Build the admin panel Dashboard — the first page after login.
Tech stack: React + JSX, plain CSS, Supabase JS v2.

COMPONENT: src/admin/dashboard/Dashboard.jsx + Dashboard.css
ROUTE: /admin/dashboard

━━━ UI LAYOUT ━━━
Page title: "Dashboard"

ROW 1 — Stats Cards (4 equal-width cards in a row):
  Card 1: Total Projects count → SELECT count(*) FROM projects
  Card 2: Total Blog Posts → SELECT count(*) FROM blog_posts
  Card 3: Unread Messages → SELECT count(*) FROM contact_messages WHERE status='new'
  Card 4: Community Members → SELECT count(*) FROM community_applications WHERE status='approved'
  Each card shows: icon, big number, label, and a small trend text (hardcode "+2 this month" for now).
  Cards are clickable — navigate to the corresponding admin section.

ROW 2 — Two columns:
  LEFT (60%): Recent Messages panel
    - Load last 5 contact_messages ordered by received_at DESC
    - Each row: sender_name, truncated message (80 chars), relative time, status dot (blue=new, grey=read)
    - Row click → navigate to /admin/messages
    - "View All Messages →" link at bottom

  RIGHT (40%): Quick Actions panel
    - 6 large clickable tiles in 2×3 grid:
        ➕ New Project → /admin/content/projects/new
        ✍️ New Blog Post → /admin/content/blog/new
        📋 Messages Inbox → /admin/messages
        🖼 Upload Media → /admin/media
        ✏️ Edit Hero → /admin/content/hero
        ⚙️ Site Settings → /admin/settings/contact

ROW 3 — Recent Activity Log (full width):
  Load last 10 rows from audit_log ordered by created_at DESC.
  Each row: admin initials avatar + description text + relative timestamp.
  Max height 300px, scrollable.

━━━ INTEGRATION STEPS ━━━
Step 1: Run all 4 count queries in parallel using Promise.all on component mount.
Step 2: Use a useEffect with supabase.from('contact_messages').select(...).limit(5).order(...)
Step 3: Use a useEffect for audit_log — SELECT id, description, created_at, admin_id ORDER BY created_at DESC LIMIT 10.
Step 4: Show skeleton loaders (grey animated divs) while data is loading.
Step 5: Format timestamps using a helper: formatRelativeTime(timestamp) → "2 hours ago", "1 day ago" etc.
Step 6: Wrap all Supabase calls in try/catch — show a small inline error banner if any call fails.
```

---

## PROMPT 05 — Hero Section Editor

```
Build the Hero Section content editor page.
Tech stack: React + JSX, plain CSS, Supabase JS v2.

COMPONENT: src/admin/content/hero/HeroEditor.jsx + HeroEditor.css
ROUTE: /admin/content/hero

Supabase table: hero_content
Columns: id, badge_text, title_line_1, title_line_2, subtitle_1, subtitle_2,
         cta_primary_text, cta_primary_route, cta_secondary_text,
         client_logos (jsonb: [{name, url}]), updated_at

━━━ UI LAYOUT ━━━
Two-column layout (60% form / 40% preview panel).

LEFT — Form panel:
  - Badge Text: text input (max 40 chars, show counter)
  - Title Line 1: text input (max 60 chars)
  - Title Line 2: text input — "gradient text" label (max 60 chars)
  - Subtitle Line 1: text input (max 120 chars)
  - Subtitle Line 2: text input (max 120 chars)
  - Primary CTA Text: text input
  - Primary CTA Route: text input (placeholder "/services")
  - Secondary CTA Text: text input
  - Trusted By — Client Logos:
      Grid of existing logos (name + thumbnail from R2 URL + delete ✕ button)
      [+ Add Logo] button → opens mini-modal:
        Logo Name input + Upload image input (R2 upload)
        [Upload & Add] button

RIGHT — Preview panel (read-only):
  Renders approximate visual of the hero using current form values.
  Updates live as admin types (controlled inputs).
  Labelled "Preview (approximate)" with a grey badge.

Top-right actions: [Revert Changes] (resets to last loaded DB values) + [Save Changes] (blue, disabled until dirty)

━━━ INTEGRATION STEPS ━━━
Step 1: On mount, fetch: supabase.from('hero_content').select('*').single()
        Populate all form fields with the loaded row.

Step 2: Track "isDirty" state — compare current form values to original loaded values.
        Enable/disable [Save Changes] based on isDirty.

Step 3: On [Save Changes]:
  a. Call: supabase.from('hero_content').update({ ...formData, updated_at: new Date() }).eq('id', row.id)
  b. If success: show green toast "Hero section saved successfully", reset isDirty to false.
  c. On error: show red toast with error.message.
  d. After save, call Edge Function to invalidate cache:
     fetch(`${import.meta.env.VITE_EDGE_FN_URL}/invalidate-cache`, {
       method: 'POST',
       headers: { Authorization: `Bearer ${session.access_token}` },
       body: JSON.stringify({ routes: ['/api/hero', '/'] })
     })

Step 4: Logo upload flow:
  a. When admin selects a file in the Add Logo modal:
     - Call Edge Function: POST /generate-r2-presigned-url with { folder: 'clients/logos', filename }
     - Upload file directly to the returned presigned URL using fetch(PUT)
     - On success, append { name: logoName, url: r2PublicUrl } to client_logos jsonb array in local state.
  b. Delete logo: filter it out of the local client_logos array.
  c. Save button persists the updated array to DB.

Step 5: [Revert Changes] — re-fetch from Supabase and reset all form state.

VALIDATIONS:
- badge_text, title_line_1, title_line_2 are required
- client_logos: max 8 logos, show warning toast if exceeded
```

---

## PROMPT 06 — About Section Editor

```
Build the About Section content editor page with two tabs (About1 and About2).
Tech stack: React + JSX, plain CSS, Supabase JS v2.

COMPONENT: src/admin/content/about/AboutEditor.jsx + AboutEditor.css
ROUTE: /admin/content/about

Supabase table: about_content (two rows — section = 'about1' and section = 'about2')

━━━ UI LAYOUT ━━━
Two tab buttons at top: [About1 — Studio Description] and [About2 — Stats]
Active tab has blue underline border.
Top-right: [Revert] [Save Changes]

━━━ ABOUT1 TAB ━━━
  Logo Image: shows current logo (from logo_url R2 URL) + [Change Image] button triggering R2 upload.
  
  Paragraph 1 — Rich Color Text:
    A list of word-group rows. Each row has:
      - Text input for the word/phrase
      - Color toggle: [● Blue] / [● Dark] — stored as {text, color: 'blue'|'dark'}
      - Drag handle ↕ to reorder
      - ✕ delete button
    [+ Add Word Group] button
    Preview below shows the paragraph with colored spans applied.

  Paragraph 2 — Same structure as Paragraph 1.

  Primary Button Text: text input
  Secondary Button Text: text input

━━━ ABOUT2 TAB ━━━
  Section Badge: text input
  Title Line 1: text input
  Title Line 2: text input
  Button Text: text input
  
  Stats — Repeatable rows (max 6, drag to reorder):
    Each row: [Dot Color picker (hex or preset: red/yellow/green/blue)] [Number input] [Label input] [✕]
    [+ Add Stat] button. Show warning when max 6 reached.

━━━ INTEGRATION STEPS ━━━
Step 1: On mount, fetch both rows:
  supabase.from('about_content').select('*').in('section', ['about1', 'about2'])
  Store as { about1: {...}, about2: {...} } in local state.

Step 2: paragraph_1 and paragraph_2 are stored as jsonb arrays: [{text, color}]
  Render them as editable repeatable rows. Local state mirrors the jsonb structure.

Step 3: stats in about2 stored as jsonb: [{dot_color, number, label}]
  Use same repeatable row pattern.

Step 4: On save:
  Determine which tab is active. Save only that section's row:
  supabase.from('about_content').update({ ...sectionData }).eq('section', activeTab)
  Then call invalidate-cache Edge Function with routes: ['/api/about', '/', '/about']

Step 5: Logo upload → same R2 presigned URL flow as Hero editor (folder: 'about/').
  After upload success, update logo_url field in local about1 state.

Step 6: Drag-and-drop reorder for word groups and stats:
  Use HTML5 drag events (onDragStart, onDragOver, onDrop) on list items.
  Update array order in local state on drop.
```

---

## PROMPT 07 — Projects Manager (Table + Form)

```
Build the Projects Manager — table view and add/edit form.
Tech stack: React + JSX, plain CSS, Supabase JS v2, React Router v6.

COMPONENTS:
  src/admin/content/projects/ProjectsTable.jsx + ProjectsTable.css
  src/admin/content/projects/ProjectForm.jsx + ProjectForm.css
ROUTES:
  /admin/content/projects → ProjectsTable
  /admin/content/projects/new → ProjectForm (new)
  /admin/content/projects/:id → ProjectForm (edit)

Supabase table: projects
Columns: id, slug, title, category_pill, cover_image_url, hero_description,
         challenges (jsonb), gallery_urls (jsonb), solutions (jsonb),
         review_quote, review_author, review_role, review_company, review_avatar_url,
         related_project_slugs (jsonb), status ('published'|'draft'|'scheduled'),
         publish_at, display_order, created_at, updated_at

━━━ TABLE VIEW ━━━
Page header: "Projects" + [+ Add New Project] button (top right)
Search input + [List view] [Grid view] toggle

Table columns:
  ☐ checkbox | # | 48×48 cover thumbnail | Title (clickable → edit) |
  Category pill badge | Status badge (Published=green, Draft=grey, Scheduled=blue) |
  Updated date | Actions: [✏️ Edit] [🗑 Delete]

Filter tabs: [All] [Published] [Draft] [Scheduled]

Bulk operations bar (appears when checkboxes selected):
  "X items selected" + [Publish All] [Set to Draft] [🗑 Delete All] [✕ Clear]
  Delete All → confirmation modal: type "DELETE" to confirm.

Pagination: show 10 per page, page controls at bottom.

━━━ FORM VIEW ━━━
Breadcrumb: Content > Projects > [Edit — Title] or [New Project]
Top-right: [Cancel] [Save as Draft] [Publish]

Form sections (vertical scroll):
  BASIC INFO:
    Project Title: text input (required, max 80 chars)
    Slug: text input (auto-generated from title, editable)
          Show real-time uniqueness check: green ✓ / red ✗
    Category Pill: text input
    Cover Image: R2 upload image picker — shows preview after upload

  DETAIL PAGE CONTENT:
    Hero Description: textarea (for project detail page)

    Challenges: repeatable rich-text items
      Each item: textarea + [✕] delete + [↕] drag reorder
      [+ Add Challenge]

    Gallery Images: multi-image R2 uploader
      Shows grid of uploaded images — each with [✕] remove button
      [+ Add Image] button

    Solutions: same repeatable pattern as Challenges
      [+ Add Solution]

  CLIENT REVIEW:
    Quote: textarea (max 300 chars)
    Author Name: text input
    Author Role: text input
    Company: text input
    Avatar: optional R2 upload

  RELATED PROJECTS:
    Multi-select dropdown populated from all other project titles/slugs.

  STATUS:
    Radio group: ○ Published  ○ Draft  ● Scheduled
    If Scheduled selected → show: date picker + time picker + timezone dropdown
    Show countdown: "Goes live in X days, X hours"

  VERSION HISTORY BUTTON: [🕐 Version History] top-right of form header
    Clicking opens the Version History drawer (see Prompt 14).

━━━ INTEGRATION STEPS ━━━
Step 1 (Table): 
  supabase.from('projects').select('id,title,slug,category_pill,cover_image_url,status,updated_at')
  .order('display_order', { ascending: true })
  Apply filter based on active tab.

Step 2 (Form load):
  If editing: supabase.from('projects').select('*').eq('id', params.id).single()
  Populate all form sections.

Step 3 (Slug auto-gen):
  On title change → slugify(title) → set slug field.
  slugify: lowercase, replace spaces with -, remove special chars.
  Check uniqueness: supabase.from('projects').select('id').eq('slug', slug).neq('id', currentId)
  If results.length > 0 → show red error.

Step 4 (Cover & gallery upload): 
  Request presigned URL: POST /generate-r2-presigned-url { folder: 'projects/covers/', filename }
  PUT file to presigned URL.
  Store returned public URL in cover_image_url.
  Gallery: loop same flow, push each URL into gallery_urls array.

Step 5 (Save):
  Build payload. If status='scheduled', include publish_at as ISO string.
  If new: supabase.from('projects').insert([payload])
  If editing: supabase.from('projects').update(payload).eq('id', id)
  On success: call invalidate-cache with ['/api/projects', `/api/projects/${slug}`]
  Show toast. Navigate back to table on success.

Step 6 (Delete): 
  supabase.from('projects').delete().eq('id', id)
  Then navigate back to table.

Step 7 (Version snapshot — call before every update):
  POST /save-version-snapshot { table_name: 'projects', record_id: id }
  This Edge Function reads the current row and saves to content_history before your UPDATE runs.

VALIDATIONS:
  - Title and cover image are required for publishing (draft can save without cover).
  - slug must be unique.
  - If status=scheduled, publish_at must be in the future.
```

---

## PROMPT 08 — Services Manager (Table + 4-Tab Form)

```
Build the Services Manager — table and 4-tab form.
Tech stack: React + JSX, plain CSS, Supabase JS v2, React Router v6.

COMPONENTS:
  src/admin/content/services/ServicesTable.jsx + ServicesTable.css
  src/admin/content/services/ServiceForm.jsx + ServiceForm.css
ROUTES:
  /admin/content/services → ServicesTable
  /admin/content/services/new → ServiceForm (new)
  /admin/content/services/:id → ServiceForm (edit)

Supabase table: services
Columns: id, slug, title, short_description, tags (jsonb), theme, hero_bg_color,
         graphic_url, offers (jsonb: [{icon,title,text}]),
         process_steps (jsonb: [{step,title,text}]),
         benefits (jsonb: [string]), status, display_order, updated_at

━━━ TABLE VIEW ━━━
Same pattern as Projects table but columns:
  # | Service Name | Theme color swatch | Tags chips | Status | Actions

━━━ FORM VIEW ━━━
4 tabs in the form:

TAB 1 — Overview:
  Title: text input (required)
  Slug: text input (auto-gen + uniqueness check)
  Short Description: textarea (shown on landing page ServiceCard, max 200 chars)
  Tags: tag chip input — type and press Enter to add, × to remove
  Theme dropdown:
    Options with color swatch: Dark Green / Indigo Blue / Charcoal Black
    Values: 'theme-dark-green' | 'theme-indigo-blue' | 'theme-charcoal-black'
  Hero Background Color: color picker (hex input + color swatch)
  Service Graphic Image: R2 upload → folder: services/graphics/

TAB 2 — What We Offer:
  Repeatable items (max 8):
    Each: [Icon emoji picker] [Title input] [Description textarea] [✕] [↕ drag]
    [+ Add Offer] button

TAB 3 — Our Process:
  Repeatable steps (max 6):
    Each: Step Number (auto 01, 02...) [Title input] [Description textarea] [✕]
    [+ Add Step] button

TAB 4 — Benefits:
  Repeatable text items:
    Each: text input + [✕] + [↕]
    [+ Add Benefit]

Form top-right: [Cancel] [Save Draft] [Publish]

━━━ INTEGRATION STEPS ━━━
Step 1 (Load for edit):
  supabase.from('services').select('*').eq('id', params.id).single()

Step 2 (Graphic upload):
  Same R2 presigned URL flow → folder: 'services/graphics/'

Step 3 (Save):
  Build payload with all 4 tabs merged:
  { title, slug, short_description, tags, theme, hero_bg_color, graphic_url,
    offers, process_steps, benefits, status, updated_at }
  UPSERT to services table.
  Call invalidate-cache: ['/api/services', `/api/services/${slug}`]

Step 4 (Version snapshot before update):
  POST /save-version-snapshot { table_name: 'services', record_id: id }

VALIDATIONS:
  - Title and slug required.
  - At least 1 offer required for publishing.
  - Slug uniqueness check same as projects.
```

---

## PROMPT 09 — Highlights & Process Steps Editors

```
Build two simple single-record editors: Highlights and Process Steps.
Tech stack: React + JSX, plain CSS, Supabase JS v2.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPONENT A: src/admin/content/highlights/HighlightsEditor.jsx
ROUTE: /admin/content/highlights
Supabase table: highlights_content
Columns: id, header_rich_text (jsonb: [{text, highlight: bool}]),
         items (jsonb: [{svg_code, title_line1, title_line2}]), updated_at

FORM LAYOUT:
  Section: Header Text
    Repeatable word-group rows: [Text input] [Highlight toggle ☐/☑] [↕] [✕]
    When highlight=true, preview shows the word in the brand blue color.
    [+ Add Word Group]

  Section: Highlight Items (max 4)
    Each item row:
      SVG Icon Code: textarea (3 lines) + small inline SVG preview (50×50 box)
      Title Line 1: text input
      Title Line 2: text input
      [↕ reorder] [✕ delete]
    [+ Add Item]

Top-right: [Revert] [Save Changes]

INTEGRATION:
  Step 1: Fetch single row: supabase.from('highlights_content').select('*').single()
  Step 2: On save: supabase.from('highlights_content').update({...}).eq('id', row.id)
  Step 3: Call invalidate-cache with routes: ['/api/highlights', '/']

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPONENT B: src/admin/content/process/ProcessEditor.jsx
ROUTE: /admin/content/process
Supabase table: process_steps
Columns: id, badge_text, title_1, title_2, cta_text,
         steps (jsonb: [{step, title, description, image_url}]), updated_at

FORM LAYOUT:
  Section Header fields: Badge Text / Title Line 1 / Title Line 2 / CTA Button Text

  Steps (min 2, max 6, drag to reorder):
    Each step row (card-style):
      Step number: auto (01, 02, 03...)
      Title: text input (required)
      Description: textarea (required, max 300 chars with counter)
      Image: R2 upload image picker → folder: 'process/steps/'
             Shows 120×90 preview after upload
      [✕ Remove step] — only shows if more than 2 steps
    [+ Add Step] button — disabled when 6 steps reached

Top-right: [Revert] [Save Changes]

INTEGRATION:
  Step 1: supabase.from('process_steps').select('*').single()
  Step 2: For each step image upload → R2 presigned URL flow, folder: 'process/steps/'
  Step 3: On save: supabase.from('process_steps').update({...}).eq('id', row.id)
  Step 4: invalidate-cache with: ['/api/process', '/', '/about']
```

---

## PROMPT 10 — Reviews Manager

```
Build the Reviews/Testimonials manager.
Tech stack: React + JSX, plain CSS, Supabase JS v2.

COMPONENTS:
  src/admin/content/reviews/ReviewsTable.jsx + ReviewsTable.css
  src/admin/content/reviews/ReviewForm.jsx (modal or side panel)
ROUTE: /admin/content/reviews

Supabase table: reviews
Columns: id, quote, author_name, author_role, company, avatar_url,
         status ('active'|'inactive'), display_order, created_at

━━━ TABLE VIEW ━━━
Page: "Reviews / Testimonials" + [+ Add Review]

Table columns:
  ☐ | # | Avatar (circle initials or image) | Author Name + Role |
  Company | Quote preview (50 chars...) | Status toggle | Actions: [✏️] [🗑]

Rows are drag-reorderable (update display_order on drop).
Status toggle: click toggles active ↔ inactive inline (no form).

━━━ ADD/EDIT MODAL ━━━
Opens as slide-over panel from the right (400px wide):
  Quote: textarea (max 300 chars, show counter: "213/300")
  Author Name: text input (required)
  Author Role: text input
  Company: text input
  Avatar Image: R2 upload (optional) → folder: 'team/avatars/'
    Shows circular preview if uploaded. [✕ Remove] to clear.
  Status: toggle Active / Inactive
  [Cancel] [Save Review]

━━━ INTEGRATION STEPS ━━━
Step 1: supabase.from('reviews').select('*').order('display_order', { ascending: true })

Step 2: Inline status toggle:
  supabase.from('reviews').update({ status: newStatus }).eq('id', id)
  Then call invalidate-cache: ['/api/reviews', '/']

Step 3: Drag-to-reorder:
  On drop, update display_order for each row based on new index.
  Batch update: loop and call update for each affected row (or build a single RPC).

Step 4: Add/Edit:
  INSERT or UPDATE reviews row.
  Call invalidate-cache after save.

Step 5: Avatar R2 upload → presigned URL flow, folder: 'team/avatars/'

Step 6: Delete → confirmation modal → DELETE row → invalidate cache.
```

---

## PROMPT 11 — Community Manager (4 Tabs)

```
Build the Community section manager with 4 tabs.
Tech stack: React + JSX, plain CSS, Supabase JS v2.

COMPONENT: src/admin/content/community/CommunityManager.jsx + CommunityManager.css
ROUTE: /admin/content/community

Supabase tables:
  community_content: id, section ('teaser'|'how_it_works'|'perks'), title_1, title_2,
                     description, cta_text, tracks (jsonb), stats (jsonb),
                     steps (jsonb), perks (jsonb), updated_at
  community_applications: id, full_name, email, track, message, status, applied_at

━━━ TAB STRUCTURE ━━━
[Tab 1: Teaser] [Tab 2: How It Works] [Tab 3: Perks] [Tab 4: Members]

━━━ TAB 1 — Teaser ━━━
  Title Line 1 + Title Line 2: text inputs
  Description: textarea
  CTA Button Text: text input
  Stats (3 items): each has [Value input] [Label input]
  Tracks (repeatable, max 4):
    [Emoji icon picker] [Label input] [Description textarea] [✕]
  [Save Teaser] button

━━━ TAB 2 — How It Works ━━━
  Steps (repeatable, max 6):
    Auto step number + [Icon emoji] + [Title] + [Description] + [✕] + [↕ drag]
  [Save How It Works]

━━━ TAB 3 — Perks ━━━
  Perks (repeatable, max 8):
    [Icon emoji] + [Title input] + [Description textarea] + [✕] + [↕ drag]
  [Save Perks]

━━━ TAB 4 — Members (Applications) ━━━
  Filter tabs: [All] [Pending] [Approved] [Rejected]
  Search input by name or email.

  Table columns:
    Name | Email | Track badge | Applied Date | Status badge | Actions: [View] [✓ Approve] [✗ Reject]

  DETAIL MODAL (on View click):
    Full name, email, track, message, applied date, current status.
    [Approve] button (green) or [Reject] button (red) based on current status.

━━━ INTEGRATION STEPS ━━━
Step 1 (Load content tabs):
  supabase.from('community_content').select('*')
  Map by section into { teaser: {...}, how_it_works: {...}, perks: {...} }

Step 2 (Save per tab):
  supabase.from('community_content').update({...}).eq('section', tabName)
  invalidate-cache: ['/api/community', '/', '/community']

Step 3 (Load applications):
  supabase.from('community_applications').select('*').order('applied_at', { ascending: false })
  Apply status filter in query with .eq('status', filterValue) when not 'All'.

Step 4 (Approve):
  supabase.from('community_applications').update({ status: 'approved' }).eq('id', applicationId)
  Then call Edge Function: POST /approve-community-member { application_id }
  (Edge Function sends welcome email to applicant via Resend/Brevo)
  Insert notification: type='application', title='Application approved for [name]'

Step 5 (Reject):
  supabase.from('community_applications').update({ status: 'rejected' }).eq('id', applicationId)
```

---

## PROMPT 12 — Blog / Insights Manager

```
Build the Blog / Insights manager with scheduled publishing.
Tech stack: React + JSX, plain CSS, Supabase JS v2, React Router v6.

COMPONENTS:
  src/admin/content/blog/BlogTable.jsx + BlogTable.css
  src/admin/content/blog/BlogForm.jsx + BlogForm.css
ROUTES:
  /admin/content/blog → BlogTable
  /admin/content/blog/new → BlogForm (new)
  /admin/content/blog/:id → BlogForm (edit)

Supabase table: blog_posts
Columns: id, slug, title, cover_image_url, date_label, short_description,
         full_content, tags (jsonb), link, status ('published'|'draft'|'scheduled'),
         publish_at, created_at, updated_at

━━━ TABLE VIEW ━━━
Filter tabs: [All] [Published] [Draft] [🕐 Scheduled (shows count)]

Table: ☐ | # | 48×48 cover | Title | Published Date | Status badge | [✏️] [🗑]

Bulk bar same as Projects table.

━━━ FORM VIEW ━━━
Sections:
  Cover Image: R2 upload → folder: 'blogs/covers/' — shows 200px-wide preview
  Title: text input (required, max 100 chars + counter)
  Slug: auto-gen + editable + uniqueness check
  Date Label: text input (e.g. "March 7, 2026" or "1 week ago")
  Short Description: textarea (max 200 chars + counter)
  Tags: chip tag input
  Full Article Content: WYSIWYG text editor
    Use a simple textarea for now with a note: "Integrate rich text editor (Tiptap/Quill) here"
    Store as HTML string.

  STATUS section (card):
    ○ Published (live immediately)
    ○ Draft (hidden from public)
    ● Scheduled
      Shows date picker + time picker + timezone selector when selected.
      Below pickers: "ℹ Goes live in: [calculated countdown string]"

Top-right: [🕐 History] [Cancel] [Save Draft] [Publish]

━━━ INTEGRATION STEPS ━━━
Step 1 (Load): supabase.from('blog_posts').select('*').eq('id', id).single()

Step 2 (Save draft): upsert with status='draft', no publish_at.

Step 3 (Publish now): upsert with status='published', updated_at=now().
  Call invalidate-cache: ['/api/blog', `/api/blog/${slug}`, '/insights']
  Call trigger-webhook Edge Function with event: 'blog_post_published'
  INSERT notification: type='system', title='Blog post published: [title]'

Step 4 (Schedule):
  upsert with status='scheduled', publish_at = ISO string of chosen datetime.
  The Edge Function cron (scheduled-publish-cron runs every 15 min) will auto-publish.
  DO NOT call invalidate-cache at this point — cron will handle it.

Step 5 (Version snapshot): Before any UPDATE call POST /save-version-snapshot.

Step 6 (🕐 History button): Opens VersionHistoryDrawer component (Prompt 14) passing table='blog_posts', recordId=id.

Step 7 (Slug uniqueness): Same pattern as Projects — live check on input change.
```

---

## PROMPT 13 — Messages Inbox

```
Build the Messages Inbox — contact form submissions reader.
Tech stack: React + JSX, plain CSS, Supabase JS v2.

COMPONENT: src/admin/messages/MessagesInbox.jsx + MessagesInbox.css
ROUTE: /admin/messages

Supabase table: contact_messages
Columns: id, sender_name, sender_email, message, status ('new'|'read'|'archived'), received_at

━━━ UI LAYOUT ━━━
Left panel (380px): message list
Right panel (fluid): message detail

LEFT PANEL:
  Header: "Messages" + stats: "X new" badge
  Filter tabs: [All] [New] [Read] [Archived]
  Search input (searches sender_name and sender_email)
  
  Message list rows (each ~70px tall):
    Sender avatar (circle initials, blue for 'new', grey for 'read')
    Sender name (bold if new)
    Message preview (first 60 chars, truncated)
    Relative time
    Status dot
  
  Clicking a row → loads into right panel + marks status='read' if was 'new'
  Unread rows have slightly blue-tinted background.

RIGHT PANEL (detail view):
  Empty state if none selected: "Select a message to read it."
  
  When selected:
    Sender name (large) + email (link: mailto:)
    Received timestamp (full date + time)
    Status badge
    Divider line
    Full message text (readable font, line-height 1.7)
    
    Action buttons row:
      [Reply via Email] → opens mailto: link with pre-filled subject
      [Mark as New] ← (only shown if currently 'read')
      [Archive] → updates status='archived'
      [🗑 Delete] → confirmation modal → DELETE row

━━━ INTEGRATION STEPS ━━━
Step 1: supabase.from('contact_messages').select('*').order('received_at', { ascending: false })
  Apply filter by status if tab is not 'All'.

Step 2: Real-time updates — subscribe to new messages:
  supabase.channel('contact_messages').on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'contact_messages' },
    (payload) => prepend payload.new to messages list
  ).subscribe()
  Show a "New message received" toast when real-time event fires.

Step 3: On row click:
  Set selectedMessage in state.
  If message.status === 'new': supabase.from('contact_messages').update({ status: 'read' }).eq('id', id)
  Update local state to reflect 'read' without re-fetching all.
  INSERT audit_log row: { event_type: 'content', description: `Message from ${name} marked as read` }

Step 4: Archive: supabase.from('contact_messages').update({ status: 'archived' }).eq('id', id)

Step 5: Delete: confirmation modal → supabase.from('contact_messages').delete().eq('id', id)
  Remove from local list state. Show toast "Message deleted."
  INSERT audit_log: { event_type: 'content', description: `Message from ${name} deleted` }

Step 6: Search — filter local state (client-side, since list is small).
```

---

## PROMPT 14 — Media Library (Cloudflare R2)

```
Build the Media Library — R2 file manager.
Tech stack: React + JSX, plain CSS, Supabase JS v2 (for auth), R2 presigned URLs.

COMPONENT: src/admin/media/MediaLibrary.jsx + MediaLibrary.css
ROUTE: /admin/media

━━━ UI LAYOUT ━━━
Page header: "Media Library" + [📤 Upload Files] button

Filters row: [All] [Images] [Videos] [Documents]  |  Search by filename  |  [⊞ Grid] [☰ List] toggle

UPLOAD ZONE:
  Large dashed drop zone at top (shows on clicking Upload button or drag-over):
  "Drop files here or click to browse"
  Accepts: .jpg, .jpeg, .png, .webp, .svg, .mp4, .pdf
  Multi-file support.
  Shows upload progress bar per file.
  After upload: adds files to the grid without full reload.

GRID VIEW (default): 4-column image grid
  Each cell: image preview (covers cell) + filename below (truncated) + file size
  Hover: overlay with [📋 Copy URL] and [🗑 Delete] icons

LIST VIEW: Table
  Columns: Thumbnail (40×40) | Filename | Type | Size | Uploaded date | Actions: [📋 Copy] [🗑 Delete]

DETAIL MODAL (on image click in grid):
  Full-size preview
  Filename, size, type, uploaded date
  R2 URL (readonly text input) + [📋 Copy URL] button
  [🗑 Delete File] button (red)

━━━ INTEGRATION STEPS ━━━
Step 1 (List files):
  Files are stored in the DB as records in a media_files table.
  Create this table: CREATE TABLE media_files (
    id uuid primary key default uuid_generate_v4(),
    filename text, r2_url text, file_type text, file_size int8, folder text, uploaded_at timestamp default now()
  )
  RLS: no public access, admin full CRUD.
  Fetch: supabase.from('media_files').select('*').order('uploaded_at', { ascending: false })

Step 2 (Upload flow):
  a. For each selected file:
     Request presigned URL from Edge Function:
       POST /generate-r2-presigned-url
       Body: { folder: detectFolder(file.type), filename: sanitize(file.name) }
     Edge Function returns: { presignedUrl, publicUrl }
  b. Upload: fetch(presignedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
  c. On success: INSERT into media_files table: { filename, r2_url: publicUrl, file_type, file_size, folder }
  d. Add new record to local state grid.
  e. Update progress bar to 100% then show green ✓.

Step 3 (Copy URL):
  navigator.clipboard.writeText(r2_url) → show brief "Copied!" tooltip.

Step 4 (Delete):
  Confirmation modal.
  Call Edge Function DELETE /delete-r2-file { key: r2ObjectKey } (extracts key from URL).
  Then: supabase.from('media_files').delete().eq('id', fileId)
  Remove from local state.

Step 5 (Search/Filter): client-side filtering on local state.
  filterByType: file_type.startsWith('image') | 'video' | 'application/pdf'

NOTE: The detectFolder helper:
  image types → 'general/'
  When used from a content picker (passed folder prop) → use that specific folder.
```

---

## PROMPT 15 — Site Settings (3 Tabs)

```
Build the Site Settings editor with 3 tabs.
Tech stack: React + JSX, plain CSS, Supabase JS v2.

COMPONENT: src/admin/settings/SiteSettings.jsx + SiteSettings.css
ROUTE: /admin/settings/contact  (and /social, /seo handled by same component with active tab)

Supabase table: site_config
Columns: id, key (unique text), value, updated_at

━━━ UI LAYOUT ━━━
Tab navigation: [📞 Contact Info] [🔗 Social Links] [🏷 SEO / Meta]
Top-right: [Save Settings] (blue, disabled until dirty)

━━━ TAB 1 — Contact Info ━━━
  Business Email: email input
  Phone Number: text input
  Physical Address: textarea (3 rows)
  Map Embed URL: URL input (for Google Maps iframe src)
  Keys used: contact_email, contact_phone, contact_address, contact_map_url

━━━ TAB 2 — Social Links ━━━
  Instagram URL: URL input + Instagram icon
  LinkedIn URL: URL input + LinkedIn icon
  Twitter/X URL: URL input
  Behance URL: URL input
  GitHub URL: URL input
  YouTube URL: URL input
  Keys used: instagram_url, linkedin_url, twitter_url, behance_url, github_url, youtube_url

━━━ TAB 3 — SEO / Meta ━━━
  Site Name: text input
  Default Meta Title: text input (max 60 chars, live counter)
  Default Meta Description: textarea (max 160 chars, live counter — green<120, yellow<140, red>140)
  Default OG Image: R2 upload → folder: 'og/images/' + preview
  
  Per-Page Meta table:
    Rows for each main page: Home / About / Projects / Services / Insights / Community
    Columns: Page Name | Meta Title (input) | Meta Description (input) | OG Image (picker)
    Keys pattern: seo_[page]_title, seo_[page]_description, seo_[page]_og_image

━━━ INTEGRATION STEPS ━━━
Step 1 (Load all settings):
  supabase.from('site_config').select('key, value')
  Build a map: { contact_email: '...', instagram_url: '...', ... }
  Populate all form inputs from map.

Step 2 (Save):
  Collect only the keys belonging to the active tab.
  For each changed key-value pair, upsert:
  supabase.from('site_config').upsert({ key, value, updated_at: new Date() }, { onConflict: 'key' })

  After all upserts complete: show "Settings saved" toast.
  Call invalidate-cache with relevant routes:
    Contact tab → ['/api/config']
    Social tab → ['/api/config']
    SEO tab → ['/', '/about', '/projects', '/services', '/insights', '/community']

Step 3 (OG image upload): R2 presigned URL flow → folder: 'og/images/'

Step 4 (Dirty tracking):
  Compare current form values to originally loaded values.
  Enable save only when at least one value has changed.
```

---

## PROMPT 16 — Security Center (5 Sub-pages)

```
Build the Security Center with 5 sub-sections.
Tech stack: React + JSX, plain CSS, Supabase JS v2.

COMPONENTS:
  src/admin/security/SecurityOverview.jsx
  src/admin/security/ActiveSessions.jsx
  src/admin/security/MFASettings.jsx
  src/admin/security/AuditLog.jsx
  src/admin/security/IPBlocklist.jsx

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPONENT A — SecurityOverview (/admin/security/overview):
  Security Score bar: fetch count from audit_log WHERE event_type='auth' AND result='failure' AND created_at > 24h ago.
  Compute score: 100 - (failed_logins * 5) - (mfa_disabled ? 20 : 0). Min 0.
  Show as a filled progress bar (green > 80, yellow > 50, red ≤ 50). Label "X/100".

  4 Status cards:
    Active Sessions: SELECT count FROM admin_sessions WHERE revoked_at IS NULL AND admin_id = currentUser.id
    Failed logins (24h): SELECT count FROM audit_log WHERE event_type='auth' AND result='failure' and created_at > now()-interval'24h'
    Last login: SELECT login_at FROM admin_sessions ORDER BY login_at DESC LIMIT 1
    MFA: SELECT mfa_enabled FROM admin_profiles WHERE id = currentUser.id

  Recent alerts panel: SELECT * FROM audit_log WHERE result='failure' ORDER BY created_at DESC LIMIT 5

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPONENT B — ActiveSessions (/admin/security/sessions):
  Load: supabase.from('admin_sessions')
    .select('*').eq('admin_id', currentUser.id).is('revoked_at', null)
    .order('login_at', { ascending: false })

  Table: ★(current) | Device | Browser | IP | Location | Last Active | [Revoke]
  Current session row has a green "Current" badge, no Revoke button.
  
  [Revoke All Other Sessions] button at top-right.

  REVOKE FLOW:
    Call Edge Function: POST /revoke-session { session_id: sessionRow.id, jwt_id: sessionRow.jwt_id }
    Edge Function: UPDATE admin_sessions SET revoked_at=now() + INSERT audit_log.
    On success: remove row from local state. Show toast "Session revoked."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPONENT C — MFASettings (/admin/security/mfa):
  Step 1: Check if MFA enrolled:
    const { data } = await supabase.auth.mfa.listFactors()
    If factors.totp.length > 0 → show "MFA Enabled" status + Disable button.
    If not → show QR setup flow.

  SETUP FLOW:
    Step 1: Call supabase.auth.mfa.enroll({ factorType: 'totp', issuer: 'AnthaTech Admin' })
    Display returned qrCode (base64 image) in an <img> tag.
    Display manual secret key for manual entry.
    Step 2: User enters 6-digit OTP to verify.
    Call: supabase.auth.mfa.challengeAndVerify({ factorId, code })
    On success: factor is enrolled. Update admin_profiles: SET mfa_enabled=true. Show success.

  BACKUP CODES section:
    Show 8 masked codes: "●●●●●●●●●●"
    [👁 Reveal Codes] → require password re-entry → fetch backup_codes from admin_profiles (store as jsonb).
    [🔄 Regenerate Codes] → generate 8 new random 10-char codes, hash them, store in admin_profiles.
    Show generated codes ONCE in a popup — admin must copy/download.

  DISABLE MFA:
    Require password confirmation → call supabase.auth.mfa.unenroll({ factorId })
    Update admin_profiles SET mfa_enabled=false.

  ENFORCE MFA FOR ALL ADMINS (Super Admin only):
    Toggle switch. Updates admin_profiles.mfa_enforced_by_super for all admin rows.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPONENT D — AuditLog (/admin/security/audit-log):
  Filters: Search input | Event type dropdown (All/auth/content/security/system) | Date range | User dropdown
  [⬇ Export CSV] button

  Table: Timestamp | Admin | Type badge (color-coded) | Description | Target | IP | Result (✅/❌)
  Pagination: 10 per page.

  LOAD: supabase.from('audit_log').select('*, admin_profiles(full_name)')
    .order('created_at', { ascending: false })
    .range(page*10, page*10+9)
    Apply filters via .eq() / .gte() / .lte() chaining.

  EXPORT CSV:
    Build CSV string from loaded (filtered) rows.
    Create a Blob + download link. trigger click. Download as "audit-log-YYYY-MM-DD.csv".

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPONENT E — IPBlocklist (/admin/security/ip-blocklist):
  Two sections:

  WHITELIST section:
    List of rows where is_whitelisted=true.
    [+ Add to Whitelist] → inline form: IP input + label + [Add] button.
    INSERT ip_blocklist { ip_address, reason: label, is_whitelisted: true, blocked_by: currentUser.id, blocked_at: now() }
    [✕ Remove] → DELETE row.

  BLOCKED IPs section:
    Table: IP | Reason | Blocked At | Expires | [Unblock] [Extend]
    Load: WHERE is_whitelisted=false ORDER BY blocked_at DESC

    [+ Block IP] button → modal: IP input + Reason + Expiry (optional datetime or "Permanent")
    INSERT ip_blocklist row with is_whitelisted=false.

    [Unblock] → DELETE ip_blocklist row. Show toast.
    [Extend] → UPDATE expires_at to +24h.
```

---

## PROMPT 17 — Analytics Dashboard

```
Build the Analytics Dashboard (read-only data visualization).
Tech stack: React + JSX, plain CSS, Cloudflare Analytics API, Supabase.

COMPONENTS:
  src/admin/analytics/AnalyticsTraffic.jsx
  src/admin/analytics/AnalyticsPerformance.jsx
ROUTES: /admin/analytics/traffic, /admin/analytics/performance

━━━ TRAFFIC PAGE ━━━
Period selector: [7 days] [30 days] [90 days] (default: 30 days)

Stats cards row (3 cards):
  Page Views | Unique Visitors | Bandwidth Served by Cloudflare
  Each: big number + trend arrow + % vs previous period.

Two-column row:
  LEFT — Top Pages table: URL | Views | % of total
  RIGHT — Top Countries bar list: Country flag + name + percentage bar + number

LOAD: Call Cloudflare Analytics GraphQL API from an Edge Function proxy
  (never expose CF API token to browser):
  POST /get-analytics-data { period: '30d' }
  Edge Function uses CF_ANALYTICS_API_TOKEN (stored as secret) to query:
  https://api.cloudflare.com/client/v4/graphql
  Return structured data to admin panel.
  Display received data. Show skeleton loaders while fetching.

━━━ PERFORMANCE PAGE ━━━
4 Progress bars with colour status:
  1. CF Cache Hit Rate (target > 80%) — from CF analytics API
  2. Error Rate (target < 1%) — from CF analytics API
  3. Supabase Bandwidth: SELECT pg_database_size(current_database()) (or read from Supabase dashboard API)
     Display: "340 MB / 2 GB" + percentage bar
     Color: green < 60%, yellow < 80%, red ≥ 80%
  4. R2 Storage: GET /get-r2-usage Edge Function (uses CF R2 API)
     Display: "1.8 GB / 10 GB (free tier)"

For Supabase and R2 metrics — implement as stubs initially:
  Return hardcoded values and add a comment: "// TODO: Wire to real API endpoint"
  The UI is fully built; values just need real data sources.

━━━ INTEGRATION NOTES ━━━
All CF API calls must go through a Supabase Edge Function to protect API tokens.
Edge Function: get-analytics-data
  - Accepts { metric: 'traffic' | 'performance', period: '7d' | '30d' | '90d' }
  - Returns normalized JSON matching what the React component expects.
  - Requires Authorization header with admin JWT (validate before calling CF API).
```

---

## PROMPT 18 — Maintenance Mode + Webhook Manager

```
Build the Maintenance Mode panel and Webhook Manager.
Tech stack: React + JSX, plain CSS, Supabase JS v2.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPONENT A — MaintenanceMode
src/admin/settings/MaintenanceMode.jsx + MaintenanceMode.css
ROUTE: /admin/settings/maintenance
(Super Admin only — check currentUser role from AuthContext. If not super_admin → show "Access Denied".)

UI:
  Warning banner: "⚠ This affects ALL public visitors"
  Status card showing current state (red "MAINTENANCE ACTIVE" or green "SITE LIVE").
  Big toggle switch: OFF / ON
  When ON: shows how long maintenance has been active.
  
  Fields (always editable, applied when active):
    Maintenance Title: text input (default: "We'll be back soon")
    Message: textarea
    Expected Back At: date + time picker
  
  Allowed IPs (bypass list):
    List of IPs with [✕ Remove]
    [+ Add IP] inline form
  
  [Test Maintenance Page] button (opens /maintenance-preview in new tab)
  [Save & Activate] or [Deactivate] button depending on current state.

INTEGRATION:
  Step 1: Load current state:
    supabase.from('site_config').select('key,value').in('key', ['maintenance_mode','maintenance_title','maintenance_message','maintenance_back_at','maintenance_allowed_ips'])
  
  Step 2: Toggle ON:
    Batch upsert all maintenance_* keys.
    INSERT audit_log { event_type: 'system', description: 'Maintenance mode activated' }
    INSERT notification { type: 'system', title: 'Maintenance mode is now active' }
    Call trigger-webhook Edge Function with event: 'maintenance_mode_on'
  
  Step 3: Toggle OFF:
    UPDATE site_config SET value='false' WHERE key='maintenance_mode'
    INSERT audit_log { description: 'Maintenance mode deactivated' }
  
  Step 4: Cloudflare Worker checks site_config for maintenance_mode on each request.
    (The Worker is pre-built — this admin panel just writes the DB value.)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPONENT B — WebhookManager
src/admin/settings/WebhookManager.jsx + WebhookManager.css
ROUTE: /admin/settings/webhooks

UI:
  Page header: "Webhooks" + [+ Add Webhook]
  
  Table: # | Name | Events badges | Last Trigger | Status toggle | [✏️ Edit] [▶ Test] [🗑 Delete]
  
  ADD/EDIT MODAL:
    Name: text input (required)
    Endpoint URL: URL input (required, must start https://)
    Secret Key: show masked (●●●) + [🔄 Regenerate] button (generates random 32-char secret)
    Events (checkboxes):
      ☐ new_contact_message
      ☐ new_community_application
      ☐ project_published
      ☐ blog_post_published
      ☐ maintenance_mode_on
      ☐ security_alert
    Status: ● Active  ○ Paused
    [Test Webhook →] button → calls Edge Function send-test-webhook { webhookId }
      Shows response code + latency in the modal.
    [Cancel] [Save Webhook]

INTEGRATION:
  Step 1: supabase.from('webhooks').select('id,name,events,status,last_triggered_at,last_result').order('created_at')
    Note: endpoint_url and secret_key are NOT selected (encrypted, never sent to browser unnecessarily).

  Step 2: Add: INSERT webhooks row (endpoint_url and secret_key sent only on write, handled by Edge Function for encryption).
    Call Edge Function: POST /create-webhook { name, endpoint_url, secret_key, events, status }
    Edge Function encrypts endpoint_url and secret_key before DB insert.

  Step 3: Test: POST /trigger-test-webhook { webhook_id }
    Edge Function decrypts URL, sends a sample payload with X-AnthaTech-Signature HMAC header.
    Returns { status_code, latency_ms, response_body } to display in modal.

  Step 4: DELETE: supabase.from('webhooks').delete().eq('id', id) + INSERT audit_log.
```

---

## PROMPT 19 — Backup & Export Center

```
Build the Backup & Export page.
Tech stack: React + JSX, plain CSS, Supabase JS v2.

COMPONENT: src/admin/backup/BackupCenter.jsx + BackupCenter.css
ROUTE: /admin/backup

━━━ UI LAYOUT ━━━
3 sections on the page:

SECTION 1 — Manual Export:
  [⬇ Export All Content as JSON] button
  [⬇ Export Media Index as CSV] button
  After export starts: show spinning progress indicator → on complete show download link.

SECTION 2 — Auto-Backup Schedule:
  Toggle: "Weekly auto-backup" ON/OFF  (stored in site_config key: backup_auto_enabled)
  Retain last N backups: dropdown [1] [2] [3] [4] [5]  (site_config: backup_retain_count)
  Next backup: calculated display "Sunday, [date] at 02:00 AM"
  Last backup status: "✅ [date] at 02:01 AM" + [⬇ Download] link (fetches latest from R2)
  [Save Schedule] button.

SECTION 3 — Restore from Backup:
  File dropzone: upload .json backup file.
  After file is selected: parse it client-side and show diff summary:
    "This will overwrite: X projects, X blog posts, X reviews, X services, X config keys"
  Confirmation: "Type RESTORE to confirm:" text input.
  [Restore Now] button — disabled until text input equals "RESTORE".
  Progress bar during restore.

━━━ INTEGRATION STEPS ━━━
Step 1 (Manual JSON export):
  Call Edge Function: POST /create-backup { type: 'manual' }
  Edge Function: SELECT all rows from all 12 content tables → serialize to JSON → upload to R2 → return signed download URL.
  Admin panel: window.open(signedUrl) to trigger download.

Step 2 (Media CSV export):
  Call Edge Function: POST /create-backup { type: 'media-csv' }
  or — select from media_files table and build CSV client-side:
  supabase.from('media_files').select('filename, r2_url, file_type, file_size, uploaded_at')
  Build CSV string → create Blob → download.

Step 3 (Auto-backup settings):
  supabase.from('site_config').upsert([
    { key: 'backup_auto_enabled', value: toggle ? 'true' : 'false' },
    { key: 'backup_retain_count', value: retainCount.toString() }
  ], { onConflict: 'key' })
  Show "Schedule saved" toast.

Step 4 (Last backup status):
  supabase.from('site_config').select('value').eq('key', 'backup_last_run_at').single()
  Display the value. For [Download]: POST /get-latest-backup-url → Edge Function returns signed R2 URL.

Step 5 (Restore):
  Parse uploaded JSON. Count items per table. Show diff.
  On confirm: POST /restore-backup { json: parsedContent }
  Edge Function: validate schema → run DELETE+INSERT per table in a transaction.
  On complete: call invalidate-cache for ALL routes. Show "Restore complete" full-page success message.
  INSERT audit_log { event_type: 'system', description: 'Full site restore performed from backup file' }
```

---

## PROMPT 20 — API Key Manager

```
Build the API Key Manager.
Tech stack: React + JSX, plain CSS, Supabase JS v2.

COMPONENT: src/admin/apikeys/APIKeyManager.jsx + APIKeyManager.css
ROUTE: /admin/api-keys

Create a new table: api_keys
Columns: id uuid pk, name text, service_type text, encrypted_value text,
         last_used_at timestamp, created_at timestamp, status text ('active'|'revoked'), added_by uuid

RLS: No public access. Admin: SELECT (encrypted_value NOT returned in normal select), INSERT, UPDATE.

━━━ UI LAYOUT ━━━
Page header: "API Keys" + [+ Add API Key]

Table: # | Name | Service badge | Last Used | Created | Status | [👁 Reveal] [🚫 Revoke]

ADD KEY MODAL:
  Name: text input (e.g. "Resend Production")
  Service Type: dropdown (Email / Analytics / Storage / Other)
  API Key Value: password-type input (value is visible while typing)
  [Save API Key] — stores encrypted via Edge Function.

REVEAL MODAL:
  "🔒 Re-enter your password to reveal this key"
  Password input → [Confirm]
  On success: shows masked key "rse_••••••••Ab3x" + [👁 Toggle Reveal] + [📋 Copy] + [Revoke]
  Auto-masks after 30 seconds. Shows countdown.

━━━ INTEGRATION STEPS ━━━
Step 1 (List):
  supabase.from('api_keys').select('id, name, service_type, last_used_at, created_at, status')
  (Never select encrypted_value in normal list query)

Step 2 (Add):
  Call Edge Function: POST /store-api-key { name, service_type, value }
  Edge Function: encrypts value with AES-256 using server-side secret → INSERT into api_keys.
  INSERT audit_log { event_type: 'security', description: `API key '${name}' added` }

Step 3 (Reveal):
  Re-authenticate: supabase.auth.signInWithPassword({ email: currentUser.email, password: enteredPassword })
  If auth success: POST /reveal-api-key { key_id }
  Edge Function: SELECT encrypted_value → decrypt → return plaintext (single-use response).
  INSERT audit_log { event_type: 'security', description: `API key '${name}' revealed` }

Step 4 (Revoke):
  supabase.from('api_keys').update({ status: 'revoked' }).eq('id', id)
  INSERT audit_log { event_type: 'security', description: `API key '${name}' revoked` }
```

---

## PROMPT 21 — Admin Users Management

```
Build the Admin Users management page.
Tech stack: React + JSX, plain CSS, Supabase JS v2.

COMPONENT: src/admin/users/AdminUsers.jsx + AdminUsers.css
ROUTE: /admin/users
Access control: Only 'super_admin' role can edit. Other roles see read-only view.
  Check in component: if (userRole !== 'super_admin') → render read-only table, hide action buttons.

Supabase tables: admin_profiles (id, role, full_name, mfa_enabled, mfa_enforced_by_super)
                 + auth.users (not directly queryable — use admin_profiles joined data)

━━━ UI LAYOUT ━━━
Header: "Admin Users" + [+ Invite New Admin] (super_admin only)

Table: # | Avatar circle (initials) | Full Name | Email | Role badge | MFA status | Last Login | Status | Actions

Role badges: Super Admin (purple) / Admin (blue) / Editor (grey)
MFA: ✅ Enabled or ⚠ Disabled
Status: ● Active or ● Suspended
Actions (super_admin only): [✏️ Edit Role] [🚫 Suspend / ✅ Restore] [🗑 Remove]

INVITE MODAL:
  Full Name: text input
  Email: email input
  Role: dropdown [Admin | Editor] (cannot invite another super_admin from here)
  [Send Invite] — triggers Supabase invite email.

EDIT ROLE MODAL:
  Shows current name + email (read-only).
  Role: dropdown. Change and save.

━━━ INTEGRATION STEPS ━━━
Step 1 (List):
  supabase.from('admin_profiles').select('id, role, full_name, mfa_enabled')
  For email and last login: join auth.users — use service role Edge Function for this since auth.users requires service role.
  OR: store email in admin_profiles on signup.

Step 2 (Invite):
  Call Edge Function: POST /invite-admin { email, full_name, role }
  Edge Function uses service role:
    supabase.auth.admin.inviteUserByEmail(email, { data: { full_name, role } })
  On signup, a database trigger creates the admin_profiles row with the passed role.
  INSERT audit_log { event_type: 'security', description: `Admin invited: ${email}` }

Step 3 (Edit role):
  supabase.from('admin_profiles').update({ role }).eq('id', userId)
  INSERT audit_log { event_type: 'security', description: `Role changed: ${name} → ${newRole}` }

Step 4 (Suspend):
  Call Edge Function: POST /toggle-admin-status { user_id, action: 'disable' | 'enable' }
  Edge Function: supabase.auth.admin.updateUserById(userId, { ban_duration: 'none' | '87600h' })
  INSERT audit_log.

Step 5 (Remove):
  Confirmation modal. Call Edge Function: POST /remove-admin { user_id }
  Edge Function: supabase.auth.admin.deleteUser(userId) + DELETE admin_profiles WHERE id=userId.
  Cannot remove your own account (check currentUser.id !== targetUserId).
```

---

## PROMPT 22 — Version History Drawer

```
Build the Version History drawer — used inside any content editor.
Tech stack: React + JSX, plain CSS, Supabase JS v2.

COMPONENT: src/admin/shared/VersionHistoryDrawer.jsx + VersionHistoryDrawer.css
(This is a shared component, imported into ProjectForm, BlogForm, ServiceForm, etc.)

Props:
  isOpen: boolean
  onClose: () => void
  tableName: string  (e.g. 'projects', 'blog_posts')
  recordId: uuid
  onRestoreSuccess: () => void  (callback to reload the parent form)

Supabase table: content_history
Columns: id, table_name, record_id, snapshot_data (jsonb), version_number, saved_by, saved_at, change_summary

━━━ UI LAYOUT ━━━
Slides in from the RIGHT side of the editor (380px wide), overlays the editor.
Close button [✕] at top-right.
Header: "Version History" + record title (passed via snapshot_data.title).

For each version (scrollable list):
  Version number badge (v7, v6...)
  Admin avatar (from saved_by) + "by [name]" + relative timestamp
  Change summary text (if present) in grey italic
  [Preview] button → opens preview in new tab with token
  [Restore This Version] button (hidden on v1 = current/latest)
  Current version has a "Current" badge, no Restore button.

At bottom: "Showing X of Y saved versions" + [Load More]

━━━ INTEGRATION STEPS ━━━
Step 1 (Load history):
  supabase.from('content_history')
    .select('id, version_number, saved_by, saved_at, change_summary, snapshot_data->title')
    .eq('table_name', tableName)
    .eq('record_id', recordId)
    .order('version_number', { ascending: false })
    .limit(10)

Step 2 (Preview):
  Call Edge Function: POST /generate-preview-token { snapshot_data: version.snapshot_data, table_name: tableName }
  Edge Function returns { previewToken, previewUrl }
  window.open(previewUrl + '?preview_token=' + previewToken)

Step 3 (Restore):
  Confirmation modal: "Restore v[N]? Current state will be saved as v[N+1]."
  [Confirm Restore]
  a. First call POST /save-version-snapshot { table_name, record_id } (saves current state)
  b. Then: supabase.from(tableName).update(version.snapshot_data).eq('id', recordId)
  c. Call invalidate-cache for affected routes.
  d. INSERT audit_log { event_type: 'content', description: `Restored ${tableName} to v${version.version_number}` }
  e. Call props.onRestoreSuccess() — parent form re-fetches and shows restored data.
  f. Close drawer. Show "Content restored to version [N]" toast.

Step 4 (Load more):
  Use .range(offset, offset+9) pagination. Append results to list on button click.
```

---

## PROMPT 23 — Notification Center

```
Build the Notification Center — topbar bell + full notification page.
Tech stack: React + JSX, plain CSS, Supabase JS v2.

COMPONENTS:
  src/admin/shared/NotificationBell.jsx (topbar component — shows bell + badge)
  src/admin/shared/NotificationDropdown.jsx (dropdown panel on bell click)

Supabase table: notifications
Columns: id, type ('message'|'application'|'security'|'backup'|'system'),
         title, body, link, is_read, created_at

━━━ NOTIFICATION BELL (in Topbar) ━━━
Shows: 🔔 icon + red badge with unread count.
If count = 0, no badge shown.
Clicking toggles the dropdown panel.

━━━ NOTIFICATION DROPDOWN ━━━
Width: 400px, max-height: 500px, scrollable.
Header: "Notifications" + [Mark All Read] button.
Divider line.

Each notification row (~70px tall):
  Left: type icon (📬 message | 👥 application | 🔴 security | ✅ system | 💾 backup)
  Center: title (bold if unread) + body text (1 line truncated) + relative time
  Right: [Dismiss ×] button
  Unread rows have a light blue background tint.
  Clicking a row → navigate to link + mark as read.

Footer: [View All Notifications →] link → /admin/notifications (full page list)
If empty: "All caught up! No notifications." with a ✅ icon.

━━━ INTEGRATION STEPS ━━━
Step 1 (Load unread count on mount):
  supabase.from('notifications').select('id', { count: 'exact' }).eq('is_read', false)
  Store count in context (NotificationContext) so topbar bell always reflects current count.

Step 2 (Load notification list for dropdown):
  supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(8)

Step 3 (Real-time updates):
  supabase.channel('admin-notifications').on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'notifications' },
    (payload) => {
      prepend payload.new to list
      increment unread count in context
    }
  ).subscribe()

Step 4 (Mark as read — single):
  On row click: supabase.from('notifications').update({ is_read: true }).eq('id', id)
  Decrement unread count in context.

Step 5 (Mark all as read):
  supabase.from('notifications').update({ is_read: true }).eq('is_read', false)
  Reset count to 0 in context. Refresh list.

Step 6 (Dismiss):
  supabase.from('notifications').delete().eq('id', id)
  Remove from local list. Decrement count if it was unread.
```

---

## PROMPT 24 — Content Preview Feature

```
Build the Content Preview feature — draft preview via signed token.
Tech stack: React + JSX, plain CSS, Supabase JS v2.

This consists of two parts:
  A) PreviewButton component in the editor toolbar
  B) Public website preview page that validates the token

━━━ PART A — PreviewButton (Admin Panel) ━━━
COMPONENT: src/admin/shared/PreviewButton.jsx

Props:
  tableName: string
  recordId: uuid
  currentFormData: object (the unsaved current form state to preview)

UI:
  Dropdown button: [Preview ▾]
  Opens a small dropdown menu:
    🖥 Desktop (1440px)
    📟 Tablet (768px)
    📱 Mobile (390px)

On menu item click:
  const res = await fetch(`${VITE_EDGE_FN_URL}/generate-preview-token`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ table_name: tableName, snapshot_data: currentFormData })
  })
  const { previewToken, previewUrl } = await res.json()
  window.open(`${previewUrl}?preview_token=${previewToken}&breakpoint=${selectedBreakpoint}`)
  Show a small tooltip in admin: "Preview token expires in 15 min"

Edge Function: generate-preview-token
  - Validate admin JWT.
  - Create a signed JWT using SUPABASE_JWT_SECRET:
    Payload: { snapshot_data, table_name, exp: now + 15*60 }
  - Return { previewToken, previewUrl: 'https://www.anthatech.com/preview' }

━━━ PART B — Public Website Preview Handler ━━━
This is added to the public website (not admin panel).

In the public site's router, add a catch-all or specific route that checks
for ?preview_token in the URL.

In each page component (ProjectDetailsPage, BlogPostPage, etc.):
  const previewToken = new URLSearchParams(window.location.search).get('preview_token')
  if (previewToken) {
    // Validate token via Edge Function: POST /validate-preview-token { token: previewToken }
    // Edge Function verifies JWT signature and returns { snapshot_data, table_name }
    // Use snapshot_data as the page data instead of regular DB fetch
    // Show a "PREVIEW MODE" banner at top of page
  } else {
    // Normal fetch from Supabase/cache
  }

Token expiry: if token is expired (Edge Function returns 403), show:
  A centered error message: "Preview expired — go back to admin and generate a new preview."
```

---

## PROMPT 25 — Shared UX Components

```
Build 4 shared UI components used across the entire admin panel.
Tech stack: React + JSX, plain CSS.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPONENT 1 — Toast notification system
src/admin/shared/Toast.jsx + Toast.css
src/admin/shared/ToastContext.jsx

ToastContext: provides showToast(message, type) function
  type: 'success' | 'error' | 'warning' | 'info'
  Stores array of active toasts in state.

Toast component: renders at fixed bottom-right.
Each toast: colored left border (green/red/yellow/blue) + icon + message + ✕ dismiss button.
Auto-dismiss: success after 3s, error stays until dismissed.
Animate in from right (slide + fade). Animate out on dismiss.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPONENT 2 — Confirmation Modal
src/admin/shared/ConfirmModal.jsx + ConfirmModal.css

Props: isOpen, onClose, onConfirm, title, message, confirmLabel, variant ('danger'|'warning')
Optionally: requireTyping (string) — if provided, show text input that must match before confirm button enables.

Shows:
  Backdrop overlay (semi-transparent)
  Centered modal: icon (⚠/🗑 based on variant) + title + message + optional type-to-confirm input
  [Cancel] (grey) + [Confirm] (red if danger, yellow if warning)
  Press Escape to dismiss.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPONENT 3 — Skeleton Loader
src/admin/shared/Skeleton.jsx + Skeleton.css

Props: variant ('text'|'card'|'table-row'|'image'), count (number of items)
Renders animated shimmer placeholders.
text: grey rounded rectangle, full width, 16px tall.
card: grey rectangle with rounded corners.
table-row: 6 columns, alternating widths.
image: square grey block.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPONENT 4 — Empty State
src/admin/shared/EmptyState.jsx + EmptyState.css

Props: icon (emoji), title, description, actionLabel, onAction

Renders centered in parent container:
  Large emoji icon (48px)
  Title (h3, 20px bold)
  Description (p, 14px grey)
  Optional CTA button (blue) with onAction callback.

Examples used throughout:
  Projects table empty: "📂", "No projects yet", "Add your first project →"
  Messages empty: "📬", "No messages yet", "Your inbox is empty"
  Audit log empty: "🔍", "No activity found", "Try adjusting your filters"
```

---

## PROMPT 26 — App Router Setup (Putting It All Together)

```
Wire all pages together in the React Router v6 router.
Tech stack: React JSX, React Router v6.

Update src/main.jsx (or App.jsx) to define all routes:

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './admin/shared/ToastContext'
import { NotificationProvider } from './admin/shared/NotificationContext'

All /admin routes are wrapped in:
  <AuthProvider>
    <ToastProvider>
      <NotificationProvider>
        <Routes>
          <!-- Public -->
          <Route path="/admin/login" element={<LoginPage />} />
          
          <!-- Protected: all admin pages wrapped in AdminLayout via ProtectedRoute -->
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              
              <!-- Security -->
              <Route path="/admin/security/overview" element={<SecurityOverview />} />
              <Route path="/admin/security/sessions" element={<ActiveSessions />} />
              <Route path="/admin/security/mfa" element={<MFASettings />} />
              <Route path="/admin/security/audit-log" element={<AuditLog />} />
              <Route path="/admin/security/ip-blocklist" element={<IPBlocklist />} />
              
              <!-- Content -->
              <Route path="/admin/content/hero" element={<HeroEditor />} />
              <Route path="/admin/content/about" element={<AboutEditor />} />
              <Route path="/admin/content/projects" element={<ProjectsTable />} />
              <Route path="/admin/content/projects/new" element={<ProjectForm />} />
              <Route path="/admin/content/projects/:id" element={<ProjectForm />} />
              <Route path="/admin/content/services" element={<ServicesTable />} />
              <Route path="/admin/content/services/new" element={<ServiceForm />} />
              <Route path="/admin/content/services/:id" element={<ServiceForm />} />
              <Route path="/admin/content/highlights" element={<HighlightsEditor />} />
              <Route path="/admin/content/process" element={<ProcessEditor />} />
              <Route path="/admin/content/reviews" element={<ReviewsTable />} />
              <Route path="/admin/content/community" element={<CommunityManager />} />
              <Route path="/admin/content/blog" element={<BlogTable />} />
              <Route path="/admin/content/blog/new" element={<BlogForm />} />
              <Route path="/admin/content/blog/:id" element={<BlogForm />} />
              
              <!-- Other sections -->
              <Route path="/admin/messages" element={<MessagesInbox />} />
              <Route path="/admin/media" element={<MediaLibrary />} />
              <Route path="/admin/analytics/traffic" element={<AnalyticsTraffic />} />
              <Route path="/admin/analytics/performance" element={<AnalyticsPerformance />} />
              <Route path="/admin/settings/contact" element={<SiteSettings defaultTab="contact" />} />
              <Route path="/admin/settings/social" element={<SiteSettings defaultTab="social" />} />
              <Route path="/admin/settings/seo" element={<SiteSettings defaultTab="seo" />} />
              <Route path="/admin/settings/maintenance" element={<MaintenanceMode />} />
              <Route path="/admin/settings/webhooks" element={<WebhookManager />} />
              <Route path="/admin/api-keys" element={<APIKeyManager />} />
              <Route path="/admin/backup" element={<BackupCenter />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              
              <!-- Default redirect -->
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
          </Route>
          
          <!-- Catch-all -->
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </NotificationProvider>
    </ToastProvider>
  </AuthProvider>

ProtectedRoute component:
  import { useAuth } from '../context/AuthContext'
  const { currentUser, isLoading } = useAuth()
  if (isLoading) return <FullPageSpinner />
  if (!currentUser) return <Navigate to="/admin/login" replace />
  return <Outlet />

━━━ INTEGRATION STEPS ━━━
Step 1: Create src/context/NotificationContext.jsx
  Provides: unreadCount, refreshCount()
  On mount: fetch count from notifications table.
  Exposes setUnreadCount for real-time updates.

Step 2: Install react-router-dom if not already: npm install react-router-dom

Step 3: Create src/admin/shared/FullPageSpinner.jsx
  Renders a full-viewport centered loading spinner for the ProtectedRoute loading state.

Step 4: Make sure each lazy-loadable page uses React.lazy + Suspense for code splitting:
  const Dashboard = React.lazy(() => import('./admin/dashboard/Dashboard'))
  Wrap entire <Routes> in: <Suspense fallback={<FullPageSpinner />}>
```

---

## PROMPT 27 — Supabase Database Setup (SQL)

```
Run these SQL commands in the Supabase SQL Editor to create all necessary tables.
Execute them in the order shown — each section is independently runnable.

━━━ STEP 1 — Enable UUID extension ━━━
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

━━━ STEP 2 — Content tables ━━━

CREATE TABLE site_config (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key text UNIQUE NOT NULL,
  value text,
  updated_at timestamp DEFAULT now()
);

CREATE TABLE hero_content (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  badge_text text,
  title_line_1 text,
  title_line_2 text,
  subtitle_1 text,
  subtitle_2 text,
  cta_primary_text text,
  cta_primary_route text,
  cta_secondary_text text,
  client_logos jsonb DEFAULT '[]',
  updated_at timestamp DEFAULT now()
);
INSERT INTO hero_content (badge_text) VALUES ('Development agency');

CREATE TABLE about_content (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  section text NOT NULL,
  logo_url text,
  paragraph_1 jsonb DEFAULT '[]',
  paragraph_2 jsonb DEFAULT '[]',
  btn_primary text,
  btn_secondary text,
  badge_text text,
  title_1 text,
  title_2 text,
  stats jsonb DEFAULT '[]',
  updated_at timestamp DEFAULT now()
);
INSERT INTO about_content (section) VALUES ('about1'), ('about2');

CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  category_pill text,
  cover_image_url text,
  hero_description text,
  challenges jsonb DEFAULT '[]',
  gallery_urls jsonb DEFAULT '[]',
  solutions jsonb DEFAULT '[]',
  review_quote text,
  review_author text,
  review_role text,
  review_company text,
  review_avatar_url text,
  related_project_slugs jsonb DEFAULT '[]',
  status text DEFAULT 'draft' CHECK (status IN ('published','draft','scheduled')),
  publish_at timestamp,
  display_order int2 DEFAULT 0,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  short_description text,
  tags jsonb DEFAULT '[]',
  theme text,
  hero_bg_color text,
  graphic_url text,
  offers jsonb DEFAULT '[]',
  process_steps jsonb DEFAULT '[]',
  benefits jsonb DEFAULT '[]',
  status text DEFAULT 'draft' CHECK (status IN ('published','draft')),
  display_order int2 DEFAULT 0,
  updated_at timestamp DEFAULT now()
);

CREATE TABLE highlights_content (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  header_rich_text jsonb DEFAULT '[]',
  items jsonb DEFAULT '[]',
  updated_at timestamp DEFAULT now()
);
INSERT INTO highlights_content DEFAULT VALUES;

CREATE TABLE process_steps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  badge_text text,
  title_1 text,
  title_2 text,
  cta_text text,
  steps jsonb DEFAULT '[]',
  updated_at timestamp DEFAULT now()
);
INSERT INTO process_steps DEFAULT VALUES;

CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote text,
  author_name text,
  author_role text,
  company text,
  avatar_url text,
  status text DEFAULT 'active' CHECK (status IN ('active','inactive')),
  display_order int2 DEFAULT 0,
  created_at timestamp DEFAULT now()
);

CREATE TABLE community_content (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  section text NOT NULL,
  title_1 text, title_2 text, description text, cta_text text,
  tracks jsonb DEFAULT '[]',
  stats jsonb DEFAULT '[]',
  steps jsonb DEFAULT '[]',
  perks jsonb DEFAULT '[]',
  updated_at timestamp DEFAULT now()
);
INSERT INTO community_content (section) VALUES ('teaser'), ('how_it_works'), ('perks');

CREATE TABLE community_applications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name text NOT NULL,
  email text NOT NULL,
  track text,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  applied_at timestamp DEFAULT now()
);

CREATE TABLE blog_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  cover_image_url text,
  date_label text,
  short_description text,
  full_content text,
  tags jsonb DEFAULT '[]',
  link text,
  status text DEFAULT 'draft' CHECK (status IN ('published','draft','scheduled')),
  publish_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE contact_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_name text NOT NULL,
  sender_email text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new','read','archived')),
  received_at timestamp DEFAULT now()
);

CREATE TABLE media_files (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename text NOT NULL,
  r2_url text NOT NULL,
  file_type text,
  file_size int8,
  folder text,
  uploaded_at timestamp DEFAULT now()
);

━━━ STEP 3 — Security & system tables ━━━

CREATE TABLE admin_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'editor' CHECK (role IN ('super_admin','admin','editor')),
  full_name text,
  mfa_enabled boolean DEFAULT false,
  mfa_enforced_by_super boolean DEFAULT false,
  password_last_changed timestamp DEFAULT now(),
  min_password_age_days int2 DEFAULT 0,
  require_uppercase boolean DEFAULT true,
  require_number boolean DEFAULT true,
  require_special boolean DEFAULT true,
  min_length int2 DEFAULT 12
);

CREATE TABLE admin_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id uuid REFERENCES auth.users(id),
  device text, browser text, os text,
  ip_address text, location text,
  login_at timestamp DEFAULT now(),
  last_active timestamp DEFAULT now(),
  is_current boolean DEFAULT true,
  jwt_id text,
  revoked_at timestamp
);

CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id uuid REFERENCES auth.users(id),
  event_type text CHECK (event_type IN ('auth','content','security','system')),
  description text NOT NULL,
  target_table text,
  target_id uuid,
  ip_address text,
  user_agent text,
  result text DEFAULT 'success' CHECK (result IN ('success','failure')),
  created_at timestamp DEFAULT now()
);

CREATE TABLE ip_blocklist (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address text NOT NULL,
  reason text,
  is_whitelisted boolean DEFAULT false,
  blocked_by uuid REFERENCES auth.users(id),
  blocked_at timestamp DEFAULT now(),
  expires_at timestamp
);

CREATE TABLE content_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  snapshot_data jsonb NOT NULL,
  version_number int2 NOT NULL,
  saved_by uuid REFERENCES auth.users(id),
  saved_at timestamp DEFAULT now(),
  change_summary text
);

CREATE TABLE webhooks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  endpoint_url text NOT NULL,
  secret_key text NOT NULL,
  events jsonb DEFAULT '[]',
  status text DEFAULT 'active' CHECK (status IN ('active','paused')),
  last_triggered_at timestamp,
  last_result text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text CHECK (type IN ('message','application','security','backup','system')),
  title text NOT NULL,
  body text,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

CREATE TABLE api_keys (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  service_type text,
  encrypted_value text NOT NULL,
  last_used_at timestamp,
  created_at timestamp DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active','revoked')),
  added_by uuid REFERENCES auth.users(id)
);

━━━ STEP 4 — Row Level Security ━━━
-- Enable RLS on all tables
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_blocklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Public read policies (content tables)
CREATE POLICY "public_read_hero" ON hero_content FOR SELECT USING (true);
CREATE POLICY "public_read_about" ON about_content FOR SELECT USING (true);
CREATE POLICY "public_read_projects" ON projects FOR SELECT USING (status = 'published');
CREATE POLICY "public_read_services" ON services FOR SELECT USING (status = 'published');
CREATE POLICY "public_read_highlights" ON highlights_content FOR SELECT USING (true);
CREATE POLICY "public_read_process" ON process_steps FOR SELECT USING (true);
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT USING (status = 'active');
CREATE POLICY "public_read_community" ON community_content FOR SELECT USING (true);
CREATE POLICY "public_read_blog" ON blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "public_read_config" ON site_config FOR SELECT USING (true);

-- Public write policies (forms)
CREATE POLICY "public_insert_contact" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_apply" ON community_applications FOR INSERT WITH CHECK (true);

-- Admin full access policies (all tables)
CREATE POLICY "admin_all_hero" ON hero_content FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_about" ON about_content FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_projects" ON projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_services" ON services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_highlights" ON highlights_content FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_process" ON process_steps FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_reviews" ON reviews FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_community" ON community_content FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_applications" ON community_applications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_blog" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_messages" ON contact_messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_config" ON site_config FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_media" ON media_files FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_profiles" ON admin_profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_sessions" ON admin_sessions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_auditlog" ON audit_log FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_ipblocklist" ON ip_blocklist FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_history" ON content_history FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_webhooks" ON webhooks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_notifications" ON notifications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_apikeys" ON api_keys FOR ALL USING (auth.role() = 'authenticated');
```

---

## PROMPT 28 — Supabase Edge Functions Setup

```
Create the core Supabase Edge Functions. Each function lives in:
supabase/functions/[function-name]/index.ts

Deploy with: supabase functions deploy [function-name]

━━━ FUNCTION 1 — generate-r2-presigned-url ━━━
File: supabase/functions/generate-r2-presigned-url/index.ts

import { serve } from "https://deno.land/std/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js"
import { AwsClient } from "https://esm.sh/aws4fetch"

serve(async (req) => {
  // 1. Validate admin JWT from Authorization header
  // 2. Parse body: { folder, filename }
  // 3. Create AWS-compatible client with R2 credentials from env:
  //    R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME
  // 4. Generate presigned PUT URL valid for 5 minutes
  // 5. Return { presignedUrl, publicUrl }
  // publicUrl = `${Deno.env.get('R2_PUBLIC_URL')}/${folder}${filename}`
})

Environment variables needed (add in Supabase Dashboard → Edge Functions → Secrets):
  R2_ACCOUNT_ID
  R2_ACCESS_KEY_ID
  R2_SECRET_ACCESS_KEY
  R2_BUCKET_NAME
  R2_PUBLIC_URL  (your R2 public domain)

━━━ FUNCTION 2 — invalidate-cache ━━━
File: supabase/functions/invalidate-cache/index.ts

serve(async (req) => {
  // 1. Validate admin JWT
  // 2. Parse body: { routes: ['/api/hero', '/'] }
  // 3. Call Cloudflare Cache Purge API:
  //    POST https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache
  //    Authorization: Bearer {CF_CACHE_PURGE_KEY}
  //    Body: { files: routes.map(r => `https://www.anthatech.com${r}`) }
  // 4. Return { success: true }
})

Env vars: CF_CACHE_PURGE_KEY, CF_ZONE_ID

━━━ FUNCTION 3 — send-contact-notification ━━━
File: supabase/functions/send-contact-notification/index.ts

serve(async (req) => {
  // 1. Parse body: { sender_name, sender_email, message_preview }
  // 2. Use Resend API to send email to admin:
  //    POST https://api.resend.com/emails
  //    Authorization: Bearer {RESEND_API_KEY}
  //    Body: { from: 'noreply@anthatech.com', to: ADMIN_EMAIL,
  //            subject: `New message from ${sender_name}`,
  //            html: template }
  // 3. INSERT into notifications: { type:'message', title:`New message from ${sender_name}`, link:'/admin/messages' }
  // 4. Return { success }
})

Env vars: RESEND_API_KEY, ADMIN_EMAIL

━━━ FUNCTION 4 — scheduled-publish-cron ━━━
File: supabase/functions/scheduled-publish-cron/index.ts
(This runs on a cron — configure in Supabase Dashboard → Database → Cron Jobs → every 15 minutes)

serve(async (req) => {
  // Use service role client (not anon)
  const supabase = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
  
  const now = new Date().toISOString()
  
  // 1. Find and publish scheduled projects
  const { data: projects } = await supabase.from('projects')
    .update({ status: 'published', publish_at: null })
    .eq('status', 'scheduled')
    .lte('publish_at', now)
    .select('id, slug, title')
  
  // 2. Find and publish scheduled blog posts
  const { data: posts } = await supabase.from('blog_posts')
    .update({ status: 'published', publish_at: null })
    .eq('status', 'scheduled')
    .lte('publish_at', now)
    .select('id, slug, title')
  
  // 3. For each published item: invalidate cache + insert notification
  for (const item of [...(projects||[]), ...(posts||[])]) {
    // Call invalidate-cache internally
    // INSERT notification: { type:'system', title:`"${item.title}" is now live`, link: ... }
  }
})

━━━ FUNCTION 5 — save-version-snapshot ━━━
File: supabase/functions/save-version-snapshot/index.ts

serve(async (req) => {
  // 1. Validate admin JWT
  // 2. Parse body: { table_name, record_id }
  // 3. SELECT * from table_name WHERE id = record_id
  // 4. Get current max version_number for this record:
  //    SELECT max(version_number) FROM content_history WHERE table_name=x AND record_id=y
  // 5. INSERT content_history: { table_name, record_id, snapshot_data, version_number: max+1, saved_by }
  // 6. If version_number > 20: DELETE oldest entry for this record (keep last 20)
})
```

---

## BUILD ORDER (Recommended Sequence)

```
Phase 1 — Foundation (do FIRST)
  ✅ Prompt 27 — Run all SQL in Supabase
  ✅ Prompt 01 — Project setup + Supabase client
  ✅ Prompt 03 — Login Page (need auth before anything else)
  ✅ Prompt 02 — Global Shell
  ✅ Prompt 25 — Shared components (Toast, Modal, Skeleton)
  ✅ Prompt 26 — Router setup

Phase 2 — Core Content
  ✅ Prompt 04 — Dashboard
  ✅ Prompt 05 — Hero Editor
  ✅ Prompt 06 — About Editor
  ✅ Prompt 07 — Projects Manager ← most complex, build early
  ✅ Prompt 08 — Services Manager
  ✅ Prompt 09 — Highlights + Process
  ✅ Prompt 10 — Reviews
  ✅ Prompt 11 — Community
  ✅ Prompt 12 — Blog Manager

Phase 3 — Operations
  ✅ Prompt 13 — Messages Inbox
  ✅ Prompt 14 — Media Library
  ✅ Prompt 15 — Site Settings

Phase 4 — Advanced Features
  ✅ Prompt 22 — Version History Drawer
  ✅ Prompt 23 — Notification Center
  ✅ Prompt 24 — Content Preview
  ✅ Prompt 16 — Security Center
  ✅ Prompt 17 — Analytics
  ✅ Prompt 18 — Maintenance + Webhooks
  ✅ Prompt 19 — Backup
  ✅ Prompt 20 — API Keys
  ✅ Prompt 21 — Admin Users

Phase 5 — Backend
  ✅ Prompt 28 — Edge Functions (deploy in parallel with Phase 2-4)
```
