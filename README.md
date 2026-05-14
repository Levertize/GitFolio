<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/github.svg" width="60" height="60" alt="GitFolio Logo" />
  <h1>GitFolio</h1>
  <p>A premium, automated developer portfolio and dashboard generated directly from your GitHub data.</p>
</div>

---

## 🌟 Overview

GitFolio is a modern web application designed for developers (especially fresh graduates) who want to showcase their coding activity, repositories, and technical skills without the hassle of setting up a portfolio from scratch. 

Simply log in with GitHub, and GitFolio automatically generates a beautiful, premium portfolio page complete with your contribution heatmap, top languages, and featured projects.

## ✨ Features

- **Automated Portfolio Generation:** Fetches your GitHub stats, repositories, and contribution graph.
- **Premium Aesthetics:** Modern UI with glassmorphism, glowing accents, and smooth Framer Motion animations.
- **Dynamic Themes:** Customizable accent colors to match your personal brand.
- **Interactive Dashboard:** Manage your profile, hide/show specific repositories, and customize your "About Me" section.
- **Custom Links & Availability:** Add social links and a sleek "Open to Work" / "Freelance" availability badge.
- **Custom Domain Ready:** Claim a custom slug (`gitfolio.app/your-name`) for a professional look.
- **High Performance:** Cached heavily with Redis for instant load times.

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Components)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Charts:** [D3.js](https://d3js.org/) (Custom Contribution Heatmap)
- **Auth:** [NextAuth.js v5](https://authjs.dev/) (Auth.js)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Caching:** [Upstash Redis](https://upstash.com/)
- **Deployment:** [Vercel](https://vercel.com/)

## 🚀 Quick Start

For detailed step-by-step instructions including Database schemas and GitHub OAuth configuration, please see the [**DOCUMENTATION.md**](./DOCUMENTATION.md) file.

### Basic Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` (See docs for variables)
4. Run the development server: `npm run dev`

## 📄 License

This project is licensed under the MIT License.

---
<div align="center">
  <i>Made with ❤️ for the developer community.</i>
</div>
