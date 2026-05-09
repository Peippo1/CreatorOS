# CreatorOS Agent Guidance

Follow the global Codex working rules first. This file adds project-specific guidance for the CreatorOS repository only.

## Project Shape

- Preserve the existing Next.js App Router structure under `app/`.
- Keep product UI in `app/` and `components/`; keep orchestration, prompts, OpenAI access, and types in `lib/`.
- Keep changes small, reviewable, and aligned with the current lean MVP. Avoid broad refactors unless explicitly requested.
- Prefer extending existing modules over introducing new architectural layers.

## Generation And OpenAI

- Preserve the mock-first generation path when `OPENAI_API_KEY` is missing. Local demos must continue to work without live OpenAI credentials.
- Respect the existing OpenAI wrapper and model fallback architecture in `lib/openai/`.
- Do not bypass the wrapper from agents, API routes, or UI components.
- Keep agent flow explicit and readable in `lib/orchestration/`.
- Do not silently change model fallback behavior; document any intentional change in README and `docs/architecture.md`.

## Scope Boundaries

- Do not add auth, payments, database persistence, analytics ingestion, queues, social integrations, or other third-party integrations unless explicitly requested.
- Do not expand the product into a generic content generator. Preserve the focus on audience intelligence, creator growth strategy, platform-aware experiments, content gap discovery, and strategic repurposing.

## Testing Expectations

- Add or update tests when changing orchestration, request validation, API route behavior, OpenAI wrapper behavior, mock fallback behavior, or failure handling.
- Cover success paths, validation failures, missing API key mock output, OpenAI/model failure paths, and downstream agent composition when relevant.
- Run `npm run lint` and `npm run build` before finishing changes that affect application code.

## Documentation

- Keep `README.md` and `docs/architecture.md` honest and up to date when behavior, setup, architecture, environment variables, model fallback behavior, or extension points change.
- Do not document future features as implemented.

## Handoff

Before finishing, summarize:

- Changed files
- Tests and checks run
- Documentation updated
- Known limitations or follow-up risks
