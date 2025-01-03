# Dockerfile

# Use a lightweight Node image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy all source code
COPY . .

# Build the NestJS application
RUN yarn build

# Expose the port (NestJS default is 3000)
EXPOSE 3000

# Start the app (in production mode)
CMD ["node", "dist/main"]
