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
import { renderCctv } from './views/cctv.js';
import { renderOverview } from './views/overview.js';
import { renderProject } from './views/project.js';
import { renderPublicIntel } from './views/publicintel.js';
import { renderDiagnosis } from './views/diagnosis.js';
import { renderContext } from './views/context.js';
import { renderContextPlus } from './views/contextplus.js';
import { renderSimulation } from './views/simulation.js';
import { renderEvaluation } from './views/evaluation.js';
import { renderInsights } from './views/insights.js';
import { renderReports } from './views/reports.js';
import { renderIntegrations } from './views/integrations.js';
import { renderSettings } from './views/settings.js';
import { renderMapview } from './views/mapview.js';
import { renderCreators } from './views/creators.js';

export const pageRenderers = Object.freeze({
  overview: renderOverview,
  cctv: renderCctv,
  vehicles: renderVehicles,
  project: renderProject,
  publicintel: renderPublicIntel,
  diagnosis: renderDiagnosis,
  context: renderContext,
  contextplus: renderContextPlus,
  simulation: renderSimulation,
  evaluation: renderEvaluation,
  insights: renderInsights,
  reports: renderReports,
  integrations: renderIntegrations,
  settings: renderSettings,
  mapview: renderMapview,
  creators: renderCreators,
});
