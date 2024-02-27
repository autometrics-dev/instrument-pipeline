import { performance } from "perf_hooks";

import { TMP_VAR_GITHUB_NAME } from "./metrics/const.js";
import { trackJob } from "./metrics/index.js";

const value = process.env[TMP_VAR_GITHUB_NAME];
if (!value) {
  throw new Error("Could not retrieve start timestamp from previous stage");
}
const start = Number(value);
const duration = performance.now() - start;
// we track the job duration in seconds
trackJob(duration / 1000);
