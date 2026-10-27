# Web app setup

Requirements: Node 24, pnpm 11.25 and a Supabase project dedicated to this app.

## Database and accounts

Apply the migrations under `supabase/migrations` in order. They define account profiles, journal records, private media metadata, consent, background jobs and account quotas. Configure private storage and deploy the upload/worker functions under `supabase/functions`.

In Supabase Auth, set the application site URL and allow its exact `/auth/callback` redirect. Local development uses `http://localhost:3000`. Enable confirmed-email accounts and configure the sender for signup and recovery.

## Server configuration

Copy `.env.example` to `.env.local` for local use. On a host, put the same values in its environment settings:

| Variable | Value |
|---|---|
| `SCHEMA_CUSTOMER_HOST` | `true` |
| `SUPABASE_URL` | Project API URL |
| `SUPABASE_PUBLISHABLE_KEY` | Project publishable key |
| `APP_ORIGIN` | Exact app origin, with no trailing slash |
| `TINYFISH_ENABLED` | `true` |
| `TINYFISH_API_KEY` | TinyFish server API key |
| `TINYFISH_ALLOWED_EMAILS` | Comma-separated approved demo accounts |

Keep keys out of source control. TinyFish starts are limited to five per account per UTC day by the quota migration. Each provider run has a 120-second time limit. The current API beta-gates custom step limits, so this version does not send `max_steps` or claim a twelve-step hard cap. Failed starts can consume an allowance. Set an account budget in TinyFish too.

Personal-memory answers are optional and use separate `AI_ENABLED`, `AI_ALLOWED_EMAILS`, `OPENAI_API_KEY` and `OPENAI_MODEL` settings. Per-account consent and per-page permission still apply. Billing stays disabled.

## Start

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm check
pnpm customer:build
pnpm customer:dev
```

For deployment, use `pnpm customer:build` as the build command. The repository includes `vercel.json` for a standalone Next.js host.

## Exercise the workflow

Sign in, open My life and paste a public event page. Approve only title and venue, create the draft, add a personal note, save, reload and reopen. Confirm that other returned fields stayed out. Check a failed page and account isolation separately.

To exercise research and draft persistence without the account database, use `pnpm demo:tinyfish` as described in the README.
