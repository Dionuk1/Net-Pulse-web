import "server-only";

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

type AllowedCommand = "ping" | "tracert" | "ipconfig" | "netstat" | "arp" | "nslookup";

export type TerminalRunResult = {
  ok: boolean;
  output: string;
};

const ALLOWED_COMMANDS: readonly AllowedCommand[] = ["ping", "tracert", "ipconfig", "netstat", "arp", "nslookup"];
const MAX_OUTPUT_LENGTH = 20000;

function sanitizeOutput(raw: string): string {
  const noAnsi = raw.replace(/\x1B\[[0-9;]*[A-Za-z]/g, "");
  const printable = noAnsi.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
  if (printable.length <= MAX_OUTPUT_LENGTH) {
    return printable;
  }
  return `${printable.slice(0, MAX_OUTPUT_LENGTH)}\n\n[output truncated]`;
}

function isIPv4Address(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    if (!/^\d+$/.test(part)) return false;
    const n = Number(part);
    return n >= 0 && n <= 255;
  });
}

function isHostname(input: string): boolean {
  return /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+$/.test(input) && !input.startsWith("-") && input.length <= 253;
}

function hasUnsafeCharacters(input: string): boolean {
  return /[;&|`$<>]/.test(input);
}

function parseSingleTarget(rawArgs: string): string | null {
  const tokens = rawArgs.trim().split(/\s+/).filter(Boolean);
  if (tokens.length !== 1) return null;
  const target = tokens[0];
  if (isIPv4Address(target) || isHostname(target)) {
    return target;
  }
  return null;
}

function resolveTerminalCommand(cmdRaw: string, argsRaw: string): { file: string; args: string[] } {
  const cmd = cmdRaw.trim().toLowerCase();
  const args = argsRaw.trim();

  if (!ALLOWED_COMMANDS.includes(cmd as AllowedCommand)) {
    throw new Error("Command not allowed.");
  }
  if (hasUnsafeCharacters(args)) {
    throw new Error("Unsafe characters in args.");
  }

  if (cmd === "ipconfig") {
    if (args.length > 0) throw new Error("ipconfig does not accept custom args.");
    return { file: "ipconfig", args: ["/all"] };
  }
  if (cmd === "netstat") {
    if (args.length > 0) throw new Error("netstat does not accept custom args.");
    return { file: "netstat", args: ["-ano"] };
  }
  if (cmd === "arp") {
    if (args.length > 0) throw new Error("arp does not accept custom args.");
    return { file: "arp", args: ["-a"] };
  }

  const target = parseSingleTarget(args);
  if (!target) {
    throw new Error("Use exactly one target (IPv4 or hostname).");
  }

  if (cmd === "ping") {
    return { file: "ping", args: ["-n", "4", "-w", "1000", target] };
  }
  if (cmd === "tracert") {
    return { file: "tracert", args: ["-d", "-h", "10", target] };
  }
  return { file: "nslookup", args: [target] };
}

export async function runTerminalFallback(cmdRaw: string, argsRaw = ""): Promise<TerminalRunResult> {
  if (process.platform !== "win32") {
    throw new Error("Terminal commands are supported on Windows only.");
  }

  const resolved = resolveTerminalCommand(cmdRaw, argsRaw);

  try {
    const { stdout, stderr } = await execFileAsync(resolved.file, resolved.args, {
      timeout: 10000,
      windowsHide: true,
      maxBuffer: MAX_OUTPUT_LENGTH * 2,
    });
    const joined = [stdout, stderr].filter(Boolean).join("\n").trim();
    return { ok: true, output: sanitizeOutput(joined || "(no output)") };
  } catch (error) {
    const processError = error as { stdout?: string; stderr?: string; message?: string };
    const output = [processError.stdout, processError.stderr].filter(Boolean).join("\n").trim();
    return { ok: false, output: sanitizeOutput(output || processError.message || "Command failed.") };
  }
}
