export function getBuckets() {
  let buckets = process.env.INPUT_BUCKETS;
  if (!buckets) return;
  if (buckets.startsWith("[") && buckets.endsWith("]")) {
    buckets = buckets.slice(1, -1);
  }

  return buckets
    .trim()
    .split(",")
    .map((b) => {
      const n = Number(b);
      if (isNaN(n)) {
        throw new Error(`Invalid bucket value: ${b}`);
      }
      return n;
    });
}

export function getMetricsUrl() {
  const gateway = process.env.INPUT_PUSHGATEWAY;
  if (!gateway) {
    throw new Error("Pushgateway URL is required");
  }
  const parsed = new URL(gateway);
  const type = process.env.INPUT_GATEWAYTYPE;
  if (type === "prometheus") {
    const labels = getLabels();
    parsed.pathname = `/metrics/job/${labels.job}/workflow/${labels.workflow}`;
  } else if (parsed.pathname !== "/metrics") {
    parsed.pathname = "/metrics";
  }

  console.log(`Pushing metrics to ${parsed.toString()}`);

  return parsed.toString();
}

export function getLabels() {
  return {
    workflow: process.env.GITHUB_WORKFLOW,
    job: process.env.GITHUB_JOB,
  };
}
