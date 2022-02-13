declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPENAPI_API_KEY: string;
      OPENAPI_ORGANIZATION: string;
    }
  }
}

export {};
