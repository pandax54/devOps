import Koa from "koa";
import cors from "@koa/cors";
import { koaBody } from "koa-body";
import { publicRoutes } from "@app/routes";
import db from "@app/database/database";
import dotenv from 'dotenv';
import Router from "@koa/router";

dotenv.config();

async function start() {
  // Initialize database connection
  try {
    await db.start();
    console.log("Database connection initialized");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  }

  const app = new Koa();
  const healthRouter = new Router();

  healthRouter.get("/health", async (ctx) => {
    const dbConnected = await db.checkDatabaseConnection();

    const checks = {
      server: true,
      database: dbConnected,
      timestamp: new Date().toISOString(),
    };

    ctx.status = dbConnected === true ? 200 : 503;

    ctx.body = {
      status: dbConnected ? "healthy" : "unhealthy",
      checks,
    };
  });

  app.use(cors());
  app.use(koaBody());

  app.use(publicRoutes.routes());
  app.use(publicRoutes.allowedMethods());
  app.use(healthRouter.routes());
  app.use(healthRouter.allowedMethods());

  app.on("error", (err, ctx) => {
    console.error("server error", err, ctx);
  });

  const server = app.listen(process.env.PORT, () => {
    console.info(`Server running in PORT ${process.env.PORT} 🚀`);
  });

  // Setup graceful shutdown
  setupGracefulShutdown(server);
}

function setupGracefulShutdown(server) {
  // Handle termination signals
  const gracefulShutdown = async (signal) => {
    console.log(`${signal} received, shutting down gracefully...`);
    
    // Close server first (stop accepting new connections)
    server.close(() => {
      console.log('HTTP server closed');
    });

    try {
      // Close database connection
      await db.close();
      console.log('Database connections closed');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  // Listen for termination signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
    gracefulShutdown('UNHANDLED_REJECTION');
  });
}

start();