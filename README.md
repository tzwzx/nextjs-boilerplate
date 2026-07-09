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

Launch the Next.js development server.

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

### Lint Semver Ranges

Validate semver ranges in `package.json` with Syncpack.

```bash
bun syncpack:lint
```

### Analyze Codebase Health

Use Fallow to find unused code, duplication, and complexity hotspots.

```bash
bun fallow
```

### Fix Unused Code

Auto-remove unused exports, dependencies, and enum members with Fallow.

```bash
bun fallow:fix
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

Run linting, formatting checks, Stylelint, type checks, Fallow, package format validation, and unit tests together.

```bash
bun codesweep:check
```

### Quality Gate (Auto Fix)

Apply automatic fixes (including Fallow), then run type checks, Fallow, package format validation, and unit tests.

```bash
bun codesweep:fix
```

### Run React Doctor

Diagnose project health with React Doctor.

```bash
bun react-doctor
```

### Generate Rulesync

Generate rule files with Rulesync.

```bash
bun rulesync
```
