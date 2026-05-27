"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const queries_1 = require("../db/queries");
const crypto_1 = require("crypto");
const router = (0, express_1.Router)();
// POST /api/admin/cohorts
router.post('/cohorts', auth_1.requireAdminAuth, async (req, res) => {
    const { missionId = 'monaco-syndicate' } = req.body;
    // Generate a readable 8-char join code
    const joinCode = (0, crypto_1.randomBytes)(4).toString('hex').toUpperCase();
    const cohort = await (0, queries_1.createCohort)(missionId, joinCode);
    const response = {
        cohortId: cohort.id,
        joinCode: cohort.joinCode,
        missionId,
    };
    return res.status(201).json(response);
});
// GET /api/admin/cohorts
router.get('/cohorts', auth_1.requireAdminAuth, async (_req, res) => {
    const cohorts = await (0, queries_1.listAllCohorts)();
    return res.json(cohorts);
});
// GET /api/admin/cohorts/:cohortId
router.get('/cohorts/:cohortId', auth_1.requireAdminAuth, async (req, res) => {
    const cohort = await (0, queries_1.getCohortById)(req.params.cohortId);
    if (!cohort)
        return res.status(404).json({ error: 'Cohort not found' });
    const teams = await (0, queries_1.getTeamsByCohorId)(cohort.id);
    const teamsWithSubmissions = await Promise.all(teams.map(async (t) => {
        const subs = await (0, queries_1.getAllSubmissionsForTeam)(t.id);
        return { ...t, submissions: subs };
    }));
    return res.json({ cohort, teams: teamsWithSubmissions });
});
exports.default = router;
//# sourceMappingURL=admin.js.map