# Prometheus Node.js Application

A Node.js application that demonstrates how to use Prometheus for monitoring and metrics collection.

## Introduction

This Node.js application provides a basic HTTP server that serves a simple "Hello World" message and collects various metrics using Prometheus. It includes routes for demonstrating different types of Prometheus metrics such as Counters, Gauges, Histograms, and Summaries.

## Features

- Provides a simple HTTP server
- Exposes metrics for Prometheus
- Demonstrates various types of Prometheus metrics

## Running as a Docker Container

```bash
docker run -p 8080:8080 lucasg04/prometheus-nodejs-app:latest
```

Open a terminal inside of the container and run:
```console
$ curl -X POST -H "Content-Type: application/json" --data '{"name":"test_counter","help":"Test counter","labels":[{"name":"app","value":"backend"}]}' localhost:8080/counter
OK

$ curl localhost:8080/metrics
# HELP test_counter Test counter
# TYPE test_counter counter
test_counter{app="backend"} 1
```

## Endpoints

The application exposes the following endpoints:

- `POST /counter`: Creates a counter metric
- `POST /gauge`: Creates a gauge metric
- `POST /histogram`: Creates a histogram metric
- `POST /summary`: Creates a summary metric
- `GET /metrics:` Exposes Prometheus metrics

Each `POST` endpoint accepts a body with:
```javascript
{
  name: string; // Name of the metric, required
  help: string; // Help text for the metric
  labels: { name: string; value: string; }[]; // Labels for the metric
}
```