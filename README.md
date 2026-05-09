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

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
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
