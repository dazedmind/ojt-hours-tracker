# 📊 OJT Hours Tracker

**OJT Hours Tracker** is a simple and efficient web application designed to help students accurately track their On-the-Job Training (OJT) hours. By automating hour tracking, this app eliminates the risk of human error and common issues like miscalculations, forgotten logs, or even laziness.

## 🚀 Features

- ✅ **Accurate Hour Tracking**: Automatically calculates rendered hours with time in/out
- 🕒 **Break Time Support**: Configurable break times (15 mins, 30 mins, 1 hour)
- 📈 **Progress Dashboard**: Real-time tracking of total hours and progress
- 📅 **Calendar Integration**: Easy date selection with intuitive calendar UI
- 🔒 **Secure Authentication**: Google OAuth integration via Supabase Auth
- 🎨 **Modern UI/UX**: Clean, responsive design with dark mode support

## 🎯 Purpose

Tracking OJT hours manually often leads to errors and inefficiencies. This tool was built to:

- Prevent mistakes in manually computed rendered hours  
- Encourage accountability among students  
- Streamline reporting for both students and supervisors  
- Save time and reduce paperwork
- Provide accurate and reliable time tracking

## 🛠️ Tech Stack

- **Framework**: [Next.js 15.2.4](https://nextjs.org/) (React 19)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: [Prisma 7](https://www.prisma.io/)
- **Authentication**: [Supabase Auth](https://supabase.com/auth)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **pnpm** or **bun**
- **PostgreSQL** database (or Supabase account)
- **Supabase** account for authentication

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Optional: Site URL for OAuth (auto-detected if not set)
NEXT_PUBLIC_BASE_URL="http://localhost:3000"  # For local development
# NEXT_PUBLIC_BASE_URL="https://your-app.vercel.app"  # For production
```

### Getting Your Environment Variables:

#### **Supabase Setup:**
1. Go to [Supabase](https://supabase.com) and create a new project
2. Navigate to **Project Settings** → **API**
3. Copy the **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Navigate to **Project Settings** → **Database**
6. Copy the **Connection String** (Session mode) → `DATABASE_URL`

#### **Google OAuth Setup:**
1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Follow Supabase's guide to set up Google OAuth credentials
4. Configure **URL Configuration** in Supabase:
   - Go to **Authentication** → **URL Configuration**
   - Set **Site URL** to your production URL (e.g., `https://your-app.vercel.app`)
   - Add **Redirect URLs**:
     - `http://localhost:3000/auth/callback` (local)
     - `https://your-app.vercel.app/auth/callback` (production)
5. In Google Cloud Console, add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ojt-hours-tracker.git
   cd ojt-hours-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

5. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

6. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   # or
   bun dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

```prisma
model Entries {
  id                 Int      @id @default(autoincrement())
  created_at         DateTime @default(now())
  date               String
  time_in            String
  time_out           String
  break_time         String
  created_by         String   @default(uuid())
}
```

## 🚀 Deployment

### Deploying to Vercel

1. **Push your code to GitHub**

2. **Import project to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your repository

3. **Add environment variables**
   - Add all variables from your `.env` file
   - Make sure to include all `NEXT_PUBLIC_` prefixed variables

4. **Deploy**
   - Vercel will automatically build and deploy your app
   - Your app will be live at `your-project.vercel.app`

## 📁 Project Structure

```
ojt-hours-tracker/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── prisma.config.ts       # Prisma 7 configuration
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   ├── modules/
│   │   │   └── entries/       # Entries module
│   │   │       ├── actions.ts
│   │   │       ├── repository.ts
│   │   │       ├── helpers.ts
│   │   │       ├── schema.ts
│   │   │       └── components/
│   │   ├── auth/              # Authentication pages
│   │   ├── page.tsx           # Home page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   └── ui/                # Shadcn UI components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions
│   ├── utils/
│   │   ├── prisma.ts          # Prisma client
│   │   ├── supabase/          # Supabase utilities
│   │   └── types.ts           # TypeScript types
│   └── middleware.ts          # Next.js middleware
├── .env                       # Environment variables
├── .env.example               # Example environment variables
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

## 🧪 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack

# Production
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma generate  # Generate Prisma Client
npx prisma migrate dev  # Run migrations in development
npx prisma studio    # Open Prisma Studio (database GUI)

# Linting
npm run lint         # Run ESLint
```

## 🐛 Troubleshooting

### OAuth Redirecting to Localhost in Production

**Problem**: After Google sign-in on Vercel, you're redirected to `http://localhost:3000`

**Solution**:
1. **Update Supabase URL Configuration**:
   - Go to Supabase Dashboard → **Authentication** → **URL Configuration**
   - Set **Site URL** to: `https://your-app.vercel.app`
   - Add your production URL to **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

2. **Redeploy on Vercel**:
   - The code now auto-detects the correct URL
   - Simply redeploy your Vercel app (it will rebuild automatically)

3. **Optional - Set Environment Variable**:
   ```env
   NEXT_PUBLIC_BASE_URL="https://your-app.vercel.app"
   ```

### Database Connection Issues

**Problem**: `P1001: Can't reach database server`

**Solution**:
- Check that your `DATABASE_URL` is correct in Vercel environment variables
- Ensure your IP is whitelisted in Supabase (or enable connection pooling)
- Verify you're using the **Session mode** connection string

### Prisma Generate Errors

**Problem**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
npx prisma generate
npm install
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Made by [aybangueco](https://github.com/aybangueco)

Contributors: [dazedmind](https://github.com/dazedmind)
## 📷 Screenshots

> *(Coming soon)*

---

⭐ Star this repo if you find it helpful!
