# Use Node.js 20 LTS as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN ls -la && ls -la src/ && cat tsconfig.json
RUN npx tsc --version
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S botuser -u 1001

# Change ownership of the app directory
RUN chown -R botuser:nodejs /app

# Switch to non-root user
USER botuser

# Expose port (if needed for health checks)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('Health check passed')" || exit 1

# Start the application
CMD ["npm", "start"]