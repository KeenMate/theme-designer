# Stage 1: Build the library and pack it
FROM node:20-alpine AS lib-builder
WORKDIR /lib
COPY package*.json tsconfig.json vite.config.ts ./
COPY src ./src
RUN npm ci && npm run build && npm pack

# Stage 2: Build the SvelteKit app
FROM node:20-alpine AS app-builder
WORKDIR /workspace

# Copy app source
COPY app ./app

# Copy the packed library tarball
COPY --from=lib-builder /lib/*.tgz ./

# Modify package.json to use the tarball for local theme-designer library
WORKDIR /workspace/app
RUN sed -i 's|"@keenmate/theme-designer": "file:../"|"@keenmate/theme-designer": "file:../keenmate-theme-designer-1.0.0.tgz"|g' package.json

# Remove package-lock.json to force fresh resolution (node_modules excluded via .dockerignore)
# RUN rm -f package-lock.json

# Install dependencies and build
RUN npm ci
RUN npm ls --depth=0
RUN npm run build

# Stage 3: Serve with nginx
FROM nginx:alpine

# Copy built static files
COPY --from=app-builder /workspace/app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
