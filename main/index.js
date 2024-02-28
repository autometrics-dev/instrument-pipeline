import { createRequire as __WEBPACK_EXTERNAL_createRequire } from "module";
/******/ /* webpack/runtime/compat */
/******/ 
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + "/";
/******/ 
/************************************************************************/
var __webpack_exports__ = {};

;// CONCATENATED MODULE: external "fs"
const external_fs_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("fs");
;// CONCATENATED MODULE: external "os"
const external_os_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("os");
;// CONCATENATED MODULE: external "perf_hooks"
const external_perf_hooks_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("perf_hooks");
;// CONCATENATED MODULE: ./src/metrics/const.ts
const TMP_VAR_NAME = "AUTOMETRICS_START";
const TMP_VAR_GITHUB_NAME = `STATE_${TMP_VAR_NAME}`;
const HISTOGRAM_NAME = "workflow.jobs.duration";
const COUNTER_NAME = "workflow.jobs.count";

;// CONCATENATED MODULE: ./src/main.ts




(0,external_fs_namespaceObject.appendFileSync)(process.env.GITHUB_STATE, `${TMP_VAR_NAME}=${external_perf_hooks_namespaceObject.performance.now()}${external_os_namespaceObject.EOL}`, {
    encoding: "utf8",
});

