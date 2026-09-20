import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const launcher = fileURLToPath(new URL('./dev.mjs', import.meta.url));

function run(port, mode = 'all') {
  return exec(process.execPath, [launcher, mode], {
    env: { ...process.env, PORT: port },
    timeout: 10000,
  });
}

test('rejects invalid ports before starting development processes', async () => {
  for (const port of ['0', '-1', '65536', '3000.5', 'invalid', '']) {
    await assert.rejects(run(port), (error) => {
      assert.equal(error.code, 1);
      assert.match(error.stderr, /PORT must be an integer between 1 and 65535/);
      assert.equal(error.stdout, '');
      return true;
    });
  }
});

test('does not contact an existing server or start Electron when the port is occupied', async () => {
  let connections = 0;
  const server = createServer((socket) => {
    connections += 1;
    socket.end();
  });
  server.listen(0);
  await once(server, 'listening');

  try {
    const port = String(server.address().port);
    for (const mode of ['all', 'next']) {
      await assert.rejects(run(port, mode), (error) => {
        assert.equal(error.code, 1);
        assert.match(error.stderr, new RegExp(`Port ${port} is already in use`));
        assert.equal(error.stdout, '');
        return true;
      });
    }
    assert.equal(connections, 0);
    assert.equal(server.listening, true);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
