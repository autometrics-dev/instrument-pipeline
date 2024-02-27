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

import { COUNTER_NAME, HISTOGRAM_NAME } from "./const.js";
import { getMetricsUrl } from "./github.js";


export function init(buckets?: number[]) {
  const exporter = new PeriodicExportingMetricReader({
    // 0 - using delta aggregation temporality setting
    // to ensure data submitted to the gateway is accurate
    exporter: new InMemoryMetricExporter(AggregationTemporality.DELTA),
  });

  const histogramView = new View({
    aggregation: buckets
      ? new ExplicitBucketHistogramAggregation(buckets)
      : new HistogramAggregation(),
    instrumentName: HISTOGRAM_NAME,
    instrumentType: InstrumentType.HISTOGRAM,
  });

  const autometricsMeterProvider = new MeterProvider({
    views: [histogramView],
    readers: [exporter],
  });

  const meter = autometricsMeterProvider.getMeter("autometrics");
  const histogram = meter.createHistogram(HISTOGRAM_NAME, {
    unit: "seconds",
  });
  const counter = meter.createCounter(COUNTER_NAME);
  return { exporter, histogram, counter };
}

export async function pushToGateway(exporter: PeriodicExportingMetricReader) {
  try {
    const exporterResponse = await exporter.collect();
    const serialized = new PrometheusSerializer().serialize(
      exporterResponse.resourceMetrics
    );
    const url = getMetricsUrl();
  
    const response = await fetch(url, {
      method: "POST",
      body: serialized,
    });
    if (response.status < 200 || response.status >= 300) {
      const text = await response.text();
      throw new Error(`Failed to push to gateway: ${response.status} ${text}`);
    }
    console.log("Metrics successfully pushed to gateway");
    // we flush the metrics at the end of the submission to ensure the data is not repeated
    await exporter.forceFlush();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
