# CreatorOS

CreatorOS is an AI operating system for creators and internet brands. The MVP turns one transcript or raw input into a structured Creator Growth Pack through a focused multi-agent workflow.

## MVP Workflow

```text
Transcript/Input
  -> Audience Intelligence Agent
  -> Content Strategy Agent
  -> Repurposing Agent
  -> Final Creator Growth Pack
```

The generated pack includes:

- Audience Insights
- Viral Hooks
- Titles
- Short-form Ideas
- Repurposed Content
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
- Social integrations
- FastAPI backend migration
- OpenAI Agents SDK integration
