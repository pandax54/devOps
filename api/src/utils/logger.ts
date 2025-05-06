import pino from "pino";
import { config } from "@app/config";

export const logger = pino({
  enabled: config.environment !== "test",
  level: config.logs.level,

  // Pretty printing for development
  transport:
    config.environment !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,

  // Request serialization (more advanced)
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      id: req.id,
    }),
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
  // Add timestamp
  timestamp: pino.stdTimeFunctions.isoTime,

  // Base properties included in all logs
  // example
  // [2025-05-06 12:25:31.553 -0300] INFO: Server running in PORT 3000 🚀
  //   app: "my-api"
  //   env: "development"
  // base: {
  //   app: "my-api",
  //   env: config.environment,
  // },
});
