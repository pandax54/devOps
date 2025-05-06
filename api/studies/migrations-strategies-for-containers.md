# Migration Strategy for Containerized Applications

## Option 1: Entrypoint Script Approach

This approach runs migrations automatically when the container starts.

### 1. Create an entrypoint.sh script

```bash
#!/bin/bash
set -e

# Wait for database to be ready
echo "Waiting for database to be ready..."
./wait-for-it.sh $DB_HOST:$DB_PORT -t 60

# Run migrations
echo "Running database migrations..."
if [ "$NODE_ENV" = "production" ]; then
  npx knex --knexfile dist/config/knexfile.js migrate:latest
else
  npx knex --knexfile src/config/knexfile.ts migrate:latest
fi

# Start the application
echo "Starting application..."
exec "$@"
```

### 2. Wait-for-it helper script (wait-for-it.sh)

```bash
#!/bin/bash
# wait-for-it.sh script from https://github.com/vishnubob/wait-for-it
# Download this script and make it executable
```

### 3. Update your Dockerfile

```dockerfile
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/database ./database
COPY --from=builder /app/entrypoint.sh ./
COPY --from=builder /app/wait-for-it.sh ./
RUN chmod +x entrypoint.sh wait-for-it.sh
RUN npm install --production

ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "dist/server.js"]
```

## Option 2: Migration Job Approach

This approach runs migrations as a separate job or container before the main app starts.

### 1. Create a docker-compose.yml with a migration service

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_DATABASE}
    ports:
      - "${DB_PORT}:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data

  migration:
    build:
      context: .
      dockerfile: Dockerfile.migration
    environment:
      NODE_ENV: ${NODE_ENV}
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_DATABASE: ${DB_DATABASE}
    depends_on:
      - postgres
    command: sh -c "npx knex --knexfile dist/config/knexfile.js migrate:latest"

  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "${PORT}:${PORT}"
    environment:
      NODE_ENV: ${NODE_ENV}
      PORT: ${PORT}
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_DATABASE: ${DB_DATABASE}
    depends_on:
      - migration

volumes:
  postgres-data:
```

### 2. Create a migration-specific Dockerfile (Dockerfile.migration)

```dockerfile
FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
```

## Option 3: Volume Mounting for Development

This approach is ideal for development, allowing migration changes without rebuilds.

### 1. Update your docker-compose.dev.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_DATABASE}
    ports:
      - "${DB_PORT}:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data

  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "${PORT}:${PORT}"
    environment:
      NODE_ENV: development
      PORT: ${PORT}
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_DATABASE: ${DB_DATABASE}
    volumes:
      - ./:/app
      - /app/node_modules
    depends_on:
      - postgres
    command: npm run dev

volumes:
  postgres-data:
```

### 2. Create a development Dockerfile (Dockerfile.dev)

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

CMD ["npm", "run", "dev"]
```

### 3. Add a migration script to package.json

```json
{
  "scripts": {
    "migrate:docker": "docker-compose exec app npx knex --knexfile src/config/knexfile.ts migrate:latest",
    "migrate:make:docker": "docker-compose exec app npx knex --knexfile src/config/knexfile.ts migrate:make"
  }
}
```

## Production Deployment Best Practices

1. Compile TypeScript migrations to JavaScript before deploying
2. Run migrations as a separate step in your CI/CD pipeline
3. Use a release strategy that runs migrations before deploying new app version
4. Implement rollback procedures for failed migrations


------------------------


#!/bin/bash
# Example workflow for managing migrations in Docker environments

# ======================================================
# Development Workflow (Local Docker Environment)
# ======================================================

# 1. Creating a new migration while in development
function create_migration() {
  local migration_name=$1
  if [ -z "$migration_name" ]; then
    echo "Error: Migration name is required"
    echo "Usage: create_migration migration_name"
    return 1
  fi

  echo "Creating migration: $migration_name"
  # Execute migration creation inside the running container
  docker-compose exec app npx knex --knexfile src/config/knexfile.ts migrate:make $migration_name -x ts
  
  echo "Migration created successfully!"
  echo "Edit the migration file in the database/migrations directory"
}

# 2. Running migrations in development
function run_migrations_dev() {
  echo "Running migrations in development environment..."
  # Execute migrations inside the running container
  docker-compose exec app npx knex --knexfile src/config/knexfile.ts migrate:latest
  
  echo "Migrations completed successfully!"
}

# 3. Rolling back migrations in development
function rollback_migrations_dev() {
  echo "Rolling back migrations in development environment..."
  # Execute rollback inside the running container
  docker-compose exec app npx knex --knexfile src/config/knexfile.ts migrate:rollback
  
  echo "Rollback completed successfully!"
}

# ======================================================
# Production Deployment Workflow
# ======================================================

# 1. Building production image with compiled migrations
function build_production() {
  echo "Building production image..."
  
  # Compile TypeScript to JavaScript (including migrations)
  npm run build
  
  # Build Docker image
  docker build -t myapp:latest .
  
  echo "Production image built successfully!"
}

# 2. Running migrations in production
function run_migrations_prod() {
  echo "Running migrations in production environment..."
  
  # Option 1: Run as a separate one-off container
  docker run --rm \
    --network my-network \
    --env-file .env.production \
    myapp:latest \
    npx knex --knexfile dist/config/knexfile.js migrate:latest
  
  echo "Production migrations completed successfully!"
}

# ======================================================
# Helper Scripts for CI/CD Pipeline
# ======================================================

# Example GitHub Actions workflow for production deployment
cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy with Migrations

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        
      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: myapp:latest
          
      - name: Run migrations
        run: |
          docker run --rm \
            --network my-network \
            --env-file .env.production \
            myapp:latest \
            npx knex --knexfile dist/config/knexfile.js migrate:latest
            
      - name: Deploy application
        run: |
          # Deploy the application (update with your deployment strategy)
          echo "Deploying application..."
EOF

# ======================================================
# Example entrypoint.sh for automatic migrations
# ======================================================

cat > entrypoint.sh << 'EOF'
#!/bin/bash
set -e

echo "Starting application container..."

# Check if we should run migrations
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations..."
  
  # Wait for database to be ready (with timeout)
  echo "Waiting for database..."
  timeout=60
  while ! nc -z $DB_HOST $DB_PORT && [ $timeout -gt 0 ]; do
    timeout=$((timeout-1))
    sleep 1
  done
  
  if [ $timeout -eq 0 ]; then
    echo "Error: Database connection timed out"
    exit 1
  fi
  
  # Run migrations based on environment
  if [ "$NODE_ENV" = "production" ]; then
    npx knex --knexfile dist/config/knexfile.js migrate:latest
  else
    npx knex --knexfile src/config/knexfile.ts migrate:latest
  fi
  
  echo "Migrations completed!"
fi

# Execute the main container command
exec "$@"
EOF

chmod +x entrypoint.sh

echo "Migration workflow scripts created successfully!"
echo "Use:"
echo "  - create_migration <name> - To create a new migration"
echo "  - run_migrations_dev - To run migrations in development"
echo "  - rollback_migrations_dev - To rollback migrations in development"
echo "  - build_production - To build the production image"
echo "  - run_migrations_prod - To run migrations in production"