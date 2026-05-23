import { Router, Request, Response } from 'express';
import { getCohortByJoinCode, createTeam } from '../db/queries';
import { JoinCohortRequest, JoinCohortResponse } from '../types/api';

const router = Router();

// POST /api/cohorts/:joinCode/join
router.post('/:joinCode/join', async (req: Request, res: Response) => {
  const { joinCode } = req.params;
  const { callsign } = req.body as JoinCohortRequest;

  if (!callsign || callsign.trim().length < 2) {
    return res.status(400).json({ error: 'Callsign must be at least 2 characters' });
  }

  const cohort = await getCohortByJoinCode(joinCode);
  if (!cohort) {
    return res.status(404).json({ error: 'Invalid join code' });
  }

  try {
    const team = await createTeam(cohort.id, callsign.trim().toUpperCase());
    const response: JoinCohortResponse = {
      teamId: team.id,
      sessionToken: team.sessionToken,
      cohortId: cohort.id,
      missionId: cohort.mission_id,
    };
    return res.status(201).json(response);
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'CALLSIGN_TAKEN') {
      return res.status(409).json({ error: 'That callsign is already taken in this cohort. Choose another.' });
    }
    throw e;
  }
});

export default router;
