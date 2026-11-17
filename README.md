# RIO by Vink (Resell It Online)

> An all-India second-hand buying and selling marketplace connecting buyers and sellers across Indian cities with trust, simplicity, and speed.

---

## 🚀 Features

- **Minimalist Mobile-First Design:** Warm-charcoal dark mode (`#121212`) by default with clean Paper-White toggle, bento-grid cards, and sticky mobile bottom navigation.
- **Indian Localization:** All pricing formatted in Indian Rupees with the Indian numbering comma system (`₹1,25,000`), default Indian cities (Visakhapatnam, Hyderabad, Bengaluru, Mumbai, Delhi NCR, Chennai, Pune), and location radius filters (5 km, 10 km, City-wide, All India).
- **Client-Side Image Compression:** Built-in WebP/JPEG compression targeting max 200KB prior to uploading to Supabase Storage.
- **Dynamic Sell Form & Quota Paywall:** Dynamic category fields with automated category listing quota checks (1 ad/30d for Mobiles & Electronics, 1 ad/60d for Vehicles & Property, 2 ads/30d for others).
- **Real-Time Chat & Negotiation:** Pinned item cards, quick negotiation chips (*"Is this still available?"*, *"Make an Offer"* structured cards, *"Where can we meet?"*), seller quick actions (*"Mark as Sold"*, *"Share Phone Number"*), and statutory consumer safety tip banner.
- **Monetization Ready:** "Boost Ad" flow (24-Hour Top Boost ₹29, 7-Day Featured Spotlight ₹99) and "RIO Pro for Dealers (₹499/mo)".
- **Statutory & Legal Compliance:** Terms of Use, DPDP Act 2023 Privacy Policy, Prohibited Items List, and Grievance Officer & Trust Center with 48h SLA and takedown/complaint form.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite 6, TypeScript (strict mode), Tailwind CSS 3
- **Icons:** Lucide Icons (`lucide-react`)
- **Backend & Database:** Supabase (Auth, PostgreSQL, Storage, Realtime)
- **Deployment:** Vercel (configured with `vercel.json` SPA rewrites)

---

## ⚙️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/shashank-0913/RIO.git
cd RIO
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
Execute the SQL migration in `supabase/schema.sql` inside your Supabase project's SQL Editor to set up tables, RLS policies, anti-tampering triggers, and listing quota functions.

### 5. Run local development
```bash
npm run dev
```

### 6. Build for production
```bash
npm run build
```
