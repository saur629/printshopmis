# PrintFlow MIS — Printing Shop Management System

A complete, production-ready MIS for printing shops built with **Next.js 14**, **Node.js**, **Prisma ORM**, and **SQLite/PostgreSQL**.

---

## 🚀 Quick Start

### 1. Extract and install dependencies

```bash
cd printflow-mis
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and update:
- `NEXTAUTH_SECRET` — any random 32+ character string
- `TWILIO_*` — your Twilio credentials for SMS (optional)
- `NEXT_PUBLIC_SHOP_NAME` — your shop name

### 3. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Create the database and tables
npx prisma db push

# Seed with sample data + default admin user
node prisma/seed.js
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Default login:**
- Username: `admin`
- Password: `admin123`

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18 |
| Styling | Tailwind CSS + inline styles |
| Charts | Recharts |
| Backend | Next.js API Routes (Node.js) |
| Auth | NextAuth.js (JWT + credentials) |
| ORM | Prisma |
| Database | SQLite (dev) / PostgreSQL (prod) |
| SMS | Twilio |
| PDF | jsPDF + autoTable |

---

## 🗂️ Module Overview

| Module | Path | Description |
|--------|------|-------------|
| Dashboard | `/dashboard` | KPIs, charts, activity feed |
| Job Cards | `/job-cards` | Create & manage print jobs |
| Job Status | `/job-status` | Kanban board with drag-to-move |
| Quotations | `/quotation` | Create, approve, convert to jobs |
| Invoices | `/invoice` | GST invoicing with preview |
| Payments | `/payments` | Multi-mode payment ledger |
| Purchase | `/purchase` | POs + stock/inventory |
| Attendance | `/attendance` | Staff calendar + daily marking |
| Reports | `/reports` | Revenue, job-wise, client-wise |
| Access Control | `/access-control` | Role permissions + user CRUD |
| Masters | `/masters` | Clients, suppliers, job types, items |
| SMS Alerts | `/sms` | Templates + send + logs via Twilio |

---

## 👥 Roles & Permissions

| Role | Access |
|------|--------|
| **Super Admin** | Full access to everything |
| **Admin** | All modules except Access Control |
| **Operator** | Job cards, attendance view, basic reports |
| **User** | Dashboard and job status view only |

---

## 🛢️ Database

**Development (default):** SQLite — zero setup, file stored at `prisma/dev.db`

**Production (recommended):** PostgreSQL

```env
# In .env, change to:
DATABASE_URL="postgresql://user:password@localhost:5432/printflow"
```

Then run:
```bash
npx prisma db push
node prisma/seed.js
```

---

## 📱 SMS Configuration (Twilio)

1. Create a [Twilio account](https://twilio.com)
2. Get your Account SID, Auth Token, and a phone number
3. Update `.env`:

```env
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+91xxxxxxxxxx"
```

> **Without Twilio:** SMS will be logged to console in development mode. All other features work normally.

---

## 🏗️ Production Deployment

### Build

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Set all environment variables in the Vercel dashboard.

### Deploy to VPS (Ubuntu)

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
npm install -g pm2

# Build and start
npm run build
pm2 start npm --name "printflow" -- start
pm2 save
pm2 startup
```

---

## 📁 Project Structure

```
printflow-mis/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.js             # Sample data seeder
├── src/
│   ├── app/
│   │   ├── api/            # All API routes
│   │   │   ├── auth/       # NextAuth
│   │   │   ├── job-cards/  # Job CRUD
│   │   │   ├── invoices/   # Invoice CRUD
│   │   │   ├── payments/   # Payment records
│   │   │   ├── quotations/ # Quotation CRUD
│   │   │   ├── purchase/   # Purchase orders
│   │   │   ├── attendance/ # Attendance
│   │   │   ├── reports/    # Analytics
│   │   │   ├── users/      # User management
│   │   │   ├── sms/        # SMS via Twilio
│   │   │   └── masters/    # Clients, suppliers
│   │   ├── dashboard/      # Dashboard page
│   │   ├── job-cards/      # Job cards page
│   │   ├── job-status/     # Kanban board
│   │   ├── quotation/      # Quotations
│   │   ├── invoice/        # Invoices
│   │   ├── payments/       # Payments
│   │   ├── purchase/       # Purchase
│   │   ├── attendance/     # Attendance
│   │   ├── reports/        # Reports
│   │   ├── access-control/ # User management
│   │   ├── masters/        # Master data
│   │   ├── sms/            # SMS module
│   │   └── login/          # Login page
│   ├── components/
│   │   ├── ui/             # Reusable UI components
│   │   └── layout/         # Sidebar, Topbar, PageShell
│   └── lib/
│       ├── prisma.ts       # DB client
│       └── utils.ts        # Helpers
├── .env.example
├── package.json
├── tailwind.config.js
└── README.md
```

---

## 🔧 Customization

### Change Shop Details
Edit `.env`:
```env
NEXT_PUBLIC_SHOP_NAME="Your Print House"
NEXT_PUBLIC_SHOP_ADDRESS="Your Address"
NEXT_PUBLIC_SHOP_GST="Your GST Number"
NEXT_PUBLIC_SHOP_PHONE="Your Phone"
```

### Add New Job Types
Go to **Masters → Job Types** and add via the UI, or directly in `prisma/seed.js`.

### Change Currency/Locale
Edit `src/lib/utils.ts` → `formatCurrency()` function.

---

## 📝 License

MIT — free to use and modify for your printing business.
