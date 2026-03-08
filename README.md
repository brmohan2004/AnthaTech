# Antha Tech 🚀

A comprehensive digital ecosystem featuring a high-performance **Public Website** and a robust **Admin Panel**. Built with modern web technologies, this project is designed for speed, scalability, and ease of management.

## 🌟 Project Overview

This repository contains two main applications:
1.  **Public Website**: A stunning, visually engaging landing page for clients and community members.
2.  **Admin Panel**: A secure management dashboard to control website content in real-time.

---

## ✨ Features

### 🌐 Public Website
- **Modern UI/UX**: Built with React and Framer Motion for smooth, premium animations.
- **Dynamic Content**: All sections (Hero, Projects, Services, Reviews) are fetched dynamically from Supabase.
- **Performance Optimized**: 
    - **Smart Caching**: In-memory caching with a 5-minute TTL to reduce database load and provide instant navigation.
    - **Throttling**: Built-in 1-minute cooldown for form submissions to prevent spam.
- **SEO Ready**: Semantic HTML and optimized meta tags.

### 🔐 Admin Panel
- **Content Management (CMS)**: Manage every part of the public website without touching code.
- **Real-time Updates**: Changes made in the admin panel reflect on the public site instantly.
- **Secure Access**: Integrated with Supabase Auth for restricted access.
- **Media Support**: Built-in logic for Cloudinary and Supabase storage.

---

## 🛠️ Tech Stack

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: Vanilla CSS / CSS Modules
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend/Database**: [Supabase](https://supabase.com/)
- **Media Storage**: Cloudinary / Supabase Storage
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/)

---

## 📂 Project Structure

```bash
AnthaTech/
├── admin-panel/          # Admin Dashboard (Vite project)
│   ├── src/
│   │   ├── api/          # Admin-specific data handlers
│   │   ├── components/   # Reusable UI elements
│   │   └── pages/        # Management modules (Dashboard, Projects, etc.)
│   └── public/           # Static assets (Favicon)
├── public_website/       # Public Landing Page (Vite project)
│   ├── src/
│   │   ├── api/          # Content fetching with Caching/Throttling
│   │   ├── Shared/       # Global components (NavBar, Footer)
│   │   └── landing_Page/ # Main landing page components
│   └── public/           # Static assets & Cloudflare _redirects
└── supabase/             # Database schema and SQL exports
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Local Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/brmohan2004/AnthaTech.git
   cd AnthaTech
   ```

2. **Setup Admin Panel**:
   ```bash
   cd admin-panel
   npm install
   # Create .env and add Supabase/Cloudinary keys
   npm run dev
   ```

3. **Setup Public Website**:
   ```bash
   cd ../public_website
   npm install
   # Create .env and add VITE_SUPABASE_URL/KEY
   npm run dev
   ```

---

## ☁️ Deployment

### Cloudflare Pages
This project is configured for Cloudflare Pages with separate URLs:
1. Connect your GitHub repo to Cloudflare.
2. Create two projects:
   - **Public Site**: Set root directory to `public_website`.
   - **Admin Panel**: Set root directory to `admin-panel`.
3. Add your Environment Variables in the Cloudflare Dashboard.

---

## 🔒 Security & Optimization
- **SPA Support**: `_redirects` files ensure clean routing on Cloudflare.
- **Form Protection**: Throttling logic in `api/content.js` prevents API abuse.
- **Environment Protection**: `.gitignore` is configured to never leak your secrets.

---

Developed with ❤️ by [Mohan](https://github.com/brmohan2004)