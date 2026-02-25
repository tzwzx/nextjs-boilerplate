/**
 * Check All - Run linting, formatting, type checking, and tests
 *
 * Usage:
 *   bun check-all          # Check mode (read-only)
 *   bun check-all:fix      # Fix mode (auto-fix then check)
 */

/* oxlint-disable import/no-nodejs-modules */
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
const configYaml = readFileSync(configPath, "utf8");

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

const logExecOutput = (stdout?: string, stderr?: string): void => {
  if (stdout) {
    console.log(stdout);
  }
  if (stderr) {
    console.error(stderr);
  }
};

const formatDuration = (startTime: number): string => {
  const MILLISECONDS_PER_SECOND = 1000;
  return ((performance.now() - startTime) / MILLISECONDS_PER_SECOND).toFixed(2);
};

const executeCommand = async (
  command: string
): Promise<{ command: string; error: Error } | null> => {
  try {
    const { stdout, stderr } = await execPromise(command);
    logExecOutput(stdout, stderr);
    return null;
  } catch (error) {
    const execError = error as Error & { stdout?: string; stderr?: string };
    console.error(`❌ Command failed: ${command}`);
    logExecOutput(execError.stdout, execError.stderr);
    return { command, error: execError };
  }
};

/**
 * Execute commands sequentially, continuing even if some fail
 */
const runSequential = async (commands: readonly string[]): Promise<void> => {
  const errors: { command: string; error: Error }[] = [];

  for (const command of commands) {
    const result = await executeCommand(command);
    if (result) {
      errors.push(result);
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
  commands: readonly { readonly command: string }[]
): Promise<void> => {
  const { result } = concurrently([...commands], {
    group: true,
    killOthersOn: [] as never[],
    prefix: "none",
  });

  try {
    await result;
  } catch (error) {
    const failures =
      (error as { message?: string })?.message || "Unknown error";
    throw new Error(`Some commands failed: ${failures}`, { cause: error });
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

  try {
    await fn();
    const duration = formatDuration(startTime);
    console.log(`✅ ${successMessage} (execution time: ${duration}s)\n`);
    process.exit(0);
  } catch {
    const duration = formatDuration(startTime);
    console.error(`❌ ${failureMessage} (execution time: ${duration}s)`);
    process.exit(1);
  }
};

/**
 * Execute commands in parallel with timing and exit handling
 */
const runConcurrently = async (
  commands: readonly { readonly command: string }[],
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

  await (isFix ? runFix() : runCheck());
};

// oxlint-disable-next-line jest/require-hook
run();
