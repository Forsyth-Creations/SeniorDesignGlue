// server.js

const express = require('express');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const port = parseInt(process.env.PORT, 10) || 3000;
  const serverInstance = server.listen(port, () => {
    console.log(`> Ready on http://0.0.0.0:${port}`);
  });

  const gracefulShutdown = (signal) => {
    console.log(`Received ${signal}. Closing HTTP server.`);
    serverInstance.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });

    // Timeout to force close the server
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 2000);

    // Optional: Close any other resources like database connections here
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
});
