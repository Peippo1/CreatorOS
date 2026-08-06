# Vercel deployment

CreatorOS is deployed as a Next.js App Router application on Vercel.

## Required production environment

Configure these variables in the Vercel project for the Production environment:

```text
OPENAI_API_KEY=<server-side OpenAI key>
OPENAI_MODEL=gpt-5.2
CREATOROS_ALLOW_MOCK=false
NEXT_PUBLIC_SUPABASE_URL=<Supabase project URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable key>
# Legacy Supabase projects may still use NEXT_PUBLIC_SUPABASE_ANON_KEY instead.
SUPABASE_SERVICE_ROLE_KEY=<server-side Supabase service-role key>
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<public Cloudflare Turnstile site key>
APP_ORIGIN=https://<production-domain>
```

Run `supabase/schema.sql` before inviting beta users. Enable email magic-link authentication, set Supabase's Site URL to `APP_ORIGIN`, and add `${APP_ORIGIN}/auth/callback` to its Auth redirect URLs. Never expose the service-role key or the Turnstile secret to the browser.

`OPENAI_API_KEY` is required in production. The application fails its readiness
check and returns a safe configuration error rather than silently serving mock
output. Mock output remains available locally when `NODE_ENV` is not production.

## Deployment workflow

1. Connect the repository to Vercel and enable preview deployments for branches
   and pull requests.
2. Add the production environment variables above. Never commit them or expose
   them as `NEXT_PUBLIC_*` values.
3. Confirm the preview build passes the repository CI checks.
4. Verify `/api/health` returns `200` and `status: "ok"` on the preview with a
   configured key.
5. Promote the validated preview to production.

For CLI-based deployments, use a pinned Vercel CLI version and the standard
`vercel pull`, `vercel build --prod`, and `vercel deploy --prebuilt --prod`
sequence. Keep `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` in CI
secrets only.

## Abuse protection

When Supabase is configured, `POST /api/generate` uses the atomic
`consume_generation_rate_limit` Postgres function. It stores only a SHA-256
bucket key, never a raw IP address. Local demos retain an in-memory fallback.
Also enable project-level deployment protection and a platform/WAF rule before
inviting beta users.

## Beta access controls

CreatorOS keeps the public landing page available, but `/generate`, `/workspace`,
and all workspace API routes require a Supabase session in production. Enable
Supabase Email authentication before inviting users. The beta is invite-only:
create or invite each tester in Supabase Auth → Users before they use the login
page. The login page sends a magic link and does not collect passwords. Google
and Apple sign-in can be enabled later in Supabase Auth without changing
CreatorOS code.

The login route permits five requests per IP address every 15 minutes. Signed-in
users may generate ten Growth Packs every 10 minutes. Both limits use the shared
Supabase rate-limit function; production fails closed for generation if the
shared limiter is unavailable.

Enable Supabase Auth → Bot and Abuse Protection → CAPTCHA protection, select
Cloudflare Turnstile, and save the Turnstile **secret key** there. Put only the
matching **site key** in Vercel as `NEXT_PUBLIC_TURNSTILE_SITE_KEY` for both
Preview and Production, then redeploy. CreatorOS requires a valid CAPTCHA token
before it will request a beta magic link, and production fails closed if the
site-key configuration is absent.

## Rollback and monitoring

- Inspect function logs by request ID; logs intentionally contain only request
  ID and response category, never source material or generated content.
- If a release fails, roll back to the previous deployment in Vercel or use
  `vercel rollback`.
- Check `/api/health`, generation success rate, timeout responses, and provider
  errors after each release.
- Query `beta_events` for profile saves, source additions, experiment creation,
  publishing, and reviewed experiments to measure activation and weekly return.

## Known beta limitations

- The demo store is process-local when Supabase is not configured; use Supabase for persistence and ownership.
- There are no billing controls, native publishing integrations, or social-platform API imports.
- Product analytics events for activation and weekly return still need a hosted analytics provider.
- Copy/export depends on browser capabilities, with a text-area fallback for
  clipboard access.
- Prompt quality must be reviewed manually using the evaluation fixtures and
  sanitized beta examples.
