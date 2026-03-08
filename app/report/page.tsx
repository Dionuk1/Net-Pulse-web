"use client";

import { useEffect, useState } from "react";
import AnimatedButton from "@/components/AnimatedButton";
import Card from "@/components/Card";
import { fetchAdvancedReport, type AdvancedReportResponse } from "@/lib/api";

function fmtTime(value: string): string {
  return new Date(value).toLocaleString();
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export default function ReportPage() {
  const [report, setReport] = useState<AdvancedReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const data = await fetchAdvancedReport();
        setReport(data);
      } catch (error) {
        setErrorText(error instanceof Error ? error.message : "Failed to load report data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const trust = report?.trustLatest;

  const printReport = () => {
    if (!report) return;

    const win = window.open("", "_blank", "width=980,height=1200");
    if (!win) {
      window.print();
      return;
    }

    const deviceRows = report.devices
      .map(
        (device) => `
          <tr>
            <td>${escapeHtml(device.ip)}</td>
            <td>${escapeHtml(device.mac)}</td>
            <td>${escapeHtml(device.vendor ?? "Unknown")}</td>
            <td>${device.online ? "Online" : "Offline"}</td>
            <td>${escapeHtml((device.riskLevel ?? "low").toUpperCase())}</td>
          </tr>`,
      )
      .join("");

    const speedRows = report.speedHistory.length === 0
      ? "<p class='muted'>No speed history saved yet.</p>"
      : report.speedHistory
        .map(
          (item) => `
            <div class="item">
              <p><strong>${escapeHtml(fmtTime(item.timestamp))}</strong> - Target ${escapeHtml(item.targetHost)}</p>
              <p>Download ${item.downloadMbps.toFixed(1)} Mbps | Upload ${item.uploadMbps.toFixed(1)} Mbps | Ping ${item.pingMs} ms</p>
            </div>`,
        )
        .join("");

    const eventRows = report.activityEvents.length === 0
      ? "<p class='muted'>No activity events recorded.</p>"
      : report.activityEvents
        .map(
          (event) => `
            <div class="item">
              <p><strong>${escapeHtml(event.type)}</strong> - ${escapeHtml(event.deviceLabel)}</p>
              <p>${escapeHtml(event.details)}</p>
              <p class="muted">${escapeHtml(fmtTime(event.timestamp))} | Severity: ${escapeHtml(event.severity)}</p>
            </div>`,
        )
        .join("");

    const trustText = trust
      ? `${trust.score} (${trust.badge}) at ${fmtTime(trust.timestamp)}`
      : "N/A";

    const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>RocketPing Report</title>
    <style>
      body { font-family: "Segoe UI", Arial, sans-serif; color: #111; margin: 16mm; }
      h1 { font-size: 28px; margin: 0 0 6px; }
      h2 { font-size: 18px; margin: 0 0 8px; }
      p { margin: 0 0 4px; line-height: 1.4; }
      .muted { color: #555; }
      .section { border: 1px solid #ddd; border-radius: 12px; padding: 12px; margin-bottom: 10px; break-inside: avoid-page; }
      .section.flow { break-inside: auto; }
      table { width: 100%; border-collapse: collapse; margin-top: 6px; }
      th, td { border-bottom: 1px solid #e4e4e4; padding: 6px 4px; text-align: left; font-size: 13px; }
      .item { border: 1px solid #e5e5e5; border-radius: 10px; padding: 8px; margin-bottom: 8px; break-inside: avoid-page; }
      @media print {
        html, body { margin: 0; padding: 0; }
        body { margin: 12mm; }
        .section.flow, .section.flow * { break-inside: auto; page-break-inside: auto; }
      }
    </style>
  </head>
  <body>
    <h1>RocketPing Advanced Security Report</h1>
    <p class="muted">Generated: ${escapeHtml(fmtTime(report.generatedAt))}</p>

    <section class="section">
      <h2>Network Overview</h2>
      <p>SSID: ${escapeHtml(report.network.ssid)}</p>
      <p>Local IP: ${escapeHtml(report.network.localIp)}</p>
      <p>Gateway: ${escapeHtml(report.network.gateway)}</p>
      <p>DNS: ${escapeHtml(report.network.dnsServers.length ? report.network.dnsServers.join(", ") : "N/A")}</p>
    </section>

    <section class="section">
      <h2>Trust Score 2.0</h2>
      <p>Latest sample: ${escapeHtml(trustText)}</p>
      <p>Encryption: <strong>${trust?.encryption ?? "-"}</strong></p>
      <p>Stability: <strong>${trust?.stability ?? "-"}</strong></p>
      <p>DNS Consistency: <strong>${trust?.dnsConsistency ?? "-"}</strong></p>
      <p>Router Behavior: <strong>${trust?.routerBehavior ?? "-"}</strong></p>
    </section>

    <section class="section flow">
      <h2>Device Inventory</h2>
      <table>
        <thead>
          <tr><th>IP</th><th>MAC</th><th>Vendor</th><th>Status</th><th>Risk</th></tr>
        </thead>
        <tbody>
          ${deviceRows}
        </tbody>
      </table>
    </section>

    <section class="section flow">
      <h2>SQLite Speed Test History</h2>
      ${speedRows}
    </section>

    <section class="section flow">
      <h2>Recent Activity Events</h2>
      ${eventRows}
    </section>
  </body>
</html>`;

    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <main className="space-y-4 pb-4 md:space-y-6 md:pb-8 report-print">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">RocketPing Advanced Security Report</h1>
        <p className="text-sm text-white/60">
          Generated: {report ? fmtTime(report.generatedAt) : "Loading..."}
        </p>
      </header>

      <AnimatedButton className="print-hide w-fit rounded-xl px-4 py-2 text-sm font-semibold" onClick={printReport}>
        Download PDF
      </AnimatedButton>

      {loading && <Card className="p-5"><p className="text-sm text-white/70">Loading report sections...</p></Card>}
      {errorText && <Card className="p-5"><p className="text-sm text-[color:var(--np-danger)]">{errorText}</p></Card>}

      {!loading && report && (
        <>
          <Card className="report-card report-no-break p-5">
            <h2 className="text-lg font-semibold">Network Overview</h2>
            <div className="mt-2 grid gap-1 text-sm text-white/80">
              <p>SSID: {report.network.ssid}</p>
              <p>Local IP: {report.network.localIp}</p>
              <p>Gateway: {report.network.gateway}</p>
              <p>DNS: {report.network.dnsServers.length ? report.network.dnsServers.join(", ") : "N/A"}</p>
            </div>
          </Card>

          <Card className="report-card report-no-break p-5">
            <h2 className="text-lg font-semibold">Trust Score 2.0</h2>
            <p className="mt-1 text-sm text-white/70">
              Latest sample: {trust ? `${trust.score} (${trust.badge}) at ${fmtTime(trust.timestamp)}` : "N/A"}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <p>Encryption: <span className="font-semibold">{trust?.encryption ?? "-"}</span></p>
              <p>Stability: <span className="font-semibold">{trust?.stability ?? "-"}</span></p>
              <p>DNS Consistency: <span className="font-semibold">{trust?.dnsConsistency ?? "-"}</span></p>
              <p>Router Behavior: <span className="font-semibold">{trust?.routerBehavior ?? "-"}</span></p>
            </div>
          </Card>

          <Card className="report-card report-flow p-5">
            <h2 className="text-lg font-semibold">Device Inventory</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/60">
                    <th className="py-2">IP</th>
                    <th className="py-2">MAC</th>
                    <th className="py-2">Vendor</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {report.devices.map((device) => (
                    <tr key={`${device.ip}-${device.mac}`} className="border-b border-[color:var(--np-border)]">
                      <td className="py-2">{device.ip}</td>
                      <td className="py-2">{device.mac}</td>
                      <td className="py-2">{device.vendor ?? "Unknown"}</td>
                      <td className="py-2">{device.online ? "Online" : "Offline"}</td>
                      <td className="py-2">{(device.riskLevel ?? "low").toUpperCase()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="report-card report-flow p-5">
            <h2 className="text-lg font-semibold">SQLite Speed Test History</h2>
            <div className="mt-3 space-y-2">
              {report.speedHistory.length === 0 && <p className="text-sm text-white/60">No speed history saved yet.</p>}
              {report.speedHistory.map((item) => (
                <div key={item.id} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white/80">
                  <p className="font-medium">{fmtTime(item.timestamp)} - Target {item.targetHost}</p>
                  <p>Download {item.downloadMbps.toFixed(1)} Mbps | Upload {item.uploadMbps.toFixed(1)} Mbps | Ping {item.pingMs} ms</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="report-card report-flow p-5">
            <h2 className="text-lg font-semibold">Recent Activity Events</h2>
            <div className="mt-3 space-y-2">
              {report.activityEvents.length === 0 && <p className="text-sm text-white/60">No activity events recorded.</p>}
              {report.activityEvents.map((event) => (
                <div key={event.id} className="rounded-xl border border-white/10 px-3 py-2 text-sm">
                  <p className="font-medium text-white">{event.type} - {event.deviceLabel}</p>
                  <p className="text-white/70">{event.details}</p>
                  <p className="text-xs text-white/50">{fmtTime(event.timestamp)} | Severity: {event.severity}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </main>
  );
}
