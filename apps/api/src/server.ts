// Module responsible for starting the Tapak HTTP server.
import { buildApp } from './app.js';
import { readConfig } from './config.js';

const config = readConfig();
const app = await buildApp(config);

try {
  await app.listen({ host: '0.0.0.0', port: config.port });
} catch (error) {
  app.log.error({ err: error, event: 'startup_failed' });
  process.exitCode = 1;
}
