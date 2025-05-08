import Koa from 'koa'
import cors from '@koa/cors'
import { koaBody } from 'koa-body'
import routes from '@app/routes'
import db from '@app/database/database'
import dotenv from 'dotenv'
import koaLogger from 'koa-pino-logger'
import { logger } from '@app/utils/logger'
import { runMigrations } from './database/runMigrations'

dotenv.config()

async function start() {
  // Initialize database connection
  try {
    await db.start()
    await runMigrations()
    logger.info('Database connection initialized')
  } catch (error) {
    logger.error('Failed to initialize database:', error)
    process.exit(1)
  }

  const app = new Koa()

  app.use(cors())
  app.use(koaBody())
  app.use(koaLogger())

  app.use(routes.routes())
  app.use(routes.allowedMethods())

  app.on('error', (err, ctx) => {
    logger.error('server error', err, ctx)
  })

  const server = app.listen(process.env.PORT, () => {
    logger.info(`Server running in PORT ${process.env.PORT} 🚀`)
  })

  // Setup graceful shutdown
  setupGracefulShutdown(server)
}

function setupGracefulShutdown(server) {
  // Handle termination signals
  const gracefulShutdown = async (signal) => {
    logger.info(`${signal} received, shutting down gracefully...`)

    // Close server first (stop accepting new connections)
    server.close(() => {
      logger.info('HTTP server closed')
    })

    try {
      // Close database connection
      await db.close()
      logger.info('Database connections closed')
      process.exit(0)
    } catch (error) {
      logger.error('Error during shutdown:', error)
      process.exit(1)
    }
  }

  // Listen for termination signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
  process.on('SIGINT', () => gracefulShutdown('SIGINT'))

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error)
    gracefulShutdown('UNCAUGHT_EXCEPTION')
  })

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection at:', promise, 'reason:', reason)
    gracefulShutdown('UNHANDLED_REJECTION')
  })
}

start()
