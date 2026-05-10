# Base image
FROM node:20-slim

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source
COPY . .

# Build TypeScript
RUN npm run build

# Expose the application port
EXPOSE 3001

# Command to run the application
CMD ["npm", "start"]
