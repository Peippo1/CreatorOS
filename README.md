# CreatorOS

CreatorOS is an AI operating system for creators and internet brands. The MVP turns one transcript or research input into a structured Creator Growth Pack built around audience intelligence, creator growth strategy, platform-aware experiments, content gap discovery, and strategic repurposing.

## MVP Workflow

```text
Transcript/Input
  -> Audience Intelligence Agent
  -> Content Strategy Agent
  -> Strategic Repurposing Agent
  -> Final Creator Growth Pack
```

The generated pack includes:

- Audience Insights
- Content Gaps
- Hook Hypotheses
- Strategic Titles
- Platform Angles
- Strategic Repurposing
- Growth Experiments

## Architecture

CreatorOS is intentionally lean:

- Next.js App Router for pages and API routes
- TypeScript throughout
- Tailwind and shadcn/ui-style components
- OpenAI Responses API for structured outputs
- Zod schemas for request and agent output typing
- Explicit orchestration in `lib/orchestration`
- Mock output when `OPENAI_API_KEY` is missing

The product is not positioned as a generic content generator. The agents separate diagnosis, strategy, content gap discovery, and production so each output has a specific audience rationale and a testable growth purpose.

See [docs/architecture.md](docs/architecture.md) for the agent flow, file structure, extension points, and backend migration notes.

### User Request Flow

```text
Browser (app/generate/page.tsx)
  |
  | POST /api/generate
  v
app/api/generate/route.ts
  |-- validate input (Zod schema, character limits)
  |-- apply rate limit (10 req / 10 min per IP)
  v
lib/orchestration/generate-growth-pack.ts
  |-- OPENAI_API_KEY present? ──No──> lib/orchestration/mock-growth-pack.ts
  |                                         |
  |                                         v
  |                                   deterministic mock
  |                                   (niche + platform aware)
  |
  Yes
  |
  v
lib/agents/ (three sequential agents)
  |
  v
CreatorGrowthPack (Zod-validated JSON)
  |
  v
Browser (components/growth-pack-output.tsx)
```

### Agent Orchestration Flow

```text
GenerateInput
{ transcript, creatorNiche, targetPlatform, targetAudience }
  |
  v
Audience Intelligence Agent (lib/agents/audience-intelligence.ts)
  prompt: lib/prompts/audience-intelligence.ts
  output: audienceInsights[]
  |
  v
Content Strategy Agent (lib/agents/content-strategy.ts)
  prompt: lib/prompts/content-strategy.ts
  input: GenerateInput + audienceInsights
  output: contentGaps[], viralHooks[], titles[], shortFormIdeas[]
  |
  v
Strategic Repurposing Agent (lib/agents/repurposing.ts)
  prompt: lib/prompts/repurposing.ts
  input: GenerateInput + audienceInsights + contentGaps
  output: repurposedContent[], growthExperiments[]
  |
  v
CreatorGrowthPack
{ audienceInsights, contentGaps, viralHooks, titles,
  shortFormIdeas, repurposedContent, growthExperiments, meta }
```

### Testing and Evaluation Flow

```text
Unit Tests (npm run test)
  |-- tests/generation-schema.test.ts   schema shape and Zod validation
  |-- tests/growth-pack.test.ts         mock + live orchestration behavior
  |-- tests/mock-growth-pack.test.ts    niche/platform variation in mock output
  |-- tests/generate-route.test.ts      API route: validation, rate limit, mock key
  |
  No live API calls. All tests use fixtures in tests/fixtures.ts.

Prompt Evaluation (npm run eval:prompts)
  |
  |-- With OPENAI_API_KEY set
  |     -> runs live agents against 3 built-in creator fixtures
  |     -> prints full CreatorGrowthPack JSON per fixture
  |     -> use to judge specificity, strategy quality, platform fit
  |
  `-- Without OPENAI_API_KEY
        -> runs mock path (shape checks only, not prompt quality)
```

## Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Add your OpenAI API key:

```bash
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-5.5
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

