import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import concurrently from 'concurrently';

const mode = process.argv[2] ?? 'all';
const port = Number(process.env.PORT ?? 3000);

async function checkPort() {
  await new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', (error) => {
      reject(
        error.code === 'EADDRINUSE'
          ? new Error(`Port ${port} is already in use. Set PORT to an available port.`)
          : error,
      );
    });
    server.listen({ port, exclusive: true }, () => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });
}

try {
  if (!['all', 'next', 'electron'].includes(mode)) {
    throw new Error(`Unknown development mode: ${mode}`);
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }
  if (mode !== 'electron') {
    await checkPort();
  }

  const rendererUrl = `http://localhost:${port}`;
  const env = { PORT: String(port), ELECTRON_RENDERER_URL: rendererUrl };
  const commands = [
    { name: 'next', command: `next dev --port ${port}` },
    { name: 'electron-ts', command: 'pnpm dev:electron:compile' },
    {
      name: 'electron',
      command: `wait-on http-get://localhost:${port} dist-electron/main.js dist-electron/preload.js && electron .`,
    },
  ]
    .filter(({ name }) => mode === 'all' || name === mode)
    .map((command) => ({ ...command, env }));

  const { result } = concurrently(commands, {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    killOthersOn: ['failure'],
  });
  await result.catch(() => {
    process.exitCode = 1;
  });
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
