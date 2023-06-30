import { getTmpVarName, trackJob } from "./otel";

const start = Number(process.env[getTmpVarName()]);
const duration = new Date().valueOf() - start;
trackJob(duration);
