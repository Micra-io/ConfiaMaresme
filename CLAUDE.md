# CLAUDE.md — ConfiaMaresme

Community tradesman directory for the Maresme region (Catalonia). Web UI built with React + Supabase.

## Ecosystem

This repo is the **frontend/UI** layer of a three-repo system:

```
ZeroClaw (agent runtime)  →  maresme-bot (data pipeline)  →  ConfiaMaresme (this repo)
```

| Repo | GitHub | Role |
|------|--------|------|
| **ZeroClaw** | `Micra-io/zeroclaw` | Rust agent runtime — daemon that runs WhatsApp/Slack/Telegram channels, passively captures group messages, runs cron scheduler |
| **maresme-bot** | `Micra-io/maresme-bot` | Python scripts that extract tradesman contacts from captured WhatsApp messages using LLM, writes to Supabase |
| **ConfiaMaresme** | `Micra-io/ConfiaMaresme` | This repo — React app that displays the tradesman directory, handles user auth, reviews, and profile claims |

### Data flow into this app

1. ZeroClaw passively stores WhatsApp group messages in `sessions.db` on the remote machine
2. maresme-bot's `scan_tradesmen.py` (runs every 30min) extracts tradesman recommendations via LLM
3. Extracted records are written to the `tradesmen` table in Supabase via REST API (service role key)
4. This app reads from Supabase to display the directory

**This app does NOT talk to ZeroClaw or maresme-bot directly.** Supabase is the integration point.

## Tech Stack

- **Build:** Vite
- **Framework:** React 18 + TypeScript
- **Routing:** React Router DOM 6
- **State/Data:** TanStack React Query + Supabase client
- **UI:** shadcn/ui (Radix), Tailwind CSS, Lucide icons
- **Forms:** React Hook Form + Zod validation
- **i18n:** react-i18next (ES, CA, EN, RU, FR, DE, AR, ZH, PT, IT, RO, UK)
- **Testing:** Vitest + @testing-library/react
- **Scaffold:** Lovable

## Supabase

- **Project ID:** `ihhdazltdyctyygxcblw`
- **Config:** `.env` (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- **Migrations:** `supabase/migrations/`
- **Client integration:** `src/integrations/supabase/`

### Key Tables

| Table | Purpose | Populated by |
|-------|---------|-------------|
| `tradesmen` | Tradesman profiles (name, trade, phone, location, services) | maresme-bot (automated) + manual claims |
| `profiles` | User accounts (resident or tradesman role) | User signup (auth) |
| `reviews` | Ratings and comments on tradesmen | Authenticated users |
| `leads` | Resident→tradesman contact unlocks | Authenticated users |

### Trade Categories (enum)

electrician, plumber, carpenter, painter, general_handyman, locksmith, gardener, cleaner, mason, roofer, hvac, other

### RLS Policies

- `tradesmen`: public SELECT, authenticated INSERT/UPDATE own
- Bot writes use a **service role key** (bypasses RLS) — key lives at `~/.zeroclaw/secrets/supabase_service_role` on the remote machine
- Never commit the service role key to this repo

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (Vite)
npm run build        # Production build
npm run test         # Run Vitest tests
```

## Debugging

| Symptom | Where to look |
|---------|---------------|
| No tradesmen in directory | Supabase `tradesmen` table → if empty, check maresme-bot `extraction.log` on remote |
| Stale data showing | React Query cache (default 5min) → check Supabase directly for latest |
| Auth not working | `.env` Supabase keys → Supabase dashboard auth settings |
| New trade category needed | Update enum in Supabase migration + `src/lib/constants.ts` + maresme-bot extraction prompt |
| Schema changes | Create migration in `supabase/migrations/`, update `src/integrations/supabase/` types |

### Cross-repo debugging

- **maresme-bot logs:** `tailscale ssh alexanderalyushin@alexanders-macbook-pro-13 'tail -30 ~/.zeroclaw/workspace/maresme-bot/extraction.log'`
- **ZeroClaw daemon logs:** `tailscale ssh alexanderalyushin@alexanders-macbook-pro-13 'tail -30 ~/.zeroclaw/logs/daemon.stdout.log'`
- **Scanner cron status:** `tailscale ssh alexanderalyushin@alexanders-macbook-pro-13 'zeroclaw cron list'` — look for `tradesman_scanner`
- **Supabase query:** `curl 'https://ihhdazltdyctyygxcblw.supabase.co/rest/v1/tradesmen?select=*&limit=5' -H 'apikey: <anon_key>'`
