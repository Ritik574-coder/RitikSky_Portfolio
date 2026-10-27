import { stdin, stdout } from "node:process";
import { randomBytes, pbkdf2Sync } from "node:crypto";

if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
  throw new Error(
    "Run this command in an interactive terminal so the password can be entered without echo.",
  );
}

const iterations = 100000;
const salt = randomBytes(16);
const inputBytes = [];
stdout.write("Owner password (input hidden): ");
stdin.setRawMode(true);
stdin.resume();

const password = await new Promise((resolve, reject) => {
  let finished = false;
  const cleanup = () => {
    if (finished) return;
    finished = true;
    stdin.off("data", onData);
    stdin.setRawMode(false);
    stdin.pause();
    stdout.write("\n");
  };
  const onData = (chunk) => {
    for (const byte of chunk) {
      if (byte === 3) {
        cleanup();
        reject(new Error("Password generation cancelled."));
        return;
      }
      if (byte === 10 || byte === 13) {
        cleanup();
        resolve(Buffer.from(inputBytes).toString("utf8"));
        return;
      }
      if (byte === 127 || byte === 8) {
        inputBytes.pop();
        while (inputBytes.length && (inputBytes.at(-1) & 0xc0) === 0x80) inputBytes.pop();
      } else {
        inputBytes.push(byte);
      }
    }
  };
  stdin.on("data", onData);
});

if (password.length < 14 || password.length > 1024) {
  throw new Error("Use an owner password between 14 and 1024 characters.");
}

const derived = pbkdf2Sync(password, salt, iterations, 32, "sha256");
inputBytes.fill(0);
const rawHash = `pbkdf2-sha256$${iterations}$${salt.toString("hex")}$${derived.toString("hex")}`;
derived.fill(0);
stdout.write(
  "\n=== Generated Owner Password Hash (100,000 iterations for Cloudflare Workers) ===\n\n",
);
stdout.write(
  `For "npx wrangler secret put OWNER_PASSWORD_HASH", paste this exact value:\n${rawHash}\n\n`,
);
stdout.write(`For .dev.vars, paste:\nOWNER_PASSWORD_HASH=${rawHash}\n\n`);
