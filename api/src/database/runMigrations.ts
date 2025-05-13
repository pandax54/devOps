import knex from 'knex';
import { logger } from '@app/utils/logger';
import knexConfig from '@app/config/knexfile';
import { config as appConfig } from '@app/config';

export async function runMigrations() {
  logger.info('Running migrations in ' + appConfig.environment + ' environment');
  
  // Create a separate Knex instance just for migrations
  const migrationDb = knex(knexConfig[appConfig.environment]);
  
  try {
    // Run migrations with this separate instance
    const [batchNo, log] = await migrationDb.migrate.latest();
    
    if (log.length === 0) {
      logger.info('No migrations to run');
    } else {
      logger.info(`Batch ${batchNo} run: ${log.length} migrations`);
      logger.info('Migrations complete');
    }
    
    if (appConfig.environment === 'development') {
      logger.info('Running seeds');
      await migrationDb.seed.run();
      logger.info('Seeds complete');
    }
    
    return true;
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  } finally {
    // Close ONLY the migration-specific connection
    await migrationDb.destroy();
    logger.info('Migration-specific database connection closed');
  }
}