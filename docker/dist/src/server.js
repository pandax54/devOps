"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const cors_1 = __importDefault(require("@koa/cors"));
const koa_body_1 = require("koa-body");
const routes_1 = require("./routes");
const database_1 = __importDefault(require("./database/database"));
require("dotenv/config");
const router_1 = __importDefault(require("@koa/router"));
async function start() {
    // Initialize database connection
    try {
        await database_1.default.start();
        console.log("Database connection initialized");
    }
    catch (error) {
        console.error("Failed to initialize database:", error);
        process.exit(1);
    }
    const app = new koa_1.default();
    const healthRouter = new router_1.default();
    healthRouter.get("/health", async (ctx) => {
        const dbConnected = await database_1.default.checkDatabaseConnection();
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
    app.use((0, cors_1.default)());
    app.use((0, koa_body_1.koaBody)());
    app.use(routes_1.publicRoutes.routes());
    app.use(routes_1.publicRoutes.allowedMethods());
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
            await database_1.default.close();
            console.log('Database connections closed');
            process.exit(0);
        }
        catch (error) {
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
//# sourceMappingURL=server.js.map