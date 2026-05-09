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

## Extension Points

The structure is prepared for the next production layers without adding them to the MVP:

- Add an Analytics Agent in `lib/agents` and insert it into `lib/orchestration/generate-growth-pack.ts`.
- Add brand voice memory by passing a creator profile object into each prompt builder.
- Add creator profiles by replacing raw form fields with persisted profile context.
- Add experiment tracking by persisting `growthExperiments` and recording outcomes.
- Add content gap scoring by extending the existing `contentGaps` objects with priority, confidence, or funnel-stage fields once the UI needs deeper ranking.
- Add social integrations by turning repurposed content into platform-specific publishing drafts.
- Add OpenAI Agents SDK later by keeping prompts, tools, and agent boundaries separated from UI code.

## Why API Routes First

The MVP uses Next.js API routes instead of a separate FastAPI backend because the current product scope is a single synchronous workflow with no auth, billing, persistence, analytics ingestion, queues, or enterprise infrastructure.

API routes keep the first implementation smaller:

- One deployable app surface
- No cross-service contract yet
- Shared TypeScript schemas between UI and server code
- Fast iteration on the product workflow

The backend boundary is still clean. The orchestration, agents, prompts, OpenAI wrapper, and types live outside route handlers, so a future FastAPI service can mirror the same contracts without rewriting the frontend experience.
