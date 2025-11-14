# Repository Guidelines

## Project Structure & Module Organization
- `pages/` hosts Next.js routes (`/admin`, `/posts/[slug]`, API handlers) and is the entry point for UI and serverless logic.
- `components/` contains shared UI such as the layout shell, theme toggles, and shadcn-inspired primitives inside `components/ui/`.
- `lib/` houses integration code (GitHub client, auth helpers, utility functions) while `content/` stores MDX sources for posts, projects, and static pages consumed by Contentlayer.
- Global styling lives in `styles/globals.css`, and Tailwind plus Contentlayer configs live in the repo root.

## Build, Test, and Development Commands
- `pnpm install` ensures dependencies match the lockfile and Tailwind/Contentlayer plugins.
- `pnpm dev` starts the Next.js dev server with live Contentlayer regeneration; use it when editing MDX or admin flows.
- `pnpm lint` runs `next lint` with the project ESLint rules and must be clean before every commit.
- `pnpm type-check` executes `tsc --noEmit` so shared types (for example `contentlayer/generated`) remain sound.
- `pnpm build` performs `contentlayer build` then `next build`, mirroring the production pipeline; run before shipping any feature.

## Coding Style & Naming Conventions
- TypeScript files use 2-space indentation, named exports, and prefer functional React components.
- Component, hook, and utility filenames follow kebab-case (`theme-provider.tsx`, `github-client.ts`), while React components themselves use PascalCase.
- Favor Tailwind utility classes over ad-hoc CSS; extend design tokens via `tailwind.config.js` and CSS variables defined in `styles/globals.css`.
- Use `cn` from `lib/utils.ts` when merging class names and keep props typed explicitly.

## Testing Guidelines
- There is no dedicated unit test suite; rely on `pnpm lint`, `pnpm type-check`, and `pnpm build` as the minimum verification gates.
- Manually verify critical routes: `localhost:3000/`, `/posts/[slug]`, and `/admin` (including GitHub auth and MDX editing) before opening a PR.
- For content updates, check the rendered MDX in both light and dark themes to avoid typography regressions.

## Commit & Pull Request Guidelines
- Follow the short, action-focused style seen in the log (`修复 bug`, `完善博客`): use present-tense summaries under 60 characters and group related changes per commit.
- Every PR should state scope, testing commands executed, and link to any tracked issue or task. Include screenshots or GIFs when the UI changes.
- Keep branches rebased on `main` before requesting review, and avoid mixing content edits with infrastructure changes.

## Security & Configuration Tips
- Never commit `.env.local`; use the values documented in `README.md` and rotate `JWT_SECRET` plus GitHub tokens when sharing access.
- OAuth-backed admin actions require GitHub tokens with `repo` scope—store them only via the encrypted JWT flow implemented in `lib/auth.ts`.
