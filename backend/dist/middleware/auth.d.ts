import { Request, Response, NextFunction } from 'express';
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
export declare function requireAuth(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function requireAdminAuth(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.d.ts.map