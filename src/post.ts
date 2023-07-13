import { getTmpVarName, trackJob } from "./otel";

const start = Number(process.env[getTmpVarName()]);
const duration = new Date().valueOf() - start;
// we track the job duration in seconds
trackJob(duration / 1000);
