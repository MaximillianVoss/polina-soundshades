import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, relative, extname, isAbsolute } from 'node:path';

const directory = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.argv[2] ?? '8077');
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Укажите порт от 1024 до 65535.');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.wav': 'audio/wav', '.ico': 'image/x-icon', '.css': 'text/css' };
const server = createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method ?? '')) { response.writeHead(405); response.end(); return; }
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
    const path = resolve(directory, `.${pathname}`), inside = relative(directory, path);
    if (isAbsolute(inside) || inside.startsWith('..') || inside.split(/[\\/]/).some((part) => part.startsWith('.'))) { response.writeHead(403); response.end(); return; }
    let target = path;
    try { if ((await stat(target)).isDirectory()) target = resolve(target, 'index.html'); }
    catch { if (!extname(pathname)) target = resolve(directory, 'index.html'); }
    const body = await readFile(target);
    response.writeHead(200, { 'Content-Type': types[extname(target)] ?? 'application/octet-stream', 'Content-Length': body.length, 'Cache-Control': 'no-store' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch { response.writeHead(404); response.end('Not found. Run npm run build first.'); }
});
server.listen(port, '127.0.0.1', () => console.log(`SoundShades preview: http://127.0.0.1:${port}`));
