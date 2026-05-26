"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const queries_1 = require("../db/queries");
const router = (0, express_1.Router)();
// POST /api/cohorts/:joinCode/join
router.post('/:joinCode/join', async (req, res) => {
    const { joinCode } = req.params;
    const { callsign } = req.body;
    if (!callsign || callsign.trim().length < 2) {
        return res.status(400).json({ error: 'Callsign must be at least 2 characters' });
    }
    const cohort = await (0, queries_1.getCohortByJoinCode)(joinCode);
    if (!cohort) {
        return res.status(404).json({ error: 'Invalid join code' });
    }
    try {
        const team = await (0, queries_1.createTeam)(cohort.id, callsign.trim().toUpperCase());
        const response = {
            teamId: team.id,
            sessionToken: team.sessionToken,
            cohortId: cohort.id,
            missionId: cohort.mission_id,
        };
        return res.status(201).json(response);
    }
    catch (e) {
        if (e instanceof Error && e.message === 'CALLSIGN_TAKEN') {
            return res.status(409).json({ error: 'That callsign is already taken in this cohort. Choose another.' });
        }
        throw e;
    }
});
exports.default = router;
//# sourceMappingURL=cohorts.js.map