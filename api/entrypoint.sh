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