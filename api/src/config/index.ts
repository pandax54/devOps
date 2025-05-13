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
  secret: {
    secretKey: string;
    expirationTime: string;
    algorithm: string;
    publicKey: string;
    privateKey: string;
    refreshPublicKey: string;
    refreshPrivateKey: string;
    saltRounds: number;
    refreshTokenExpirationTime: string;
    tokenExpirationTime: string;
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
  },
  secret: {
    secretKey: env('JWT_SECRET', 'your-secret-key'),
    expirationTime: env('JWT_EXPIRATION_TIME', '1h'),
    algorithm: env('JWT_ALGORITHM', 'HS256'),
    publicKey: env('JWT_PUBLIC_KEY', 'your-public-key'),
    privateKey: env('JWT_PRIVATE_KEY', 'your-private-key'),
    refreshPublicKey: env('REFRESH_PUBLIC_KEY', 'your-refresh-public-key'),
    refreshPrivateKey: env('REFRESH_PRIVATE_KEY', 'your-refresh-private-key'),
    saltRounds: parseInt(env('BCRYPT_SALT_ROUNDS', '12')),
    refreshTokenExpirationTime: env('REFRESH_TOKEN_EXPIRATION_TIME', '7d'),
    tokenExpirationTime: env('TOKEN_EXPIRATION_TIME', '1h'),
    
    
  }
};
