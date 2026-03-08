import { NextResponse } from "next/server";
import { agentGet } from "@/lib/agentProxy";
import { getNetworkInfo } from "@/lib/windowsNetwork";

function isIPv4Address(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => /^\d+$/.test(part) && Number(part) >= 0 && Number(part) <= 255);
}

function isUsableLocalIp(ip: string): boolean {
  if (!isIPv4Address(ip)) return false;
  return ip !== "0.0.0.0";
}

export async function GET() {
  try {
    const info = await agentGet<{ ssid: string; localIp: string; gateway: string; dns: string[]; wifiIp?: string; lanIp?: string }>("/network/info").catch(async () => {
      const fallback = await getNetworkInfo();
      return {
        ssid: fallback.ssid,
        localIp: fallback.localIp,
        gateway: fallback.gateway,
        dns: fallback.dnsServers,
        wifiIp: fallback.wifiIp,
        lanIp: fallback.lanIp,
      };
    });

    if (!isUsableLocalIp(info.localIp)) {
      const fallback = await getNetworkInfo();
      const preferredIp = isUsableLocalIp(fallback.localIp)
        ? fallback.localIp
        : (fallback.wifiIp || fallback.lanIp || "0.0.0.0");
      return NextResponse.json({
        ssid: fallback.ssid,
        localIp: preferredIp,
        gateway: fallback.gateway,
        dnsServers: fallback.dnsServers,
        wifiIp: fallback.wifiIp || "",
        lanIp: fallback.lanIp || "",
      });
    }

    const preferredIp = isUsableLocalIp(info.localIp)
      ? info.localIp
      : (info.wifiIp || info.lanIp || "0.0.0.0");
    return NextResponse.json({
      ssid: info.ssid,
      localIp: preferredIp,
      gateway: info.gateway,
      dnsServers: info.dns,
      wifiIp: info.wifiIp || "",
      lanIp: info.lanIp || "",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get network info.";
    return NextResponse.json({
      ssid: "Unknown Network",
      localIp: "0.0.0.0",
      gateway: "",
      dnsServers: [],
      wifiIp: "",
      lanIp: "",
      error: message,
    });
  }
}
