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

If `OPENAI_API_KEY` is missing, CreatorOS returns deterministic mock output so the product workflow can be demonstrated locally.

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
npm run build
npm run start
```

## Testing

CreatorOS uses Vitest for fast unit tests around schema validation, mock output shape, and missing-key orchestration behavior. Tests do not call the live OpenAI API.

Run the suite:

```bash
npm run test
```

## Roadmap

- Analytics Agent
- Brand voice memory
- Creator profiles
- Experiment tracking
- Content gap scoring
- Social integrations
- FastAPI backend migration
- OpenAI Agents SDK integration
