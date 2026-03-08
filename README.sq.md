# RocketPing

RocketPing Ã«shtÃ« njÃ« **dashboard lokal pÃ«r monitorim rrjeti nÃ« Windows** i ndÃ«rtuar me **Next.js (App Router)**, **TypeScript** dhe **Tailwind CSS**.

Ai kombinon njÃ« UI moderne nÃ« web me njÃ« agjent lokal tÃ« sigurt nÃ« Windows, qÃ« tÃ« mund tÃ« inspektoni LAN-in, tÃ« kryeni speed test, tÃ« monitoroni aktivitetin dhe tÃ« gjeneroni raporte nga njÃ« vend i vetÃ«m.

---

## Gjuha e Dokumentimit

- Anglisht: [`README.md`](README.md)
- Shqip: ky dokument (`README.sq.md`)

---

## Ã‡farÃ« BÃ«n RocketPing

RocketPing ju ndihmon tÃ«:
- shihni detaje live tÃ« rrjetit (SSID, IP lokale, gateway, DNS)
- skanoni pajisjet nÃ« LAN
- ndiqni aktivitetin e rrjetit dhe ndryshimet e gjendjes sÃ« pajisjeve
- ekzekutoni speed test real me Ookla CLI
- pÃ«rdorni terminal tÃ« sigurt me komanda tÃ« lejuara
- shihni tregues tÃ« trust score dhe rekomandime
- gjeneroni raporte tÃ« avancuara lokale

---

## VeÃ§oritÃ« Aktuale

### Dashboard Kryesor
- Pamje kryesore me informacione live pÃ«r rrjetin/trust score
- UI e errÃ«t me stil security
- Kontroll i gjuhÃ«s dhe temÃ«s
- MbÃ«shtetje gjuhÃ«sore nÃ« UI: **Anglisht (`en`)** dhe **Shqip (`sq`)**

### Monitorimi i Pajisjeve dhe Aktivitetit
- Skanime manuale / tÃ« planifikuara tÃ« pajisjeve lokale
- Activity feed me event snapshots
- API route pÃ«r scan, ping, vendor/os/ports

### Speed Test
- Ekzekutim real pÃ«rmes `POST /api/speedtest/run`
- Parsim JSON nga Ookla CLI (download/upload/ping/jitter/packet loss, etj.)
- Historik speed test i ruajtur nÃ« SQLite lokale
- UI e personalizuar me GO button dhe animacione rocket/space

### Terminal i Sigurt
- Ekzekutim komandash vetÃ«m nga allowlist (pÃ«rmes local agent)

### Local Agent (Windows)
- HTTP server i lehtÃ« me Node.js + TypeScript
- Binds vetÃ«m nÃ« `127.0.0.1:5055`
- Endpoints tÃ« mbrojtura me token (`X-ROCKETPING-TOKEN`)
- Rate limiting dhe kontroll localhost-only

---

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- SQLite (`node:sqlite`)
- Framer Motion (animacione GO button/ring)
- Lottie React (i disponueshÃ«m nÃ« projekt)
- Local Agent: Node.js + TypeScript

---

## Klonimi i Projektit

```bash
git clone https://github.com/Dionuk1/Net-Pulse-app.git
cd Net-Pulse-app
```

---

## Parakushtet

### TÃ« detyrueshme
- Windows 10/11
- Node.js 20+ (rekomandohet LTS mÃ« i fundit)
- npm

### Opsionale (tÃ« rekomanduara)
- Ookla Speedtest CLI (`speedtest.exe`)

RocketPing provon automatikisht kÃ«to lokacione:
1. variabla `ROCKETPING_SPEEDTEST_BIN`
2. `./ookla-speedtest-1.2.0-win64/speedtest.exe`
3. Ã§do `./ookla-speedtest*/speedtest.exe`
4. `C:\Tools\speedtest\speedtest.exe`

---

## Instalimi i VarÃ«sive

Nga root i projektit:

```bash
npm install
```

PÃ«r local agent:

```bash
cd local-agent
npm install
cd ..
```

---

## Konfigurimi i Environment

Krijo `.env.local` nÃ« root tÃ« projektit:

```env
ROCKETPING_AGENT_URL=http://127.0.0.1:5055
ROCKETPING_TOKEN=change-me-local-token
# Opsionale:
# ROCKETPING_SPEEDTEST_BIN=C:\Path\To\speedtest.exe
```

I njÃ«jti token duhet tÃ« pÃ«rdoret edhe nga local agent.

---

## Nisja e Aplikacionit

### 1) Nis local agent (terminali 1)

```bash
cd local-agent
npm run dev
```

### 2) Nis RocketPing web app (terminali 2)

```bash
npm run dev
```

Hape nÃ« browser:
- `http://localhost:3000`
- pamje speed:
  - `http://localhost:3000/speed`
  - `http://localhost:3000/speedtest`

---

## Build pÃ«r Production

### Web app
```bash
npm run build
npm start
```

### Local agent
```bash
cd local-agent
npm run build
npm run start
```

---

## Endpoint-et e Local Agent

Base: `http://127.0.0.1:5055`

Publike:
- `GET /health`

KÃ«rkojnÃ« token (`X-ROCKETPING-TOKEN`):
- `GET /network/info`
- `GET /scan/devices`
- `GET /scan/ports?ip=...&range=...`
- `GET /scan/os?ip=...`
- `GET /scan/vendor?mac=...`
- `GET /ping?host=...`
- `POST /terminal/run`

---

## Statusi i Projektit

