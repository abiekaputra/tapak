// Module responsible for validating Tapak API runtime configuration.
import { z } from 'zod';

const configSchema = z.object({
  environment: z.enum(['development', 'test', 'production']),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']),
  databasePath: z.string().min(1),
  jwtSecret: z.string().min(32),
  operatorPassword: z.string().min(10),
  courierPassword: z.string().min(10),
  webOrigin: z.string().url(),
  mobileWebOrigin: z.string().url(),
  port: z.coerce.number().int().min(1).max(65_535),
  resetDatabase: z.boolean(),
});

export type ApiConfig = z.infer<typeof configSchema>;

export function readConfig(environment = process.env): ApiConfig {
  return configSchema.parse({
    environment: environment.TAPAK_ENV,
    logLevel: environment.TAPAK_LOG_LEVEL,
    databasePath: environment.TAPAK_DATABASE_PATH,
    jwtSecret: environment.TAPAK_JWT_SECRET,
    operatorPassword: environment.TAPAK_OPERATOR_PASSWORD,
    courierPassword: environment.TAPAK_COURIER_PASSWORD,
    webOrigin: environment.TAPAK_WEB_ORIGIN,
    mobileWebOrigin: environment.TAPAK_MOBILE_WEB_ORIGIN,
    port: environment.TAPAK_API_PORT ?? 4100,
    resetDatabase: environment.TAPAK_RESET_DATABASE === 'true',
  });
}
