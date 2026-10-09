// Module responsible for serving generated mobile web assets during browser validation.
import { createReadStream, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const root = join(process.cwd(), 'apps/mobile/dist');
const port = Number(process.env.PORT ?? 4174);
const types = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
};

createServer((request, response) => {
  const requested = normalize((request.url ?? '/').split('?')[0] ?? '/').replace(
    /^\.\.(\/|\\)/u,
    '',
  );
  let file = join(root, requested === '/' ? 'index.html' : requested);
  if (!existsSync(file)) file = join(root, 'index.html');
  response.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream');
  createReadStream(file).pipe(response);
}).listen(port, '127.0.0.1', () => console.log(`Static server listening on ${port}`));
