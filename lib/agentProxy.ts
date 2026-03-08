const AGENT_URL = process.env.ROCKETPING_AGENT_URL || process.env.NETPULSE_AGENT_URL || "http://127.0.0.1:5055";
const AGENT_TOKEN = process.env.ROCKETPING_TOKEN || process.env.NETPULSE_TOKEN || "change-me-local-token";

function formatAgentNetworkError(error: unknown): Error {
  const message = error instanceof Error ? error.message : String(error);
  if (/fetch failed|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|socket/i.test(message)) {
    return new Error(
      `Local Agent is unreachable at ${AGENT_URL}. Start it with: cd local-agent && npm run dev`,
    );
  }
  return new Error(message || "Agent request failed.");
}

export async function agentGet<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${AGENT_URL}${path}`, {
      method: "GET",
      headers: {
        "X-ROCKETPING-TOKEN": AGENT_TOKEN,
        "X-NETPULSE-TOKEN": AGENT_TOKEN,
      },
      cache: "no-store",
    });
  } catch (error) {
    throw formatAgentNetworkError(error);
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : { error: await response.text() };

  if (!response.ok) {
    const message = payload && typeof payload.error === "string" ? payload.error : `Agent request failed: ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

export async function agentPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${AGENT_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ROCKETPING-TOKEN": AGENT_TOKEN,
        "X-NETPULSE-TOKEN": AGENT_TOKEN,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (error) {
    throw formatAgentNetworkError(error);
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : { error: await response.text() };

  if (!response.ok) {
    const message = payload && typeof payload.error === "string" ? payload.error : `Agent request failed: ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}
