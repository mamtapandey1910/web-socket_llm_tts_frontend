# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Set API URL for build
ENV REACT_APP_API_URL=http://localhost:8000

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine

# Install serve globally
RUN npm install -g serve

# Set working directory
WORKDIR /app

# Copy built app from builder stage
COPY --from=builder /app/build .

# Expose port 3000
EXPOSE 3000

# Start serve
CMD ["serve", "-s", ".", "-l", "3000"]