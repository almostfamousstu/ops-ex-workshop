"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const queries_1 = require("../db/queries");
const router = (0, express_1.Router)();
// GET /api/teams/me/state
router.get('/me/state', auth_1.requireAuth, async (req, res) => {
    const team = req.team;
    const submissions = await (0, queries_1.getAllSubmissionsForTeam)(team.id);
    const response = {
        teamId: team.id,
        callsign: team.callsign,
        cohortId: team.cohort_id,
        missionId: team.mission_id,
        currentGate: team.current_gate,
        submissions: submissions.map((s) => ({
            gateNumber: s.gate_number,
            artifact: s.artifact_json,
            status: s.status,
            qualitySignals: s.quality_signals_json,
            feedbackText: s.feedback_text,
            submittedAt: s.submitted_at.toISOString(),
            evaluatedAt: s.evaluated_at ? s.evaluated_at.toISOString() : undefined,
        })),
    };
    return res.json(response);
});
exports.default = router;
//# sourceMappingURL=teams.js.map