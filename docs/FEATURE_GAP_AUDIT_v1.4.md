# SIMPUL v1.4 — Feature Gap Audit

**Audited baseline:** SIMPUL Strix-Ready v1.3.  
**Reference:** `reference/SIMPUL_iSeeDesignITB_Proposal.pdf` (five-page iSeeDesignITB submission).  
**Audit scope:** user journeys, field-observation completeness, operation follow-through, evidence provenance, security and deployment. This is a feature audit and regression review, not an independent transport or penetration-testing certification.

## A. Prioritized missing capabilities

| Priority | Gap identified in v1.3 | Consequence | Action in v1.4 | Evidence |
|---|---|---|---|---|
| P0 | No structured plan to track the proposed 12 field sessions (30–60 min each) | Field teams could collect many samples in one period while missing other conditions | **Implemented:** editable 3-zone × 2-period × 2-repeat planning matrix; reviewed manual sessions only | `js/pilot.js`, `js/views/survey.js`, `tests/test_pilot.mjs` |
| P0 | No quality review of individual sessions before treating them as coverage | Incomplete or mistimed observations could be counted as a complete baseline | **Implemented:** internal review, source/zone/time/duration checks, zero-activity confirmation, gap reasons | `js/pilot.js`, `js/views/survey.js` |
| P0 | P1/P2 classification was disconnected from assigned operational follow-up | High-priority obstruction reports could remain unaddressed | **Implemented:** case creation, owner, optional due date, status transitions and audit entries | `js/operations.js`, `js/views/operations.js`, `tests/test_operations.mjs` |
| P1 | No privacy-reduced export of assigned operational responses | Handoffs would require copying raw field notes | **Implemented:** structured case export without raw notes or personal identifiers | `exportOperations` |
| P1 | Active survey sessions did not capture an explicit peak/off-peak label | Sessions could not reliably populate a period-based study plan | **Implemented:** period selection when starting a session; old unlabeled sessions remain unknown | `js/views/observation.js`, `js/app.js` |
| P1 | Survey sessions could include events with mismatched zones/times | An incorrectly linked event might support an invalid review | **Implemented:** session event consistency guard | `sessionQuality` |

### How the planning matrix relates to the proposal

The proposal plans **12 sessions of 30–60 minutes** but does **not** specify the exact allocation of those sessions. SIMPUL's initial distribution (three zones, peak/off-peak, two repetitions) is therefore an **editable implementation assumption**. It must be refined using the actual study boundary, traffic study design and stakeholder feedback.

## B. Remaining requirements before field or public deployment

| Severity | Remaining limitation | Acceptance gate / evidence required |
|---|---|---|
| **Critical for public deployment** | No individual user authentication, role-based access control, organization isolation or review signatures. Optional API Bearer token is a shared development credential. | Implement tested identity/RBAC, tenancy, audit integrity, HTTPS and secure session management before collecting operational data on a shared server. |
| **Critical for field validation** | Fatmawati geometry, observed volumes and pedestrian movements are not independently surveyed/calibrated. SUMO uses a synthetic network. | Complete licensed/authorized observations; independent calibration/validation; publish goodness-of-fit metrics, uncertainty and rejected runs. |
| **Critical for multi-device operations** | Survey plans/reviews and operational cases persist in browser storage only; existing SQLite sync does not cover these new records. | Implement versioned transactional sync and conflict resolution, authenticated APIs and offline synchronization tests. |
| **High** | No real-time alert delivery or dispatch acknowledgment. | Add controlled notification channels, recipient roles, deduplication, escalation and tested delivery behavior before claiming monitoring alerts. |
| **High** | No direct official police or transit-operator workflow integration. | Establish authorization/contract, governance, interoperability contract and independent acceptance tests; retain legalConclusion `NOT_DETERMINED`. |
| **High** | No independent evidence-signing or controlled retention/purge policy. | Implement tamper-evident event revision chain, retention rules, lawful deletion, evidence access logs and policy review. |
| **High** | No independently validated, representative vehicle detection AI. | Permissioned dataset, human annotations, test-set separation and measured precision/recall/F1. F1 = 0.80 remains a target. |
| **Medium** | No exposure-aware congestion predictions or quantified causal impact. | Conduct controlled pilots with matched baselines, covariate checks and measured intervention outcomes. |
| **Medium** | Strix full autonomous scan and live Grafana/InfluxDB Docker run not executed in this environment. | Run in authorized local setup; retain logs, findings and remediation regression evidence. |
| **Medium** | PWA localStorage is not a reliable long-term multi-person field database. | Move durable offline records to IndexedDB plus server-side reconciliation; test recovery from device and network failures. |

## C. What the new modules do **not** prove

- A session labeled internally as `approved` is **not externally certified** or validated against a field reference sensor.
- A 12/12 survey coverage result is **not proof that SUMO is calibrated**.
- An operational P1/P2 label is a **triage priority**, not a traffic-law classification.
- A `resolved` internal case is a documented team follow-up, **not an official police disposition**.
- All initial example traffic data remain synthetic, even when displayed alongside an otherwise working workflow.

## D. Next development order

1. Authenticated organization workspaces and secure sync for sessions, reviews and response cases.
2. Survey methodology finalization and authorized Fatmawati field campaign.
3. Calibrated SUMO model with independent validation data and uncertainty.
4. Accessibilty/transport-operator acceptance testing and post-intervention evaluation.
5. Production observability, consent/retention controls and a second security review including a real Strix run.
