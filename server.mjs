import http from 'node:http';
import path from 'node:path';
import { realpath, stat, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = await realpath(path.resolve(here, process.argv[2] || 'dist'));
if (!(await stat(path.join(root, 'index.html'))).isFile()) throw new Error('Built Studio index.html is missing.');
const host = '127.0.0.1';
const port = 5173;
const health = JSON.stringify({ app: 'plain-music-studio', version: 1, dist: root, pid: process.pid });
const mime = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'], ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'], ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'], ['.jpg', 'image/jpeg'], ['.jpeg', 'image/jpeg'],
  ['.ico', 'image/x-icon'], ['.wasm', 'application/wasm'], ['.zip', 'application/zip'],
  ['.txt', 'text/plain; charset=utf-8'], ['.md', 'text/markdown; charset=utf-8'],
  ['.mp3', 'audio/mpeg'], ['.wav', 'audio/wav'], ['.ogg', 'audio/ogg'],
  ['.woff', 'font/woff'], ['.woff2', 'font/woff2']
]);
function insideRoot(file) {
  const relative = path.relative(root, file);
  return relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative));
}
const server = http.createServer(async (request, response) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }); response.end(); return;
  }
  try {
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://' + host + ':' + port).pathname);
    if (pathname.includes('\0') || pathname.includes('\\')) {
      response.writeHead(400); response.end(); return;
    }
    if (pathname === '/__studio_health') {
      response.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
        'Content-Length': Buffer.byteLength(health)
      });
      response.end(request.method === 'HEAD' ? undefined : health); return;
    }
    let file = path.resolve(root, '.' + pathname);
    if (!insideRoot(file)) { response.writeHead(403); response.end(); return; }
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    file = await realpath(file);
    if (!insideRoot(file)) { response.writeHead(403); response.end(); return; }
    if (!(await stat(file)).isFile()) { response.writeHead(404); response.end(); return; }
    const contents = await readFile(file);
    response.writeHead(200, {
      'Content-Type': mime.get(path.extname(file).toLowerCase()) || 'application/octet-stream',
      'Content-Length': contents.length, 'Cache-Control': 'no-cache'
    });
    response.end(request.method === 'HEAD' ? undefined : contents);
  } catch (error) {
    const status = error instanceof URIError ? 400 : error?.code === 'ENOENT' || error?.code === 'ENOTDIR' ? 404 : error?.code === 'EACCES' ? 403 : 500;
    if (!response.headersSent) response.writeHead(status);
    response.end();
  }
});
server.on('error', error => {
  console.error('Studio server could not bind to ' + host + ':' + port + ': ' + error.message);
  process.exitCode = 1;
});
server.listen(port, host, () => console.log('Studio serving ' + root + ' at http://' + host + ':' + port + '/'));
