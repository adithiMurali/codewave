FROM node:18-bullseye

# Install Python, g++, Java
RUN apt-get update && apt-get install -y \
    python3 \
    g++ \
    default-jdk \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy server files
COPY . .

# Expose port (Render automatically maps PORT env var, but let's expose default)
EXPOSE 5000

# Start server
CMD ["node", "index.js"]
