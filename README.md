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

##  Project Structure

```bash
AnthaTech/
├── admin-panel/          # Admin Dashboard (Vite project)
├── public_website/       # Public Landing Page (Vite project)
└── supabase/             # Database schema and SQL exports
```

---

## 🔑 Environment Configuration & Credentials

To run these projects, you need to set up environment variables in `.env` files within each project folder.

### 1. Supabase Credentials (Required for both)
- **VITE_SUPABASE_URL**: Go to your [Supabase Dashboard](https://app.supabase.com/) > Project Settings > API. Copy the **Project URL**.
- **VITE_SUPABASE_ANON_KEY**: In the same API settings page, copy the **`anon` `public`** key.
- **SUPABASE_SERVICE_ROLE_KEY** (Admin Panel only): In the same API settings page, copy the **`service_role` `secret`** key. (⚠️ *Keep this private*).

### 2. Cloudinary Credentials (Admin Panel - Media)
- **VITE_CLOUDINARY_CLOUD_NAME**: Found on your [Cloudinary Dashboard](https://cloudinary.com/console).
- **VITE_CLOUDINARY_UPLOAD_PRESET**: Created in Cloudinary Settings > Upload > Upload presets (Enable "Unsigned" uploading).

### 3. Brevo Credentials (Admin Panel - Emails)
- **BREVO_API_KEY**: Sign up at [Brevo (Sendinblue)](https://www.brevo.com/) > SMTP & API > API Keys.

---

## 🚀 How to Run Locally

### Step 1: Clone the repository
```bash
git clone https://github.com/brmohan2004/AnthaTech.git
cd AnthaTech
```

### Step 2: Setup and Run Admin Panel
```bash
cd admin-panel
npm install
# Create a .env file based on .env.example and add your keys
npm run dev
```
- **Access**: `http://localhost:5173` (or the port shown in terminal).

### Step 3: Setup and Run Public Website
Open a new terminal:
```bash
cd public_website
npm install
# Create a .env file based on .env.example and add your keys
npm run dev
```
- **Access**: `http://localhost:5173` (Vite will likely use `5174` if Admin is running).

---

## ☁️ How to Deploy (Cloudflare Pages)

We use **Cloudflare Pages** for deployment because it is fast and supports monorepos easily.

### Deployment Steps:
1.  **Connect GitHub**: Log in to [Cloudflare](https://dash.cloudflare.com/), go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2.  **Deploy Public Website**:
    - **Project Name**: `anthatech-public`
    - **Root directory**: `public_website`
    - **Build command**: `npm run build`
    - **Build output directory**: `dist`
    - **Environment Variables**: Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3.  **Deploy Admin Panel**:
    - Repeat the process with a new project.
    - **Project Name**: `anthatech-admin`
    - **Root directory**: `admin-panel`
    - **Build command**: `npm run build`
    - **Build output directory**: `dist`
    - **Environment Variables**: Add all keys from the Admin `.env` file.

### Custom Domains:
You can assign custom domains like `anthatech.com` to the Public site and `admin.anthatech.com` to the Admin Panel in the **Custom Domains** tab of each Cloudflare project.

---

## 🔒 Security & Optimization
- **SPA Support**: `_redirects` files in the `public` folders ensure that page refreshes on sub-routes don't cause 404 errors.
- **Protection**: `.ignore` files are set up to ensure your private `.env` keys are never pushed to GitHub.

---

Developed with ❤️ by [Mohan](https://github.com/brmohan2004)