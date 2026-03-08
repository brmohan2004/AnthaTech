# Admin Panel — Layout Diagrams
### Page-by-Page & Section-by-Section

---

## LEGEND

```
[ ]   = Button
{ }   = Input / Form Field
| |   = Divider / Border
[===] = Image / Media
[~~~] = Skeleton loader / placeholder
■     = Filled area / Panel
░     = Muted / secondary area
★     = Active / selected state
↕     = Draggable / reorderable
```

---

## 0. GLOBAL SHELL

```
┌─────────────────────────────────────────────────────────────────────────┐
│ TOPBAR                                                                   │
│  [🔵 AnthaTech Logo]  |ADMIN|  ←Page Title→   ☀/🌙  🔔³  [AB ▾ Admin]  │
│                                               (dark)  (notifs)          │
├────────────────┬────────────────────────────────────────────────────────┤
│ SIDEBAR        │  MAIN CONTENT AREA                                      │
│                │                                                         │
│ ★ Dashboard    │  Breadcrumb: Dashboard > Section                        │
│                │  ─────────────────────────────────                      │
│ 🔐 Security 🔴 │  [ Page-specific content renders here ]                 │
│  ├ Overview    │                                                         │
│  ├ Sessions    │                                                         │
│  ├ MFA         │                                                         │
│  ├ Passwords   │                                                         │
│  ├ IP Blocklist│                                                         │
│  ├ Audit Log   │                                                         │
│  └ Alerts      │                                                         │
│                │                                                         │
│ 📁 Content     │                                                         │
│  ├ Hero        │                                                         │
│  ├ About       │                                                         │
│  ├ Projects    │                                                         │
│  ├ Services    │                                                         │
│  ├ Highlights  │                                                         │
│  ├ Process     │                                                         │
│  ├ Reviews     │                                                         │
│  ├ Community   │                                                         │
│  └ Blog        │                                                         │
│                │                                                         │
│ 📬 Messages    │                                                         │
│ 🖼  Media Lib   │                                                         │
│                │                                                         │
│ 📊 Analytics   │                                                         │
│  ├ Traffic     │                                                         │
│  ├ Performance │                                                         │
│  ├ Contact     │                                                         │
│  └ Community   │                                                         │
│                │                                                         │
│ ⚙  Settings    │                                                         │
│  ├ Contact     │                                                         │
│  ├ Social      │                                                         │
│  ├ SEO/Meta    │                                                         │
│  ├ Maintenance │                                                         │
│  └ Webhooks    │                                                         │
│                │                                                         │
│ 🗝  API Keys    │                                                         │
│ 💾 Backup      │                                                         │
│ 👤 Admin Users │                                                         │
│                │                                                         │
│  [← Collapse]  │                                                         │
└────────────────┴────────────────────────────────────────────────────────┘
```

---

## 1. DASHBOARD PAGE

### Corresponds to: Overview of entire public website

```
┌─── DASHBOARD ───────────────────────────────────────────────────────────┐
│                                                                          │
│  STATS ROW                                                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ 📂 Projects  │ │ 📝 Blog Posts│ │ 📬 Messages  │ │ 👥 Community │   │
│  │   ■ 5        │ │   ■ 3        │ │   ■ 12 new   │ │   ■ 500+     │   │
│  │ ↑ +2 this mo │ │ → no change  │ │ ↑ 3 unread   │ │ ↑ +15 new    │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                                          │
│  ┌────────────────────────────────┐  ┌──────────────────────────────┐   │
│  │ RECENT MESSAGES                │  │ QUICK ACTIONS                │   │
│  │────────────────────────────────│  │──────────────────────────────│   │
│  │ ● Lokesh K.  "Hello I want..." │  │ ┌─────────────┐ ┌─────────┐  │   │
│  │ ○ Sarah M.   "Following up..." │  │ │ ➕ New       │ │ ✍️ New  │  │   │
│  │ ○ Ahmed T.   "Project quote.." │  │ │   Project   │ │  Blog   │  │   │
│  │ ● John D.    "Partnership..."  │  │ └─────────────┘ └─────────┘  │   │
│  │ ● Priya S.   "Feedback on..."  │  │ ┌─────────────┐ ┌─────────┐  │   │
│  │                                │  │ │ 📋 Messages │ │ 🖼️ Media│  │   │
│  │         [View All Messages →]  │  │ │   Inbox     │ │ Upload  │  │   │
│  └────────────────────────────────┘  │ └─────────────┘ └─────────┘  │   │
│                                      │ ┌─────────────┐ ┌─────────┐  │   │
│                                      │ │ ✏️ Edit Hero │ │ ⚙️ Site │  │   │
│                                      │ │   Section   │ │Settings │  │   │
│                                      │ └─────────────┘ └─────────┘  │   │
│                                      └──────────────────────────────┘   │
│                                                                          │
│  RECENT ACTIVITY LOG                                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ [AB] Project 'RecruiterOne' updated ──────────────── 2 hours ago │   │
│  │ [AB] New blog post 'Digital Landscape' published ─── 1 day ago   │   │
│  │ [AB] Review from 'Sarah Chen' added ────────────────  3 days ago │   │
│  │ [AB] Service 'Branding' content updated ─────────── 1 week ago   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. HERO SECTION MANAGER

### Corresponds to: `src/landing_Page/sections/hero/Hero.jsx`

```
┌─── HERO SECTION EDITOR ─────────────────────────────────────────────────┐
│  Breadcrumb: Content > Hero Section              [Revert] [Save Changes] │
│                                                                          │
│  ┌───────────────────────────────────┐  ┌──────────────────────────┐    │
│  │ FORM PANEL                        │  │ PREVIEW PANEL (approx.)  │    │
│  │                                   │  │                          │    │
│  │ Badge Text                        │  │  [Development agency]    │    │
│  │ {  Development agency          }  │  │                          │    │
│  │                                   │  │  Turning pixels into     │    │
│  │ Title Line 1                      │  │  digital mastery         │    │
│  │ {  Turning pixels into         }  │  │                          │    │
│  │                                   │  │  Transform ideas into... │    │
│  │ Title Line 2 (gradient text)      │  │                          │    │
│  │ {  digital mastery             }  │  │  [Our Services]          │    │
│  │                                   │  │  [Get in Touch]          │    │
│  │ Subtitle Line 1                   │  │                          │    │
│  │ {  Transform ideas into...     }  │  │  They trusted us         │    │
│  │                                   │  │  [logo][logo][logo]...   │    │
│  │ Subtitle Line 2                   │  │                          │    │
│  │ {  that captivate your...      }  │  │                          │    │
│  │                                   │  └──────────────────────────┘    │
│  │ CTA Buttons                       │                                   │
│  │ Primary: { Our Services       }   │                                   │
│  │ Route:   { /services   ▾      }   │                                   │
│  │ Secondary: { Get in Touch     }   │                                   │
│  │                                   │                                   │
│  │ Trusted By — Client Logos         │                                   │
│  │ ┌─────────────────────────────┐   │                                   │
│  │ │ [===] [===] [===] [===]     │   │                                   │
│  │ │  c1    c2    c3    c4       │   │                                   │
│  │ │ [===] [===]                 │   │                                   │
│  │ │  c5    c6    [+ Add Logo]   │   │                                   │
│  │ └─────────────────────────────┘   │                                   │
│  └───────────────────────────────────┘                                   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. ABOUT SECTION MANAGER

