import dotenv from 'dotenv'
import path from 'path'

dotenv.config({
  path: path.join(process.cwd(), `.env`),
})

const env = (key: string, defaultValue?: string): string => {
  const envVal = process.env[key] || defaultValue
  if (!envVal) {
    throw new Error(`env variable ${key} should be defined`)
  }
  return envVal
}

const environment = env('NODE_ENV', 'development').toLowerCase()

type Config = {
  environment: string;
  database: {
    ssl: boolean;
    databaseUrl: string;
  };
  logs: {
    level: string
  }
};

export const config: Config = {
  environment: environment,
  database: {
    ssl: environment === 'production' ? true : false,
    databaseUrl: env('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/database'),
  },
  logs: {
    level: env('LOG_LEVEL', 'info')
  }
};
