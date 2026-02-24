/**
 * Type declarations for SCSS module imports.
 * Enables TypeScript to recognize .scss files for side-effect and default imports.
 */
declare module "*.scss" {
  const content: Record<string, string>;
  export default content;
}
