# Start here: development map for AI agents

## Before changing anything

1. Identify the requested user behavior and the acceptance criterion.
2. Read the [root agent policy](../../AGENTS.md).
3. Search the [module catalog](../../config/module-catalog.json) for the closest `purpose` / `interfaces`.
4. Open its `source` files **and** `tests` before editing.
5. Follow the [task playbook](TASK_PLAYBOOKS.md), then run tests.

## Important operational distinctions

| Label | May be shown as evidence? | Required action |
|:--|:--|:--|
| Manual, unverified | Only as an observer claim | Review and document collection method |
| Verified field measurement | Yes, with method/source | Preserve timestamp, zone, units and provenance |
| Synthetic example | **No** for field or police evidence | Label demo clearly |
| Public news | Context only | Human source verification; no enforcement inference |
| SUMO synthetic run | Technical demo only | Calibrate network and compare against independent measurements |
| AI interpretation | Hypothesis only | Check against underlying observations |

## One-task change protocol

```text
User request
   ↓
Find module ID in config/module-catalog.json
   ↓
Read relevant nested AGENTS.md + source + tests
   ↓
Write invariant checklist
   ↓
Edit only owner modules
   ↓
Run targeted tests and npm run verify
   ↓
Update docs + report observed results
```

### How the modules fit together

- **UI:** `js/data.js` metadata + `js/page-registry.js` renderer registration.
- **Events:** `js/app.js` dispatches user actions; `js/store.js` persists browser state.
- **Pilot quality:** `js/pilot.js` defines manual survey coverage, time/zone verification and review gate; `js/views/survey.js` owns UI.
- **Follow-up:** `js/operations.js` defines P1/P2 internal case rules; `js/views/operations.js` owns UI.
- **Domain:** `js/diagnostics.js`, `js/classification.js`, `js/finance.js`, etc. compute deterministic outputs.
- **Server:** `server/api_registry.py` centralizes `APIRouter` registrations; each router owns its input validation.
- **Storage:** browser local state, SQLite for manual sync, InfluxDB projection for monitoring.
- **Exports:** `js/services/export-data.js` and `js/services/csv.js` are pure, testable services.
- **Delivery:** `tools/build_standalone.py` follows the relative-import dependency graph to make offline HTML.

**Never assume** a passing contract mock means the live external service was exercised.

For vehicle stopping and pickup-related problem-solving, start with [Vehicle Problem Logic](../VEHICLE_PROBLEM_v1.9.md) and `js/vehicle-problem.js`.
