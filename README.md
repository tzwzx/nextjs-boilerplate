# Next.js Boilerplate

Opinionated starter for Next.js 15 with React 19, TypeScript, SCSS, and an Ultracite-driven lint pipeline.

## Install Dependencies

Use Bun to install dependencies when setting up the project for the first time.

```bash
bun i
```

## Scripts

Run each script with `bun <script>`.

### Start Dev Server

Launch the Next.js development server with Turbopack.

```bash
bun dev
```

### Build Production Bundle

Generate optimized assets for production.

```bash
bun run build
```

### Start Production Server

Serve the built application in production mode.

```bash
bun start
```

### Run Lint Checks

Execute Ultracite static analysis.

```bash
bun lint
```

### Apply Lint Fixes

Apply automatic fixes provided by Ultracite.

```bash
bun format
```

### Run Stylelint

Check SCSS files with Stylelint.

```bash
bun stylelint
```

### Fix Stylelint Issues

Autofix SCSS issues detected by Stylelint.

```bash
bun stylelint:fix
```

### Type Check

Run `tsgo --noEmit` to validate TypeScript types.

```bash
bun tsc
```

### Format package.json

Format and normalize `package.json` with Syncpack.

```bash
bun package-format
```

### Lint Semver Ranges

Validate semver ranges in `package.json` with Syncpack.

```bash
bun package-lint-semver-ranges
```

### Detect Unused Code

Use Knip to find unused files, exports, and dependencies.

```bash
bun knip
```

### Run Unit Tests

Execute the Bun unit test suite.

```bash
bun test:unit
```

### Run E2E Tests

Run Playwright end-to-end tests in headless mode.

```bash
bun test:e2e
```

### Open Playwright UI

Start the Playwright test runner UI.

```bash
bun test:e2e:ui
```

### Quality Gate

Run linting, formatting checks, Stylelint, type checks, Knip, package format validation, and unit tests together.

```bash
bun check-all
```

### Quality Gate (Auto Fix)

Apply automatic fixes, then run type checks, Knip, package format validation, and unit tests.

```bash
bun check-all:fix
```
