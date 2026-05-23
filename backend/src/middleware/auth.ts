import { Request, Response, NextFunction } from 'express';
import { getTeamByToken } from '../db/queries';

declare global {
  namespace Express {
    interface Request {
      team?: {
        id: string;
        cohort_id: string;
        callsign: string;
        current_gate: number;
        mission_id: string;
        join_code: string;
        created_at: Date;
      };
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.slice(7);
  const team = await getTeamByToken(token);
  if (!team) {
    return res.status(401).json({ error: 'Invalid session token' });
  }

  req.team = team;
  next();
}

export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    return res.status(500).json({ error: 'Admin token not configured' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${adminToken}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}
