import http from 'node:http';
import { handler } from './index';

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url || '/', 'http://localhost');
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const body = Buffer.concat(chunks).toString('utf8');

  const event = {
    path: requestUrl.pathname,
    httpMethod: req.method || 'GET',
    headers: Object.fromEntries(Object.entries(req.headers)),
    queryStringParameters: Object.fromEntries(requestUrl.searchParams.entries()),
    body,
    pathParameters: {},
    requestContext: {
      identity: {
        sourceIp: '127.0.0.1',
      },
    },
  };

  const result = await handler(event as never);

  res.writeHead(result.statusCode || 200, { 'Content-Type': 'application/json' });
  res.end(result.body || '');
});

server.listen(PORT, () => {
  console.log(`URI de prueba: http://localhost:${PORT}/volatilidad`);
  console.log(`URI de prueba PUT: http://localhost:${PORT}/volatilidad/1`);
});
