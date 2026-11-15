/**
 * SIMPUL view registry.
 *
 * UI pages register here; route labels and grouping are defined in data.js.
 * Keep render functions synchronous and side-effect-free at render time.
 * When adding a page, update this registry and views in data.js, then run:
 *   node tests/test_module_boundaries.mjs
 *   python tools/build_standalone.py
 */
import { renderVehicles } from './views/vehicles.js';
import { renderOverview } from './views/overview.js';
import { renderProject } from './views/project.js';
import { renderObservation } from './views/observation.js';
import { renderSurvey } from './views/survey.js';
import { renderOperations } from './views/operations.js';
import { renderMonitor } from './views/monitor.js';
import { renderClassification } from './views/classification.js';
import { renderPublicIntel } from './views/publicintel.js';
import { renderDiagnosis } from './views/diagnosis.js';
import { renderContext } from './views/context.js';
import { renderContextPlus } from './views/contextplus.js';
import { renderSimulation } from './views/simulation.js';
import { renderEvaluation } from './views/evaluation.js';
import { renderInsights } from './views/insights.js';
import { renderBusiness } from './views/business.js';
import { renderPipeline } from './views/pipeline.js';
import { renderEquipment } from './views/equipment.js';
import { renderStandards } from './views/standards.js';
import { renderReports } from './views/reports.js';
import { renderIntegrations } from './views/integrations.js';
import { renderSettings } from './views/settings.js';
import { renderMapview } from './views/mapview.js';
import { renderDocuments } from './views/documents.js';
import { renderCreators } from './views/creators.js';

export const pageRenderers = Object.freeze({
  overview: renderOverview,
  vehicles: renderVehicles,
  project: renderProject,
  observation: renderObservation,
  survey: renderSurvey,
  operations: renderOperations,
  monitor: renderMonitor,
  classification: renderClassification,
  publicintel: renderPublicIntel,
  diagnosis: renderDiagnosis,
  context: renderContext,
  contextplus: renderContextPlus,
  simulation: renderSimulation,
  evaluation: renderEvaluation,
  insights: renderInsights,
  business: renderBusiness,
  pipeline: renderPipeline,
  equipment: renderEquipment,
  standards: renderStandards,
  reports: renderReports,
  integrations: renderIntegrations,
  settings: renderSettings,
  mapview: renderMapview,
  documents: renderDocuments,
  creators: renderCreators,
});
