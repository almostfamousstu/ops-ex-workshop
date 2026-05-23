import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { upsertScenario, getScenario, getAllSubmissionsForTeam } from '../db/queries';
import { generateScenario } from '../services/scenarioService';
import { ScenarioResponse } from '../types/api';

const router = Router();

// POST /api/scenario/generate
router.post('/generate', requireAuth, async (req: Request, res: Response) => {
  const team = req.team!;

  if (team.current_gate < 4) {
    return res.status(403).json({ error: 'All four gates must be completed first' });
  }

  const submissions = await getAllSubmissionsForTeam(team.id);
  const completedGates = submissions.filter((s: Record<string, unknown>) => s.status === 'complete');
  if (completedGates.length < 4) {
    return res.status(403).json({ error: 'All gate evaluations must be complete before generating the scenario' });
  }

  await upsertScenario(team.id);

  // Fire async generation
  generateScenario(team.id, team.callsign, submissions).catch((err: Error) => {
    console.error(`Scenario generation failed for team ${team.id}:`, err.message);
  });

  return res.status(202).json({ status: 'generating' });
});

// GET /api/scenario
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const team = req.team!;
  const scenario = await getScenario(team.id);

  if (!scenario) {
    return res.status(404).json({ error: 'No scenario found. Call POST /scenario/generate first.' });
  }

  const response: ScenarioResponse = {
    status: scenario.status,
    acts: scenario.acts_json ?? [],
    outcomeType: scenario.outcome_type,
    weightedAggregate: scenario.weighted_aggregate,
  };

  return res.json(response);
});

export default router;
