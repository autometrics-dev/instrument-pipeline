import { getBuckets, getLabels } from "./github.js";
import { init, pushToGateway } from "./otel.js";

const buckets = getBuckets();
const { exporter, histogram, counter } = init(buckets);

export function trackJob(duration: number) {
  const labels = getLabels();
  histogram.record(duration, labels);
  counter.add(1, labels);
  pushToGateway(exporter);
}