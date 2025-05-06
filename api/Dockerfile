# FROM --platform=linux/amd64 node:22-alpine AS build
FROM node:22-alpine AS build

WORKDIR /usr/app

COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

COPY . .

RUN npm run build

# Create a smaller production image
FROM node:22-alpine AS production

WORKDIR /usr/app

# Create a non-root user (Alpine syntax)
RUN addgroup -g 1001 nodejs && \
    adduser -D -u 1001 -G nodejs nodeuser

# Copy only the necessary files
COPY --from=build /usr/app/package*.json ./
COPY --from=build /usr/app/dist ./dist
COPY --from=build /usr/app/tsconfig.json ./tsconfig.json

COPY --from=builder /app/entrypoint.sh ./
COPY --from=builder /app/wait-for-it.sh ./
RUN chmod +x entrypoint.sh wait-for-it.sh


COPY --from=build /usr/app/.env ./.env

# RUN npm install --production
RUN npm ci --only=production && npm cache clean --force

# Change ownership
RUN chown -R nodeuser:nodejs /usr/app

USER nodeuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD wget -q --spider http://localhost:3000/health || exit 1

# ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm", "run", "start"]


# docker run -e DATABASE_URL="postgresql://user:password@db:5432/database" your-image
# https://docs.docker.com/build/building/variables/