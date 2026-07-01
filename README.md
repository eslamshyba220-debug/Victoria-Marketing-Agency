# 🏢 Victoria Marketing Agency ERP & CRM System

An enterprise-grade, high-performance executive SaaS platform custom-engineered for **Victoria Marketing Agency** to manage core operational workflows, financial ledger systems, content planners, team configurations, paid campaign performance metrics, and client accounts in real time.

---

## 🎨 Design Theme & Core Principles

This system implements an executive **Bento Grid Design System** utilizing a professional light theme to project authority, precision, and high operational capability:
- **Default Light Theme**: A clean, pure-white interface designed for comfortable daytime corporate operations.
- **Consistent Visual Palette**: Employs Blue (`#2563EB`) as the primary brand color, styled along soft gray borders, deep-slate text, and subtle shadows.
- **Strict Data Mandate**: Real-time operational reporting without pre-populated dummy values or simulated telemetry clutter. When the database has no records, professional context-appropriate empty state illustrations are shown.
- **Bidirectional Localization**: Native Support for English (LTR) and Arabic (RTL) with dynamic layout adjustments.

---

## 🚀 Key Modules & Capabilities

1. **Executive Dashboard**: Unified overview of live agency ROAS, client balances, critical tasks, and calendar events.
2. **Client Directory**: Central ledger mapping client companies, industries, contact options, active contracts, and documents.
3. **CRM Lead Tracker**: High-fidelity pipeline with drag-and-drop statuses, contact logs, budget scopes, and assigned sales representatives.
4. **Paid Media Analyzer (ROAS)**: Real-time tracking of campaigns across Meta, Google Ads, TikTok, LinkedIn, and Snapchat with automatic metric calculated indices.
5. **Content Planner**: A rich calendar scheduling content pieces, copywriting scripts, design specifications, and review statuses.
6. **Company Scheduler**: Core task pipelines grouped by parent projects and client meetings with integration buttons.
7. **Employee Registry**: Secure team roster documenting roles, salaries, departments, and active operational statuses.
8. **Invoicing & Taxation**: Fast VAT tax invoice builder compliant with UAE tax guidelines (5% standard VAT, TRN calculations, custom sequential prefixes).
9. **Executive Reporting**: Generative AI reporting powered by **Google Gemini API** for performance auditing.
10. **Live Audit Logging**: Background notifications capturing database transactions and executive logins.

---

## 📁 Folder Structure

```
├── /assets/                # Standard applet configuration tracking
├── /src/
│   ├── /components/        # Modular, standalone view components
│   │   ├── Sidebar.tsx     # Clean Light Mode sidebar navigation & simulation
│   │   ├── Dashboard.tsx   # Core stats panels, quick actions, & summaries
│   │   ├── Clients.tsx     # Ledger accounts & contract managers
│   │   ├── CRM.tsx         # Lead pipelines & engagement records
│   │   ├── PaidAds.tsx     # Paid media analytics, spent ratios, & ROAS
│   │   ├── ContentPlanner.tsx # Multi-channel content layout boards
│   │   ├── CompanyPlanner.tsx # Task manager & synchronized meeting scheduler
│   │   ├── Employees.tsx   # Human resources records & payroll indicators
│   │   ├── Invoices.tsx    # UAE VAT invoice builder & payment status ledger
│   │   ├── Reports.tsx     # Intelligent executive summaries with Gemini AI
│   │   ├── Settings.tsx    # Firm profile & tax registration configurations
│   │   └── SupabaseGuide.tsx # In-app direct schema guide & diagnostic assistant
│   ├── App.tsx             # System orchestrator & route handling
│   ├── main.tsx            # React application bootstrapper
│   ├── index.css           # Global custom scrollbars, typography & Tailwind V4 imports
│   ├── types.ts            # Complete enterprise data structure declarations
│   └── supabaseClient.ts   # Unified API bridge supporting Supabase OR localStorage fallback
├── index.html              # Main HTML frame
├── package.json            # Node.js manifest with fully resolved dependencies
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite asset compiling setup
├── database.sql            # Executive table structures, seed queries & RLS policies
└── .env.example            # Environment configuration template
```

---

## 🔑 Environment Variables

The application references the following configurations inside `.env`:

```env
# Google Gemini API key for automated executive report analyses
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Supabase direct connection keys (from project settings)
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key-here"
```

---

## ⚙️ Installation & Local Setup

### 1. Clone & Install Dependencies
First, ensure you have **Node.js v18+** installed. In your local terminal, execute:

```bash
# Clone or extract this project folder
cd victoria-marketing-agency

# Install all package dependencies
npm install
```

### 2. Database Provisioning (Optional - Supabase)
To establish persistent real-time storage:
1. Create a free project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** on the left panel.
3. Paste the contents of the `/database.sql` file from this project and click **Run**.
4. Navigate to **Project Settings -> API** to retrieve your unique URL and Anon Key.
5. Create a local `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```
   Provide your Supabase URL and Anon Key in `.env`.

*If you do not have a Supabase database ready, the system will automatically activate its high-performance Client-Side Local Storage Fallback engine, enabling you to test every feature instantly without any setup!*

### 3. Local Development Commands
To boot the local development server:

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 4. Build for Production
To build a static optimized bundle ready for hosting:

```bash
# Compile and package application
npm run build
```

This compiles optimized assets directly into the `/dist` directory, ready to be deployed to static hosting solutions (Vercel, Netlify, Cloudflare Pages, AWS S3, or Cloud Run).

---

## 🛡️ Administrative Authentication
To log in securely, use the authorized system credentials:

- **Eslam Shyba** (Agency Owner)
- **Authorized Email**: `eslamshyba220@gmail.com`
- **Authorized Password**: `admin123`
