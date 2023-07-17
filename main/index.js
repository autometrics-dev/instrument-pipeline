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
;// CONCATENATED MODULE: ./src/const.ts
const TMP_VAR_NAME = "AUTOMETRICS_START";

;// CONCATENATED MODULE: ./src/main.ts



external_fs_namespaceObject.appendFileSync(process.env.GITHUB_STATE, `${TMP_VAR_NAME}=${new Date().valueOf()}${external_os_namespaceObject.EOL}`, {
    encoding: "utf8",
});