### Corresponds to:
- `src/landing_Page/sections/about_1/About1.jsx`
- `src/landing_Page/sections/about_2/About2.jsx`
- `src/about_Page/AboutPage.jsx` (reuses same sections)

```
┌─── ABOUT SECTION EDITOR ────────────────────────────────────────────────┐
│  Breadcrumb: Content > About                     [Revert] [Save Changes] │
│                                                                          │
│  [Tab: About1 — Studio Description] [Tab: About2 — Numbers Stats]       │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  ★ ABOUT 1 TAB                                                           │
│  ┌────────────────────────────────────────────────────────────────┐      │
│  │ Logo Image                                                      │      │
│  │ [=== logo.png ===]  [Change Image →]                           │      │
│  │                                                                 │      │
│  │ Paragraph 1 — Rich Text                                         │      │
│  │ ┌─────────────────────────────────────────────────────────┐    │      │
│  │ │ We're a [●blue] / digital design studio [●dark]         │    │      │
│  │ │ founded by [●blue] tech passionate enthusiasts [●blue]  │    │      │
│  │ └─────────────────────────────────────────────────────────┘    │      │
│  │ (color toggle per word group: Blue | Dark)                      │      │
│  │                                                                 │      │
│  │ Paragraph 2 — Rich Text (same pattern)                          │      │
│  │ ┌─────────────────────────────────────────────────────────┐    │      │
│  │ │ We create [●blue] / memorable websites [●dark] ...      │    │      │
│  │ └─────────────────────────────────────────────────────────┘    │      │
│  │                                                                 │      │
│  │ Button 1 Text: { Get in Touch   }                               │      │
│  │ Button 2 Text: { More about us  }                               │      │
│  └────────────────────────────────────────────────────────────────┘      │
│                                                                          │
│  ○ ABOUT 2 TAB                                                           │
│  ┌────────────────────────────────────────────────────────────────┐      │
│  │ Section Badge: { Highlights     }                               │      │
│  │ Title Line 1:  { Numbers that   }                               │      │
│  │ Title Line 2:  { drive success  }                               │      │
│  │ Button Text:   { More About us  }                               │      │
│  │                                                                 │      │
│  │ STATS  [+ Add Stat]  (max 6)                                    │      │
│  │ ┌────────────────────────────────────────────────────────┐     │      │
│  │ │↕ [● Red  ▾] { 10+ }  { Projects Completed }  [✕]      │     │      │
│  │ │↕ [● Yell ▾] { 5+  }  { Years Experience    }  [✕]     │     │      │
│  │ │↕ [● Green▾] { 95% }  { Client Retention... }   [✕]    │     │      │
│  │ └────────────────────────────────────────────────────────┘     │      │
│  └────────────────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 4. PROJECTS MANAGER

### Corresponds to:
- `src/landing_Page/sections/projects/Projects.jsx`
- `src/Projects_Page/sections/ProjectList/ProjectList.jsx`
- `src/Project_Details_Page/project_Details.jsx` (all sections)

```
┌─── PROJECTS MANAGER ────────────────────────────────────────────────────┐
│  Breadcrumb: Content > Projects               [☰ List] [⊞ Grid]         │
│  [+ Add New Project]                                  {🔍 Search...   } │
│                                                                          │
│  LIST VIEW                                                               │
│  ┌──┬──────────┬────────────────────┬─────────────────┬────────┬──────┐ │
│  │# │ Image    │ Title              │ Category        │ Status │ Acts │ │
│  ├──┼──────────┼────────────────────┼─────────────────┼────────┼──────┤ │
│  │1 │ [===35px]│ RecruiterOne       │[Human Recruit.] │ ● Live │ ✏️ 🗑│ │
│  │2 │ [===35px]│ Digital in         │[Creative Agency]│ ● Live │ ✏️ 🗑│ │
│  │3 │ [===35px]│ PayFlow Pro        │[Finance App]    │ ● Live │ ✏️ 🗑│ │
│  │4 │ [===35px]│ ShopMart Global    │[E-Commerce]     │ ● Live │ ✏️ 🗑│ │
│  │5 │ [===35px]│ MediCare Plus      │[Healthcare]     │ ○ Draft│ ✏️ 🗑│ │
│  └──┴──────────┴────────────────────┴─────────────────┴────────┴──────┘ │
│                                           Showing 1–5 of 5  [10 ▾ /page]│
└──────────────────────────────────────────────────────────────────────────┘

