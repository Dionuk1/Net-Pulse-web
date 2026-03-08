import { NextRequest, NextResponse } from "next/server";
import { agentPost } from "@/lib/agentProxy";
import { runTerminalFallback } from "@/lib/server/terminalFallback";

type CommandPayload = {
  cmd?: unknown;
  args?: unknown;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CommandPayload;
    const cmd = typeof body.cmd === "string" ? body.cmd : "";
    const args = typeof body.args === "string" ? body.args : "";
    try {
      const result = await agentPost<{ ok: boolean; output: string }>("/terminal/run", { cmd, args });
      return NextResponse.json(result);
    } catch (agentError) {
      const message = agentError instanceof Error ? agentError.message : "";
      if (/Local Agent is unreachable|fetch failed|ECONNREFUSED|ENOTFOUND|ETIMEDOUT/i.test(message)) {
        const fallbackResult = await runTerminalFallback(cmd, args);
        return NextResponse.json(fallbackResult, {
          headers: { "X-NetPulse-Data-Source": "fallback-local" },
        });
      }
      throw agentError;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Terminal command failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
