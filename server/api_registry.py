"""Single authoritative registry for SIMPUL API routers.

To add a backend API capability:
1. Implement an APIRouter in a dedicated server/<module>.py.
2. Register it below without changing the simulation entrypoint.
3. Add contract tests and update config/module-catalog.json.
4. Update docs/API_REFERENCE.md and README if the user workflow changes.

Importing this registry does not execute external API calls.
"""
from __future__ import annotations
from fastapi import FastAPI, APIRouter
from server.simulation_api import router as simulation_router
from server.extra_routes import router as integrations_router
from server.extended_routes import router as context_router
from server.monitoring import router as monitoring_router
from server.field_readings import router as field_router
from server.international import router as evidence_router
from server.traffic_classification import router as classification_router
from server.public_intelligence import router as public_intelligence_router
from server.document_evidence import router as document_evidence_router
from server.decision_brief import router as decision_brief_router

API_ROUTERS: tuple[tuple[str, APIRouter], ...] = (
    ('simulation', simulation_router),
    ('integrations', integrations_router),
    ('context', context_router),
    ('monitoring', monitoring_router),
    ('field_observations', field_router),
    ('evidence_quality', evidence_router),
    ('traffic_classification', classification_router),
    ('public_intelligence', public_intelligence_router),
    ('pdf_observations', document_evidence_router),
    ('decision_brief', decision_brief_router),
)

def register_api_routers(app: FastAPI) -> None:
    for _, router in API_ROUTERS:
        app.include_router(router)
