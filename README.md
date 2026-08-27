# 📊 RFP Dashboard & AI Tender Management System

An intelligent, full-stack Request for Proposal (RFP) & Tender Management System built with **Next.js 16**, **TypeScript**, **Drizzle ORM**, **Neon PostgreSQL**, **Google Gemini AI**, and **Cloudinary**.

---

## ✨ Key Features

- **🤖 AI-Powered Tender Extraction**: Upload official RFP PDF documents and let Google Gemini AI automatically parse, analyze, and populate tender metadata (Client Name, Title, State, Value, EMD, Submission Dates, Eligibility, Priority, and Remarks).
- **🔒 Duplicate PDF Detection**: Built-in SHA-256 binary content-hashing system that prevents uploading duplicate RFP documents across both manual and AI extraction workflows (even if the file is renamed).
- **📦 Smart PDF Optimization**: Automatically compresses uploaded PDF files using `pdf-lib` to reduce storage size before uploading to Cloudinary.
- **📈 Comprehensive Tender Tracking**: Manage tenders through all lifecycle stages: Draft, Technical Evaluation, Commercial Evaluation, EMD Status, Quotation, Margin analysis, and Award Status.
- **💬 Team Discussions & Collaboration**: Built-in discussion thread per tender for team collaboration and audit tracking.
- **🔐 Secure Authentication**: Integrated NextAuth.js supporting Google OAuth authentication.
- **🎨 Modern UI/UX**: Designed using Tailwind CSS v4, Shadcn UI components, Base UI, Dark/Light modes, Lucide icons, and responsive data tables.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) with React 19 & Turbopack
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Neon PostgreSQL](https://neon.tech/) (Serverless Postgres)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) & Drizzle Kit
- **AI Engine**: [Google Gemini AI API (`@google/generative-ai`)](https://ai.google.dev/)
- **Storage & Compression**: [Cloudinary](https://cloudinary.com/) (Raw file hosting) & [pdf-lib](https://pdf-lib.js.org/)
- **Authentication**: [NextAuth.js v4](https://next-auth.js.org/) (Google OAuth Provider)
- **State & Data Fetching**: [TanStack React Query v5](https://tanstack.com/query/latest) & Zustand
- **Form & Validation**: React Hook Form, Zod schema validation
- **Styling**: Tailwind CSS v4, Lucide React icons, Sonner toast notifications
- **Package Manager**: [Bun](https://bun.sh/)

---

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

Make sure you have the following installed on your system:
- **Node.js**: `v20.x` or higher
- **Bun**: `v1.x` (`npm install -g bun` or refer to [bun.sh](https://bun.sh))
- **Git**

You will also need accounts/credentials for:
1. **Neon Database** (or any PostgreSQL connection string)
2. **Google Cloud Console** (for Google OAuth Client ID & Secret)
3. **Cloudinary** (for cloud PDF storage)
4. **Google AI Studio** (for Gemini API Key)

---

### 1. Clone the Repository

```bash
git clone https://github.com/dshamshee/rfp_dashboard.git
cd rfp_dashboard
```

---

### 2. Install Dependencies

Using **Bun**:

```bash
bun install
```

---

### 3. Environment Setup

Create a `.env` file in the root directory by copying the sample configuration:

```bash
cp .env.example .env
```

Open `.env` and fill in your actual configuration values:

```env
# PostgreSQL Database URL (e.g. Neon DB)
DATABASE_URL=postgresql://user:password@ep-example-123456.us-east-2.aws.neon.tech/neondb?sslmode=require

# Google Auth Credentials (from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_nextauth_secret_string

# Cloudinary Storage Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google Gemini AI API Key (from Google AI Studio)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```

> ⚠️ **Important Security Note**: Never commit your `.env` file to version control. It is already added to `.gitignore`.

---

### 4. Database Schema Setup

Push the database schema to your PostgreSQL instance using Drizzle Kit:

```bash
bun db:push
```

*(Optional)* Seed sample data into your database for testing:

```bash
bun db:seed
```

---

### 5. Run Development Server

Start the local development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 📜 Available Scripts

In the project directory, you can run:

| Command | Description |
|---|---|
| `bun dev` | Starts the Next.js development server with Turbopack |
| `bun run build` | Compiles the production build |
| `bun run start` | Runs the compiled production server |
| `bun run lint` | Runs ESLint to check for code quality issues |
| `bun db:push` | Pushes the Drizzle schema directly to the database |
| `bun db:generate` | Generates SQL migration files |
| `bun db:migrate` | Applies pending migrations to the database |
| `bun db:studio` | Opens Drizzle Studio to visually inspect database records |
| `bun db:seed` | Populates the database with test/sample seed data |

---

## 📁 Project Directory Structure

```text
rfp_dashboard/
├── app/
│   ├── (admin)/             # Admin Dashboard, Tenders & AI Extract routes
│   │   ├── ai-extract/      # AI PDF extraction page & form
│   │   ├── new-tender/      # Manual tender creation page & form
│   │   ├── page.tsx         # Main dashboard page
│   │   └── layout.tsx       # Admin sidebar & header layout
│   ├── api/
│   │   ├── auth/            # NextAuth authentication endpoints
│   │   ├── extract-tender/  # AI PDF parser API route (Gemini AI integration)
│   │   └── upload/pdf/      # Manual PDF upload route (Cloudinary + Compression)
│   └── login/               # Authentication login page
├── components/              # Shared UI components (Shadcn UI, Base UI, Header, Sidebar)
├── lib/
│   ├── ai/                  # Gemini AI extraction logic & prompts
│   ├── db/                  # Drizzle ORM client, schemas, & seed scripts
│   └── state-district.ts    # Indian States & Districts mapping data
├── drizzle.config.ts        # Drizzle ORM configuration
├── next.config.ts           # Next.js configuration
├── proxy.ts                 # Middleware proxy configuration
└── public/                  # Static assets
```

---

## 🔒 Security & Privacy Best Practices

- All API keys and secrets (Database credentials, OAuth tokens, Cloudinary API keys, Gemini API key) are kept strictly in environment variables.
- Sensitive environment files (`.env`, `.env.local`) are excluded from Git via `.gitignore`.
- PDF uploads undergo SHA-256 hash checks and metadata stripping prior to storage.

---

## 📄 License

This project is private and intended for internal use.
