https://efficient-sloth-d85.notion.site/Desafio-Configura-o-de-Ambiente-com-Docker-Compose-486107762a0042c99a3bf7d3ecc14e85



# Create a new migration
npm run migrate:make -- create_users_table

npm run migrate:make:docker -- create_users_table

# List Docker networks
docker network ls

# Inspect the network your containers are using
docker network inspect your_network_name

# Run migrations in development 
npm run migrate:docker


# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

psql postgres://postgres:password@localhost:5490/database
psql -h localhost -p 5432 -U your_username -d your_db_name

# Or for Docker
docker ps | grep postgres