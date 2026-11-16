# UI innovation verification — 16 November 2026

Changed: js/views/overview.js, js/views/classification.js, js/app.js, styles.css; rebuilt standalone and service worker. Added output/pi/Buka_SIMPUL.ps1 and Desktop/SIMPUL shortcuts.

Implemented: presentation-only illustrative 3D corridor with A0/A1/A2 controls; deterministic priority sandbox using existing classifyTrafficEvent. No persistence, network calls or legal decisions from preview. Existing provenance and scenario calculations preserved.

Observed validation: npm run verify PASS (15 JS test groups, catalog 20 modules / 101 paths, 49-module standalone, syntax). Targeted API/build/security pytest: 12 passed, 0 failed, one dependency deprecation warning. Browser QA details recorded after live check. Linux-only tools/check_motion_browser.py uses /usr/bin/chromium; Windows equivalent browser QA used instead.

Deployment: five UI/runtime files copied to existing Pi deployment and user service restarted successfully. SQLite and deployment configuration unchanged. Desktop/SIMPUL contains SIMPUL.lnk, Grafana.url, InfluxDB.url. Launcher requests SSH login when the tunnel is unavailable; no stored password.

Limitations: 3D geometry is illustrative, classifier is rule-based. Pi must be powered and connected over Ethernet; monitoring containers run on laptop. Acceptance: inspect overview and classifier on actual device and confirm readability for field use.

Live browser QA PASS: deployed 3D toggle; classifier P1/P2/P3/P4; negative duration rejected; state unchanged; 390px mobile no horizontal overflow; zero page errors. External requests blocked. Screenshots: tmp/pi_setup/innovation-desktop.png and classifier-mobile.png.
