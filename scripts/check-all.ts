/**
 * Check All - Run linting, formatting, type checking, and tests
 *
 * Usage:
 *   bun check-all          # Check mode (read-only)
 *   bun check-all:fix      # Fix mode (auto-fix then check)
 */

import { exec } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { performance } from "node:perf_hooks";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import concurrently from "concurrently";
import { parse } from "yaml";

const execPromise = promisify(exec);

// Load configuration from YAML file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const configPath = join(__dirname, "..", "check-all.yml");
const configYaml = readFileSync(configPath, "utf-8");

interface Config {
  parallel_check_commands: string[];
  parallel_common_check_commands: string[];
  sequential_format_commands: string[];
}

const config = parse(configYaml) as Config;

// Convert YAML configuration to internal format
const PARALLEL_CHECK_COMMANDS = config.parallel_check_commands.map(
  (command) => ({ command })
);
const SEQUENTIAL_FORMAT_COMMANDS = config.sequential_format_commands;
const PARALLEL_COMMON_CHECK_COMMANDS =
  config.parallel_common_check_commands.map((command) => ({ command }));

/**
 * Execute commands sequentially, continuing even if some fail
 */
const runSequential = async (commands: readonly string[]): Promise<void> => {
  const errors: Array<{ command: string; error: Error }> = [];

  for (const command of commands) {
    try {
      const { stdout, stderr } = await execPromise(command);
      if (stdout) {
        console.log(stdout);
      }
      if (stderr) {
        console.error(stderr);
      }
    } catch (error) {
      const execError = error as Error & { stdout?: string; stderr?: string };
      console.error(`❌ Command failed: ${command}`);
      if (execError.stdout) {
        console.log(execError.stdout);
      }
      if (execError.stderr) {
        console.error(execError.stderr);
      }
      errors.push({ command, error: execError });
    }
  }

  if (errors.length > 0) {
    const errorMessages = errors
      .map((e) => `${e.command}: ${e.error.message}`)
      .join("\n");
    throw new Error(`Sequential commands failed:\n${errorMessages}`);
  }
};

/**
 * Execute commands in parallel, continuing even if some fail
 */
const runConcurrentlyOnly = async (
  commands: ReadonlyArray<{ readonly command: string }>
): Promise<void> => {
  const { result } = concurrently([...commands], {
    group: true,
    prefix: "none",
    killOthersOn: [] as never[],
  });

  try {
    await result;
  } catch (error) {
    const failures =
      (error as { message?: string })?.message || "Unknown error";
    throw new Error(`Some commands failed: ${failures}`);
  }
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
  const commands = [
    ...PARALLEL_CHECK_COMMANDS,
    ...PARALLEL_COMMON_CHECK_COMMANDS,
  ];

  await runConcurrently(commands, "All checks completed", "Checks failed");
};

/**
 * Fix mode: Auto-fix formatting, then run validation checks
 */
const runFix = async (): Promise<void> => {
  await runWithTimer(
    async () => {
      const errors: string[] = [];

      try {
        await runSequential(SEQUENTIAL_FORMAT_COMMANDS);
      } catch (error) {
        errors.push(`Sequential execution failed: ${(error as Error).message}`);
      }

      try {
        await runConcurrentlyOnly(PARALLEL_COMMON_CHECK_COMMANDS);
      } catch (error) {
        errors.push(`Parallel execution failed: ${(error as Error).message}`);
      }

      if (errors.length > 0) {
        throw new Error(errors.join("\n\n"));
      }
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
