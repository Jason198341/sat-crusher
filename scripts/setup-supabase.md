# Supabase Setup Guide / 설정 가이드

## Step 1: Create Project (프로젝트 생성)

1. Go to https://supabase.com/dashboard
2. Sign in (GitHub or email)
3. Click "New project"
4. Settings:
   - **Name**: `sat-crusher`
   - **Database Password**: (save this!)
   - **Region**: Northeast Asia (ap-northeast-1) or closest to you
5. Wait ~2 minutes for provisioning

## Step 2: Get Credentials (자격증명 복사)

1. Go to: Project Settings → API
2. Copy these two values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

## Step 3: Update .env (.env 파일 수정)

Edit `sat-crusher/.env`:

```
VITE_FIREWORKS_API_KEY=your_fireworks_api_key_here
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

## Step 4: Run Migration (DB 스키마 생성)

1. Go to: SQL Editor (left sidebar)
2. Click "New query"
3. Paste contents of `supabase/migrations/001_initial_schema.sql`
4. Click "Run"

## Step 5: Enable Auth Providers (인증 설정)

1. Go to: Authentication → Providers
2. Enable **Email** (already enabled by default)
3. (Optional) Enable **Google**:
   - Set up Google Cloud OAuth consent screen
   - Add Client ID and Secret

## Step 6: Restart Dev Server (개발 서버 재시작)

```bash
npm run dev
```

The app will detect real Supabase credentials and switch from dev mode to production mode.
