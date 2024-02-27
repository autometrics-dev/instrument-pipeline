declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GITHUB_WORKFLOW: string;
      GITHUB_JOB: string;
      GITHUB_STATE: string;
      INPUT_BUCKETS?: string;
      INPUT_PUSHGATEWAY: string;
      INPUT_GATEWAYTYPE?: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
