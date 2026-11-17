# AGENTS.md — Development & Agent Guidelines

## 1. Project Overview
- **Name:** RIO by Vink (Resell It Online)
- **Concept:** An all-India second-hand buying and selling marketplace connecting buyers and sellers across Indian cities with trust, simplicity, and speed.

---

## 2. Tech Stack
- **Framework:** React + Vite
- **Language:** TypeScript (`strict` mode enabled; strict typing required everywhere)
- **Styling:** Tailwind CSS
- **Iconography:** Lucide Icons (`lucide-react`)
- **Backend & Cloud:** Supabase
  - Supabase Auth (Phone/Email/Social login)
  - PostgreSQL Database (with relational schema & triggers)
  - Supabase Storage (image/asset uploads for listings)
  - Supabase Realtime (live chats, instant notifications, status updates)

---

## 3. Design System & UI Architecture
- **Approach:** Minimalist, mobile-first design tailored for mobile screens and responsive on desktop.
- **Theme & Colors:**
  - **Dark Mode (Default):**
    - Background: Warm-charcoal (`#121212`)
    - Elevated Cards: `#1E1E1E`
    - Typography: Crisp white / off-white (`#F9FAFB`, `#E5E7EB`, `#9CA3AF`)
    - Accents: Emerald (`#10B981` / `#059669`) & Amber (`#F59E0B` / `#D97706`)
  - **Light Mode:** Clean Paper-White theme with a persistent mode toggle.
- **Card Style:** Bento-grid style summary cards for categories, highlights, and featured listings.
- **Navigation:**
  - Sticky mobile bottom navigation bar featuring:
    1. **Home**
    2. **Search**
    3. **+ Sell** (prominent action)
    4. **Chats**
    5. **Profile**

---

## 4. Indian Localization & Compliance
- **Currency & Formatting:**
  - Format all pricing in Indian Rupees (`₹`).
  - Use Indian numbering comma formatting (e.g., `₹1,25,000` instead of standard international formatting `₹125,000`).
- **Default Cities:**
  - Visakhapatnam
  - Hyderabad
  - Bengaluru
  - Mumbai
  - Delhi NCR
  - Chennai
  - Pune
- **Statutory & Legal Compliance:**
  - Include dedicated Indian compliance navigation links and pages:
    - Terms of Service
    - DPDP Privacy Policy (Digital Personal Data Protection Act compliance)
    - Prohibited Items List
    - Grievance Officer details (name, designation, redressal mechanism, and contact info)

---

## 5. Security & Data Integrity
- **Supabase Keys:**
  - **NEVER** expose the Supabase `service_role` key in frontend code, client bundles, or repository files.
  - Client side must only utilize the public `anon` key alongside Supabase Auth JWTs.
- **Row-Level Security (RLS):**
  - **ALWAYS** enable and enforce Row-Level Security (RLS) on every PostgreSQL table.
  - Write granular RLS policies for `SELECT`, `INSERT`, `UPDATE`, and `DELETE` operations ensuring users can only modify their own listings, messages, and profile data.

---

## 6. Verification Rule
- **Mandatory Quality Check:** After **every** code edit or modification, run:
  ```bash
  npm run build
  # or
  npx tsc --noEmit
  ```
- **Zero Errors Policy:** Verify that there are **zero** TypeScript compiler errors or Vite build failures before completing any task.

