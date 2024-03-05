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

    it('should increment an existing counter metric if it already exists', async () => {
        // Send the first request to create the counter metric
        const res1 = await request(app)
            .post('/counter')
            .send({
                name: 'test_counter',
                help: 'Test counter',
                labels: [{ name: 'severity', value: 'high' }],
                value: 1
            });
        expect(res1.status).toBe(200);

        // Verify that the counter metric was created
        const metrics1 = await prometheus.register.metrics();
        expect(metrics1).toContain('test_counter{severity="high"} 1');

        // Send the second request to increment the existing counter metric
        const res2 = await request(app)
            .post('/counter')
            .send({
                name: 'test_counter',
                labels: [{ name: 'severity', value: 'high' }],
                value: 3 // Increment value
            });
        expect(res2.status).toBe(200);

        // Verify that the counter metric was incremented
        const metrics2 = await prometheus.register.metrics();
        expect(metrics2).toContain('test_counter{severity="high"} 4');
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

    it('should update an existing gauge metric if it already exists', async () => {
        // Send the first request to create the gauge metric
        const res1 = await request(app)
            .post('/gauge')
            .send({
                name: 'test_gauge',
                help: 'Test gauge',
                labels: [{ name: 'severity', value: 'high' }],
                value: 42
            });
        expect(res1.status).toBe(200);

        // Verify that the gauge metric was created
        const metrics1 = await prometheus.register.metrics();
        expect(metrics1).toContain('test_gauge{severity="high"} 42');

        // Send the second request to update the existing gauge metric
        const res2 = await request(app)
            .post('/gauge')
            .send({
                name: 'test_gauge',
                labels: [{ name: 'severity', value: 'high' }],
                value: 100 // New value
            });
        expect(res2.status).toBe(200);

        // Verify that the gauge metric was updated
        const metrics2 = await prometheus.register.metrics();
        expect(metrics2).toContain('test_gauge{severity="high"} 100');
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

    it('should observe an existing histogram metric if it already exists', async () => {
        // Send the first request to create the histogram metric
        const res1 = await request(app)
            .post('/histogram')
            .send({
                name: 'test_histogram',
                help: 'Test histogram',
                labels: [{ name: 'severity', value: 'high' }],
                value: 5
            });
        expect(res1.status).toBe(200);

        // Verify that the histogram metric was observed
        const metrics1 = await prometheus.register.metrics();
        expect(metrics1).toContain('test_histogram_bucket{le="0.1",severity="high"} 0');
        expect(metrics1).toContain('test_histogram_bucket{le="1",severity="high"} 0');
        expect(metrics1).toContain('test_histogram_bucket{le="5",severity="high"} 1');
        expect(metrics1).toContain('test_histogram_bucket{le="10",severity="high"} 1');
        expect(metrics1).toContain('test_histogram_sum{severity="high"} 5');
        expect(metrics1).toContain('test_histogram_count{severity="high"} 1');

        // Send the second request to observe the existing histogram metric
        const res2 = await request(app)
            .post('/histogram')
            .send({
                name: 'test_histogram',
                labels: [{ name: 'severity', value: 'high' }],
                value: 10 // New value
            });
        expect(res2.status).toBe(200);

        // Verify that the histogram metric was observed again with the new value
        const metrics2 = await prometheus.register.metrics();
        expect(metrics2).toContain('test_histogram_bucket{le="0.1",severity="high"} 0');
        expect(metrics2).toContain('test_histogram_bucket{le="1",severity="high"} 0');
        expect(metrics2).toContain('test_histogram_bucket{le="5",severity="high"} 1');
        expect(metrics2).toContain('test_histogram_bucket{le="10",severity="high"} 2');
        expect(metrics2).toContain('test_histogram_sum{severity="high"} 15');
        expect(metrics2).toContain('test_histogram_count{severity="high"} 2');
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
        expect(metrics).toContain('test_summary{quantile="0.5",severity="high"} 5');
        expect(metrics).toContain('test_summary{quantile="0.9",severity="high"} 5');
        expect(metrics).toContain('test_summary{quantile="0.99",severity="high"} 5');
        expect(metrics).toContain('test_summary_sum{severity="high"} 5');
        expect(metrics).toContain('test_summary_count{severity="high"} 1');
    });

    it('should observe an existing summary metric if it already exists', async () => {
        // Send the first request to create the summary metric
        const res1 = await request(app)
            .post('/summary')
            .send({
                name: 'test_summary',
                help: 'Test summary',
                labels: [{ name: 'severity', value: 'high' }],
                value: 5
            });
        expect(res1.status).toBe(200);

        // Verify that the summary metric was observed
        const metrics1 = await prometheus.register.metrics();
        expect(metrics1).toContain('test_summary{quantile="0.5",severity="high"} 5');
        expect(metrics1).toContain('test_summary{quantile="0.9",severity="high"} 5');
        expect(metrics1).toContain('test_summary{quantile="0.99",severity="high"} 5');
        expect(metrics1).toContain('test_summary_sum{severity="high"} 5');
        expect(metrics1).toContain('test_summary_count{severity="high"} 1');

        // Send the second request to observe the existing summary metric
        const res2 = await request(app)
            .post('/summary')
            .send({
                name: 'test_summary',
                labels: [{ name: 'severity', value: 'high' }],
                value: 10 // New value
            });
        expect(res2.status).toBe(200);

        // Verify that the summary metric was observed again with the new value
        const metrics2 = await prometheus.register.metrics();
        expect(metrics2).toContain('test_summary{quantile="0.5",severity="high"} 7.5');
        expect(metrics2).toContain('test_summary{quantile="0.9",severity="high"} 10');
        expect(metrics2).toContain('test_summary{quantile="0.99",severity="high"} 10');
        expect(metrics2).toContain('test_summary_sum{severity="high"} 15');
        expect(metrics2).toContain('test_summary_count{severity="high"} 2');
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

