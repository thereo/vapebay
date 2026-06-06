// scripts/dev.mjs
// One-command dev runner. Spawns the three services as child processes and
// forwards SIGINT / SIGTERM to ALL of them (using `tree-kill` to recursively
// terminate each process tree on Windows — `concurrently` doesn't always
// propagate kills on Windows because the OS doesn't deliver POSIX signals
// the same way).

import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { createInterface } from 'node:readline'
import spawn from 'cross-spawn'
import treeKill from 'tree-kill'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// Spawning through `npm run` on Windows opens a cmd.exe that itself spawns
// the actual command — that extra layer is exactly what breaks signal
// propagation. We resolve to the real executables instead.
const services = [
  {
    name: 'api',
    color: '[34m', // blue
    cwd: path.join(repoRoot, 'backend-api'),
    cmd: process.execPath, // node
    args: [
      '-r',
      'dotenv/config',
      path.join(repoRoot, 'backend-api', 'node_modules', 'ts-node', 'dist', 'bin.js'),
      path.join(repoRoot, 'backend-api', 'src', 'main.ts'),
    ],
  },
  {
    name: 'admin',
    color: '[32m', // green
    cwd: path.join(repoRoot, 'backend-admin'),
    cmd: 'php',
    args: ['artisan', 'serve', '--host=127.0.0.1', '--port=8000'],
  },
  {
    name: 'web',
    color: '[35m', // magenta
    cwd: path.join(repoRoot, 'frontend'),
    // `nuxt dev` needs to run via the local .bin so nuxi picks up the project's Nuxt install.
    cmd: process.platform === 'win32' ? 'npx.cmd' : 'npx',
    args: ['nuxt', 'dev'],
  },
]
const RESET = '[0m'

function prefixLines(stream, name, color) {
  let carry = ''
  stream.on('data', (chunk) => {
    const text = (carry + chunk.toString('utf8')).replace(/\r/g, '')
    carry = ''
    const lines = text.split('\n')
    // Last element is either '' (clean line break) or a partial line.
    if (lines[lines.length - 1] !== '') {
      carry = lines.pop() ?? ''
    }
    for (const line of lines) {
      process.stdout.write(`${color}[${name}]${RESET} ${line}\n`)
    }
  })
}

const children = []
for (const svc of services) {
  const child = spawn(svc.cmd, svc.args, {
    cwd: svc.cwd,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    // detached:false on purpose — we want them in our process group so tree-kill reaches them.
  })
  children.push(child)
  prefixLines(child.stdout, svc.name, svc.color)
  prefixLines(child.stderr, svc.name, svc.color)
  child.on('exit', (code, signal) => {
    process.stdout.write(
      `${svc.color}[${svc.name}]${RESET} exited (code=${code}, signal=${signal})\n`,
    )
    // If any service dies, stop the rest so the user doesn't end up with
    // two orphan processes.
    shutdown(`child "${svc.name}" exited`)
  })
}

let shuttingDown = false
async function shutdown(reason) {
  if (shuttingDown) return
  shuttingDown = true
  process.stdout.write(`\nshutting down (${reason})…\n`)
  await Promise.all(
    children.map(
      (child) =>
        new Promise((resolve) => {
          if (child.exitCode !== null || child.signalCode !== null) return resolve()
          treeKill(child.pid, 'SIGKILL', (err) => {
            if (err) {
              // Fall back to a direct kill on the pid we know.
              try {
                child.kill('SIGKILL')
              } catch {
                /* ignore */
              }
            }
            resolve()
          })
        }),
    ),
  )
  // Give trees a moment to actually die before we exit.
  setTimeout(() => process.exit(0), 250)
}

// Ctrl+C in the terminal.
process.on('SIGINT', () => shutdown('SIGINT'))
// `taskkill` from another shell.
process.on('SIGTERM', () => shutdown('SIGTERM'))
// Closing stdin (Ctrl+D in a real terminal) is a valid shutdown signal —
// but only when the runner is attached to a TTY. In CI / non-interactive
// shells stdin is closed for unrelated reasons and we'd otherwise quit
// immediately. This is why background-task runners elsewhere in this repo
// get treated as "done" the moment the harness closes their pipe.
if (process.stdin.isTTY) {
  createInterface({ input: process.stdin }).on('close', () => shutdown('stdin closed'))
}
