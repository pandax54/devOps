import { logger } from '@app/utils/logger'
import Router from '@koa/router'
import db from "@app/database/database";

const router = new Router()

router.get('/', (ctx, next) => {
  // With context
  logger.info({ userId: '123' }, 'User logged in')

  const routeLogger = logger.child({ component: 'routes' })
  routeLogger.info('Route handler called')

  // Different levels
  // logger.error({ err }, "Error processing request");
  // logger.trace("Detailed debugging");
  // logger.debug("Debugging information");
  // logger.info("Informational message");
  // logger.warn("Warning message");
  // logger.error("Error message");
  // logger.fatal("Critical error");

  ctx.status = 200
  ctx.body = {
    message: 'Hello World',
    version: '1.0.0',
    documentation: '/docs'
  }
})

router.get('/health', async (ctx) => {
  const dbConnected = await db.checkDatabaseConnection()

  // TODO: Add redis check

  const checks = {
    server: true,
    database: dbConnected,
    timestamp: new Date().toISOString(),
  }

  ctx.status = dbConnected === true ? 200 : 503

  ctx.body = {
    status: dbConnected ? 'healthy' : 'unhealthy',
    checks,
  }
})

export { router }
