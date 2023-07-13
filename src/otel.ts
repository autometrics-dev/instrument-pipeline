import { PrometheusSerializer } from "@opentelemetry/exporter-prometheus";
import {
  AggregationTemporality,
  ExplicitBucketHistogramAggregation,
  InMemoryMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
  HistogramAggregation,
  InstrumentType,
  View,
} from "@opentelemetry/sdk-metrics";
import fetch from "node-fetch";

import { TMP_VAR_NAME } from "./const.js";

const buckets = getBuckets();
const { exporter, histogram, counter } = init(buckets);

function init(buckets?: number[]) {
  const exporter = new PeriodicExportingMetricReader({
    // 0 - using delta aggregation temporality setting
    // to ensure data submitted to the gateway is accurate
    exporter: new InMemoryMetricExporter(AggregationTemporality.DELTA),
  });

  const histogramView = new View({
    aggregation: buckets
      ? new ExplicitBucketHistogramAggregation(buckets)
      : new HistogramAggregation(),
    instrumentName: "workflow.jobs.duration",
    instrumentType: InstrumentType.HISTOGRAM,
  });

  const autometricsMeterProvider = new MeterProvider({
    views: [histogramView],
  });
  autometricsMeterProvider.addMetricReader(exporter);

  const meter = autometricsMeterProvider.getMeter("autometrics");
  const histogram = meter.createHistogram("workflow.jobs.duration", {
    unit: "seconds",
  });
  const counter = meter.createCounter("workflow.jobs.count");
  return { exporter, histogram, counter };
}

function getBuckets() {
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

export function trackJob(duration: number) {
  const labels = {
    workflow: process.env.GITHUB_WORKFLOW,
    job: process.env.GITHUB_JOB,
  };
  histogram.record(duration, labels);
  counter.add(1, labels);
  pushToGateway(process.env.INPUT_PUSHGATEWAY);
}

async function pushToGateway(gateway: string) {
  const exporterResponse = await exporter.collect();
  const serialized = new PrometheusSerializer().serialize(
    exporterResponse.resourceMetrics
  );

  await fetch(gateway, {
    method: "POST",
    body: serialized,
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
  // we flush the metrics at the end of the submission to ensure the data is not repeated
  await exporter.forceFlush();
}

export const getTmpVarName = () => `STATE_${TMP_VAR_NAME}`;
