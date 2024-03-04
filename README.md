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

## Endpoints

The application exposes the following endpoints:

- `GET /counter`: Creates a counter metric
  - Query Params: `name` (Metric Name), `help`, `severity`
- `GET /gauge`: Creates a gauge metric
  - Query Params: `name` (Metric Name), `help`, `severity`
- `GET /histogram`: Creates a histogram metric
  - Query Params: `name` (Metric Name), `help`, `severity`
- `GET /summary`: Creates a summary metric
  - Query Params: `name` (Metric Name), `help`, `severity`
- `GET /metrics:` Exposes Prometheus metrics