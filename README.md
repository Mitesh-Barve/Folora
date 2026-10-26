# Folora — A Quiet, Premium Home for Words

Preview: [_(live URL to be added once deployed)_](https://folora.vercel.app/)

## Overview

Folora is a full-stack blogging platform inspired by Medium — a minimalist, reading-first space where writers publish essays and stories and readers discover them. It bridges the gap between authors looking for a clean, distraction-free writing environment and readers who want a calm, premium place to consume long-form content.

Authors get a focused editor with rich formatting, inline and cover images, tags, and a personal dashboard to manage, edit, and delete their posts. Readers can browse an infinite feed, search, follow authors, like or dislike posts, save stories for later, and get an AI-generated summary of any article with a single click.

The interface follows a deliberate brand system — forest green, warm paper, and sand accents with elegant serif headlines — and is fully responsive across desktop, tablet, and mobile, with light, eye-comfortable reading surfaces throughout.

Beyond core publishing, Folora emphasizes trust and polish with email verification, secure authenticated sessions, and AI-assisted content previews — all built with scalability in mind.

## Features

- **Responsive Design** — adapts cleanly across desktop, tablet, and mobile
- **Rich Editor (TipTap)** — headings, lists, code blocks, quotes, inline images, drag-and-drop
- **Image Uploads + Crop** — Cloudinary-backed uploads with a Medium-style crop dialog for body, cover, and avatar images
- **AI Article Summarizer** — on-demand Gemini-generated TL;DR, cached per post
- **Search & Browse** — keyword search and an infinite-scrolling feed
- **Social Actions** — like / dislike, save for later, and follow authors
- **Author Dashboard** — manage, edit, and delete your published posts
- **Profile & Verification** — user profile with avatar and email verification via OTP
- **Secure Authentication** — JWT access/refresh sessions plus Google OAuth

## Screenshots

### 🏠 Home / Landing
Hero landing introducing the platform.

### 📰 Explore Feed
Infinite scroll of story cards with cover thumbnails, tags, and reactions.

### ✍️ Editor
Distraction-free TipTap writing surface with image support.

### 📖 Reading View
Calm, serif-first article page with the AI summary panel.

### 📊 My Blogs / Dashboard
Author's posts with edit and delete actions.

## 🔧 Tech Stack

### Frontend
- **React + Vite + TypeScript** for a fast, typed component architecture
- **Tailwind CSS** with a custom Folora design-token theme (Playfair Display + sans UI)
- **TipTap** for the rich-text editor, **Framer Motion** for animation, **Recoil** for state

### Backend
- **Hono** running on **Cloudflare Workers** (edge serverless API)
- **Prisma ORM** with **PostgreSQL** via **Prisma Accelerate**
- Shared **Zod** validation package (`@om_wadhi/common`) across client and server

### Authentication
- **JWT** access/refresh tokens delivered via secure cookies
- **Google OAuth** and **bcrypt** password hashing
- **Resend** for OTP-based email verification

### Integrations
- **Cloudinary** (unsigned presets) for image hosting
- **Google Gemini** for AI article summaries

### Deployment
- Frontend on **Vercel**, backend on **Cloudflare Workers**, database on **Prisma Accelerate**

## Contributors

- Mitesh-Barve

## License

This project is licensed under the MIT License.
