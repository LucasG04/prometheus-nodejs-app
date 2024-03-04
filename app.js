const express = require('express');
const prometheus = require('prom-client');

const app = express();
const port = 8080;

app.use(express.json());

app.get('/counter', (req, res) => {
    const { metric_name, help, severity } = req.query;
    
    if (!metric_name) {
        res.status(400).send('No "metric_name" passed.')
    }

    const counter = new prometheus.Counter({
        name: metric_name,
        help: help ?? 'Help empty',
        labelNames: ['severity']
    });
    counter.labels(severity || '0').inc();

    res.status(200).send('OK');
});

app.get('/gauge', (req, res) => {
    const { metric_name, help, value } = req.query;
    
    if (!metric_name || !value) {
        res.status(400).send('Both "metric_name" and "value" are required.');
        return;
    }

    const gauge = new prometheus.Gauge({
        name: metric_name,
        help: help || 'Help empty',
    });
    gauge.set(parseFloat(value));

    res.status(200).send('OK');
});

app.get('/histogram', (req, res) => {
    const { metric_name, help, value } = req.query;
    
    if (!metric_name || !value) {
        res.status(400).send('Both "metric_name" and "value" are required.');
        return;
    }

    const histogram = new prometheus.Histogram({
        name: metric_name,
        help: help || 'Help empty',
    });
    histogram.observe(parseFloat(value));

    res.status(200).send('OK');
});

app.get('/summary', (req, res) => {
    const { metric_name, help, value } = req.query;
    
    if (!metric_name || !value) {
        res.status(400).send('Both "metric_name" and "value" are required.');
        return;
    }

    const summary = new prometheus.Summary({
        name: metric_name,
        help: help || 'Help empty',
    });
    summary.observe(parseFloat(value));

    res.status(200).send('OK');
});

app.get('/metrics', (req, res) => {
    res.set('Content-Type', prometheus.register.contentType);
    res.end(prometheus.register.metrics());
});

const server = app.listen(port, () => {
    console.log(`App listening at port ${port}`);
});
module.exports = server;
