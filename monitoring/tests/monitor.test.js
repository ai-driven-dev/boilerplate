const request = require('supertest');
const app = require('../src/monitor');

describe('Monitoring Service', () => {
  test('GET /health returns healthy status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('healthy');
    expect(response.body.timestamp).toBeDefined();
  });

  test('GET /metrics returns Prometheus metrics', async () => {
    const response = await request(app)
      .get('/metrics')
      .expect(200);
    
    expect(response.text).toContain('# HELP');
    expect(response.text).toContain('# TYPE');
  });

  test('GET /monitor returns monitoring info', async () => {
    const response = await request(app)
      .get('/monitor')
      .expect(200);
    
    expect(response.body.status).toBe('monitoring');
    expect(response.body.endpoints).toBeDefined();
    expect(response.body.services).toBeDefined();
  });
});

describe('Metrics Collection', () => {
  const { updateSwarmMetrics, updateTaskMetrics } = require('../src/metrics-collector');

  test('updateSwarmMetrics updates agent metrics', () => {
    const agents = [
      { type: 'coordinator', status: 'active' },
      { type: 'researcher', status: 'active' },
      { type: 'coder', status: 'idle' }
    ];
    
    // Should not throw
    expect(() => updateSwarmMetrics(agents)).not.toThrow();
  });

  test('updateTaskMetrics updates task queue metrics', () => {
    const tasks = [
      { priority: 'high' },
      { priority: 'medium' },
      { priority: 'high' }
    ];
    
    // Should not throw
    expect(() => updateTaskMetrics(tasks)).not.toThrow();
  });
});

describe('Tracing', () => {
  const { createSpan, initializeTracing } = require('../src/tracing');

  test('initializeTracing returns tracer', () => {
    const tracer = initializeTracing('test-service');
    expect(tracer).toBeDefined();
  });

  test('createSpan executes function and returns result', async () => {
    const tracer = initializeTracing('test-service');
    const testFunction = jest.fn().mockResolvedValue('test-result');
    
    const result = await createSpan(tracer, 'test-span', testFunction);
    
    expect(testFunction).toHaveBeenCalled();
    expect(result).toBe('test-result');
  });
});