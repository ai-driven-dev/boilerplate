#!/bin/bash

# Test monitoring stack functionality

echo "🔍 Testing Claude Flow Monitoring Stack..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start monitoring stack
echo "🚀 Starting monitoring stack..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Test service endpoints
echo "🧪 Testing service endpoints..."

# Test Prometheus
echo "Testing Prometheus..."
if curl -s http://localhost:9090/api/v1/query?query=up > /dev/null; then
    echo "✅ Prometheus is running"
else
    echo "❌ Prometheus is not responding"
fi

# Test Grafana
echo "Testing Grafana..."
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Grafana is running"
else
    echo "❌ Grafana is not responding"
fi

# Test Jaeger
echo "Testing Jaeger..."
if curl -s http://localhost:16686/api/services > /dev/null; then
    echo "✅ Jaeger is running"
else
    echo "❌ Jaeger is not responding"
fi

# Test AlertManager
echo "Testing AlertManager..."
if curl -s http://localhost:9093/-/ready > /dev/null; then
    echo "✅ AlertManager is running"
else
    echo "❌ AlertManager is not responding"
fi

# Test Node Exporter
echo "Testing Node Exporter..."
if curl -s http://localhost:9100/metrics > /dev/null; then
    echo "✅ Node Exporter is running"
else
    echo "❌ Node Exporter is not responding"
fi

# Test Loki
echo "Testing Loki..."
if curl -s http://localhost:3100/ready > /dev/null; then
    echo "✅ Loki is running"
else
    echo "❌ Loki is not responding"
fi

# Start monitoring service
echo "🎯 Starting monitoring service..."
npm start &
MONITOR_PID=$!

# Wait for monitoring service
sleep 5

# Test monitoring service endpoints
echo "Testing monitoring service..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Monitoring service is running"
else
    echo "❌ Monitoring service is not responding"
fi

# Test metrics endpoint
echo "Testing metrics endpoint..."
if curl -s http://localhost:3001/metrics | grep -q "# HELP"; then
    echo "✅ Metrics endpoint is working"
else
    echo "❌ Metrics endpoint is not working"
fi

# Generate some test metrics
echo "📊 Generating test metrics..."
for i in {1..10}; do
    curl -s http://localhost:3001/health > /dev/null
    sleep 1
done

# Check if metrics are being collected
echo "Checking metric collection..."
if curl -s http://localhost:3001/metrics | grep -q "http_requests_total"; then
    echo "✅ HTTP metrics are being collected"
else
    echo "❌ HTTP metrics are not being collected"
fi

# Test Prometheus scraping
echo "Testing Prometheus scraping..."
sleep 10  # Wait for scraping
if curl -s "http://localhost:9090/api/v1/query?query=up" | grep -q "\"value\""; then
    echo "✅ Prometheus is scraping metrics"
else
    echo "❌ Prometheus is not scraping metrics"
fi

# Test alert rules
echo "Testing alert rules..."
if curl -s http://localhost:9090/api/v1/rules | grep -q "claude-flow.rules"; then
    echo "✅ Alert rules are loaded"
else
    echo "❌ Alert rules are not loaded"
fi

# Cleanup
echo "🧹 Cleaning up..."
kill $MONITOR_PID 2>/dev/null || true

echo "✅ Monitoring stack test completed!"
echo ""
echo "🎉 Access your monitoring tools:"
echo "   📊 Grafana: http://localhost:3000 (admin/admin)"
echo "   📈 Prometheus: http://localhost:9090"
echo "   🔍 Jaeger: http://localhost:16686"
echo "   🚨 AlertManager: http://localhost:9093"
echo ""
echo "To stop the stack: docker-compose down"