- Zhvillim aktiv lokal
- VeÃ§oritÃ« kryesore janÃ« implementuar dhe integruar
- Iterim i vazhdueshÃ«m nÃ« UI/animacione
- Fokus nÃ« runtime Windows-first

---

## Pse Local Agent?

RocketPing pÃ«rdor local agent pÃ«r tÃ« ekzekutuar operacione tÃ« rrjetit/sistemit nÃ« Windows nÃ« mÃ«nyrÃ« mÃ« tÃ« sigurt dhe mÃ« tÃ« qÃ«ndrueshme, krahasuar me ekzekutimin direkt tÃ« komandave nÃ« web routes.

PÃ«rfitimet:
- Izolon ekzekutimin e komandave tÃ« nivelit OS nga logjika e UI
- Centralizon validimin e komandave dhe allowlist
- Rrit qÃ«ndrueshmÃ«rinÃ« pÃ«r mjetet Windows-specific (scan/ping/terminal/network info)
- E mban web app mÃ« tÃ« pastÃ«r duke pÃ«rdorur proxy routes

---

## ShÃ«nime Sigurie

- Agent bind vetÃ«m nÃ« `127.0.0.1` (localhost-only)
- Header token i detyrueshÃ«m pÃ«r route tÃ« mbrojtura:
  - `X-ROCKETPING-TOKEN`
- Endpoint i terminalit pÃ«rdor command allowlist
- Input validation dhe output sanitization aplikohen nÃ« route tÃ« agent-it
- Rate limiting bazik Ã«shtÃ« aktiv nÃ« local agent
- Mbajeni `.env.local` private dhe mos commit secrets/token real

---

## Struktura e Projektit

```text
RocketPing-web
|-- app
|   |-- api
|   |   |-- activity/snapshot/route.ts
|   |   |-- network/info/route.ts
|   |   |-- ping/route.ts
|   |   |-- report/advanced/route.ts
|   |   |-- scan
|   |   |   |-- devices/route.ts
|   |   |   |-- os/route.ts
|   |   |   |-- ports/route.ts
|   |   |   `-- vendor/route.ts
|   |   |-- speed/history/route.ts
|   |   |-- speed/ookla/route.ts
|   |   |-- speedtest/run/route.ts
|   |   |-- terminal/run/route.ts
|   |   `-- trust/live/route.ts
|   |-- activity/page.tsx
|   |-- devices/page.tsx
|   |-- report/page.tsx
|   |-- settings/page.tsx
|   |-- speed/page.tsx
|   |-- speedtest/page.tsx
|   |-- terminal/page.tsx
|   |-- layout.tsx
|   `-- page.tsx
|-- components
|   |-- GoSpeedtestButton.tsx
|   |-- RocketOverlay.tsx
|   |-- StarshipCanvas.tsx
|   |-- AppControls.tsx
|   |-- SidebarNav.tsx
|   `-- ...
|-- lib
|   |-- api.ts
|   |-- agentProxy.ts
|   |-- windowsNetwork.ts
|   |-- trustScore.ts
|   |-- activityLogic.ts
|   `-- server/db.ts
|-- local-agent
|   |-- src
|   |   |-- index.ts
|   |   |-- network.ts
|   |   |-- terminal.ts
|   |   |-- oui.ts
|   |   |-- config.ts
|   |   `-- utils.ts
|   |-- package.json
|   `-- tsconfig.json
|-- public
|   `-- animations
|-- package.json
`-- README.md
```

---

## Zgjidhja e Problemeve

### `/speed` ose `/speedtest` nuk pÃ«rditÃ«sohet pas ndryshimeve
- Rinise dev server dhe bÃ«j hard refresh nÃ« browser (`Ctrl+F5`).

### Nuk gjendet `speedtest.exe`
- Vendose `speedtest.exe` nÃ« njÃ« nga path-et e mbÃ«shtetura ose vendos `ROCKETPING_SPEEDTEST_BIN`.

### Probleme me auth tÃ« agent-it
- Verifiko qÃ« `ROCKETPING_TOKEN` nÃ« web app dhe local agent tÃ« jetÃ« i njÃ«jtÃ«.

### Sjellje Windows-only
- Disa API janÃ« qÃ«llimisht vetÃ«m pÃ«r Windows dhe kthejnÃ« fallback/error nÃ« platforma tÃ« tjera.

---

## Skriptet

### Root
- `npm run dev` - nis Next.js dev server
- `npm run build` - build pÃ«r production
- `npm run start` - nis production server
- `npm run lint` - lint i codebase

### `local-agent/`
- `npm run dev` - nis agent me TSX
- `npm run build` - kompilon TypeScript
- `npm run start` - nis agent-in e build-uar

---

## Licenca

Ky projekt licencohet me **MIT License**.

Shiko [LICENSE](LICENSE) pÃ«r detajet e plota.

---

## Kontributi

Kontributet janÃ« tÃ« mirÃ«pritura! NÃ«se doni ta pÃ«rmirÃ«soni RocketPing:

- Fork repository
- Krijo branch tÃ« ri:
  `git checkout -b feature/your-feature-name`
- BÃ«j ndryshimet dhe commit:
  `git commit -m "Add new feature or improvement"`
- Shtyje branch-in nÃ« fork-un tÃ«nd
- Hape njÃ« Pull Request

---

## Kontakt

Projekti Ã«shtÃ« i hapur pÃ«r pÃ«rmirÃ«sime dhe kontribute tÃ« reja.

PÃ«r bashkÃ«punim, sugjerime ose pyetje:

Email: [dukshini123@gmail.com](mailto:dukshini123@gmail.com)