┌─── ADD / EDIT PROJECT FORM ─────────────────────────────────────────────┐
│  Breadcrumb: Content > Projects > Edit — RecruiterOne                    │
│                                              [Cancel] [Save as Draft]    │
│                                                            [Publish ✓]   │
│  ┌─────────────────────────────────┐  ┌────────────────────────────┐    │
│  │ BASIC INFO                      │  │ COVER IMAGE                │    │
│  │                                 │  │ ┌──────────────────────┐   │    │
│  │ Title:  { RecruiterOne         }│  │ │                      │   │    │
│  │ Slug:   { recruiterone      ✓ }│  │ │  [=== preview ===]   │   │    │
│  │ Category Pill: {Human Recruit.}│  │ │                      │   │    │
│  │                                 │  │ └──────────────────────┘   │    │
│  │ HERO DESCRIPTION                │  │ [📁 Change from R2]        │    │
│  │ ┌─────────────────────────┐     │  │ [⬆ Upload New]            │    │
│  │ │ {                       │     │  └────────────────────────────┘    │
│  │ │  Hero text here...  }   │     │                                    │
│  │ └─────────────────────────┘     │  STATUS                            │
│  └─────────────────────────────────┘  ○ Published   ● Draft             │
│                                                                          │
│  CHALLENGES (repeatable)  [+ Add Challenge]                              │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │↕ { Challenge description #1...                                 } │   │
│  │↕ { Challenge description #2...                                 } │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  GALLERY IMAGES  [+ Add Images]                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ [===img1===] [===img2===] [===img3===] [+]                      │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  SOLUTIONS (repeatable)  [+ Add Solution]                                │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │↕ { Solution description #1...                                  } │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  CLIENT REVIEW                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Quote:   { "Working with Antha Tech was..."                    } │   │
│  │ Author:  { Lokesh Kumar        }   Role: { CEO              }   │   │
│  │ Company: { RecruiterOne        }                                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  RELATED PROJECTS  [Multi-select ▾]                                      │
│  [Digital in ✕] [PayFlow Pro ✕]                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 5. SERVICES MANAGER

### Corresponds to:
- `src/landing_Page/sections/services/Services.jsx`
- `src/services_Page/ServicesPage.jsx`
- `src/Service_Details_Page/ServiceDetailsPage.jsx`

```
┌─── SERVICES MANAGER ────────────────────────────────────────────────────┐
│  Breadcrumb: Content > Services              [+ Add New Service]         │
│                                                                          │
│  ┌───┬─────────────────┬──────────────────┬────────────┬────────┬─────┐ │
│  │ # │ Service Name    │ Tags             │ Theme      │ Status │Acts │ │
│  ├───┼─────────────────┼──────────────────┼────────────┼────────┼─────┤ │
│  │ 1 │ Branding        │[Brand][Pitch]... │ ■ DkGreen  │ ● Live │✏️ 🗑│ │
│  │ 2 │ Product Design  │[UI/UX][Mobile].. │ ■ Indigo   │ ● Live │✏️ 🗑│ │
│  │ 3 │ Development     │[Front][Back]...  │ ■ Charcoal │ ● Live │✏️ 🗑│ │
│  └───┴─────────────────┴──────────────────┴────────────┴────────┴─────┘ │
└──────────────────────────────────────────────────────────────────────────┘

┌─── EDIT SERVICE FORM ───────────────────────────────────────────────────┐
│  [Tab: Overview] [Tab: What We Offer] [Tab: Process] [Tab: Benefits]    │
│                                                                          │
│  ★ OVERVIEW TAB                                                          │
│  Title:       { Branding                                              }  │
│  Slug:        { branding                                           ✓  }  │
│  Description: { Exceptional businesses deserve memorable branding... }  │
│  Tags:        [Branding ✕] [Pitch Deck ✕] [Rebranding ✕] [+Add]        │
│  Theme:       ○ Dark Green  ○ Indigo Blue  ★ Charcoal Black             │
│  Hero BG Color: [■ #e6fffa ▾]  (color picker)                           │
│  Service Graphic: [=== branding_service.png ===]  [Change]              │
│                                                                          │
│  ○ WHAT WE OFFER TAB                                                     │
│  [+ Add Offer Item]  (max 6)                                             │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │↕ Icon: {🎨} Title: { Visual Identity } Text: { Logo design...}│     │
│  │↕ Icon: {📈} Title: { Brand Strategy  } Text: { Positioning...}│     │
│  │↕ Icon: {📄} Title: { Brand Guidelines} Text: { Rulebook...   }│     │
│  │↕ Icon: {✉️} Title: { Stationery      } Text: { Business cards}│     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                          │
│  ○ PROCESS TAB                                                           │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │↕ Step 01 | Title: { Discovery  } | Text: {Understanding...   }│     │
│  │↕ Step 02 | Title: { Research   } | Text: {Analyzing...       }│     │
│  │↕ Step 03 | Title: { Concepts   } | Text: {Developing...      }│     │
│  │↕ Step 04 | Title: { Refinement } | Text: {Perfecting...      }│     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                          │
│  ○ BENEFITS TAB                                                          │
│  [+ Add Benefit]                                                         │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │↕ { Consistent Brand Voice                              } [✕]   │     │
│  │↕ { Increased Market Value                              } [✕]   │     │
│  │↕ { Trust & Credibility                                 } [✕]   │     │
│  └────────────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 6. HIGHLIGHTS SECTION MANAGER

### Corresponds to: `src/landing_Page/sections/highlights/Highlights.jsx`

```
┌─── HIGHLIGHTS EDITOR ───────────────────────────────────────────────────┐
│  Breadcrumb: Content > Highlights                [Revert] [Save Changes] │
│                                                                          │
│  HEADER TEXT (rich — highlight color toggle per phrase)                  │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ [●highlight] We blend  [normal] cutting-edge technology          │   │
│  │ [normal] with strategic design [●highlight] to build             │   │
│  │ [normal] memorable online identities...                          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  HIGHLIGHT ITEMS (4 items, reorderable)  [+ Add Item] (max 4)           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │↕ ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │ Item 1                                                     │  │   │
│  │  │ SVG Icon Code:                                             │  │   │
│  │  │ ┌──────────────────────────────┐  ┌────────────────────┐  │  │   │
│  │  │ │ { <svg>...</svg>           } │  │ [Mini SVG Preview] │  │  │   │
│  │  │ └──────────────────────────────┘  └────────────────────┘  │  │   │
│  │  │ Title Line 1: { Integrated  }                              │  │   │
│  │  │ Title Line 2: { Expertise   }                              │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  │↕ [Item 2: Creative Excellence       ]                            │   │
│  │↕ [Item 3: Open Communication        ]                            │   │
│  │↕ [Item 4: Customised Solutions      ]                            │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 7. PROCESS STEPS MANAGER

### Corresponds to: `src/landing_Page/sections/progress/Progress.jsx`

```
┌─── PROCESS STEPS EDITOR ────────────────────────────────────────────────┐
│  Breadcrumb: Content > Process Steps             [Revert] [Save Changes] │
│                                                                          │
│  Section Badge: { How we work        }                                   │
│  Title Line 1:  { How we bring       }                                   │
│  Title Line 2:  { ideas to life      }                                   │
│  CTA Button:    { How we work        }                                   │
│                                                                          │
│  STEPS (4 steps, reorderable, min 2 / max 6)  [+ Add Step]              │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │↕ STEP 01                                                   [✕]   │   │
│  │  Title:       { Discovery & Strategy                          }  │   │
│  │  Description: { We dive deep into your brand, goals...       }  │   │
│  │  Step Image:  [=== progress_1.png ===]  [Change Image]          │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │↕ STEP 02                                                   [✕]   │   │
│  │  Title:       { Design & Identity                             }  │   │
│  │  Description: { Creative excellence is our core...           }  │   │
│  │  Step Image:  [=== progress_2.png ===]  [Change Image]          │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │↕ STEP 03  ...                                                    │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │↕ STEP 04  ...                                                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 8. REVIEWS / TESTIMONIALS MANAGER

### Corresponds to: `src/landing_Page/sections/reviews/Reviews.jsx`

```
┌─── REVIEWS MANAGER ─────────────────────────────────────────────────────┐
│  Breadcrumb: Content > Reviews               [+ Add New Review]          │
│                                                                          │
│  ┌───┬────────────────┬───────────┬───────────┬────────┬──────────────┐ │
│  │ # │ Author         │ Role      │ Company   │ Status │ Actions      │ │
│  ├───┼────────────────┼───────────┼───────────┼────────┼──────────────┤ │
│  │ 1 │ Lokesh Kumar   │ CEO       │ RecruiterOne│●Active│ ✏️ 🗑        │ │
│  │ 2 │ Sarah Chen     │ Founder   │ EcoSphere │●Active │ ✏️ 🗑        │ │
│  │ 3 │ Marcus Thorne  │ Mktg Dir  │ Apex Global│●Active│ ✏️ 🗑        │ │
│  │ 4 │ Elena Rodriguez│ CTO       │ FinStream │●Active │ ✏️ 🗑        │ │
│  └───┴────────────────┴───────────┴───────────┴────────┴──────────────┘ │
│                                                                          │
│  ADD / EDIT REVIEW MODAL                                                 │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Quote (max 300 chars)       [243/300]                            │   │
│  │ ┌──────────────────────────────────────────────────────────┐    │   │
│  │ │ { "We partnered with Antha Tech for our e-commerce..."  }│    │   │
│  │ └──────────────────────────────────────────────────────────┘    │   │
│  │                                                                  │   │
│  │ Author Name: { Lokesh Kumar  }  Role: { CEO            }        │   │
│  │ Company:     { RecruiterOne  }                                   │   │
│  │ Avatar:      [=== (optional) ===]  [Upload to R2]               │   │
│  │ Status:      ● Active  ○ Inactive                                │   │
│  │                                                                  │   │
│  │                              [Cancel]  [Save Review]            │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 9. COMMUNITY MANAGER

### Corresponds to:
- `src/landing_Page/sections/community/Community.jsx`
- `src/Community_Page/CommunityPage.jsx`
- All sections: Hero / HowItWorks / Perks / Apply

```
┌─── COMMUNITY MANAGER ───────────────────────────────────────────────────┐
│  Breadcrumb: Content > Community                                         │
│  [Tab: Teaser Content] [Tab: How It Works] [Tab: Perks] [Tab: Members]  │
│                                                                          │
│  ★ TEASER CONTENT TAB                                                    │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ Section Title L1: { Build together,  }                         │     │
│  │ Section Title L2: { grow together.   }                         │     │
│  │ Description:    { Join a verified community of students...  }  │     │
│  │ CTA Button Text: { Apply to Join  }                            │     │
│  │                                                                 │     │
│  │ TRACKS  [+ Add Track] (max 4)                                   │     │
│  │ ┌─────────────────────────────────────────────────────────┐    │     │
│  │ │↕ Icon: {🎓} Label: {Students    } Desc: {Build real...}│    │     │
│  │ │↕ Icon: {💼} Label: {Professionals} Desc: {Collaborate.}│    │     │
│  │ └─────────────────────────────────────────────────────────┘    │     │
│  │                                                                 │     │
│  │ STATS  (3 stats)                                                │     │
│  │ { 500+ } { Members Worldwide }                                  │     │
│  │ { 40+  } { Live Projects     }                                  │     │
│  │ { 2    } { Tracks Available  }                                  │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                          │
│  ○ HOW IT WORKS TAB                                                      │
│  Steps (repeatable): Step# | Title | Description | Icon                  │
│                                                                          │
│  ○ PERKS TAB                                                             │
│  Perks (repeatable): Icon | Title | Description                          │
│                                                                          │
│  ○ MEMBERS / APPLICATIONS TAB                                            │
│  ┌───┬──────────────┬─────────────────┬───────────┬────────┬──────────┐ │
│  │ # │ Name         │ Email           │ Track     │ Status │ Actions  │ │
│  ├───┼──────────────┼─────────────────┼───────────┼────────┼──────────┤ │
│  │ 1 │ Priya S.     │ priya@mail.com  │[Student]  │[Pending│ ✓ ✗ 👁  │ │
│  │ 2 │ Ahmed T.     │ ahmed@mail.com  │[Pro]      │[Apprvd]│      👁  │ │
│  └───┴──────────────┴─────────────────┴───────────┴────────┴──────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 10. BLOG / INSIGHTS MANAGER

### Corresponds to:
- `src/insights_Page/InsightsPage.jsx`
- `src/insights_Page/sections/BlogList/BlogList.jsx`

```
┌─── BLOG / INSIGHTS MANAGER ─────────────────────────────────────────────┐
│  Breadcrumb: Content > Blog/Insights         [+ Add New Post]            │
│                                              {🔍 Search posts...       } │
│                                                                          │
│  [Filter: All ▾]  [Filter: Published | Draft]                           │
│                                                                          │
│  ┌───┬──────────────┬──────────────────────────┬──────────┬──────┬────┐ │
│  │ # │ Cover        │ Title                    │ Date     │Status│Acts│ │
│  ├───┼──────────────┼──────────────────────────┼──────────┼──────┼────┤ │
│  │ 1 │[===30px===]  │Explore the digital land..│1 yr ago  │●Live │✏️🗑│ │
│  │ 2 │[===30px===]  │Streamlining with cloud...│2 yrs ago │●Live │✏️🗑│ │
│  │ 3 │[===30px===]  │Future of mobile design...│3 yrs ago │○Draft│✏️🗑│ │
│  └───┴──────────────┴──────────────────────────┴──────────┴──────┴────┘ │
└──────────────────────────────────────────────────────────────────────────┘

┌─── ADD / EDIT BLOG POST ────────────────────────────────────────────────┐
│                                        [Cancel] [Save Draft] [Publish]   │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Cover Image (from R2 or URL)                                     │    │
│  │ [==============================================]                  │    │
│  │ [📁 Browse R2]  [📎 Paste URL]  [⬆ Upload]                      │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Title:    { Explore the ever-evolving digital landscape           }     │
│            [62/100]                                                      │
│  Slug:     { explore-digital-landscape                         ✓   }     │
│  Date:     { 1 year ago     }   (or date picker for actual date)         │
│  Short Desc: { with insights on design, development...         }         │
│              [134/200]                                                    │
│  Link/URL:   { /insights/digital-landscape                     }         │
│  Tags:     [Design ✕] [Dev ✕] [+Add]                                    │
│                                                                          │
│  FULL ARTICLE CONTENT                                                    │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  [B] [I] [H1] [H2] [List] [Link] [Image] [Code] ...             │   │
│  │ ─────────────────────────────────────────────                    │   │
│  │                                                                  │   │
│  │  { Write your full article here... }                             │   │
│  │                                                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Status:  ○ Published   ● Draft                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 11. MESSAGES (CONTACT FORM) INBOX

### Corresponds to: `src/Shared/contact/Contact.jsx` submissions

```
┌─── MESSAGES INBOX ──────────────────────────────────────────────────────┐
│  Breadcrumb: Messages                         [Mark All Read] [🗑 Clear] │
│                                               {🔍 Search messages...  } │
│                                                                          │
│  [Filter: All ▾]  [Filter: New | Read]                                  │
│                                                                          │
│  ┌──┬───────┬───────────────┬───────────────────┬────────────┬────────┐ │
│  │# │ 🔵    │ Sender        │ Message Preview   │ Date       │ Acts   │ │
│  ├──┼───────┼───────────────┼───────────────────┼────────────┼────────┤ │
│  │1 │ [NEW] │ Lokesh Kumar  │ Hello I want to...│ 2 hrs ago  │ 👁 🗑  │ │
│  │2 │ [NEW] │ Priya Sharma  │ Following up on...│ 5 hrs ago  │ 👁 🗑  │ │
│  │3 │ [READ]│ Sarah M.      │ Quick question ...│ 1 day ago  │ 👁 🗑  │ │
│  └──┴───────┴───────────────┴───────────────────┴────────────┴────────┘ │
│                                                                          │
│  MESSAGE DETAIL DRAWER (slides in from right on row click)               │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ [✕ Close]                                                       │     │
│  │ From: Lokesh Kumar  <lokesh@email.com>                          │     │
│  │ Received: March 7, 2026 at 10:32 AM                            │     │
│  │ ─────────────────────────────────────────────────────────────  │     │
│  │ "Hello I want to discuss a project with your team.             │     │
│  │  We are looking for a full website redesign and...             │     │
│  │  Please get back to me at your earliest."                       │     │
│  │                                                                 │     │
│  │ [📧 Reply via Email]  [✓ Mark as Read]  [🗑 Delete]            │     │
│  └────────────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 12. MEDIA LIBRARY (Cloudflare R2)

```
┌─── MEDIA LIBRARY ───────────────────────────────────────────────────────┐
│  Breadcrumb: Media Library          [⊞ Grid] [☰ List]  {🔍 Search...}  │
│  [Filter: All ▾] [Images] [Videos] [Documents]                          │
│                                                                          │
│  UPLOAD ZONE                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │   ☁ Drag & drop files here, or  [Browse Files]                  │   │
│  │   Supports: JPG, PNG, WebP, SVG, MP4, PDF                       │   │
│  │                                                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  GRID VIEW (4 columns)                                                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │             │ │             │ │             │ │             │       │
│  │ [===img===] │ │ [===img===] │ │ [===img===] │ │ [===img===] │       │
│  │             │ │             │ │             │ │             │       │
│  │ project_1.. │ │ project_2.. │ │ branding_s..│ │ logo.png    │       │
│  │[📋 Copy URL]│ │[📋 Copy URL]│ │[📋 Copy URL]│ │[📋 Copy URL]│       │
│  │    [🗑]      │ │    [🗑]      │ │    [🗑]      │ │    [🗑]      │       │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                                          │
│  [← Prev]  Page 1 of 4  [Next →]                                        │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 13. SITE SETTINGS

```
┌─── SITE SETTINGS ───────────────────────────────────────────────────────┐
│  [Tab: Contact Info] [Tab: Social Links] [Tab: SEO / Meta]              │
│                                                                          │
│  ★ CONTACT INFO TAB                        [Save Settings]              │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ Business Email:  { hello@anthatech.com                      }  │     │
│  │ Phone Number:    { +91 98765 43210                           }  │     │
│  │ Address:         { 12, Tech Park, Chennai, India             }  │     │
│  │ Map Embed URL:   { https://maps.google.com/embed?...         }  │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                          │
│  ○ SOCIAL LINKS TAB                                                      │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ Instagram: { https://instagram.com/anthatech              }    │     │
│  │ LinkedIn:  { https://linkedin.com/company/anthatech        }   │     │
│  │ Twitter/X: { https://x.com/anthatech                       }   │     │
│  │ Behance:   { https://be.net/anthatech                      }   │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                          │
│  ○ SEO / META TAB                                                        │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ Site Name:    { Antha Tech                                  }  │     │
│  │ Meta Title:   { Antha Tech — Digital Design Studio     52/60}  │     │
│  │ Meta Desc:    { We create memorable... websites...   142/160}  │     │
│  │ OG Image:     [=== og_default.png ===] [Change]                │     │
│  │                                                                 │     │
│  │ PER-PAGE META                                                   │     │
│  │ ┌────────────┬──────────────────┬──────────────────┬────────┐  │     │
│  │ │ Page       │ Meta Title       │ Meta Description │ OG Img │  │     │
│  │ ├────────────┼──────────────────┼──────────────────┼────────┤  │     │
│  │ │ Home       │ { Home title } ✏│ { Home desc...}✏ │ [img]  │  │     │
│  │ │ About      │ { About title}✏ │ { About desc..}✏ │ [img]  │  │     │
│  │ │ Projects   │ ...              │ ...              │ ...    │  │     │
│  │ └────────────┴──────────────────┴──────────────────┴────────┘  │     │
│  └────────────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 14. ADMIN USERS

```
┌─── ADMIN USERS ─────────────────────────────────────────────────────────┐
│  Breadcrumb: Admin Users                   [+ Invite New Admin]          │
│  ⚠ Only Super Admin can manage users                                    │
│                                                                          │
│  ┌───┬──────┬──────────────┬─────────────────┬────────────┬──────┬────┐ │
│  │ # │ Avtr │ Name         │ Email           │ Role       │Status│Acts│ │
│  ├───┼──────┼──────────────┼─────────────────┼────────────┼──────┼────┤ │
│  │ 1 │ [AB] │ Admin User   │ admin@antha.com │ SuperAdmin │●Actv │ ✏️ │ │
│  │ 2 │ [MK] │ Mohan K.     │ mohan@antha.com │ Editor     │●Actv │✏️🚫│ │
│  └───┴──────┴──────────────┴─────────────────┴────────────┴──────┴────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 15. SECURITY CENTER

### 15A — Security Overview Dashboard
```
┌─── SECURITY — OVERVIEW ─────────────────────────────────────────────────┐
│  Breadcrumb: Security > Overview                                         │
│                                                                          │
│  SECURITY SCORE                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  🔐 Security Score: ████████████████████░░░░  87/100             │   │
│  │  ⚠ Enable MFA for all admins to reach 100                       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  STATUS CARDS ROW                                                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ 👥 Sessions  │ │ 🚫 Failed    │ │ 🕐 Last Login│ │ 🔑 MFA       │   │
│  │   ■ 1 active │ │   ■ 2 (24h)  │ │ ■ 10:32 AM   │ │ ■ ENABLED ✓  │   │
│  │ This device  │ │ ● Normal     │ │ IP:49.x.x.x  │ │              │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────┐  ┌────────────────────────────┐    │
│  │ RECENT SUSPICIOUS ALERTS        │  │ CLOUDFLARE ACCESS          │    │
│  │─────────────────────────────────│  │────────────────────────────│    │
│  │ ⚠ Login from new IP: 192.x.x.x │  │ Status: ● Connected        │    │
│  │   March 7, 2026 at 09:14 AM     │  │ Policy: Email Whitelist    │    │
│  │   [Dismiss]  [View Details]      │  │ Protected: admin.antha.com │    │
│  │                                  │  │ [Manage in CF Dashboard →] │    │
│  │ ✅ No critical alerts            │  └────────────────────────────┘    │
│  └─────────────────────────────────┘                                    │
└──────────────────────────────────────────────────────────────────────────┘
```

### 15B — Active Sessions Manager
```
┌─── SECURITY — ACTIVE SESSIONS ──────────────────────────────────────────┐
│  Breadcrumb: Security > Sessions            [Revoke All Other Sessions]  │
│                                                                          │
│  ┌────┬──────────┬──────────┬────────────┬────────────┬──────┬───────┐  │
│  │    │ Device   │ Browser  │ IP Address │ Last Active│ From │ Acts  │  │
│  ├────┼──────────┼──────────┼────────────┼────────────┼──────┼───────┤  │
│  │ ★  │Windows PC│ Chrome   │ 49.x.x.x   │ Just now   │India │This 🟢│  │
│  │    │MacBook   │ Safari   │ 182.x.x.x  │ 1 hr ago   │India │[Revoke│  │
│  └────┴──────────┴──────────┴────────────┴────────────┴──────┴───────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

### 15C — MFA Settings
```
┌─── SECURITY — MFA SETTINGS ─────────────────────────────────────────────┐
│  Breadcrumb: Security > MFA                                              │
│  MFA STATUS:  ● ENABLED     [Disable MFA]  (requires password confirm)  │
│                                                                          │
│  SETUP / RE-CONFIGURE                                                    │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Step 1: Scan QR Code           | Step 2: Enter verification code │   │
│  │ ┌──────────────────────┐       | ┌──────────────────────────┐    │   │
│  │ │  ██████████████████  │       | │  { _ _ _ - _ _ _ }       │    │   │
│  │ │  █ QR CODE BLOCK  █  │       | │  6-digit code from app   │    │   │
│  │ │  ██████████████████  │       | │  [Verify & Activate]     │    │   │
│  │ └──────────────────────┘       | └──────────────────────────┘    │   │
│  │ Manual key: ABCD EFGH IJKL     |                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  BACKUP CODES                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  ●●●●●●●●●●  ●●●●●●●●●●  ●●●●●●●●●●  ●●●●●●●●●●               │   │
│  │  ●●●●●●●●●●  ●●●●●●●●●●  ●●●●●●●●●●  ●●●●●●●●●●               │   │
│  │  [👁 Reveal]  [🔄 Regenerate]   ⚠ Save these — shown once      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Enforce MFA for all admins:  ○ OFF  ● ON   (Super Admin only)          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 15D — Audit Log
```
┌─── SECURITY — AUDIT LOG ────────────────────────────────────────────────┐
│  Breadcrumb: Security > Audit Log                                        │
│  {🔍 Search...} [Filter: All ▾] [User ▾] [Date Range ▾]  [⬇ Export CSV]│
│                                                                          │
│  ┌──────────────┬───────┬──────────┬──────────────────────┬────┬──────┐ │
│  │ Timestamp    │ Admin │ Type     │ Description          │ IP │Result│ │
│  ├──────────────┼───────┼──────────┼──────────────────────┼────┼──────┤ │
│  │ 07/03 10:32  │ [MK]  │[Content] │ Project 'Recruit..'  │49x │ ✅   │ │
│  │ 07/03 10:01  │ [MK]  │[Auth]    │ Login success        │49x │ ✅   │ │
│  │ 06/03 18:44  │ [MK]  │[Security]│ MFA verified         │49x │ ✅   │ │
│  │ 06/03 09:00  │ [??]  │[Auth]    │ Failed login attempt │182x│ ❌   │ │
│  └──────────────┴───────┴──────────┴──────────────────────┴────┴──────┘ │
│                             Showing 1–10 of 143  [10 ▾]  [← 1 2 3 →]   │
└──────────────────────────────────────────────────────────────────────────┘
```

### 15E — IP Blocklist
```
┌─── SECURITY — IP BLOCKLIST ─────────────────────────────────────────────┐
│  Breadcrumb: Security > IP Blocklist         [+ Block IP]                │
│                                                                          │
│  WHITELISTED IPs (bypass login rate-limiting)                            │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 49.x.x.x — Office Network  ●Active  [✕ Remove]                  │   │
│  │ { Enter new IP... }  [+ Add to Whitelist]                        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  BLOCKED IPs                                                             │
│  ┌──────┬─────────────┬────────────┬──────────────┬──────────────────┐  │
│  │  IP  │ Reason      │ Blocked At │ Expires      │ Actions          │  │
│  ├──────┼─────────────┼────────────┼──────────────┼──────────────────┤  │
│  │182.x │ 5x failed   │ 07/03 09:00│ Auto 10 min  │[Unblock] [Extend]│  │
│  │41.x  │ Manual block│ 06/03 12:00│ Permanent    │[Unblock]         │  │
│  └──────┴─────────────┴────────────┴──────────────┴──────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 16. ANALYTICS DASHBOARD

```
┌─── ANALYTICS — TRAFFIC OVERVIEW ───────────────────────────────────────┐
│  Breadcrumb: Analytics > Traffic           [Period: Last 30 days ▾]     │
│                                                                          │
│  TRAFFIC STATS ROW                                                       │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐      │
│  │ 👁 Page Views     │ │ 👤 Unique Visitors │ │ 📡 Bandwidth Svd  │      │
│  │   ■ 14,320        │ │   ■ 4,891          │ │   ■ 1.2 GB        │      │
│  │ ↑ +18% vs prev mo │ │ ↑ +12% vs prev mo  │ │ (CF served free)  │      │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘      │
│                                                                          │
│  ┌─────────────────────────────────┐  ┌────────────────────────────┐    │
│  │ TOP PAGES                       │  │ TOP COUNTRIES              │    │
│  │─────────────────────────────────│  │────────────────────────────│    │
│  │ /               4,200  (29%)    │  │ India      ████████  62%   │    │
│  │ /projects       2,900  (20%)    │  │ US         ████      18%   │    │
│  │ /about          1,800  (13%)    │  │ UK         ██         8%   │    │
│  │ /services       1,500  (11%)    │  │ Others     ██        12%   │    │
│  │ /insights         900   (6%)    │  │                            │    │
│  └─────────────────────────────────┘  └────────────────────────────┘    │
│                                                                          │
│  FREE TIER USAGE BARS                                                    │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ CF Cache Hit Rate: ██████████████████████░░░░  88%  ✅ Healthy   │   │
│  │ Error Rate:        █░░░░░░░░░░░░░░░░░░░░░░░░░  0.3% ✅ Normal   │   │
│  │ Supabase BW:       ████████░░░░░░░░░░░░░░░░░░  340MB/2GB ✅      │   │
│  │ R2 Storage:        ██░░░░░░░░░░░░░░░░░░░░░░░░  1.8GB/10GB ✅     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 17. CONTENT VERSION HISTORY (Drawer)

### Triggered by the 🕐 History button inside any content editor
```
┌─── CONTENT EDITOR ───────────────────┐  ┌── VERSION HISTORY ───────────┐
│  Breadcrumb: Content > Projects       │  │  Version History              │
│                     [🕐 History]      │  │  Project: RecruiterOne        │
│                                       │  │  ─────────────────────────── │
│  [ ...form fields...               ]  │  │  v7 — Current                 │
│                                       │  │  [MK] Mar 7  10:32 AM  ←now  │
│                                       │  │  "Updated hero description"   │
│                                       │  │  [Preview]                    │
│                                       │  │  ─────────────────────────── │
│                                       │  │  v6                           │
│                                       │  │  [MK] Mar 5  03:14 PM         │
│                                       │  │  "Added gallery images"       │
│                                       │  │  [Preview]  [Restore This]    │
│                                       │  │  ─────────────────────────── │
│                                       │  │  v5                           │
│                                       │  │  [MK] Mar 1  11:00 AM         │
│                                       │  │  [Preview]  [Restore This]    │
│                                       │  │  ─────────────────────────── │
│                                       │  │  ... (7 of 12 saved)          │
│                                       │  │  [Load More]                  │
│                                       │  └───────────────────────────────┘
└───────────────────────────────────────┘

  RESTORE CONFIRMATION MODAL
  ┌──────────────────────────────────────────────────────────┐
  │ ⚠ Restore Version 6?                                    │
  │ This will overwrite current content with v6.            │
  │ Current state will be auto-saved as v8.                 │
  │                       [Cancel]  [Restore Version 6]     │
  └──────────────────────────────────────────────────────────┘
```

---

## 18. SCHEDULED PUBLISHING (Status field on Project / Blog forms)

```
┌─── ADD / EDIT BLOG POST — STATUS SECTION ───────────────────────────────┐
│                                                                          │
│  STATUS                                                                  │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ ○ Published   (live immediately on save)                         │   │
│  │ ○ Draft       (not visible to public)                            │   │
│  │ ● Scheduled 🕐 (publish at a future time)                        │   │
│  │                                                                  │   │
│  │  Publish At: [ March 15, 2026 ▾ ]  [ 09:00 AM ▾ ]  [IST ▾]     │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │  ℹ Goes live in: 7 days, 22 hours, 14 minutes            │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  SCHEDULED ITEMS FILTER TAB (Blog/Projects table)                        │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │  [All] [Published] [Draft] [🕐 Scheduled (2)]                  │     │
│  │  # │ Title                     │ Scheduled For     │ Countdown │     │
│  │  1 │ Mobile Design Future      │ Mar 15  09:00 AM  │ 7d 22h    │     │
│  │  2 │ Cloud Solutions Deep Dive │ Mar 20  12:00 PM  │ 12d 3h    │     │
│  └────────────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 19. MAINTENANCE MODE (Settings sub-panel)

```
┌─── SETTINGS — MAINTENANCE MODE ────────────────────────────────────────┐
│  Breadcrumb: Settings > Maintenance Mode    (Super Admin only)           │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  ⚠ WARNING — This affects ALL public visitors immediately        │   │
│  │                                                                  │   │
│  │  Status:  [ OFF ══════════●ON ]   🔴 MAINTENANCE IS ACTIVE       │   │
│  │           Active for: 23 minutes                                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Maintenance Page Title:  { We'll be back soon              }           │
│  Message:                                                                │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ { We're upgrading our platform. Back in ~30 minutes.           } │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│  Expected Back At: [ March 7, 2026 ▾ ] [ 03:00 PM ▾ ]                  │
│                                                                          │
│  Allowed IPs (bypass — can still see live site):                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 49.x.x.x — Office IP  ●Active  [✕]                               │   │
│  │ { Enter IP... }  [+ Add IP]                                      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│                                   [Test Maintenance Page]                │
│                                   [Deactivate Maintenance]               │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 20. BACKUP & EXPORT

```
┌─── BACKUP & EXPORT ─────────────────────────────────────────────────────┐
│  Breadcrumb: Backup & Export                                             │
│                                                                          │
│  MANUAL EXPORT                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  [⬇ Export All Content as JSON]   [⬇ Export Media Index as CSV] │   │
│  │  Filename: anthatech-backup-2026-03-07.json                      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  AUTO-BACKUP SCHEDULE                                                    │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Weekly auto-backup:  [ OFF ═══════════●ON ]                     │   │
│  │  Saves to R2: anthatech-media/backups/weekly/                    │   │
│  │  Retain last: [ 4 backups ▾ ]                                    │   │
│  │  Next backup: Sunday, March 9 at 02:00 AM                        │   │
│  │  Last backup: ✅ March 2, 2026 at 02:01 AM  [⬇ Download]        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  RESTORE FROM BACKUP                                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  ⬆ Upload backup JSON:  [Browse File]  or drag & drop here       │   │
│  │                                                                  │   │
│  │  Diff preview after upload:                                      │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │ This will overwrite:                                     │   │   │
│  │  │ • 5 projects  • 3 blog posts  • 4 reviews               │   │   │
│  │  │ • 3 services  • 12 config keys                           │   │   │
│  │  │ Type RESTORE to confirm: {                            }  │   │   │
│  │  │                              [Cancel] [Restore Now]      │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 21. WEBHOOK MANAGER (Settings sub-panel)

```
┌─── SETTINGS — WEBHOOKS ─────────────────────────────────────────────────┐
│  Breadcrumb: Settings > Webhooks               [+ Add New Webhook]       │
│                                                                          │
│  ┌───┬──────────────┬──────────────────┬──────────────┬──────┬────────┐ │
│  │ # │ Name         │ Events           │ Last Trigger │Status│ Acts   │ │
│  ├───┼──────────────┼──────────────────┼──────────────┼──────┼────────┤ │
│  │ 1 │ Slack Notifs │[NewMsg][NewApply]│ 2 hrs ago ✅ │●Actv │✏️ ▶ 🗑│ │
│  │ 2 │ Zapier CRM   │[ProjPub][BlogPub]│ 1 day ago ✅ │●Actv │✏️ ▶ 🗑│ │
│  └───┴──────────────┴──────────────────┴──────────────┴──────┴────────┘ │
│                                                                          │
│  ADD / EDIT WEBHOOK MODAL                                                │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Name:          { Slack Notifications                          }  │   │
│  │ Endpoint URL:  { https://hooks.slack.com/services/xxx/yyy     }  │   │
│  │ Secret Key:    { ●●●●●●●●●●●●●●●●●  [🔄 Regenerate]          }  │   │
│  │                                                                  │   │
│  │ Trigger Events (multi-select):                                   │   │
│  │ ☑ New Contact Message    ☑ New Community Application            │   │
│  │ ☐ Project Published      ☐ Blog Post Published                  │   │
│  │ ☐ Maintenance Mode ON    ☐ Security Alert                       │   │
│  │                                                                  │   │
│  │ Status:  ● Active  ○ Paused                                      │   │
│  │  [Test Webhook →]   ← sends sample payload                      │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │ Response: ✅ 200 OK — "ok"  (12ms)                       │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  │                              [Cancel]  [Save Webhook]           │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 22. NOTIFICATION CENTER (Topbar Dropdown)

```
  Topbar — Bell 🔔³ click
  ┌──────────────────────────────────────────────┐
  │  🔔 Notifications                [Mark All Read]
  │  ──────────────────────────────────────────  │
  │  📬 [NEW] New contact from Lokesh Kumar       │
  │       2 hours ago                  [Dismiss] │
  │  ──────────────────────────────────────────  │
  │  👥 [NEW] Priya S. applied to Community       │
  │       5 hours ago                  [Dismiss] │
  │  ──────────────────────────────────────────  │
  │  ✅ Blog 'Digital Landscape' went live        │
  │       1 day ago (scheduled post)   [Dismiss] │
  │  ──────────────────────────────────────────  │
  │  🔴 [CRITICAL] Failed login: IP 182.x.x.x    │
  │       Mar 6 at 09:00 AM  [View Security]     │
  │  ──────────────────────────────────────────  │
  │  ⚠ Supabase bandwidth at 75% of 2GB limit   │
  │       Mar 5              [View Analytics]    │
  │  ──────────────────────────────────────────  │
  │             [View All Notifications →]       │
  └──────────────────────────────────────────────┘
```

---

## 23. BULK OPERATIONS BAR

### Appears at bottom of screen when table rows are checked
```
  ANY TABLE — after row checkboxes are selected
  ┌──┬──────────┬─────────────────────────┬────────┬──────┐
  │☑ │ [===img] │ RecruiterOne            │ ● Live │ ✏️ 🗑│
  │☑ │ [===img] │ Digital in              │ ● Live │ ✏️ 🗑│
  │☐ │ [===img] │ PayFlow Pro             │ ● Live │ ✏️ 🗑│
  └──┴──────────┴─────────────────────────┴────────┴──────┘

  ┌─────────────────────────────────────────────────────────────────┐
  │  ☑ 2 items selected                                             │
  │  [Publish All]  [Set to Draft]  [🗑 Delete All]  [✕ Clear Sel]  │
  └─────────────────────────────────────────────────────────────────┘

  BULK DELETE CONFIRMATION MODAL
  ┌──────────────────────────────────────────────────────────┐
  │  🗑 Delete 2 Projects?                                   │
  │  This action cannot be undone.                           │
  │  Both items will be permanently removed.                 │
  │                                                          │
  │  Type DELETE to confirm: {                           }   │
  │                                  [Cancel]  [Delete (2)]  │
  └──────────────────────────────────────────────────────────┘
```

---

## 24. CONTENT PREVIEW

```
  CONTENT EDITOR — Topbar actions
  ┌──────────────────────────────────────────────────────────┐
  │  [🕐 History]  [Preview ▾]  [Save Draft]  [Publish]      │
  │                    │                                     │
  │                    ├── 🖥 Desktop (1440px)                │
  │                    ├── 📟 Tablet  (768px)                 │
  │                    └── 📱 Mobile  (390px)                 │
  └──────────────────────────────────────────────────────────┘

  PREVIEW — Opens in new browser tab
  ┌──────────────────────────────────────────────────────────────────┐
  │  [🖥 Desktop]  [📟 Tablet]  [📱 Mobile]                          │
  │  ┌─────────────────────────────────────────────────────────┐     │
  │  │                                                         │     │
  │  │   ← iframe: www.anthatech.com                           │     │
  │  │   ?preview_token=abc123xyz                              │     │
  │  │   (renders draft content via signed token)              │     │
  │  │                                                         │     │
  │  │   [ LIVE PREVIEW OF DRAFT CONTENT ]                     │     │
  │  │                                                         │     │
  │  └─────────────────────────────────────────────────────────┘     │
  │  ⏱ Preview token expires in: 14:32                               │
  │  [Get Fresh Token]  ← re-signs without closing preview           │
  └──────────────────────────────────────────────────────────────────┘
```

---

## 25. API KEY MANAGER

```
┌─── API KEYS ────────────────────────────────────────────────────────────┐
│  Breadcrumb: API Keys                          [+ Add API Key]           │
│                                                                          │
│  ┌───┬──────────────┬─────────┬────────────┬───────────┬──────┬──────┐  │
│  │ # │ Name         │ Service │ Last Used  │ Created   │Status│ Acts │  │
│  ├───┼──────────────┼─────────┼────────────┼───────────┼──────┼──────┤  │
│  │ 1 │ Resend Prod  │[Email]  │ 2 hrs ago  │ Jan 2026  │●Actv │👁 🚫 │  │
│  │ 2 │ Brevo Backup │[Email]  │ Never      │ Feb 2026  │●Actv │👁 🚫 │  │
│  └───┴──────────────┴─────────┴────────────┴───────────┴──────┴──────┘  │
│                                                                          │
│  REVEAL KEY MODAL (password required)                                    │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 🔒 Re-enter your password to reveal this key                     │   │
│  │ { ●●●●●●●●●●●●              }  [Confirm]                        │   │
│  │                                                                  │   │
│  │ Resend Production Key:                                           │   │
│  │ rse_••••••••••••••••Ab3x  [👁 Reveal]  [📋 Copy]  [Revoke]      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 26. LOGIN PAGE

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│              ░░░░░░░░░░░░ GRADIENT BACKGROUND ░░░░░░░░░░░░              │
│                                                                          │
│                    ┌─────────────────────────────┐                      │
│                    │  [🔵 Antha Tech Logo]        │                      │
│                    │   Admin Panel               │                      │
│                    │  ───────────────────────    │                      │
│                    │                             │                      │
│                    │  Email                      │                      │
│                    │  { admin@anthatech.com    } │                      │
│                    │                             │                      │
│                    │  Password                   │                      │
│                    │  { ●●●●●●●●●●●●    👁     } │                      │
│                    │                             │                      │
│                    │  ☑ Remember me              │                      │
│                    │                             │                      │
│                    │  [    Sign In to Admin    ] │                      │
│                    │                             │                      │
│                    │  ─ MFA Step (if enabled) ─  │                      │
│                    │  { Enter 6-digit OTP      } │                      │
│                    │  [      Verify Code       ] │                      │
│                    │                             │                      │
│                    └─────────────────────────────┘                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 27. ADMIN PANEL PAGE MAP — FULL ROUTE HIERARCHY

```
ADMIN PANEL
│
├── /admin/login                        ← Auth gate (email + password + MFA)
├── /admin/dashboard                    ← Stats, quick actions, activity log
│
├── /admin/security                     ← Security Center (🔴 badge if alerts)
│   ├── /admin/security/overview        ← Score card, sessions, last login
│   ├── /admin/security/sessions        ← Active sessions + revoke
│   ├── /admin/security/mfa             ← TOTP setup, backup codes, enforce policy
│   ├── /admin/security/passwords       ← Password policy settings
│   ├── /admin/security/ip-blocklist    ← Blocked IPs + whitelist
│   ├── /admin/security/audit-log       ← Forensic audit trail + CSV export
│   └── /admin/security/alerts          ← Suspicious activity feed
│
├── /admin/content/hero                 ← Landing Hero editor + preview
├── /admin/content/about                ← About1 + About2 (tabs)
├── /admin/content/projects             ← Projects table (bulk select, filter tabs)
│   └── /admin/content/projects/:id    ← Edit project + version history drawer
├── /admin/content/services             ← Services table
│   └── /admin/content/services/:id    ← Edit service (4 tabs)
├── /admin/content/highlights           ← Highlights section editor
├── /admin/content/process              ← Process steps editor (drag-reorder)
├── /admin/content/reviews              ← Testimonials table + CRUD
├── /admin/content/community            ← Community content + members (4 tabs)
├── /admin/content/blog                 ← Blog posts table (+ Scheduled tab)
│   └── /admin/content/blog/:id        ← Edit post + scheduled publish + history
│
├── /admin/messages                     ← Contact inbox + detail drawer
├── /admin/media                        ← R2 media library (grid/list)
│
├── /admin/analytics/traffic            ← CF traffic, top pages, countries
├── /admin/analytics/performance        ← Cache rate, error rate, free tier bars
├── /admin/analytics/contact            ← Contact form submission analytics
└── /admin/analytics/community          ← Applications + approval rate
│
├── /admin/settings/contact             ← Contact info
├── /admin/settings/social              ← Social links
├── /admin/settings/seo                 ← SEO / meta tags per page
├── /admin/settings/maintenance         ← Maintenance mode + allowed IPs
└── /admin/settings/webhooks            ← Webhook manager + test
│
├── /admin/api-keys                     ← API key vault (encrypted, reveal with PW)
├── /admin/backup                       ← Backup, export JSON, restore with diff
└── /admin/users                        ← Admin user management (Super Admin only)
```
