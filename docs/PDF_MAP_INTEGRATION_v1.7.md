# SIMPUL v1.7: Peta Koridor dan PDF Observation Finder

## Scope

This release supplements, but does not replace, the original four-stage SIMPUL proposal. It supports retrospective searches in observation PDFs uploaded by the user. It does not identify a unique vehicle, recognize license plates, associate observations with drivers, or locate anyone in real time.

## Verified local workflow

1. Start the FastAPI backend.
2. Open **Pencarian catatan PDF** and upload an authorized PDF observation report.
3. PyMuPDF reads embedded PDF text. Only lines containing an explicit timestamp, zone, and vehicle type become candidate records.
4. Optional fields, when written, are color, activity and GPS coordinates.
5. The app indexes these fields with page/line provenance in SQLite and returns explicitly unverified candidate records.
6. Use the search fields to filter by date, time interval, zone, vehicle category/subcategory, and color.
7. Open **Peta koridor interaktif**. Coordinates explicitly present in the PDF appear as unverified observation points. Records lacking coordinates remain listed but do not receive invented pins.
8. A surveyor may place zone-level reference points by clicking the map, which are labeled as manually defined zones rather than vehicle positions.

## Map sources and API

- Leaflet 1.9.4 is served on demand from local assets/vendor/leaflet, including its BSD license. The browser requests OSM tiles for the visible viewport when online.
- OpenStreetMap standard raster tiles provide the base map: `https://tile.openstreetmap.org/{z}/{x}/{y}.png` with visible OpenStreetMap attribution.
- Initial station reference: `-6.29247, 106.79245` from published OpenStreetMap-derived station data. It is not a surveyed curb position.
- Nominatim and Overpass API integrations continue to exist in the previous **Peta & data konteks** page.
- OSM tile use is subject to the [OSM Foundation tile use policy](https://operations.osmfoundation.org/policies/tiles/). No bulk or offline tile download. Switch to a managed provider for production.
- The standalone HTML works as an offline UI demonstration, but external map tiles and the PDF import backend require an internet connection and server, respectively.

## PDF processing implementation

| Stage | Implementation | Evidence status |
| --- | --- | --- |
| PDF upload | `POST /api/v1/documents/import` | Operator-submitted document |
| Embedded-text extraction | PyMuPDF | Actual parsed text |
| Scanned-PDF OCR | Topdu/OpenOCR optional CLI, `openocr --task doc` | Available only after local installation and opt-in; not executed during current verification |
| Structured records | Conservative deterministic parser | Candidate, unverified |
| Search | `GET /api/v1/documents/records` | Matching indexed document records |
| GeoJSON points | `GET /api/v1/documents/map` | Explicit PDF coordinates only |
| Health | `GET /api/v1/documents/status` | Runtime package status |

For optional OpenOCR, install `openocr-python==0.1.5` in a separate controlled Python environment with the model dependencies specified by the upstream project; enable the flag `SIMPUL_OPENOCR_ENABLED=1` only after that environment is ready. Model binaries are not bundled. OCR accuracy for Indonesian field-report structures has not been measured. An empty OCR result does not prove there were no events.

## Supported demo document

`examples/SIMPUL_Observations_SYNTHETIC.pdf` contains four synthetic observation lines. It is safe for demos and regression testing, and it does not describe real vehicles.

## Limitations and risk controls

- No face detection, plate-number matching, owner identification, live CCTV search, or external people/location tracking.
- PDF contents are processed locally and not retained as raw files. Structured non-personal observation fields are stored in a local SQLite database without multi-user authorization.
- Input caps are 10 MB and 30 pages; downstream OpenOCR is opt-in, has a timeout, and should be placed in a worker sandbox for production.
- A derived record includes document ID, filename, page, source, and review state. It must not be used as direct enforcement evidence without human review.
- Date/time formats beyond the documented format may not be recognized. GPS is not inferred from zone labels.
- Local Leaflet, explicit-coordinate pins, provenance popups, error states and mobile rendering were exercised in an isolated browser against the Pi deployment. Automated tests block OSM tile traffic. Live basemap availability follows browser connectivity and is displayed on the map.
- The SIMPUL reference proposal does not authorize collecting identity information or reading license plates.
