const { spawn } = require("child_process");
const path = require("path");

const frontendDir = path.resolve(__dirname, "..");
const backendDir = path.resolve(frontendDir, "..", "school_mysql");

function runCommand(command, args, cwd, extraEnv = {}) {
  const child = spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      ...extraEnv
    }
  });

  child.on("error", (error) => {
    console.error(`Failed to start command: ${command} ${args.join(" ")}`);
    console.error(error);
  });

  return child;
}

const backend = runCommand("npm", ["start"], backendDir);
const frontend = runCommand("npm", ["run", "start:react"], frontendDir, {
  BROWSER: process.env.BROWSER || "default"
});

let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  if (backend && !backend.killed) {
    backend.kill();
  }

  if (frontend && !frontend.killed) {
    frontend.kill();
  }

  process.exit(exitCode);
}

backend.on("exit", (code) => {
  if (!shuttingDown && code && code !== 0) {
    shutdown(code);
  }
});

frontend.on("exit", (code) => {
  shutdown(code || 0);
});

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
