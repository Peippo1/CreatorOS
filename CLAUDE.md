# CreatorOS — Claude Guidance

## Project Overview

CreatorOS is an AI operating system for creators and internet brands. The MVP turns one transcript or research input into a structured Creator Growth Pack built around audience intelligence, content gap discovery, platform-aware experiments, and strategic repurposing.

## Tech Stack

- **Framework**: Next.js App Router (canary) — read `node_modules/next/dist/docs/` before touching router behavior
- **Language**: TypeScript throughout
- **UI**: Tailwind CSS + Radix UI primitives (shadcn/ui style) in `components/`
- **AI**: OpenAI Responses API via `lib/openai/` — structured JSON outputs, Zod-validated
- **Validation**: Zod schemas in `lib/types/generation.ts`
- **Testing**: Vitest — no live API calls in tests
- **Prompt eval**: `scripts/evaluate-prompts.ts` — exercises live or mock pipeline

## Key Commands

```bash
npm run dev          # start dev server
npm run lint         # ESLint (must pass before committing app code)
npm run test         # Vitest unit suite (must pass)
npm run build        # production build (must pass)
npm run eval:prompts # run prompt quality evaluation
npm run test:watch   # watch mode
```

Run `lint`, `test`, and `build` before finishing any change to application code.

## Architecture Summary

```
app/
  api/generate/route.ts   — POST endpoint, validates input, applies rate limit
  generate/page.tsx        — /generate UI route
  page.tsx                 — landing page

lib/
  agents/                  — three focused agents (audience, strategy, repurposing)
  openai/                  — client, config, error handling (all OpenAI access goes here)
  orchestration/           — generate-growth-pack.ts (live), mock-growth-pack.ts (fallback)
  prompts/                 — prompt strings, one file per agent
  types/generation.ts      — Zod schemas + inferred TypeScript types

components/                — UI components (generate-workspace, growth-pack-output, ui/)
scripts/evaluate-prompts.ts — local prompt evaluation harness
tests/                     — Vitest tests + fixtures
```

Agent flow:

```
GenerateInput
  → Audience Intelligence Agent   (audienceInsights)
  → Content Strategy Agent        (contentGaps, viralHooks, titles, shortFormIdeas)
  → Strategic Repurposing Agent   (repurposedContent, growthExperiments)
  → CreatorGrowthPack (Zod-validated)
```

If `OPENAI_API_KEY` is missing → `createMockGrowthPack` in `lib/orchestration/mock-growth-pack.ts` runs instead. It is deterministic and niche-aware but is not live model output.

## Testing Expectations

- Tests live in `tests/` and use Vitest. No live OpenAI calls in tests.
- Cover: schema validation, mock output shape, API route behavior (missing key, bad input, rate limit), agent composition.
- Add or update tests when changing orchestration, validation, mock fallback, or OpenAI wrapper behavior.
- Four test files currently: `generation-schema.test.ts`, `growth-pack.test.ts`, `mock-growth-pack.test.ts`, `generate-route.test.ts`.

## Security Notes

- **Never commit `.env.local` or any file containing secrets.** `.gitignore` already excludes `.env*` and `.env.local` — verify with `git check-ignore -v .env.local` before pushing.
- The rate limiter in `app/api/generate/rate-limit.ts` is in-memory and single-instance only. Replace it with a shared store before any multi-instance or serverless production deployment.
- Input is validated against Zod schemas and character-length limits before reaching agents. Do not remove or loosen these guards.
- All OpenAI access must go through `lib/openai/client.ts`. Do not bypass the wrapper from agents, routes, or UI.

## Working Rules

- Keep changes small, typed, tested, and limited to the stated task. No speculative refactors.
- No new auth, payments, database persistence, queues, analytics ingestion, or social integrations unless explicitly requested.
- Do not expand the product into a generic content generator. Preserve the audience-intelligence focus.
- Prefer extending existing modules over adding new architectural layers.
- Do not change model fallback behavior silently — document intentional changes in README and `docs/architecture.md`.
- Keep README.md and `docs/architecture.md` honest and up to date when behavior changes.

## Mock Output Is Fallback Only

`createMockGrowthPack` exists so local demos work without a live API key. It is template-driven and niche-aware, which makes demos feel specific. It is **not** a proxy for live model quality and should not be used to judge prompt performance.

## Evaluating Prompt Quality

Run `npm run eval:prompts` with a real `OPENAI_API_KEY` set in `.env.local` to exercise live agent prompts against the three built-in fixtures. Without a key it runs the mock path, which is good for shape checks only. When iterating on prompts, compare outputs across: specificity, strategic usefulness, platform awareness, repetition, generic-advice leakage, experiment quality, and content gap quality.
