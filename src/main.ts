import { appendFileSync } from "fs";
import { EOL } from "os";
import { performance } from "perf_hooks";

import { TMP_VAR_NAME } from "./metrics/const.js";

appendFileSync(
  process.env.GITHUB_STATE,
  `${TMP_VAR_NAME}=${performance.now()}${EOL}`,
  {
    encoding: "utf8",
  }
);
