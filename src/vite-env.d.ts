/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_SW?: string;
  readonly PROD?: boolean;
  readonly DEV?: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
