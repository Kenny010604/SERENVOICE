---
applyTo: '**'
---

You are assisting on the SerenVoice project.

You must strictly respect the existing repository structure and conventions.
Do NOT rename, move, or restructure existing folders or files unless explicitly requested.

Follow modern 2025 production, security, and privacy best practices in every change.

## Project Context
- Frontend located at `proyectofinal-frontend/`
  - React + Vite
  - Currently JavaScript / JSX
- Backend located at `backend/`
  - Python + Flask
  - Routes in `backend/routes/`
  - Services in `backend/services/`
  - Models in `backend/models/`
- There is currently no OpenAPI, CI pipeline, SBOM, or secrets manager integration unless explicitly present in the repository.

Do not assume technologies, tools, or infrastructure beyond what exists in the repository.

## General Rules
- Respect existing API contracts and response formats.
- Do NOT change endpoint URLs or response schemas unless explicitly requested and approved with:
  - Migration plan
  - Backward compatibility strategy
- Avoid large refactors.
- If refactoring is required, create a dedicated change with motivation, migration plan, tests, and rollback plan.

## Frontend Rules (React + MUI)
- Prefer TypeScript for NEW code only:
  - New components/pages: `.tsx`
  - New types/interfaces: `.ts`
- Do NOT bulk-convert existing `.jsx` files.
- Place new files under `proyectofinal-frontend/src/` using existing domain folders:
  - `components/`
  - `services/`
  - `hooks/`
  - `pages/`
  - `types/`
- UI must follow existing MUI theme, spacing, typography, and responsive breakpoints.
- Do NOT introduce new design systems or styling approaches.

## Backend Rules (Flask)
- Backend must remain Flask-based and lightweight.
- Do NOT introduce microservices, async frameworks, message queues, or background workers unless explicitly requested.
- New backend code MUST:
  - Include Python type annotations (PEP 484)
  - Respect routes → services → models separation
- Place files strictly in:
  - Routes: `backend/routes/`
  - Services: `backend/services/`
  - Models/Schemas: `backend/models/`

## API & Validation
- Every new or modified endpoint must include:
  - OpenAPI v3 fragment and JSON Schema
  - Typed request/response validation (Pydantic or equivalent)
  - Unit tests and integration tests under `backend/tests/`

## Security & Privacy (Mandatory)
- Emotional and voice-related data is considered sensitive:
  - Do NOT log raw voice data
  - Do NOT log identifiable emotional metrics
  - Prefer aggregation, anonymization, or pseudonymization
  - Example data must always be synthetic and non-identifiable
- Never commit secrets or credentials.
- Use environment variables and document secrets integration.
- Enforce:
  - TLS 1.3
  - Secure cookies (HttpOnly, Secure, SameSite)
  - Short-lived access tokens with refresh rotation
- Validate and sanitize all inputs.
- Use parameterized queries only.
- Add rate limiting for abusive endpoints.
- Configure strict CORS (no wildcard) and CSP headers.
- Use structured JSON logging.
- Prefer OpenTelemetry-compatible tracing when adding observability.

## Frontend Testing
- Type definitions for API payloads must be placed in:
  - `proyectofinal-frontend/src/types/`
- Tests required:
  - Unit tests: Jest + React Testing Library (`src/__tests__/`)
  - E2E tests: Cypress or Playwright (`e2e/`)

## Quality & Tooling
- Use:
  - `eslint` + `prettier` for frontend
  - `ruff`, `black`, `mypy` for backend
- Every change must include:
  - Unit tests
  - At least one integration test

## CI, Supply Chain & Observability
- CI workflows should:
  - Run linting and tests (frontend + backend)
  - Run SAST (bandit / semgrep)
  - Run dependency scanning (SCA)
  - Generate SBOM (syft)
  - Scan images (trivy)
- Fail fast on high-severity findings.
- No secrets in CI configs.
- Add health and readiness endpoints when relevant and document them in OpenAPI.

## Documentation & Deliverables
Each change must include:
- Code changes under existing folders (exact relative paths)
- Typed definitions (frontend + backend)
- OpenAPI fragment or update
- Tests (unit + integration + E2E if UI)
- Short documentation note explaining:
  - What was added
  - Why
  - Security considerations
- Keep pull requests small and focused.

## Clarifications
If required information is missing (for example: exact API response schema), ask a SINGLE clarifying question before proceeding.
Always specify exact file paths for any proposed new files relative to the repository root.

## Summary
Follow existing structure and conventions. Use modern best practices. Prioritize security and privacy. Include tests and documentation with every change.
Adhere to these instructions strictly for all contributions to the SerenVoice project.