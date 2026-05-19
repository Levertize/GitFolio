<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/github.svg" width="60" height="60" alt="GitFolio Logo" />
  <br/>
  <h1>🚀 GitFolio</h1>
  <p><strong>A premium, automated developer portfolio and dashboard generated directly from your GitHub data.</strong></p>
  <p>
    <a href="https://github.com/levertize/gitfolio"><img src="https://img.shields.io/github/stars/levertize/gitfolio?style=for-the-badge&color=4ade80&logo=github&logoColor=white" alt="GitHub stars" /></a>
    <a href="https://github.com/levertize/gitfolio/network/members"><img src="https://img.shields.io/github/forks/levertize/gitfolio?style=for-the-badge&color=3b82f6&logo=github&logoColor=white" alt="GitHub forks" /></a>
    <a href="https://github.com/levertize/gitfolio/issues"><img src="https://img.shields.io/github/issues/levertize/gitfolio?style=for-the-badge&color=a855f7&logo=github&logoColor=white" alt="GitHub issues" /></a>
    <img src="https://img.shields.io/github/license/levertize/gitfolio?style=for-the-badge&color=ec4899" alt="License" />
  </p>
</div>

---

## 🌟 Overview

GitFolio is a modern web application designed for developers (especially fresh graduates) who want to showcase their coding activity, repositories, and technical skills without the hassle of setting up a portfolio from scratch. 

Simply log in with GitHub, and GitFolio automatically generates a beautiful, premium portfolio page complete with your contribution heatmap, top languages, and featured projects. Focus on writing code; let GitFolio handle the presentation.

## ✨ Key Features

- ⚡ **Instant Portfolio Generation:** Fetches your GitHub stats, repositories, and contribution graph in seconds.
- 🎨 **Premium Aesthetics:** Modern UI featuring glassmorphism, glowing accents, and smooth Framer Motion animations.
- 🌈 **Dynamic Themes:** Customizable accent colors (Green, Blue, Purple, Orange, Pink, Cyan) to match your personal brand.
- ⚙️ **Interactive Dashboard:** Manage your profile, hide/show specific repositories, and customize your "About Me" section effortlessly.
- 💼 **Custom Links & Availability:** Add social links and a sleek, glowing "Open to Work" or "Freelance" availability badge to attract recruiters.
- 🔗 **Custom Domain Ready:** Claim a custom slug (`gitfolio.app/your-name`) for a professional, easy-to-share link.
- 🚀 **High Performance:** Heavily cached with Redis for near-instant page load times, preventing GitHub API rate limits.

## 🛠️ Tech Stack & Architecture

This project is built using modern web development standards and a robust tech stack:

<div align="center">
  <img src="https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/D3.js-F9A03C?style=for-the-badge&logo=d3.js&logoColor=white" alt="D3.js" />
  <br/>
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Upstash_Redis-FF2A55?style=for-the-badge&logo=upstash&logoColor=white" alt="Upstash" />
  <img src="https://img.shields.io/badge/NextAuth.js-000000?style=for-the-badge&logo=nextauth.js&logoColor=white" alt="NextAuth" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</div>

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Animations:** Framer Motion
- **Data Visualization:** D3.js (Custom Contribution Heatmap & Language Donut Chart)
- **Authentication:** NextAuth.js v5 (Auth.js) via GitHub Provider
- **Database:** Supabase (PostgreSQL) for user profiles and settings
- **Caching:** Upstash Redis for caching heavy GitHub API payloads
- **Deployment:** Vercel

## 🚀 Quick Start

For detailed step-by-step instructions including Database schemas, GitHub OAuth configuration, and Redis setup, please read our comprehensive [**DOCUMENTATION.md**](./DOCUMENTATION.md) file.

### Basic Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/levertize/gitfolio.git
   cd gitfolio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment file and fill in your keys (Supabase, Upstash, GitHub OAuth).
   ```bash
   cp .env.example .env.local
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check the [issues page](https://github.com/levertize/gitfolio/issues) if you want to contribute.

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).

---
<div align="center">
  <i>Made by <a href="https://github.com/levertize">Lev</a> with ❤️ for the developer community.</i>
</div>
