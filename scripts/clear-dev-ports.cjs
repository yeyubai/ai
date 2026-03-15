const { execSync } = require('child_process');

const ports = [3000, 3001, 3002, 3003];

function listPidsForPort(port) {
  try {
    const output = execSync(`netstat -ano | findstr :${port}`, {
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
    });

    return Array.from(
      new Set(
        output
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => line.split(/\s+/).at(-1))
          .filter((value) => /^\d+$/.test(value))
          .map((value) => Number(value)),
      ),
    );
  } catch {
    return [];
  }
}

function killPid(pid) {
  try {
    execSync(`taskkill /PID ${pid} /F`, {
      stdio: ['ignore', 'ignore', 'ignore'],
    });
    return true;
  } catch {
    return false;
  }
}

const allPids = Array.from(new Set(ports.flatMap(listPidsForPort)));

if (allPids.length === 0) {
  console.log('[dev] no stale dev ports detected');
  process.exit(0);
}

for (const pid of allPids) {
  const killed = killPid(pid);
  console.log(`[dev] ${killed ? 'released' : 'failed'} pid ${pid}`);
}
