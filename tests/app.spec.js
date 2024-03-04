const request = require('supertest');
const prometheus = require('prom-client');
const server = require('../app');

describe('Counter', () => {
    it('increments the counter', async () => {
        const res = await request(server)
            .get('/counter')
            .query({ metric_name: 'test_counter', severity: 'high' });
            console.log(res)
        expect(res.status).toBe(200);

        // Verify the counter was incremented
        const metrics = await prometheus.register.metrics();
        expect(metrics).toContain('test_counter{severity="high"} 1');
    });

    it('returns error if no metric_name provided', async () => {
        const res = await request(server)
            .get('/counter');
        expect(res.status).toBe(400);
    });
});

describe('Gauge', () => {
    it('sets the gauge value', async () => {
        const res = await request(server)
            .get('/gauge')
            .query({ metric_name: 'test_gauge', value: 10 });
        expect(res.status).toBe(200);

        // Verify the gauge was set
        const metrics = await prometheus.register.metrics();
        expect(metrics).toContain('test_gauge 10');
    });

    it('returns error if no metric_name provided', async () => {
        const res = await request(server)
            .get('/gauge');
        expect(res.status).toBe(400);
    });
});

describe('Histogram', () => {
    it('observes the histogram value', async () => {
        const res = await request(server)
            .get('/histogram')
            .query({ metric_name: 'test_histogram', value: 5 });
        expect(res.status).toBe(200);

        // Verify the histogram was observed
        const metrics = await prometheus.register.metrics();
        expect(metrics).toContain('test_histogram_bucket{le="0.1"} 0');
        expect(metrics).toContain('test_histogram_bucket{le="1"} 0');
        expect(metrics).toContain('test_histogram_bucket{le="5"} 1');
        expect(metrics).toContain('test_histogram_bucket{le="10"} 1');
        expect(metrics).toContain('test_histogram_sum 5');
        expect(metrics).toContain('test_histogram_count 1');
    });

    it('returns error if no metric_name provided', async () => {
        const res = await request(server).get('/histogram');
        expect(res.status).toBe(400);
    });
});

describe('Summary', () => {
    it('observes the summary value', async () => {
        const res = await request(server)
            .get('/summary')
            .query({ metric_name: 'test_summary', value: 7 });
        expect(res.status).toBe(200);

        // Verify the summary was observed
        const metrics = await prometheus.register.metrics();
        expect(metrics).toContain('test_summary_sum 7');
        expect(metrics).toContain('test_summary_count 1');
    });

    it('returns error if no metric_name provided', async () => {
        const res = await request(server)
            .get('/summary');
        expect(res.status).toBe(400);
    });
});
