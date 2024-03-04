const request = require('supertest');
const prometheus = require('prom-client');
const app = require('../app');

afterAll(() => {
    app.close();
});

describe('Counter', () => {
    afterEach(() => {
        prometheus.register.clear(); // Clear Prometheus metrics registry after each test
    });

    it('should return 200 OK and increment the counter with valid parameters', async () => {
        const res = await request(app)
            .post('/counter')
            .send({
                name: 'test_counter',
                help: 'Test counter',
                labels: [{ name: 'severity', value: 'high' }]
            });
        expect(res.status).toBe(200);

        // Verify the counter was incremented
        const metrics = await prometheus.register.metrics();
        expect(metrics).toContain('test_counter{severity="high"} 1');
    });

    it('should return 400 Bad Request if "name" is missing', async () => {
        const res = await request(app)
            .post('/counter')
            .send({});
        expect(res.status).toBe(400);
    });

    it('should return 400 Bad Request if "labels" are not an array', async () => {
        const res = await request(app)
            .post('/counter')
            .send({ name: 'test_counter', labels: 'invalid' });
        expect(res.status).toBe(400);
    });

    it('should return 400 Bad Request if any label is missing name or value', async () => {
        const res = await request(app)
            .post('/counter')
            .send({
                name: 'test_counter',
                labels: [{ name: 'severity' }, { value: 'high' }]
            });
        expect(res.status).toBe(400);
    });

    it('should return 400 Bad Request if any label name or value is not a string', async () => {
        const res = await request(app)
            .post('/counter')
            .send({
                name: 'test_counter',
                labels: [{ name: 'severity', value: 'high' }, { name: 123, value: 'low' }]
            });
        expect(res.status).toBe(400);
    });
});

describe('POST /gauge', () => {
    afterEach(() => {
        prometheus.register.clear(); // Clear Prometheus metrics registry after each test
    });

    it('should return 200 OK and set the gauge with valid parameters', async () => {
        const res = await request(app)
            .post('/gauge')
            .send({
                name: 'test_gauge',
                help: 'Test gauge',
                labels: [{ name: 'severity', value: 'high' }],
                value: 42
            });
        expect(res.status).toBe(200);

        // Verify the gauge was set
        const metrics = await prometheus.register.metrics();
        expect(metrics).toContain('test_gauge{severity="high"} 42');
    });

    it('should return 400 Bad Request if "name" is missing', async () => {
        const res = await request(app)
            .post('/gauge')
            .send({});
        expect(res.status).toBe(400);
    });

    it('should return 400 Bad Request if "name" is empty', async () => {
        const res = await request(app)
            .post('/gauge')
            .send({ name: '', value: 42 });
        expect(res.status).toBe(400);
    });

    // it('should return 400 Bad Request if "value" is not provided', async () => {
    //     const res = await request(app)
    //         .post('/gauge')
    //         .send({ name: 'test_gauge' });
    //     expect(res.status).toBe(400);
    // });

    it('should return 400 Bad Request if "labels" are not an array', async () => {
        const res = await request(app)
            .post('/gauge')
            .send({ name: 'test_gauge', labels: 'invalid', value: 42 });
        expect(res.status).toBe(400);
    });

    it('should return 400 Bad Request if any label is missing name or value', async () => {
        const res = await request(app)
            .post('/gauge')
            .send({
                name: 'test_gauge',
                labels: [{ name: 'severity' }, { value: 'high' }],
                value: 42
            });
        expect(res.status).toBe(400);
    });

    it('should return 400 Bad Request if any label name or value is not a string', async () => {
        const res = await request(app)
            .post('/gauge')
            .send({
                name: 'test_gauge',
                labels: [{ name: 'severity', value: 'high' }, { name: 123, value: 'low' }],
                value: 42
            });
        expect(res.status).toBe(400);
    });
});


