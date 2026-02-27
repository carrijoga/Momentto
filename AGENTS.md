# Repository Guidelines

## Project Structure & Module Organization

- `app/`: Next.js App Router routes, layouts, and server/client components.
- `components/`: Reusable UI components and Radix UI wrappers.
- `content/`: Static content and copy used across pages.
- `hooks/`: Custom React hooks.
- `lib/`: Shared utilities (e.g., data helpers, context, Supabase clients).
- `public/`: Static assets served at `/` (icons, images, manifest).
- `styles/`: Global styles and Tailwind-specific files.
- `supabase/`: Database-related artifacts and local config.
- `worker/`: Background or service worker code.
- Root files: `middleware.ts`, `next.config.mjs`, `postcss.config.mjs`, `tsconfig.json`.

## Build, Test, and Development Commands

- `npm run dev`: Start the local Next.js dev server.
- `npm run build`: Create a production build.
- `npm run start`: Run the production server from `.next/`.
- `npm run lint`: Run Next.js lint rules.

Use `pnpm` or `yarn` if preferred; commands mirror the npm scripts.

## Coding Style & Naming Conventions

- TypeScript with React 19 and Next.js 16.
- Use 2-space indentation and keep files formatted with the existing style.
- Prefer PascalCase for components (`TripCountdown.tsx`), camelCase for functions and hooks (`useTripCountdown`).
- Tailwind CSS is the primary styling approach; keep utility classes grouped logically.

## Testing Guidelines

- No test framework is configured in `package.json` yet.
- If adding tests, document the runner, add a `test` script, and keep test files near the code they cover (e.g., `app/__tests__/` or `components/__tests__/`).

## Commit & Pull Request Guidelines

- Commit history uses Conventional Commit prefixes like `feat:`, `fix:`, and `refactor:`.
- Keep commits scoped and descriptive (example: `feat: add offline countdown storage`).
- PRs should include a concise summary, testing notes, and link related issues.
- Include screenshots or short clips for UI changes.

## Configuration & Secrets

- Store local secrets in `.env.local`; never commit production credentials.
- Supabase and web push settings are expected via env vars; keep a sample in docs if you add new keys.
