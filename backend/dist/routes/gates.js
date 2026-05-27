"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const missionSpec_1 = require("../services/missionSpec");
const queries_1 = require("../db/queries");
const evaluation_1 = require("../services/evaluation");
const router = (0, express_1.Router)();
// GET /api/gates/:gateNumber
router.get('/:gateNumber', auth_1.requireAuth, async (req, res) => {
    const gateNumber = parseInt(req.params.gateNumber, 10);
    if (isNaN(gateNumber) || gateNumber < 1 || gateNumber > 4) {
        return res.status(400).json({ error: 'Invalid gate number' });
    }
    const team = req.team;
    if (team.current_gate < gateNumber - 1) {
        return res.status(403).json({ error: 'Gate not yet unlocked' });
    }
    const gate = (0, missionSpec_1.getGate)(gateNumber);
    const response = {
        gateNumber: gate.number,
        name: gate.name,
        skillFocus: gate.skill_focus,
        briefing: gate.briefing,
        instructions: gate.instructions,
        artifactSchema: gate.artifact_schema,
        hasMaterials: !!(gate.materials && gate.materials.length > 0),
    };
    return res.json(response);
});
// POST /api/gates/:gateNumber/submit
router.post('/:gateNumber/submit', auth_1.requireAuth, async (req, res) => {
    const gateNumber = parseInt(req.params.gateNumber, 10);
    if (isNaN(gateNumber) || gateNumber < 1 || gateNumber > 4) {
        return res.status(400).json({ error: 'Invalid gate number' });
    }
    const team = req.team;
    if (team.current_gate < gateNumber - 1) {
        return res.status(403).json({ error: 'Gate not yet unlocked' });
    }
    const { artifact } = req.body;
    if (!artifact || typeof artifact !== 'object') {
        return res.status(400).json({ error: 'artifact is required' });
    }
    const submissionId = await (0, queries_1.createSubmission)(team.id, gateNumber, artifact);
    // Advance gate tracking immediately (teams always progress)
    await (0, queries_1.advanceTeamGate)(team.id, gateNumber);
    // Kick off async evaluation (no await — fire and forget)
    (0, evaluation_1.evaluateGate)(submissionId, gateNumber, artifact, team).catch((err) => {
        console.error(`Evaluation failed for submission ${submissionId}:`, err.message);
    });
    return res.status(202).json({ submissionId, status: 'evaluating' });
});
// GET /api/gates/:gateNumber/evaluation
router.get('/:gateNumber/evaluation', auth_1.requireAuth, async (req, res) => {
    const gateNumber = parseInt(req.params.gateNumber, 10);
    if (isNaN(gateNumber) || gateNumber < 1 || gateNumber > 4) {
        return res.status(400).json({ error: 'Invalid gate number' });
    }
    const team = req.team;
    const submission = await (0, queries_1.getSubmission)(team.id, gateNumber);
    if (!submission) {
        return res.status(404).json({ error: 'No submission found for this gate' });
    }
    const response = {
        status: submission.status,
        feedbackText: submission.feedback_text,
        qualitySignals: submission.quality_signals_json,
        evaluatedAt: submission.evaluated_at?.toISOString(),
    };
    return res.json(response);
});
// POST /api/gates/:gateNumber/extract-dossier
router.post('/:gateNumber/extract-dossier', auth_1.requireAuth, async (req, res) => {
    const gateNumber = parseInt(req.params.gateNumber, 10);
    if (gateNumber !== 1) {
        return res.status(400).json({ error: 'Dossier extraction is only available for Gate 1' });
    }
    const { step3Output } = req.body;
    if (!step3Output || typeof step3Output !== 'string' || step3Output.trim().length === 0) {
        return res.status(400).json({ error: 'step3Output must be a non-empty string' });
    }
    try {
        const fields = await (0, evaluation_1.extractDossierFields)(step3Output);
        return res.json(fields);
    }
    catch (err) {
        console.error('Dossier extraction failed:', err);
        return res.status(502).json({ error: 'Extraction service unavailable' });
    }
});
exports.default = router;
//# sourceMappingURL=gates.js.map