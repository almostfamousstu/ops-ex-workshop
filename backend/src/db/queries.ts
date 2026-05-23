import pool from './pool';
import { randomBytes } from 'crypto';

export async function createCohort(missionId: string, joinCode: string): Promise<{ id: string; joinCode: string }> {
  const res = await pool.query(
    'INSERT INTO cohorts (mission_id, join_code) VALUES ($1, $2) RETURNING id, join_code',
    [missionId, joinCode]
  );
  return { id: res.rows[0].id, joinCode: res.rows[0].join_code };
}

export async function getCohortByJoinCode(joinCode: string) {
  const res = await pool.query(
    'SELECT id, mission_id, join_code, created_at, started_at FROM cohorts WHERE join_code = $1',
    [joinCode.toUpperCase()]
  );
  return res.rows[0] ?? null;
}

export async function getCohortById(cohortId: string) {
  const res = await pool.query(
    'SELECT id, mission_id, join_code, created_at, started_at FROM cohorts WHERE id = $1',
    [cohortId]
  );
  return res.rows[0] ?? null;
}

export async function createTeam(cohortId: string, callsign: string): Promise<{ id: string; sessionToken: string }> {
  const sessionToken = randomBytes(32).toString('hex');
  const res = await pool.query(
    `INSERT INTO teams (cohort_id, callsign, session_token)
     VALUES ($1, $2, $3)
     ON CONFLICT (cohort_id, callsign) DO NOTHING
     RETURNING id, session_token`,
    [cohortId, callsign, sessionToken]
  );
  if (res.rows.length === 0) {
    // Callsign already taken in this cohort
    throw new Error('CALLSIGN_TAKEN');
  }
  return { id: res.rows[0].id, sessionToken: res.rows[0].session_token };
}

export async function getTeamByToken(token: string) {
  const res = await pool.query(
    `SELECT t.id, t.cohort_id, t.callsign, t.current_gate, t.created_at,
            c.mission_id, c.join_code
     FROM teams t
     JOIN cohorts c ON c.id = t.cohort_id
     WHERE t.session_token = $1`,
    [token]
  );
  return res.rows[0] ?? null;
}

export async function advanceTeamGate(teamId: string, toGate: number) {
  await pool.query(
    'UPDATE teams SET current_gate = $1 WHERE id = $2 AND current_gate < $1',
    [toGate, teamId]
  );
}

export async function getTeamsByCohorId(cohortId: string) {
  const res = await pool.query(
    `SELECT t.id, t.callsign, t.current_gate, t.created_at
     FROM teams t WHERE t.cohort_id = $1 ORDER BY t.created_at`,
    [cohortId]
  );
  return res.rows;
}

export async function createSubmission(teamId: string, gateNumber: number, artifactJson: object): Promise<string> {
  const res = await pool.query(
    `INSERT INTO submissions (team_id, gate_number, artifact_json, status)
     VALUES ($1, $2, $3, 'evaluating')
     ON CONFLICT (team_id, gate_number)
     DO UPDATE SET artifact_json = EXCLUDED.artifact_json, status = 'evaluating',
                   quality_signals_json = NULL, feedback_text = NULL,
                   submitted_at = NOW(), evaluated_at = NULL
     RETURNING id`,
    [teamId, gateNumber, JSON.stringify(artifactJson)]
  );
  return res.rows[0].id;
}

export async function updateSubmissionEvaluation(
  submissionId: string,
  qualitySignals: object,
  feedbackText: string,
  status: 'complete' | 'error'
) {
  await pool.query(
    `UPDATE submissions
     SET quality_signals_json = $1, feedback_text = $2, status = $3, evaluated_at = NOW()
     WHERE id = $4`,
    [JSON.stringify(qualitySignals), feedbackText, status, submissionId]
  );
}

export async function getSubmission(teamId: string, gateNumber: number) {
  const res = await pool.query(
    `SELECT id, team_id, gate_number, artifact_json, status,
            quality_signals_json, feedback_text, submitted_at, evaluated_at
     FROM submissions WHERE team_id = $1 AND gate_number = $2`,
    [teamId, gateNumber]
  );
  return res.rows[0] ?? null;
}

export async function getAllSubmissionsForTeam(teamId: string) {
  const res = await pool.query(
    `SELECT gate_number, artifact_json, status, quality_signals_json, feedback_text, submitted_at, evaluated_at
     FROM submissions WHERE team_id = $1 ORDER BY gate_number`,
    [teamId]
  );
  return res.rows;
}

export async function upsertScenario(teamId: string): Promise<string> {
  const res = await pool.query(
    `INSERT INTO scenarios (team_id, status, acts_json)
     VALUES ($1, 'generating', '[]')
     ON CONFLICT (team_id)
     DO UPDATE SET status = 'generating', acts_json = '[]', generated_at = NOW(), completed_at = NULL
     RETURNING id`,
    [teamId]
  );
  return res.rows[0].id;
}

export async function appendScenarioAct(
  teamId: string,
  act: { act_number: number; act_title: string; prose: string }
) {
  await pool.query(
    `UPDATE scenarios
     SET acts_json = acts_json || $1::jsonb
     WHERE team_id = $2`,
    [JSON.stringify([act]), teamId]
  );
}

export async function completeScenario(
  teamId: string,
  outcomeType: string,
  weightedAggregate: number
) {
  await pool.query(
    `UPDATE scenarios
     SET status = 'complete', outcome_type = $1, weighted_aggregate = $2, completed_at = NOW()
     WHERE team_id = $3`,
    [outcomeType, weightedAggregate, teamId]
  );
}

export async function getScenario(teamId: string) {
  const res = await pool.query(
    `SELECT id, status, acts_json, outcome_type, weighted_aggregate, generated_at, completed_at
     FROM scenarios WHERE team_id = $1`,
    [teamId]
  );
  return res.rows[0] ?? null;
}

export async function updateScenarioStatus(teamId: string, status: 'generating' | 'complete' | 'error') {
  await pool.query(
    `UPDATE scenarios SET status = $1 WHERE team_id = $2`,
    [status, teamId]
  );
}

export async function listAllCohorts() {
  const res = await pool.query(
    `SELECT c.id, c.mission_id, c.join_code, c.created_at,
            COUNT(t.id)::int AS team_count
     FROM cohorts c
     LEFT JOIN teams t ON t.cohort_id = c.id
     GROUP BY c.id ORDER BY c.created_at DESC`
  );
  return res.rows;
}