`.env.example` uses:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.5
```

The code prefers `OPENAI_MODEL` when provided. If no model is configured, it uses the documented fallback constant `gpt-5.2`. If a configured model is unavailable or inaccessible to the API key, the OpenAI wrapper retries once with `gpt-5.2`. Other API failures are surfaced to the UI.

If `OPENAI_API_KEY` is missing, CreatorOS returns deterministic mock output so the product workflow can be demonstrated locally. The fallback is template-driven and keyed to the creator niche, target platform, target audience, and transcript, so demos feel specific without pretending to be live model output. It is useful for demos and contract checks but should not be read as live model quality.

## Public Route Limits

`POST /api/generate` has lightweight MVP safeguards:

- Transcript: 80 to 20,000 characters
- Creator niche: 2 to 120 characters
- Target audience: 2 to 160 characters
- Target platform: one of the supported platform values in the app selector
- Rate limit: 10 requests per 10 minutes per IP

The rate limiter is in-memory and uses `x-forwarded-for`, then `x-real-ip`, then `unknown`. It is suitable for local development and single-instance deployments only. Multi-instance or serverless production deployments should replace it with a shared store or platform rate-limit feature.

## Scripts

```bash
npm run dev
npm run lint
npm run test
npm run test:watch
npm run eval:prompts
npm run build
npm run start
```

## Testing

CreatorOS uses Vitest for fast unit tests around schema validation, mock output shape, and missing-key orchestration behavior. Tests do not call the live OpenAI API.

Run the suite:

```bash
npm run test
```

## Prompt Evaluation

Run local prompt evaluations with:

```bash
npm run eval:prompts
```

The evaluator runs three realistic creator fixtures through the orchestration pipeline and prints structured Growth Pack output. With `OPENAI_API_KEY` configured, it exercises the live agent prompts. Without a key, it uses the deterministic mock path, which is useful for shape checks but not prompt-quality review. That fallback is deterministic and fixture-aware, so it is good for demos and regression checks, not for judging live model quality.

To write local artifacts for comparison over time:

```bash
npm run eval:prompts -- --write
npm run eval:prompts -- --write --format json
```

Each run writes timestamped files into `evaluations/`. The directory is kept in the repo with `.gitkeep`, while generated `.md` and `.json` files are ignored by git. Do not commit evaluation outputs if they include sensitive transcript or source material.

For live evaluations, make sure `OPENAI_API_KEY` is available in your shell or `.env.local`. The script loads local env files before running so it can use the live OpenAI path when the key is present.

When iterating on prompts, keep changes narrow and compare outputs against:

- Specificity to the transcript and audience
- Strategic usefulness
- Platform awareness
- Repetition across sections
- Generic advice or bland CTA leakage
- Experiment quality
- Content gap quality

To compare prompt changes over time, keep one run per major prompt change and diff the generated artifacts by fixture. The rubric is intentionally manual: use the blank score and notes fields to record what improved, what regressed, and where the output still reads generic.

## Mobile

CreatorOS ships as a Progressive Web App (PWA) and can be installed directly from a mobile browser — no App Store required.

**iOS (Safari):** Open the app, tap Share, then "Add to Home Screen."

**Android (Chrome):** Open the app, tap the install prompt or Menu → "Add to Home Screen."

The PWA manifest sets `start_url` to `/generate`, so the app opens directly to the workspace. It runs in `standalone` display mode (no browser chrome) with a black theme color that respects iOS status bar transparency.

### Icons

App icons are generated at build time using Next.js `ImageResponse` (`app/icon.tsx` → 32px favicon, `app/apple-icon.tsx` → 180px Apple touch icon). The SVG source at `public/icons/icon.svg` is used in the manifest for scalable sizes. Replace these with production-quality assets before launch.

### Future native options

The app is intentionally web-first. If native apps become necessary:

| Option | Best for |
| --- | --- |
| **React Native + Expo** | Cross-platform iOS + Android from a shared TypeScript codebase. Recommended if the UI needs native gesture performance, camera, or media access. |
| **Capacitor** | Wraps the existing Next.js web app as a native shell with minimal code changes. Good bridge option before committing to a full native build. |
| **Swift / SwiftUI** | Deep iOS integration: widgets, Shortcuts, Share Sheet. Requires a separate codebase. |
| **Kotlin / Jetpack Compose** | Deep Android integration. Requires a separate codebase. |

For the current MVP the PWA path covers installation and home screen presence without native code. A service worker can be added later to enable full offline support.

## Roadmap

- Analytics Agent
- Brand voice memory
- Creator profiles
- Experiment tracking
- Content gap scoring
- Social integrations
- FastAPI backend migration
- OpenAI Agents SDK integration
- Service worker for offline support
