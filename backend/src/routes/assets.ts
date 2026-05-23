import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { getPresignedUrl } from '../services/minio';
import { getGate } from '../services/missionSpec';

const router = Router();

// GET /api/assets/gate3-intercept
// Returns a presigned URL to download the Gate 3 RFID CSV
router.get('/gate3-intercept', requireAuth, async (req: Request, res: Response) => {
  const team = req.team!;

  // Only available once Gate 2 is passed (gate_number >= 2 means current_gate >= 2)
  if (team.current_gate < 2) {
    return res.status(403).json({ error: 'Gate 3 materials are not yet available' });
  }

  const gate = getGate(3);
  const material = gate.materials?.find((m) => m.id === 'gate3_intercept');
  if (!material) {
    return res.status(404).json({ error: 'Material not found in mission spec' });
  }

  const url = await getPresignedUrl(material.minio_key, 3600);
  return res.json({ url, filename: material.filename, label: material.label });
});

// GET /api/assets/gate2-renoux-profile
router.get('/gate2-renoux-profile', requireAuth, async (req: Request, res: Response) => {
  const team = req.team!;
  if (team.current_gate < 1) {
    return res.status(403).json({ error: 'Gate 2 materials are not yet available' });
  }
  const gate = getGate(2);
  const material = gate.materials?.find((m) => m.id === 'gate2_renoux_profile');
  if (!material) {
    return res.status(404).json({ error: 'Material not found in mission spec' });
  }
  const url = await getPresignedUrl(material.minio_key, 3600);
  return res.json({ url, filename: material.filename, label: material.label });
});

// GET /api/assets/gate2-auction-programme
router.get('/gate2-auction-programme', requireAuth, async (req: Request, res: Response) => {
  const team = req.team!;
  if (team.current_gate < 1) {
    return res.status(403).json({ error: 'Gate 2 materials are not yet available' });
  }
  const gate = getGate(2);
  const material = gate.materials?.find((m) => m.id === 'gate2_auction_programme');
  if (!material) {
    return res.status(404).json({ error: 'Material not found in mission spec' });
  }
  const url = await getPresignedUrl(material.minio_key, 3600);
  return res.json({ url, filename: material.filename, label: material.label });
});

// GET /api/assets/gate2-hermitage-schematic
router.get('/gate2-hermitage-schematic', requireAuth, async (req: Request, res: Response) => {
  const team = req.team!;
  if (team.current_gate < 1) {
    return res.status(403).json({ error: 'Gate 2 materials are not yet available' });
  }
  const gate = getGate(2);
  const material = gate.materials?.find((m) => m.id === 'gate2_hermitage_schematic');
  if (!material) {
    return res.status(404).json({ error: 'Material not found in mission spec' });
  }
  const url = await getPresignedUrl(material.minio_key, 3600);
  return res.json({ url, filename: material.filename, label: material.label });
});

// GET /api/assets/gate2-intercept-fragment
router.get('/gate2-intercept-fragment', requireAuth, async (req: Request, res: Response) => {
  const team = req.team!;
  if (team.current_gate < 1) {
    return res.status(403).json({ error: 'Gate 2 materials are not yet available' });
  }
  const gate = getGate(2);
  const material = gate.materials?.find((m) => m.id === 'gate2_intercept_fragment');
  if (!material) {
    return res.status(404).json({ error: 'Material not found in mission spec' });
  }
  const url = await getPresignedUrl(material.minio_key, 3600);
  return res.json({ url, filename: material.filename, label: material.label });
});

export default router;
