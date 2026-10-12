/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_ANALYTICS_ID?: string;
}

declare module "*.md?raw" {
  const source: string;
  export default source;
}

interface Window {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
}
