# Use an official Node.js LTS image
FROM node:22-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install dependencies (only production deps for smaller image)
RUN  npm install -g npm@11.6.2 && \
     npm install --omit=dev && \
     npm cache clean --force

# Copy the rest of the app
COPY . .

# Expose the port your app listens on
EXPOSE 9000

# Define environment variable for Node
ENV NODE_ENV=production

# Start the server
CMD ["node", "app.js"]