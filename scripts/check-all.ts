/**
 * Check All - Run linting, formatting, type checking, and tests
 *
 * Usage:
 *   bun check-all          # Check mode (read-only)
 *   bun check-all:fix      # Fix mode (auto-fix then check)
 */

import { exec } from "node:child_process";
import { performance } from "node:perf_hooks";
import process from "node:process";
import { promisify } from "node:util";
import concurrently from "concurrently";

const execPromise = promisify(exec);

// ============================================================================
// CONFIGURATION: Command Definitions
// ============================================================================
// 💡 Modify only this section to customize checks for your project
//
// Execution Matrix:
// ┌─────────────────────────────┬───────────────┬──────────────┐
// │ Command Group               │ Check Mode    │ Fix Mode     │
// ├─────────────────────────────┼───────────────┼──────────────┤
// │ CHECK_COMMANDS              │ ✅ Executed   │ ⏭️  Skipped  │
// │ FORMAT_COMMANDS             │ ⏭️  Skipped   │ ✅ Executed  │
// │ PARALLEL_CHECK_COMMANDS     │ ✅ Executed   │ ✅ Executed  │
// └─────────────────────────────┴───────────────┴──────────────┘
//
// Check Mode:  CHECK_COMMANDS + PARALLEL_CHECK_COMMANDS
// Fix Mode:    FORMAT_COMMANDS + PARALLEL_CHECK_COMMANDS
// ----------------------------------------------------------------------------

// Check mode only - Read-only validation
const CHECK_COMMANDS = [
  { command: "bun lint" },
  { command: "bun prettier" },
] as const;

// Fix mode only - Auto-fix commands (run sequentially)
const FORMAT_COMMANDS = ["bun format", "bun prettier:fix"] as const;

// Both modes - Heavy checks (run in parallel)
const PARALLEL_CHECK_COMMANDS = [
  { command: "bun package-format" },
  { command: "bun package-lint-semver-ranges" },
  { command: "bun tsc" },
  { command: "bun knip" },
  { command: "bun test:unit" },
] as const;

// ============================================================================

/**
 * Execute commands sequentially (one after another)
 */
const runSequential = async (commands: readonly string[]): Promise<void> => {
  for (const command of commands) {
    console.log(`🔧 Running: ${command}`);
    const { stdout, stderr } = await execPromise(command);
    if (stdout) {
      console.log(stdout);
    }
    if (stderr) {
      console.error(stderr);
    }
  }
};

/**
 * Execute commands in parallel (without process.exit)
 */
const runConcurrentlyOnly = async (
  commands: ReadonlyArray<{ readonly command: string }>
): Promise<void> => {
  const options = {
    group: true,
    prefix: "none",
  } as const;

  const { result } = concurrently([...commands], options);
  await result;
};

/**
 * Execute function with timing and exit code handling (exit 0 on success, 1 on failure)
 */
const runWithTimer = async (
  fn: () => Promise<void>,
  successMessage: string,
  failureMessage: string
): Promise<void> => {
  const startTime = performance.now();
  const MILLISECONDS_PER_SECOND = 1000;

  try {
    await fn();
    const endTime = performance.now();
    const duration = ((endTime - startTime) / MILLISECONDS_PER_SECOND).toFixed(
      2
    );
    console.log(`✅ ${successMessage} (execution time: ${duration}s)\n`);
    process.exit(0);
  } catch {
    const endTime = performance.now();
    const duration = ((endTime - startTime) / MILLISECONDS_PER_SECOND).toFixed(
      2
    );
    console.error(`❌ ${failureMessage} (execution time: ${duration}s)`);
    process.exit(1);
  }
};

/**
 * Execute commands in parallel with timing and exit handling
 */
const runConcurrently = async (
  commands: ReadonlyArray<{ readonly command: string }>,
  successMessage: string,
  failureMessage: string
): Promise<void> => {
  await runWithTimer(
    async () => {
      await runConcurrentlyOnly(commands);
    },
    successMessage,
    failureMessage
  );
};

/**
 * Check mode: Run all validation commands in parallel (read-only)
 */
const runCheck = async (): Promise<void> => {
  const commands = [...CHECK_COMMANDS, ...PARALLEL_CHECK_COMMANDS];

  await runConcurrently(commands, "All checks completed", "Checks failed");
};

/**
 * Fix mode: Auto-fix formatting, then validate (sequential → parallel)
 */
const runFix = async (): Promise<void> => {
  await runWithTimer(
    async () => {
      console.log(
        "📝 Step 1: Running format and prettier:fix sequentially...\n"
      );
      await runSequential(FORMAT_COMMANDS);

      console.log("\n⚡ Step 2: Running remaining checks concurrently...\n");
      await runConcurrentlyOnly(PARALLEL_CHECK_COMMANDS);
    },
    "All fixes and checks completed",
    "Fixes or checks failed"
  );
};

/**
 * Main entry point: Route to check or fix mode based on CLI args
 */
const run = async (): Promise<void> => {
  const args = process.argv.slice(2);
  const isFix = args.includes("fix");

  if (isFix) {
    await runFix();
  } else {
    await runCheck();
  }
};

run();
