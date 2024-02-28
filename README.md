![GitHub_headerImage](https://user-images.githubusercontent.com/3262610/221191767-73b8a8d9-9f8b-440e-8ab6-75cb3c82f2bc.png)

This GitHub action allows you to instrument a pipeline and track number of runs and their duration; the data is then exported to a prometheus aggregation gateway, such as one of these:

- [Prometheus Pushgateway](https://github.com/prometheus/pushgateway)
- [Gravel Gateway](https://github.com/sinkingpoint/prometheus-gravel-gateway/tree/master)
- [Prometheus Aggregation Gateway](https://github.com/zapier/prom-aggregation-gateway)

Due to limitations of GitHub actions, tracking success rate is only possible via api, so it is outside the scope of this action (for now).

## Usage

Just add the action as a step to your job, and provide the url of the prometheus aggregation gateway as an input:

```yaml
steps:
  - uses: autometrics-dev/instrument-pipeline@v0
    with:
      pushgateway: http://pushgateway.example.com
      gatewaytype: prometheus
  - uses: actions/checkout@v3
  - uses: actions/setup-node@v4
    with:
      node-version: 20
  - run: npm install
  - run: npm run build
```

Now every time the action runs, it will send the duration (and increase the run counter) of the run to the aggregation gateway.

## Inputs

### `pushgateway`

**Required** 

URL to the aggregation gateway, for example `http://localhost:9091`.

### `gatewaytype`

Type of the aggregation gateway, one of `prometheus`, `gravel`, or `zapier`. Currently only changes the url format in case of prometheus.

### `buckets`

Array of buckets to use for the histogram. For example, `[0, 1, 2, 5, 10, +Infinity]`.
