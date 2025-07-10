const { register, Counter, Histogram, Gauge, collectDefaultMetrics } = require('prom-client');
const express = require('express');

// Collect default metrics (CPU, memory, etc.)
collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

const errorTotal = new Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'severity']
});

// Claude Flow specific metrics
const swarmAgents = new Gauge({
  name: 'claude_flow_swarm_agents',
  help: 'Number of active swarm agents',
  labelNames: ['type', 'status']
});

const taskQueue = new Gauge({
  name: 'claude_flow_task_queue_size',
  help: 'Size of task queue',
  labelNames: ['priority']
});

const memoryUsage = new Gauge({
  name: 'claude_flow_memory_usage_bytes',
  help: 'Memory usage in bytes',
  labelNames: ['namespace']
});

const neuralModelAccuracy = new Gauge({
  name: 'claude_flow_neural_model_accuracy',
  help: 'Neural model accuracy percentage',
  labelNames: ['model_type']
});

// Middleware to collect metrics
function metricsMiddleware(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const labels = {
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode
    };
    
    httpRequestDuration.observe(labels, duration);
    httpRequestTotal.inc(labels);
  });
  
  next();
}

// Metrics endpoint
function metricsEndpoint() {
  const router = express.Router();
  
  router.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  });
  
  return router;
}

// Update metrics functions
function updateSwarmMetrics(agents) {
  const agentCounts = agents.reduce((acc, agent) => {
    const key = `${agent.type}_${agent.status}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  
  Object.entries(agentCounts).forEach(([key, count]) => {
    const [type, status] = key.split('_');
    swarmAgents.set({ type, status }, count);
  });
}

function updateTaskMetrics(tasks) {
  const tasksByPriority = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {});
  
  Object.entries(tasksByPriority).forEach(([priority, count]) => {
    taskQueue.set({ priority }, count);
  });
}

function recordError(type, severity) {
  errorTotal.inc({ type, severity });
}

function updateConnectionCount(count) {
  activeConnections.set(count);
}

module.exports = {
  metricsMiddleware,
  metricsEndpoint,
  updateSwarmMetrics,
  updateTaskMetrics,
  recordError,
  updateConnectionCount,
  httpRequestDuration,
  httpRequestTotal,
  activeConnections,
  errorTotal,
  swarmAgents,
  taskQueue,
  memoryUsage,
  neuralModelAccuracy
};