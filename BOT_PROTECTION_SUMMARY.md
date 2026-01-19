# Bot Protection System - next_pw_podcast

Complete anti-bot protection with PostgreSQL database persistence and progressive IP banning.

---

## ✅ What's Implemented

### **6 Layers of Protection**

1. **Honeypot Field** - Hidden field only bots fill
2. **Time-Based Validation** - 3-second minimum before submission
3. **Content Validation** - Detects spam patterns (random names like `xmEXrFVLYBSJGtmyYeYrnY`)
4. **Rate Limiting** - Max 3 submissions per hour (client-side)
5. **Legacy Honeypot** - Password fields (contact form)
6. **IP Reputation & Banning** - Progressive banning with PostgreSQL persistence

---

## 🚨 IP Ban Policy

| Violation | Action | Duration |
|-----------|--------|----------|
| **1st** | **24-hour ban** | 24 hours |
| **2nd+** | **PERMANENT BAN** | Forever ⛔ |

---

## 📁 Files Implemented

### Core Libraries
- ✅ `lib/ipReputation.ts` - IP tracking & ban logic (PostgreSQL + cache)
- ✅ `lib/checkIPBan.ts` - Helper to check if IP is banned

### API Endpoints
- ✅ `app/api/bot-log/route.ts` - Logs bot attempts & records violations
- ✅ `app/api/ip-bans/route.ts` - Admin API for ban management
- ✅ `app/api/contact/route.ts` - Contact form API with IP ban protection
- ✅ `app/api/auth/forgot-password/route.ts` - Forgot password API with IP ban protection

### Prisma Schema
- ✅ `IPReputation` model - Stores IP bans in PostgreSQL
- ✅ `BotLog` model - Stores all bot attempt logs

### Forms (Already Protected)
- ✅ `app/components/contact/Contact.tsx` - Contact form with full protection
- ✅ `app/[locale]/auth/forgot-password/page.tsx` - Forgot password form with IP ban checks
- ✅ `app/[locale]/auth/login/page.tsx` - Login form (existing protection)

---

## 🗄️ Database Tables

### `ip_reputations`
Stores IP ban status and violation history.

```sql
CREATE TABLE ip_reputations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "ipAddress" VARCHAR UNIQUE NOT NULL,
  violations INTEGER DEFAULT 0,
  "firstSeen" TIMESTAMP DEFAULT NOW(),
  "lastSeen" TIMESTAMP DEFAULT NOW(),
  "bannedUntil" TIMESTAMP,
  "isPermanentBan" BOOLEAN DEFAULT FALSE,
  "detectionHistory" JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

### `BotLog`
Stores every bot attempt with full details.

```sql
CREATE TABLE "BotLog" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "ipAddress" VARCHAR,
  "userAgent" VARCHAR,
  "detectionType" VARCHAR NOT NULL,
  "detectionDetails" VARCHAR,
  name VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  message TEXT,
  honeypot VARCHAR,
  "timeSpent" INTEGER,
  locale VARCHAR,
  origin VARCHAR,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Quick Start

### 1. Your Dev Server
```bash
npm run dev
# Check your package.json for the port (typically 3000)
```

### 2. Test Bot Protection
```bash
# View all banned IPs
curl http://localhost:3000/api/ip-bans

# Get statistics
curl 'http://localhost:3000/api/ip-bans?action=stats'

# Clear all bans (admin)
curl -X DELETE http://localhost:3000/api/ip-bans
```

### 3. View Database
```bash
# Connect to PostgreSQL
psql postgresql://peter:petoPostgres*4556@141.144.227.131:5433/postgres

# View IP reputations
SELECT * FROM ip_reputations ORDER BY "lastSeen" DESC;

# View bot logs
SELECT * FROM "BotLog" ORDER BY "createdAt" DESC LIMIT 10;

# Count permanent bans
SELECT COUNT(*) FROM ip_reputations WHERE "isPermanentBan" = true;
```

---

## 🎯 How It Works

### User Submits Form

```
1. Client-side checks (honeypot, time, content, rate limit)
     ↓ (if bot detected)
2. POST to /api/bot-log
     ↓
3. Check if IP is banned (checkIPBan)
     ↓ (if not banned)
4. Store in BotLog table
     ↓
5. Record violation in ip_reputations
     ↓
6. Update ban status:
     - 1st offense → 24-hour ban
     - 2nd+ offense → PERMANENT BAN
     ↓
7. Future submissions from banned IP → 403 Forbidden
```

---

## 📊 Monitoring

### Console Logs

When a bot is detected:
```
🤖 BOT ATTEMPT DETECTED: {
  id: '...',
  detectionType: 'content-validation',
  ipAddress: '192.168.1.100',
  origin: 'PICTUSWEB.SK'
}

🚨 IP VIOLATION RECORDED: {
  ip: '192.168.1.100',
  violations: 2,
  banMessage: '2nd+ offense: PERMANENT BAN'
}
```

When a banned IP tries to submit:
```
🚫 BLOCKED REQUEST from banned IP: 192.168.1.100 {
  isBanned: true,
  isPermanent: true,
  message: 'Permanently banned due to repeated violations'
}
```

---

## 🔍 FAQ

### Q: Does ban mean they cannot access the site?
**A: NO** - Banned IPs can:
- ✅ Browse your website
- ✅ View content
- ✅ Navigate pages

Banned IPs CANNOT:
- ❌ Submit contact form (403 Forbidden)
- ❌ Use forgot password form (403 Forbidden)
- ❌ Submit any form protected by IP ban checking

### Q: Will I see when there was a second attempt?
**A: YES** - Multiple ways:
- Violations count in database
- Detection history array (JSON field)
- Bot logs table
- Admin API shows all attempts

---

## 🔐 Environment Variables

Make sure these are set in your `.env`:

```bash
# PostgreSQL Connection
DATABASE_URL="postgresql://user:password@host:port/database"

# Honeypot secrets (legacy protection)
NEXT_PUBLIC_EMAIL_EXTRA_ONE="..."
NEXT_PUBLIC_EMAIL_EXTRA_TWO="..."
```

---

## ✅ Ready to Use!

Your next_pw_podcast project now has:
- ✅ 6-layer client-side bot detection
- ✅ Progressive IP banning (24hr → permanent)
- ✅ PostgreSQL persistence
- ✅ In-memory caching for performance
- ✅ Full audit trail
- ✅ Admin APIs

**Database:** PostgreSQL (independent database)
**Status:** ✅ Production Ready
**Date:** 2024-12-24
