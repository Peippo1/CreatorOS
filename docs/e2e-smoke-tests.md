# Browser smoke tests

CreatorOS has one deterministic local browser journey and a small deployment-readiness suite. Both use Playwright and Chromium.

## Local journey

Install the browser once, then run:

```sh
npm run test:e2e:install
npm run test:e2e -- e2e/beta-journey.spec.ts
```

The local server runs with `CREATOROS_ALLOW_MOCK=true`, so no credentials or real user data are needed. The journey uses synthetic evidence, saves a profile, creates an experiment, records an outcome, checks learning, downloads an export, and deletes the synthetic source.

## Preview readiness

Set `E2E_BASE_URL` to a Vercel preview URL and run:

```sh
E2E_BASE_URL=https://your-preview.vercel.app npm run test:e2e -- e2e/readiness.spec.ts
```

The readiness checks do not log in or mutate workspace data. They verify the health contract, safe login validation, and protected workspace behavior. Vercel deployment protection may return a redirect; provide an accessible preview URL when running these checks in CI.

For a real authenticated journey, use an isolated Supabase test project and a dedicated test user. Keep its URL, publishable key, service-role key, email credentials, and any mail-capture credentials in CI secrets. Never commit them or use a production user. CAPTCHA should be disabled in the isolated test environment or handled by a documented test-only adapter.

## CI policy

The deterministic local journey runs in the existing validation job on every relevant pull request and push to `main`, avoiding a second checkout and dependency install. When the repository variable `E2E_BASE_URL` is configured, the same job also runs the non-mutating deployment-readiness checks against that URL. A missing `E2E_BASE_URL` skips only the remote checks rather than silently testing production.
