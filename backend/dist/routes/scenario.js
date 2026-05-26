"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const queries_1 = require("../db/queries");
const scenarioService_1 = require("../services/scenarioService");
const router = (0, express_1.Router)();
// POST /api/scenario/generate
router.post('/generate', auth_1.requireAuth, async (req, res) => {
    const team = req.team;
    if (team.current_gate < 4) {
        return res.status(403).json({ error: 'All four gates must be completed first' });
    }
    const submissions = await (0, queries_1.getAllSubmissionsForTeam)(team.id);
    const completedGates = submissions.filter((s) => s.status === 'complete');
    if (completedGates.length < 4) {
        return res.status(403).json({ error: 'All gate evaluations must be complete before generating the scenario' });
    }
    await (0, queries_1.upsertScenario)(team.id);
    // Fire async generation
    (0, scenarioService_1.generateScenario)(team.id, team.callsign, submissions).catch((err) => {
        console.error(`Scenario generation failed for team ${team.id}:`, err.message);
    });
    return res.status(202).json({ status: 'generating' });
});
// GET /api/scenario
router.get('/', auth_1.requireAuth, async (req, res) => {
    const team = req.team;
    const scenario = await (0, queries_1.getScenario)(team.id);
    if (!scenario) {
        return res.status(404).json({ error: 'No scenario found. Call POST /scenario/generate first.' });
    }
    const response = {
        status: scenario.status,
        acts: scenario.acts_json ?? [],
        outcomeType: scenario.outcome_type,
        weightedAggregate: scenario.weighted_aggregate,
    };
    return res.json(response);
});
exports.default = router;
//# sourceMappingURL=scenario.js.map