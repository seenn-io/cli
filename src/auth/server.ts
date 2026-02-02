import { createServer, type Server, type IncomingMessage, type ServerResponse } from 'node:http';
import { URL } from 'node:url';
import { CALLBACK_PORT } from '../config/constants.js';

interface CallbackResult {
  code: string;
}

const SUCCESS_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Seenn CLI - Authentication Successful</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .card {
      background: white;
      padding: 48px;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      text-align: center;
      max-width: 400px;
    }
    .checkmark {
      width: 80px;
      height: 80px;
      background: #10b981;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    .checkmark svg {
      width: 40px;
      height: 40px;
      stroke: white;
      stroke-width: 3;
    }
    h1 {
      margin: 0 0 16px;
      color: #1f2937;
      font-size: 24px;
    }
    p {
      margin: 0;
      color: #6b7280;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="checkmark">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <h1>Authentication Successful!</h1>
    <p>You can close this window and return to the terminal.</p>
  </div>
</body>
</html>
`;

const ERROR_HTML = (message: string) => `
<!DOCTYPE html>
<html>
<head>
  <title>Seenn CLI - Authentication Failed</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }
    .card {
      background: white;
      padding: 48px;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      text-align: center;
      max-width: 400px;
    }
    .error-icon {
      width: 80px;
      height: 80px;
      background: #ef4444;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    .error-icon svg {
      width: 40px;
      height: 40px;
      stroke: white;
      stroke-width: 3;
    }
    h1 {
      margin: 0 0 16px;
      color: #1f2937;
      font-size: 24px;
    }
    p {
      margin: 0;
      color: #6b7280;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="error-icon">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <h1>Authentication Failed</h1>
    <p>${message}</p>
  </div>
</body>
</html>
`;

export function startCallbackServer(): Promise<CallbackResult> {
  return new Promise((resolve, reject) => {
    let server: Server;

    const handleRequest = (req: IncomingMessage, res: ServerResponse) => {
      const url = new URL(req.url || '/', `http://localhost:${CALLBACK_PORT}`);

      if (url.pathname === '/callback') {
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');
        const errorDescription = url.searchParams.get('error_description');

        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(ERROR_HTML(errorDescription || error));
          server.close();
          reject(new Error(errorDescription || error));
          return;
        }

        if (!code) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(ERROR_HTML('No authorization code received'));
          server.close();
          reject(new Error('No authorization code received'));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(SUCCESS_HTML);

        // Close server after sending response
        setTimeout(() => {
          server.close();
          resolve({ code });
        }, 100);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
      }
    };

    server = createServer(handleRequest);

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        reject(new Error(`Port ${CALLBACK_PORT} is already in use. Please close any other Seenn CLI instances.`));
      } else {
        reject(err);
      }
    });

    server.listen(CALLBACK_PORT, '127.0.0.1', () => {
      // Server started, waiting for callback
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      server.close();
      reject(new Error('Authentication timed out. Please try again.'));
    }, 5 * 60 * 1000);
  });
}
