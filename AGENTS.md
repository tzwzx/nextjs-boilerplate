# Additional Conventions Beyond the Built-in Functions

As this project's AI coding tool, you must follow the additional conventions below, in addition to the built-in functions.

# General Rules

- After `bun codesweep:fix`, run `bun react-doctor` and if the score is not 100, fix the issues to achieve a score of 100.
- This is an open-source project. All code comments must be written in English. Write clear, concise comments that help external contributors understand the "why" behind the code, not just the "what". Avoid unnecessary or redundant comments — let the code speak for itself when it is self-explanatory.
- **Do not delete tsconfig keys that `next build` / `next dev` rewrite.** `writeConfigurationDefaults` restores missing keys. Suggested (written only when absent): `target` / `lib` / `allowJs` / `skipLibCheck` / `noEmit` / `incremental`, and **`strict` is written as `false`** — so `"strict": true` is a required guard. Required (overwritten when the value differs): `module` / `esModuleInterop` / `moduleResolution` / `resolveJsonModule` / `jsx` / `isolatedModules` (`isolatedModules` is skipped when `verbatimModuleSyntax: true`). `include` / `exclude` / `compilerOptions.plugins` are also written when missing. Leave them even if they look equal to TypeScript defaults.
