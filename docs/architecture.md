# CreatorOS Architecture

## Agent Flow

CreatorOS starts with one explicit orchestration path:

```text
Generate request
  -> validate input with Zod
  -> Audience Intelligence Agent
  -> Content Strategy Agent
  -> Strategic Repurposing Agent
  -> compose Creator Growth Pack
```

Each agent lives in its own module and owns a single responsibility:

- Audience Intelligence Agent extracts audience insights, pain points, motivations, language signals, objections, and likely content gaps.
- Content Strategy Agent converts audience intelligence into positioning, first-class content gaps, hook hypotheses, strategic titles, pillars, and measurable growth experiments.
- Strategic Repurposing Agent turns the source transcript and strategy into platform-aware assets that preserve the audience rationale.

The orchestration is deliberately sequential because each downstream step depends on the structured output from the previous agent.
This separation is the main product bet: a generic prompt tends to blend diagnosis, strategy, and asset generation, while CreatorOS keeps each job narrow enough to produce sharper growth strategy.

## File Structure

```text
app/
  api/generate/route.ts      Next.js API route for the MVP workflow
  generate/page.tsx          Generator screen
  page.tsx                   Homepage
components/
  generate-workspace.tsx     Client-side form and request state
  growth-pack-output.tsx     Final Creator Growth Pack renderer
  ui/                        shadcn/ui-style primitives
lib/
  agents/                    Isolated agent runners
  openai/                    Client, config, retries, errors
  orchestration/             Explicit multi-agent flow and mock output
  prompts/                   Reusable agent prompts
  types/                     Zod schemas and TypeScript types
```

## Public Route Safeguards

`POST /api/generate` keeps deployment hardening local to the MVP:

- Zod validates transcript, creator niche, platform, and audience fields before orchestration runs.
- Request caps are intentionally small: 20,000 characters for transcript, 120 for creator niche, and 160 for target audience.
- Target platform must match the supported enum values.
- A small in-memory limiter allows 10 requests per 10 minutes per IP and returns `429` with `Retry-After` when exceeded.
- Responses are marked `Cache-Control: no-store` because inputs and outputs can contain creator material.
- Provider failures and deadline failures are translated into safe `502` and `504` responses with a request ID; raw provider messages are not returned to the browser.

The limiter reads the first `x-forwarded-for` IP, then `x-real-ip`, then falls back to `unknown`. Because state is process-local, this is appropriate only for development and single-instance deployments. A multi-instance or serverless production deployment should move rate limiting to a shared store, gateway, or hosting-platform control.

## Generation Safety

The orchestration module applies one 60-second deadline across the sequential agent flow and passes its cancellation signal to every OpenAI request. Retries stop once that signal is aborted. Prompt builders format creator input, source material, and upstream agent output as untrusted JSON context and direct each agent to treat it as data rather than instructions.

## Runtime configuration and persistence\n\n`lib/config/runtime.ts` is the single configuration module for production readiness. It reports only safe booleans and category names. The Supabase adapter is selected only when Auth and the server-side service-role key are configured. The memory adapter remains available for local development, but production refuses workspace operations instead of risking silent data loss.\n\n## Extension Points

## Growth-learning loop

The workspace persists a `CreatorProfile`, source documents, content experiments, and performance snapshots through `lib/storage`. Supabase is selected when the URL, anon key, and server-only service-role key are configured; otherwise a global memory store keeps local demos usable. API routes always resolve the authenticated viewer before reading or writing data.

`lib/learning/analyse.ts` deliberately uses deterministic scoring in v1. It joins snapshots to owned experiments, identifies the strongest and weakest patterns, and produces a next-test recommendation. This makes weekly review testable and keeps the learning signal separate from model creativity. `lib/metrics/csv.ts` validates manual imports before the route checks experiment ownership and skips duplicate experiment/date pairs.

The structure is prepared for the next production layers without adding them to the MVP:

- Add an Analytics Agent in `lib/agents` and insert it into `lib/orchestration/generate-growth-pack.ts`.
- Add brand voice memory by passing a creator profile object into each prompt builder.
- Add creator profiles by replacing raw form fields with persisted profile context.
- Add experiment tracking by persisting `growthExperiments` and recording outcomes.
- Add content gap scoring by extending the existing `contentGaps` objects with priority, confidence, or funnel-stage fields once the UI needs deeper ranking.
- Add social integrations by turning repurposed content into platform-specific publishing drafts.
- Add OpenAI Agents SDK later by keeping prompts, tools, and agent boundaries separated from UI code.

## Why API Routes First

The MVP uses Next.js API routes instead of a separate FastAPI backend because the current product scope does not require a separate service. Auth, persistence, analytics ingestion, and rate limiting now live behind explicit modules and adapters within the Next.js application.

API routes keep the first implementation smaller:

- One deployable app surface
- No cross-service contract yet
- Shared TypeScript schemas between UI and server code
- Fast iteration on the product workflow

The backend boundary is still clean. The orchestration, agents, prompts, OpenAI wrapper, and types live outside route handlers, so a future FastAPI service can mirror the same contracts without rewriting the frontend experience.
