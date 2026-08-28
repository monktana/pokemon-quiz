# Pokémon Quiz

Meine Pokémon-Typen-Quiz-App – läuft komplett lokal im
Browser ohne Backend. Deployt über Coolify auf einem Hetzner-Server,
erreichbar unter [quiz.giebelmann.dev](https://quiz.giebelmann.dev/).

## Warum

Kein Werbung, kein Tracking, kein Account-Zwang – einfach die eigene
Typen-Effektivität trainieren. Man stellt sich einem zufällig
zusammengestellten 6er-Team aus Pokémon und muss pro Runde einschätzen, wie
effektiv ein Move gegen den jeweiligen Gegner ist.

## Tech-Stack

- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) – UI & Build
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/) – Styling
- [Zustand](https://zustand-demo.pmnd.rs/) – App-State
- [TanStack Query](https://tanstack.com/query/latest) – Datenfetching & Caching
- [Radix UI](https://www.radix-ui.com/) – Barrierefreie UI-Primitives
- [next-themes](https://github.com/pacocoursey/next-themes) – Dark Mode
- Mehrsprachigkeit (Lokalisierung von Pokémon-, Move- und Typnamen)
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) – Unit-Tests
- [Playwright](https://playwright.dev/) – End-to-End-Tests
- Nginx (im Container) für die statische Auslieferung im Produktivbetrieb

Die Pokémon-, Move- und Typ-Daten kommen nicht live von der PokeAPI, sondern
werden per Skript (`npm run gen:pokemon-data`) einmalig generiert und als
statisches JSON unter `public/data` ausgeliefert – die App selbst hat zur
Laufzeit keine externe Abhängigkeit.

## Lokale Entwicklung

Voraussetzung: Node.js (LTS)

```bash
npm install
npm run dev
```

Weitere nützliche Befehle:

| Befehl | Zweck |
|---|---|
| `npm run build` | Produktions-Build erzeugen |
| `npm run lint` | ESLint (mit Autofix) |
| `npm run prettier:write` | Formatierung anwenden |
| `npm run test:unit` | Unit-Tests im Watch-Modus |
| `npm run test:unit:ci` | Unit-Tests einmalig ausführen |
| `npm run test:unit:coverage` | Unit-Tests mit Coverage-Report |
| `npm run test:e2e` | End-to-End-Tests (Playwright) |
| `npm run test:e2e:ui` | End-to-End-Tests mit Playwright-UI |
| `npm run gen:pokemon-data` | Statisches Pokémon-Datenset aus der PokeAPI generieren |

## Deployment über Coolify

Die App wird über den mitgelieferten `Dockerfile` gebaut (Multi-Stage:
Node-Build → statischer Nginx-Container) und läuft nach demselben Muster wie
die übrigen selbst gehosteten Apps in diesem Setup.

1. Neue Resource in Coolify: **Dockerfile** (nicht Docker Compose, da diese
   App keine externen Abhängigkeiten wie Datenbank/Redis hat) → dieses Repo
   als Quelle angeben.
2. Domain hinterlegen, Coolify übernimmt TLS via Let's Encrypt.
3. **Ports Exposes** in den Coolify-Settings auf `80` setzen – der
   Nginx-Container lauscht auf Port 80, nicht auf dem Coolify-Standardwert
   `3000`. Bei falschem Wert antwortet der Reverse Proxy mit Bad Gateway.
4. Deploy anstoßen.

Da die App rein statisch ausgeliefert wird (kein Backend, keine Datenbank),
sind **keine Environment Variables und kein persistentes Volume** nötig.

## Tests & CI

Unit-Tests laufen mit Vitest (inkl. jsdom für DOM-Simulation), End-to-End-
Tests mit Playwright gegen den gebauten Build. Ein GitHub-Actions-Workflow
unter `.github/workflows` führt das bei jedem Push automatisch aus und lädt
den Coverage-Report zu Codecov hoch.
