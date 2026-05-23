import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { getAllSubmissionsForTeam } from '../db/queries';
import { TeamStateResponse } from '../types/api';

const router = Router();

// GET /api/teams/me/state
router.get('/me/state', requireAuth, async (req: Request, res: Response) => {
  const team = req.team!;
  const submissions = await getAllSubmissionsForTeam(team.id);

  const response: TeamStateResponse = {
    teamId: team.id,
    callsign: team.callsign,
    cohortId: team.cohort_id,
    missionId: team.mission_id,
    currentGate: team.current_gate,
    submissions: submissions.map((s: Record<string, unknown>) => ({
      gateNumber: s.gate_number as number,
      artifact: s.artifact_json as Record<string, unknown> | undefined,
      status: s.status as 'evaluating' | 'complete' | 'error',
      qualitySignals: s.quality_signals_json as Record<string, unknown> | undefined,
      feedbackText: s.feedback_text as string | undefined,
      submittedAt: (s.submitted_at as Date).toISOString(),
      evaluatedAt: s.evaluated_at ? (s.evaluated_at as Date).toISOString() : undefined,
    })),
  };

  return res.json(response);
});

export default router;
