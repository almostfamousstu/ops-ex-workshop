import { Router, Request, Response } from 'express';
import { requireAdminAuth } from '../middleware/auth';
import { createCohort, getCohortById, getTeamsByCohorId, listAllCohorts, getAllSubmissionsForTeam } from '../db/queries';
import { randomBytes } from 'crypto';
import { CreateCohortRequest, CreateCohortResponse } from '../types/api';

const router = Router();

// POST /api/admin/cohorts
router.post('/cohorts', requireAdminAuth, async (req: Request, res: Response) => {
  const { missionId = 'monaco-syndicate' } = req.body as CreateCohortRequest;

  // Generate a readable 8-char join code
  const joinCode = randomBytes(4).toString('hex').toUpperCase();

  const cohort = await createCohort(missionId, joinCode);
  const response: CreateCohortResponse = {
    cohortId: cohort.id,
    joinCode: cohort.joinCode,
    missionId,
  };
  return res.status(201).json(response);
});

// GET /api/admin/cohorts
router.get('/cohorts', requireAdminAuth, async (_req: Request, res: Response) => {
  const cohorts = await listAllCohorts();
  return res.json(cohorts);
});

// GET /api/admin/cohorts/:cohortId
router.get('/cohorts/:cohortId', requireAdminAuth, async (req: Request, res: Response) => {
  const cohort = await getCohortById(req.params.cohortId);
  if (!cohort) return res.status(404).json({ error: 'Cohort not found' });

  const teams = await getTeamsByCohorId(cohort.id);

  const teamsWithSubmissions = await Promise.all(
    teams.map(async (t: Record<string, unknown>) => {
      const subs = await getAllSubmissionsForTeam(t.id as string);
      return { ...t, submissions: subs };
    })
  );

  return res.json({ cohort, teams: teamsWithSubmissions });
});

export default router;
