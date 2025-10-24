FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Expose the port the app runs on
EXPOSE 5001

ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]
