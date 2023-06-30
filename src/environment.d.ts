declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GITHUB_WORKFLOW: string;
      GITHUB_JOB: string;
      INPUT_PUSHGATEWAY: string;
      GITHUB_STATE: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
