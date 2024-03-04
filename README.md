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

- `POST /counter`: Creates a counter metric
  - Body Params: `name`, `help`, `labels`
- `POST /gauge`: Creates a gauge metric
  - Body Params: `name`, `help`, `labels`
- `POST /histogram`: Creates a histogram metric
  - Body Params: `name`, `help`, `labels`
- `POST /summary`: Creates a summary metric
  - Body Params: `name`, `help`, `labels`
- `GET /metrics:` Exposes Prometheus metrics