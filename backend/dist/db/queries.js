"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCohort = createCohort;
exports.getCohortByJoinCode = getCohortByJoinCode;
exports.getCohortById = getCohortById;
exports.createTeam = createTeam;
exports.getTeamByToken = getTeamByToken;
exports.advanceTeamGate = advanceTeamGate;
exports.getTeamsByCohorId = getTeamsByCohorId;
exports.createSubmission = createSubmission;
exports.updateSubmissionEvaluation = updateSubmissionEvaluation;
exports.getSubmission = getSubmission;
exports.getAllSubmissionsForTeam = getAllSubmissionsForTeam;
exports.upsertScenario = upsertScenario;
exports.appendScenarioAct = appendScenarioAct;
exports.completeScenario = completeScenario;
exports.getScenario = getScenario;
exports.updateScenarioStatus = updateScenarioStatus;
exports.listAllCohorts = listAllCohorts;
const pool_1 = __importDefault(require("./pool"));
const crypto_1 = require("crypto");
async function createCohort(missionId, joinCode) {
    const res = await pool_1.default.query('INSERT INTO cohorts (mission_id, join_code) VALUES ($1, $2) RETURNING id, join_code', [missionId, joinCode]);
    return { id: res.rows[0].id, joinCode: res.rows[0].join_code };
}
async function getCohortByJoinCode(joinCode) {
    const res = await pool_1.default.query('SELECT id, mission_id, join_code, created_at, started_at FROM cohorts WHERE join_code = $1', [joinCode.toUpperCase()]);
    return res.rows[0] ?? null;
}
async function getCohortById(cohortId) {
    const res = await pool_1.default.query('SELECT id, mission_id, join_code, created_at, started_at FROM cohorts WHERE id = $1', [cohortId]);
    return res.rows[0] ?? null;
}
async function createTeam(cohortId, callsign) {
    const sessionToken = (0, crypto_1.randomBytes)(32).toString('hex');
    const res = await pool_1.default.query(`INSERT INTO teams (cohort_id, callsign, session_token)
     VALUES ($1, $2, $3)
     ON CONFLICT (cohort_id, callsign) DO NOTHING
     RETURNING id, session_token`, [cohortId, callsign, sessionToken]);
    if (res.rows.length === 0) {
        // Callsign already taken in this cohort
        throw new Error('CALLSIGN_TAKEN');
    }
    return { id: res.rows[0].id, sessionToken: res.rows[0].session_token };
}
async function getTeamByToken(token) {
    const res = await pool_1.default.query(`SELECT t.id, t.cohort_id, t.callsign, t.current_gate, t.created_at,
            c.mission_id, c.join_code
     FROM teams t
     JOIN cohorts c ON c.id = t.cohort_id
     WHERE t.session_token = $1`, [token]);
    return res.rows[0] ?? null;
}
async function advanceTeamGate(teamId, toGate) {
    await pool_1.default.query('UPDATE teams SET current_gate = $1 WHERE id = $2 AND current_gate < $1', [toGate, teamId]);
}
async function getTeamsByCohorId(cohortId) {
    const res = await pool_1.default.query(`SELECT t.id, t.callsign, t.current_gate, t.created_at
     FROM teams t WHERE t.cohort_id = $1 ORDER BY t.created_at`, [cohortId]);
    return res.rows;
}
async function createSubmission(teamId, gateNumber, artifactJson) {
    const res = await pool_1.default.query(`INSERT INTO submissions (team_id, gate_number, artifact_json, status)
     VALUES ($1, $2, $3, 'evaluating')
     ON CONFLICT (team_id, gate_number)
     DO UPDATE SET artifact_json = EXCLUDED.artifact_json, status = 'evaluating',
                   quality_signals_json = NULL, feedback_text = NULL,
                   submitted_at = NOW(), evaluated_at = NULL
     RETURNING id`, [teamId, gateNumber, JSON.stringify(artifactJson)]);
    return res.rows[0].id;
}
async function updateSubmissionEvaluation(submissionId, qualitySignals, feedbackText, status) {
    await pool_1.default.query(`UPDATE submissions
     SET quality_signals_json = $1, feedback_text = $2, status = $3, evaluated_at = NOW()
     WHERE id = $4`, [JSON.stringify(qualitySignals), feedbackText, status, submissionId]);
}
async function getSubmission(teamId, gateNumber) {
    const res = await pool_1.default.query(`SELECT id, team_id, gate_number, artifact_json, status,
            quality_signals_json, feedback_text, submitted_at, evaluated_at
     FROM submissions WHERE team_id = $1 AND gate_number = $2`, [teamId, gateNumber]);
    return res.rows[0] ?? null;
}
async function getAllSubmissionsForTeam(teamId) {
    const res = await pool_1.default.query(`SELECT gate_number, artifact_json, status, quality_signals_json, feedback_text, submitted_at, evaluated_at
     FROM submissions WHERE team_id = $1 ORDER BY gate_number`, [teamId]);
    return res.rows;
}
async function upsertScenario(teamId) {
    const res = await pool_1.default.query(`INSERT INTO scenarios (team_id, status, acts_json)
     VALUES ($1, 'generating', '[]')
     ON CONFLICT (team_id)
     DO UPDATE SET status = 'generating', acts_json = '[]', generated_at = NOW(), completed_at = NULL
     RETURNING id`, [teamId]);
    return res.rows[0].id;
}
async function appendScenarioAct(teamId, act) {
    await pool_1.default.query(`UPDATE scenarios
     SET acts_json = acts_json || $1::jsonb
     WHERE team_id = $2`, [JSON.stringify([act]), teamId]);
}
async function completeScenario(teamId, outcomeType, weightedAggregate) {
    await pool_1.default.query(`UPDATE scenarios
     SET status = 'complete', outcome_type = $1, weighted_aggregate = $2, completed_at = NOW()
     WHERE team_id = $3`, [outcomeType, weightedAggregate, teamId]);
}
async function getScenario(teamId) {
    const res = await pool_1.default.query(`SELECT id, status, acts_json, outcome_type, weighted_aggregate, generated_at, completed_at
     FROM scenarios WHERE team_id = $1`, [teamId]);
    return res.rows[0] ?? null;
}
async function updateScenarioStatus(teamId, status) {
    await pool_1.default.query(`UPDATE scenarios SET status = $1 WHERE team_id = $2`, [status, teamId]);
}
async function listAllCohorts() {
    const res = await pool_1.default.query(`SELECT c.id, c.mission_id, c.join_code, c.created_at,
            COUNT(t.id)::int AS team_count
     FROM cohorts c
     LEFT JOIN teams t ON t.cohort_id = c.id
     GROUP BY c.id ORDER BY c.created_at DESC`);
    return res.rows;
}
//# sourceMappingURL=queries.js.map