describe('POST /histogram', () => {
    afterEach(() => {
        prometheus.register.clear(); // Clear Prometheus metrics registry after each test
    });

    it('should return 200 OK and observe the histogram with valid parameters', async () => {
        const res = await request(app)
            .post('/histogram')
            .send({
                name: 'test_histogram',
                help: 'Test histogram',
                labels: [{ name: 'severity', value: 'high' }],
                value: 5
            });
        expect(res.status).toBe(200);

        // Verify the histogram was observed
        const metrics = await prometheus.register.metrics();
        expect(metrics).toContain('test_histogram_bucket{le="0.1",severity="high"} 0');
        expect(metrics).toContain('test_histogram_bucket{le="1",severity="high"} 0');
        expect(metrics).toContain('test_histogram_bucket{le="5",severity="high"} 1');
        expect(metrics).toContain('test_histogram_bucket{le="10",severity="high"} 1');
        expect(metrics).toContain('test_histogram_sum{severity="high"} 5');
        expect(metrics).toContain('test_histogram_count{severity="high"} 1');
    });

    it('should return 400 Bad Request if "name" is missing', async () => {
        const res = await request(app)
            .post('/histogram')
            .send({});
        expect(res.status).toBe(400);
    });

    it('should return 400 Bad Request if "labels" are not an array', async () => {
        const res = await request(app)
            .post('/histogram')
            .send({ name: 'test_histogram', labels: 'invalid', value: 5 });
        expect(res.status).toBe(400);
    });

    it('should return 400 Bad Request if any label is missing name or value', async () => {
        const res = await request(app)
            .post('/histogram')
            .send({
                name: 'test_histogram',
                labels: [{ name: 'severity' }, { value: 'high' }],
                value: 5
            });
        expect(res.status).toBe(400);
    });

    it('should return 400 Bad Request if any label name or value is not a string', async () => {
        const res = await request(app)
            .post('/histogram')
            .send({
                name: 'test_histogram',
                labels: [{ name: 'severity', value: 'high' }, { name: 123, value: 'low' }],
                value: 5
            });
        expect(res.status).toBe(400);
    });
});

describe('POST /summary', () => {
    afterEach(() => {
        prometheus.register.clear(); // Clear Prometheus metrics registry after each test
    });

    it('should return 200 OK and observe the summary with valid parameters', async () => {
        const res = await request(app)
            .post('/summary')
            .send({
                name: 'test_summary',
                help: 'Test summary',
                labels: [{ name: 'severity', value: 'high' }],
                value: 5
            });
        expect(res.status).toBe(200);

        // Verify the summary was observed
        const metrics = await prometheus.register.metrics();
        console.log(metrics);
        expect(metrics).toContain('test_summary{quantile="0.5",severity="high"} 5');
        expect(metrics).toContain('test_summary{quantile="0.9",severity="high"} 5');
        expect(metrics).toContain('test_summary{quantile="0.99",severity="high"} 5');
        expect(metrics).toContain('test_summary_sum{severity="high"} 5');
        expect(metrics).toContain('test_summary_count{severity="high"} 1');
    });

    it('should return 400 Bad Request if "name" is missing', async () => {
        const res = await request(app)
            .post('/summary')
            .send({});
        expect(res.status).toBe(400);
    });

    it('should return 400 Bad Request if "labels" are not an array', async () => {
        const res = await request(app)
            .post('/summary')
            .send({ name: 'test_summary', labels: 'invalid', value: 5 });
        expect(res.status).toBe(400);
    });

    it('should return 400 Bad Request if any label is missing name or value', async () => {
        const res = await request(app)
            .post('/summary')
            .send({
                name: 'test_summary',
                labels: [{ name: 'severity' }, { value: 'high' }],
                value: 5
            });
        expect(res.status).toBe(400);
    });

    it('should return 400 Bad Request if any label name or value is not a string', async () => {
        const res = await request(app)
            .post('/summary')
            .send({
                name: 'test_summary',
                labels: [{ name: 'severity', value: 'high' }, { name: 123, value: 'low' }],
                value: 5
            });
        expect(res.status).toBe(400);
    });
});

