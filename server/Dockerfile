# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy configuration and package files
COPY package*.json tsconfig.json ./

# Install all dependencies (including devDependencies for TypeScript compiler)
RUN npm ci

# Copy source code files
COPY src/ ./src/

# Compile TypeScript to JavaScript
RUN npm run build

# Remove development dependencies to keep production footprint small
RUN npm prune --production


# Stage 2: Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Copy built distribution files and pruned node_modules from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose server port
EXPOSE 5000

# Command to launch the server
CMD ["node", "dist/index.js"]
