#!/usr/bin/env node

const express = require('express');
const { metricsMiddleware, metricsEndpoint } = require('./metrics-collector');
const { initializeTracing } = require('./tracing');

// Initialize tracing
const tracer = initializeTracing('claude-flow-monitor');

const app = express();
const port = process.env.PORT || 3001;

// Add metrics middleware
app.use(metricsMiddleware);

// Add metrics endpoint
app.use(metricsEndpoint());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Real-time monitoring endpoint
app.get('/monitor', (req, res) => {
  res.json({
    status: 'monitoring',
    endpoints: {
      metrics: '/metrics',
      health: '/health',
      monitor: '/monitor'
    },
    services: {
      prometheus: 'http://localhost:9090',
      grafana: 'http://localhost:3000',
      jaeger: 'http://localhost:16686',
      alertmanager: 'http://localhost:9093'
    }
  });
});

// Start the monitoring server
app.listen(port, () => {
  console.log(`Claude Flow Monitor running on port ${port}`);
  console.log(`Metrics available at http://localhost:${port}/metrics`);
  console.log(`Health check at http://localhost:${port}/health`);
});

module.exports = app;