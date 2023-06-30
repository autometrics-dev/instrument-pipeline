import * as fs from "fs";
import * as os from "os";

import { TMP_VAR_NAME } from "./const.js";

fs.appendFileSync(
  process.env.GITHUB_STATE,
  `${TMP_VAR_NAME}=${new Date().valueOf()}${os.EOL}`,
  {
    encoding: "utf8",
  }
);
