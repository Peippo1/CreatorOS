# Vercel deployment

CreatorOS is deployed as a Next.js App Router application on Vercel.

## Required production environment

Configure these variables in the Vercel project for the Production environment:

```text
OPENAI_API_KEY=<server-side OpenAI key>
OPENAI_MODEL=gpt-5.2
CREATOROS_ALLOW_MOCK=false
NEXT_PUBLIC_SUPABASE_URL=<Supabase project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase anon key>
SUPABASE_SERVICE_ROLE_KEY=<server-side Supabase service-role key>
```

Run `supabase/schema.sql` before inviting beta users. Enable email magic-link authentication and add the deployed `/auth/callback` URL to Supabase Auth redirect URLs. Never expose the service-role key to the browser.

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

The route keeps a small process-local limiter for development and single
instances. Vercel production must also enable project-level deployment
protection and a platform/WAF rate-limit rule for `POST /api/generate` before
inviting beta users. The repository does not add a third-party shared limiter
in the stateless beta.

## Rollback and monitoring

- Inspect function logs by request ID; logs intentionally contain only request
  ID and response category, never source material or generated content.
- If a release fails, roll back to the previous deployment in Vercel or use
  `vercel rollback`.
- Check `/api/health`, generation success rate, timeout responses, and provider
  errors after each release.

## Known beta limitations

- The demo store is process-local when Supabase is not configured; use Supabase for persistence and ownership.
- There are no billing controls, native publishing integrations, or social-platform API imports.
- Product analytics events for activation and weekly return still need a hosted analytics provider.
- Copy/export depends on browser capabilities, with a text-area fallback for
  clipboard access.
- Prompt quality must be reviewed manually using the evaluation fixtures and
  sanitized beta examples.
