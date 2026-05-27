"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireAdminAuth = requireAdminAuth;
const queries_1 = require("../db/queries");
async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
    const token = authHeader.slice(7);
    const team = await (0, queries_1.getTeamByToken)(token);
    if (!team) {
        return res.status(401).json({ error: 'Invalid session token' });
    }
    req.team = team;
    next();
}
function requireAdminAuth(req, res, next) {
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
//# sourceMappingURL=auth.js.map