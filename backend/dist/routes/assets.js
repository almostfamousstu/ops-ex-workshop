"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const minio_1 = require("../services/minio");
const missionSpec_1 = require("../services/missionSpec");
const router = (0, express_1.Router)();
const CONTENT_TYPES = {
    '.csv': 'text/csv',
    '.txt': 'text/plain; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
};
function contentTypeFor(filename) {
    const ext = filename.slice(filename.lastIndexOf('.'));
    return CONTENT_TYPES[ext] ?? 'application/octet-stream';
}
async function streamMaterial(res, material) {
    const stream = await (0, minio_1.getMinioStream)(material.minio_key);
    res.setHeader('Content-Type', contentTypeFor(material.filename));
    res.setHeader('Content-Disposition', `attachment; filename="${material.filename}"`);
    res.setHeader('Cache-Control', 'no-store');
    stream.pipe(res);
}
// GET /api/assets/gate3-intercept
// Streams the Gate 3 RFID CSV — requires Gate 2 to be completed
router.get('/gate3-intercept', auth_1.requireAuth, async (req, res) => {
    const team = req.team;
    if (team.current_gate < 2) {
        return res.status(403).json({ error: 'Gate 3 materials are not yet available' });
    }
    const gate = (0, missionSpec_1.getGate)(3);
    const material = gate.materials?.find((m) => m.id === 'gate3_intercept');
    if (!material) {
        return res.status(404).json({ error: 'Material not found in mission spec' });
    }
    await streamMaterial(res, material);
});
// GET /api/assets/gate2-renoux-profile
router.get('/gate2-renoux-profile', auth_1.requireAuth, async (req, res) => {
    const team = req.team;
    if (team.current_gate < 1) {
        return res.status(403).json({ error: 'Gate 2 materials are not yet available' });
    }
    const gate = (0, missionSpec_1.getGate)(2);
    const material = gate.materials?.find((m) => m.id === 'gate2_renoux_profile');
    if (!material)
        return res.status(404).json({ error: 'Material not found in mission spec' });
    await streamMaterial(res, material);
});
// GET /api/assets/gate2-auction-programme
router.get('/gate2-auction-programme', auth_1.requireAuth, async (req, res) => {
    const team = req.team;
    if (team.current_gate < 1) {
        return res.status(403).json({ error: 'Gate 2 materials are not yet available' });
    }
    const gate = (0, missionSpec_1.getGate)(2);
    const material = gate.materials?.find((m) => m.id === 'gate2_auction_programme');
    if (!material)
        return res.status(404).json({ error: 'Material not found in mission spec' });
    await streamMaterial(res, material);
});
// GET /api/assets/gate2-hermitage-schematic
router.get('/gate2-hermitage-schematic', auth_1.requireAuth, async (req, res) => {
    const team = req.team;
    if (team.current_gate < 1) {
        return res.status(403).json({ error: 'Gate 2 materials are not yet available' });
    }
    const gate = (0, missionSpec_1.getGate)(2);
    const material = gate.materials?.find((m) => m.id === 'gate2_hermitage_schematic');
    if (!material)
        return res.status(404).json({ error: 'Material not found in mission spec' });
    await streamMaterial(res, material);
});
// GET /api/assets/gate2-intercept-fragment
router.get('/gate2-intercept-fragment', auth_1.requireAuth, async (req, res) => {
    const team = req.team;
    if (team.current_gate < 1) {
        return res.status(403).json({ error: 'Gate 2 materials are not yet available' });
    }
    const gate = (0, missionSpec_1.getGate)(2);
    const material = gate.materials?.find((m) => m.id === 'gate2_intercept_fragment');
    if (!material)
        return res.status(404).json({ error: 'Material not found in mission spec' });
    await streamMaterial(res, material);
});
exports.default = router;
//# sourceMappingURL=assets.js.map