# Monitoring Integration Guide

## Overview
This guide explains how to integrate the monitoring stack with your Claude Flow application.

## Quick Start

### 1. Install Dependencies
```bash
cd monitoring
npm install
```

### 2. Start Monitoring Stack
```bash
# Start all services
npm run docker:up

# Start monitoring server
npm start
```

### 3. Access Dashboards
- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Jaeger**: http://localhost:16686
- **AlertManager**: http://localhost:9093

## Application Integration

### Add Metrics to Your App

```javascript
const { metricsMiddleware, updateSwarmMetrics } = require('./monitoring/src/metrics-collector');

// Express app
app.use(metricsMiddleware);

// Update swarm metrics
const agents = await getSwarmAgents();
updateSwarmMetrics(agents);
```

### Add Tracing

```javascript
const { initializeTracing, traceSwarmOperation } = require('./monitoring/src/tracing');

// Initialize tracing
const tracer = initializeTracing('my-service');

// Trace operations
await traceSwarmOperation(tracer, 'spawn', swarmId, async () => {
  // Your swarm operation here
});
```

### Custom Metrics

```javascript
const { Gauge } = require('prom-client');

// Create custom metric
const customMetric = new Gauge({
  name: 'my_custom_metric',
  help: 'Description of my metric',
  labelNames: ['label1', 'label2']
});

// Update metric
customMetric.set({ label1: 'value1', label2: 'value2' }, 42);
```

## Configuration

### Environment Variables

```bash
# Monitoring
PORT=3001
JAEGER_ENDPOINT=http://localhost:14268/api/traces

# Prometheus
PROMETHEUS_URL=http://localhost:9090

# Grafana
GRAFANA_URL=http://localhost:3000
GRAFANA_USER=admin
GRAFANA_PASSWORD=admin
```

### Custom Dashboards

1. Access Grafana at http://localhost:3000
2. Create new dashboard
3. Add panels with Prometheus queries
4. Save dashboard

### Custom Alerts

1. Edit `alerts/claude-flow-rules.yml`
2. Add new alert rules
3. Restart Prometheus: `docker-compose restart prometheus`

## Monitoring Endpoints

### Metrics Endpoint
```
GET /metrics
```
Returns Prometheus metrics in text format.

### Health Check
```
GET /health
```
Returns service health status.

### Monitor Info
```
GET /monitor
```
Returns monitoring stack information.

## Best Practices

### 1. Metric Naming
- Use descriptive names: `claude_flow_swarm_agents`
- Include units: `_seconds`, `_bytes`, `_total`
- Use consistent labels

### 2. Alert Thresholds
- Set appropriate thresholds based on baseline
- Use percentiles for latency: `histogram_quantile(0.95, ...)`
- Consider alert fatigue

### 3. Dashboard Design
- Group related metrics
- Use appropriate visualization types
- Include time range selectors

### 4. Trace Sampling
- Use sampling for high-volume services
- Include relevant context in spans
- Tag spans with business metadata

## Troubleshooting

### Common Issues

1. **Metrics not appearing**
   - Check `/metrics` endpoint
   - Verify Prometheus scraping
   - Check label consistency

2. **Dashboards not loading**
   - Verify Grafana datasource configuration
   - Check Prometheus connectivity
   - Validate query syntax

3. **Alerts not firing**
   - Check AlertManager configuration
   - Verify alert rule syntax
   - Test notification channels

### Debug Commands

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f prometheus
docker-compose logs -f grafana
docker-compose logs -f jaeger

# Test metrics endpoint
curl http://localhost:3001/metrics

# Test Prometheus query
curl 'http://localhost:9090/api/v1/query?query=up'
```

## Advanced Features

### Service Discovery
Configure Prometheus to auto-discover services:

```yaml
scrape_configs:
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
```

### Custom Exporters
Create custom exporters for third-party services:

```javascript
const { register, Gauge } = require('prom-client');

const customGauge = new Gauge({
  name: 'external_service_status',
  help: 'External service status'
});

// Update from external API
setInterval(async () => {
  const status = await checkExternalService();
  customGauge.set(status);
}, 30000);
```

### Log Aggregation
Configure Loki for log aggregation:

```yaml
# promtail.yml
scrape_configs:
  - job_name: application
    static_configs:
      - targets: [localhost]
        labels:
          job: app
          __path__: /var/log/app/*.log
```