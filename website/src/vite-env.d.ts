/// <reference types="vite/client" />

declare module "*.md?raw" {
  const source: string;
  export default source;
}