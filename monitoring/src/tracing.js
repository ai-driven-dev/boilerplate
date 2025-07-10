const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');

// Initialize tracer
function initializeTracing(serviceName = 'claude-flow') {
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    }),
  });

  // Configure Jaeger exporter
  const jaegerExporter = new JaegerExporter({
    endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
  });

  // Add span processor
  provider.addSpanProcessor(new BatchSpanProcessor(jaegerExporter));

  // Register the provider
  provider.register();

  // Register instrumentations
  registerInstrumentations({
    instrumentations: [
      new HttpInstrumentation({
        requestHook: (span, request) => {
          span.setAttributes({
            'http.request.body': JSON.stringify(request.body),
            'custom.user_id': request.headers['user-id'],
          });
        },
      }),
      new ExpressInstrumentation(),
    ],
  });

  return provider.getTracer(serviceName);
}

// Custom span creation helper
function createSpan(tracer, name, fn, attributes = {}) {
  return tracer.startActiveSpan(name, async (span) => {
    try {
      // Set custom attributes
      Object.entries(attributes).forEach(([key, value]) => {
        span.setAttribute(key, value);
      });

      // Execute the function
      const result = await fn(span);
      
      // Mark span as successful
      span.setStatus({ code: 0 });
      
      return result;
    } catch (error) {
      // Record error
      span.recordException(error);
      span.setStatus({
        code: 2,
        message: error.message,
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

// Trace Claude Flow operations
function traceSwarmOperation(tracer, operationType, swarmId, fn) {
  return createSpan(
    tracer,
    `swarm.${operationType}`,
    fn,
    {
      'swarm.id': swarmId,
      'swarm.operation': operationType,
    }
  );
}

function traceAgentOperation(tracer, operationType, agentId, agentType, fn) {
  return createSpan(
    tracer,
    `agent.${operationType}`,
    fn,
    {
      'agent.id': agentId,
      'agent.type': agentType,
      'agent.operation': operationType,
    }
  );
}

function traceTaskExecution(tracer, taskId, taskType, fn) {
  return createSpan(
    tracer,
    `task.execute`,
    fn,
    {
      'task.id': taskId,
      'task.type': taskType,
    }
  );
}

module.exports = {
  initializeTracing,
  createSpan,
  traceSwarmOperation,
  traceAgentOperation,
  traceTaskExecution,
};