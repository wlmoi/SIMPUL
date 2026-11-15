# Verification Record — SIMPUL Vehicle-first v1.9

**Environment:** Python 3, Node.js 22, local Playwright/Chromium; standalone bundle injected into a controlled test document because local-page navigation was restricted.

| Check | Result |
|---|---|
| Vehicle problem analytics (manual/demo separation, duration, unknown impact) | PASS |
| JS test groups | 14/14 PASS |
| Python pytest | 36/36 PASS |
| Module catalog | PASS, 20 modules and 94 declared source/test paths |
| Standalone builder | PASS, 47 bundled JS modules |
| UI desktop 1440 px | PASS, no JavaScript errors or horizontal overflow |
| UI mobile 390 px | PASS, no JavaScript errors or horizontal overflow |
| Source filter manual/demo and activity filter | PASS |
| Intervention action navigates to simulation | PASS |
| Default home CTA navigates to vehicle problem | PASS |
| Live field survey and calibrated Fatmawati SUMO | NOT PERFORMED |
| External API integrations, OCR runtime, Docker Grafana and InfluxDB | NOT RETESTED IN THIS RELEASE |

**Evidence policy:** Demonstration records never count toward real-world claims. Missing obstruction fields remain unknown. Interventions are hypotheses to test, not automated recommendations or traffic enforcement.
