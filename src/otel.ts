import { PrometheusSerializer } from "@opentelemetry/exporter-prometheus";
import {
  AggregationTemporality,
  InMemoryMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
import fetch from "node-fetch";

import { TMP_VAR_NAME } from "./const.js";

const exporter = new PeriodicExportingMetricReader({
  // 0 - using delta aggregation temporality setting
  // to ensure data submitted to the gateway is accurate
  exporter: new InMemoryMetricExporter(AggregationTemporality.DELTA),
});

const autometricsMeterProvider = new MeterProvider();
autometricsMeterProvider.addMetricReader(exporter);

const meter = autometricsMeterProvider.getMeter("am-action");
const histogram = meter.createHistogram("workflow.jobs.duration");
const counter = meter.createCounter("workflow.jobs.count");

export const trackJob = (duration: number) => {
  const labels = {
    workflow: process.env.GITHUB_WORKFLOW,
    job: process.env.GITHUB_JOB,
  };
  histogram.record(duration, labels);
  counter.add(1, labels);
  pushToGateway(process.env.INPUT_PUSHGATEWAY);
};

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
