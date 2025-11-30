# Theme Generator - Makefile
# Development and build commands for the theme generator project

# === Configuration ===
# Docker image settings
DOCKER_IMAGE_NAME = registry.km8.es/theme-generator
DOCKER_TAG = production
DOCKER_CONTAINER_NAME = theme-generator
DOCKER_PORT = 8080

# Development settings
DEV_PORT = 5173

# Build settings
BUILD_DIR = app/build
LIB_DIST_DIR = dist
OUTPUT_DIR = app/.svelte-kit
NODE_MODULES = node_modules
APP_NODE_MODULES = app/node_modules

.PHONY: help install dev build preview clean docker-build docker-run docker-stop docker-restart docker-logs docker-clean docker-deploy docker-push status

# Default target
help: ## Show this help message
	@echo "Theme Generator - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-18s\033[0m %s\n", $$1, $$2}'

# Development commands
install: ## Install all dependencies (library + app)
	npm install
	cd app && npm install

install-lib: ## Install library dependencies only
	npm install

install-app: ## Install app dependencies only
	cd app && npm install

dev: ## Start development server
	cd app && npm run dev

dev-host: ## Start development server with host access
	cd app && npm run dev -- --host

build: ## Build everything (library + app)
	npm run build
	cd app && npm run build

build-lib: ## Build library only
	npm run build

build-app: ## Build app only
	cd app && npm run build

preview: ## Preview the production build
	cd app && npm run preview

# Quality assurance
check: ## Run type checking
	npm run check
	cd app && npm run check

lint: ## Run linting
	npm run lint
	cd app && npm run lint

# Cleanup
clean: ## Clean build artifacts
	rm -rf $(LIB_DIST_DIR)/
	rm -rf $(BUILD_DIR)/
	rm -rf $(OUTPUT_DIR)/

clean-all: clean ## Clean everything including node_modules
	rm -rf $(NODE_MODULES)/
	rm -rf $(APP_NODE_MODULES)/

# Docker commands
docker-build: ## Build Docker image
	@echo "Building Docker image: $(DOCKER_IMAGE_NAME):$(DOCKER_TAG)"
	docker build -t $(DOCKER_IMAGE_NAME):$(DOCKER_TAG) .
	@echo "Docker image built successfully!"

docker-run: ## Run Docker container
	@echo "Starting Docker container on port $(DOCKER_PORT)"
	@if [ $$(docker ps -q -f name=$(DOCKER_CONTAINER_NAME)) ]; then \
		echo "Container is already running at http://localhost:$(DOCKER_PORT)"; \
	elif [ $$(docker ps -aq -f name=$(DOCKER_CONTAINER_NAME)) ]; then \
		echo "Starting existing container"; \
		docker start $(DOCKER_CONTAINER_NAME); \
		echo "Application is running at: http://localhost:$(DOCKER_PORT)"; \
	else \
		echo "Creating and starting new container"; \
		docker run -d --name $(DOCKER_CONTAINER_NAME) -p $(DOCKER_PORT):80 $(DOCKER_IMAGE_NAME):$(DOCKER_TAG); \
		echo "Application is running at: http://localhost:$(DOCKER_PORT)"; \
	fi

docker-stop: ## Stop Docker container
	@echo "Stopping Docker container"
	@if [ $$(docker ps -q -f name=$(DOCKER_CONTAINER_NAME)) ]; then \
		docker stop $(DOCKER_CONTAINER_NAME); \
		echo "Container stopped successfully"; \
	else \
		echo "Container is not running"; \
	fi

docker-restart: docker-stop docker-run ## Restart Docker container

docker-logs: ## Show Docker container logs
	@if [ $$(docker ps -aq -f name=$(DOCKER_CONTAINER_NAME)) ]; then \
		docker logs -f $(DOCKER_CONTAINER_NAME); \
	else \
		echo "Container does not exist"; \
	fi

docker-clean: docker-stop ## Remove Docker container and image
	@echo "Cleaning up Docker resources"
	@if [ $$(docker ps -aq -f name=$(DOCKER_CONTAINER_NAME)) ]; then \
		docker rm $(DOCKER_CONTAINER_NAME); \
		echo "Container removed"; \
	fi
	@if [ $$(docker images -q $(DOCKER_IMAGE_NAME):$(DOCKER_TAG)) ]; then \
		docker rmi $(DOCKER_IMAGE_NAME):$(DOCKER_TAG); \
		echo "Image removed"; \
	fi

docker-deploy: docker-build docker-run ## Build and run Docker container

docker-push: ## Push Docker image to registry
	@echo "Pushing Docker image: $(DOCKER_IMAGE_NAME):$(DOCKER_TAG)"
	docker push $(DOCKER_IMAGE_NAME):$(DOCKER_TAG)
	@echo "Docker image pushed successfully!"

docker-deploy-registry: docker-build docker-push ## Build and push Docker image to registry

# Development workflows
setup: install ## Complete project setup
	@echo "Project setup complete!"
	@echo "Run 'make dev' to start development server"

fresh-start: clean install dev ## Clean setup and start development

# Information
status: ## Show project status
	@echo "Theme Generator Status:"
	@echo "Node version: $(shell node --version)"
	@echo "NPM version: $(shell npm --version)"
	@echo "Project directory: $(shell pwd)"
	@echo "Library dependencies installed: $(shell test -d $(NODE_MODULES) && echo "✓" || echo "✗")"
	@echo "App dependencies installed: $(shell test -d $(APP_NODE_MODULES) && echo "✓" || echo "✗")"
	@echo "Library build exists: $(shell test -d $(LIB_DIST_DIR) && echo "✓" || echo "✗")"
	@echo "App build exists: $(shell test -d $(BUILD_DIR) && echo "✓" || echo "✗")"

info: status ## Alias for status
