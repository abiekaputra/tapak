// Module responsible for creating private local credentials and Expo LAN configuration.
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { networkInterfaces } from 'node:os';

const credentialsPath = 'runtime/local-credentials.txt';

function localAddress() {
  for (const group of Object.values(networkInterfaces())) {
    for (const entry of group ?? []) {
      if (entry.family === 'IPv4' && !entry.internal) return entry.address;
    }
  }
  return '127.0.0.1';
}

function secret(length = 24) {
  return randomBytes(length).toString('base64url');
}

await mkdir('runtime', { recursive: true });
if (!existsSync('.env.dev')) {
  const operatorPassword = secret(12);
  const courierPassword = secret(12);
  const address = localAddress();
  await writeFile(
    '.env.dev',
    [
      'TAPAK_ENV=development',
      'TAPAK_LOG_LEVEL=info',
      'TAPAK_DATABASE_PATH=./runtime/tapak.db',
      `TAPAK_JWT_SECRET=${secret(32)}`,
      `TAPAK_OPERATOR_PASSWORD=${operatorPassword}`,
      `TAPAK_COURIER_PASSWORD=${courierPassword}`,
      'TAPAK_API_PORT=4100',
      'TAPAK_WEB_ORIGIN=http://127.0.0.1:4173',
      'TAPAK_MOBILE_WEB_ORIGIN=http://127.0.0.1:4174',
      '',
    ].join('\n'),
  );
  await writeFile(
    credentialsPath,
    [
      'Tapak local credentials',
      `Operator: operator@tapak.local / ${operatorPassword}`,
      `Courier: courier@tapak.local / ${courierPassword}`,
      `Expo API: http://${address}:4100`,
      '',
    ].join('\n'),
  );
  await mkdir('apps/mobile', { recursive: true });
  await writeFile(
    'apps/mobile/.env.local',
    `EXPO_PUBLIC_TAPAK_API_URL=http://${address}:4100\n`,
  );
}

const currentEnvironment = await readFile('.env.dev', 'utf8');
if (!currentEnvironment.includes('TAPAK_LOG_LEVEL=')) {
  await writeFile('.env.dev', `${currentEnvironment.trim()}\nTAPAK_LOG_LEVEL=info\n`);
}
await writeFile(
  'apps/mobile/.env.local',
  `EXPO_PUBLIC_TAPAK_API_URL=http://${localAddress()}:4100\n`,
);

console.log(await readFile(credentialsPath, 'utf8'));
