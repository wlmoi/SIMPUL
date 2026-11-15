# OpenOSINT adapter for SIMPUL v1.1

## Why this integration exists
SIMPUL answers whether pickup/drop-off patterns obstruct transit access at MRT Fatmawati. Observations and calibrated SUMO must remain the primary analysis basis. News can help identify relevant public claims and conditions worth checking. It does not supply a traffic count, evidence of a specific traffic offense, or identity information.

## Upstream and scope
- Upstream: https://github.com/OpenOSINT/OpenOSINT
- Examined upstream `pyproject.toml` version 2.38.1 and tool definition for `search_gdelt_geo`.
- License: MIT according to upstream LICENSE/COMMERCIAL.md. The optional dependency is installed separately; no upstream source files are vendored into SIMPUL.
- Enabled capability: `openosint.tools.search_gdelt_geo.run_gdelt_geo_osint` only.
- Inputs: fixed news topics, center WGS84 lat/lon, 0.5–10 km area, 15–360 minute requested time window.
- Output: filtered title, public URL, source domain, named place, mention count, lat/lon, coverage and time of retrieval.
- Other 20 upstream tools: not available through the SIMPUL backend.
- No active mode and no agent-run arbitrary investigations.

## Provider limitations
The current GDELT implementation uses a rolling 15-minute GKG feed, with a default shorter in-memory window. Geographic points represent locations *mentioned in an article* rather than verified locations where events occurred. A public report about a topic elsewhere could still mention Jakarta. Conversely, no result does not establish that no incident took place. News recency and article timestamps should not be confused with the event's time of occurrence.

## API
- `GET /api/v1/public-intelligence/status`: `available` means optional library is present and explicit opt-in is enabled, **not** that the feed has been contacted successfully.
- `POST /api/v1/public-intelligence/news`: schema `NewsSearch` with strict `extra=forbid`, no arbitrary names/phones/emails or unrestricted tools.
- Failure modes: 422 invalid data, 503 adapter unavailable, 504 timeout, 502 invalid provider result.
- Normalization rejects unexpected GeoJSON and unsafe/nonpublic link formats; caps result list to 15 items.

## Data flow
```
User browser: selected study coordinate and fixed topic
       → FastAPI request validation
       → opt-in check / optional OpenOSINT Python package
       → search_gdelt_geo (GDELT public news feed)
       → GeoJSON extractor / URL sanitation / provenance labels
       → SIMPUL public context results
```
No automatic join to police case records, legal conclusions, safety rankings, or SUMO calibration data. Source publication and terms must be reviewed before redistributing links and metadata for public commercial deployment. This integration is not an authenticated police application.

## Installation
```
python -m pip install -r server/requirements-openosint.txt
```
On Windows PowerShell:
```
$env:SIMPUL_PUBLIC_OSINT_ENABLED = '1'
python server/app.py
```
Or set the environment variable through the process manager. `.env.example` is documentation only and is not auto-loaded by `server/app.py`.

## Verification
- Test `tests/test_public_intelligence.py`: availability, fixed-topic validation, bounding-box limits, safe URL parsing, mocked provider response, fail-closed errors.
- Test `tests/test_publicintel_render.mjs`: standalone page and empty state.
- Actual OpenOSINT installation/live GDELT feed: not performed in the build environment.
- Real Chromium visual test: blocked by local browser access policy; no visual browser pass claimed.

## Ethics and privacy
The original SIMPUL proposal excludes facial recognition and license plate recognition. Uphold that restriction. OpenOSINT's personal identity and cybersecurity reconnaissance capabilities are deliberately excluded. Public mentions are independently sourced contextual claims and need review for reliability; they do not confer a basis for enforcement.
