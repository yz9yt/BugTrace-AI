# Stage 1: Build the React application
FROM node:18.18.0-alpine AS builder

WORKDIR /app

# Copy package configuration files
COPY package.json package.json
# If you have a lock file, copy it too for deterministic installs
# COPY package-lock.json package-lock.json

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application
# The vite.config.ts file will now be able to access process.env.GEMINI_API_KEY.
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:alpine

# Copy the built static content from the builder stage to the Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy documentation folders
COPY devinfo /usr/share/nginx/html/devinfo
COPY userinfo /usr/share/nginx/html/userinfo


# Expose port 80 to the outside world
EXPOSE 80

# Command to run Nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]