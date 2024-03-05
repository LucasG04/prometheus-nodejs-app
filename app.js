const express = require('express');
const prometheus = require('prom-client');

const app = express();
const port = 8080;

app.use(express.json());

const labelsAreValid = (labels) => {
    for (const label of labels) {
        if (!label || !label.name || !label.value || typeof label.name !== 'string' || typeof label.value !== 'string') {
            return false;
        }
    }
    return true;
}

const createMetric = (type, name, help, labels, value) => {
    const labelNames = labels ? labels.map(l => l.name) : [];
    const labelValues = labels ? labels.map(l => l.value) : [];
    if (type === 'counter') {
        let counter = prometheus.register.getSingleMetric(name);
        if (!counter) {
            counter = new prometheus.Counter({
                name: name,
                help: help || 'Help empty',
                labelNames
            });
        }
        counter.labels(...labelValues).inc(value || 1);
    } else if (type === 'gauge') {
        let gauge = prometheus.register.getSingleMetric(name);
        if (!gauge) {
            gauge = new prometheus.Gauge({
                name: name,
                help: help || 'Help empty',
                labelNames
            });
        }
        gauge.labels(...labelValues).set(value || 0);
    } else if (type === 'histogram') {
        let histogram = prometheus.register.getSingleMetric(name);
        if (!histogram) {
            histogram = new prometheus.Histogram({
                name: name,
                help: help || 'Help empty',
                labelNames,
                buckets: [0.1, 1, 5, 10]
            });
        }
        histogram.labels(...labelValues).observe(value || 0);
    } else if (type === 'summary') {
        let summary  = prometheus.register.getSingleMetric(name);
        if (!summary) {
            summary = new prometheus.Summary({
                name: name,
                help: help || 'Help empty',
                labelNames
            });
        }
        summary.labels(...labelValues).observe(value || 0);
    }
}

app.post('/counter', (req, res) => {
    const { name, help, labels, value } = req.body;

    if (!name) {
        res.status(400).send('No "name" passed.');
    } else if (labels && !Array.isArray(labels)) {
        res.status(400).send('Invalid labels format.');
    } else if (labels && !labelsAreValid(labels)) {
        res.status(400).send('Invalid labels provided.');
    }

    createMetric('counter', name, help, labels, value);

    res.status(200).send('OK');
});

app.post('/gauge', (req, res) => {
    const { name, help, labels, value } = req.body;

    if (!name) {
        res.status(400).send('No "name" passed.');
    } else if (labels && !Array.isArray(labels)) {
        res.status(400).send('Invalid labels format.');
    } else if (labels && !labelsAreValid(labels)) {
        res.status(400).send('Invalid labels provided.');
    }

    createMetric('gauge', name, help, labels, value);

    res.status(200).send('OK');
});

app.post('/histogram', (req, res) => {
    const { name, help, labels, value } = req.body;

    if (!name) {
        res.status(400).send('No "name" passed.');
    } else if (labels && !Array.isArray(labels)) {
        res.status(400).send('Invalid labels format.');
    } else if (labels && !labelsAreValid(labels)) {
        res.status(400).send('Invalid labels provided.');
    }

    createMetric('histogram', name, help, labels, value);

    res.status(200).send('OK');
});

app.post('/summary', (req, res) => {
    const { name, help, labels, value } = req.body;

    if (!name) {
        res.status(400).send('No "name" passed.');
    } else if (labels && !Array.isArray(labels)) {
        res.status(400).send('Invalid labels format.');
    } else if (labels && !labelsAreValid(labels)) {
        res.status(400).send('Invalid labels provided.');
    }

    createMetric('summary', name, help, labels, value);

    res.status(200).send('OK');
});

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', prometheus.register.contentType);
    res.end(await prometheus.register.metrics());
});

const server = app.listen(port, () => {
    console.log(`App listening at port ${port}`);
});
module.exports = server;
