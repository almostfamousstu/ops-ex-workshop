"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateScenario = generateScenario;
const llmMeshClient_1 = require("./llmMeshClient");
const missionSpec_1 = require("./missionSpec");
const queries_1 = require("../db/queries");
function computeWeightedAggregate(submissions, signalWeights) {
    let totalWeight = 0;
    let weightedSum = 0;
    for (const [key, weight] of Object.entries(signalWeights)) {
        for (const sub of submissions) {
            const signals = sub.quality_signals_json;
            if (signals && key in signals) {
                const val = signals[key];
                const numeric = typeof val === 'boolean' ? (val ? 1 : 0) : typeof val === 'number' ? val : null;
                if (numeric !== null) {
                    weightedSum += numeric * weight;
                    totalWeight += weight;
                }
            }
        }
    }
    if (totalWeight === 0)
        return 0;
    return Math.round((weightedSum / totalWeight) * 100) / 100;
}
function determineOutcomeType(aggregate, thresholds) {
    const cleanVal = parseFloat(thresholds.clean_success.replace('>=', '').trim());
    const partialVal = parseFloat(thresholds.partial_success.replace('>=', '').trim());
    if (aggregate >= cleanVal)
        return 'clean_success';
    if (aggregate >= partialVal)
        return 'partial_success';
    return 'failure';
}
function buildArtifactsMarkdown(submissions) {
    const gates = (0, missionSpec_1.getAllGates)();
    return submissions
        .map((sub) => {
        const gateNum = sub.gate_number;
        const gate = gates.find((g) => g.number === gateNum);
        const gateName = gate ? gate.name : `Gate ${gateNum}`;
        const artifact = sub.artifact_json;
        return `### Gate ${gateNum}: ${gateName}\n\`\`\`json\n${JSON.stringify(artifact, null, 2)}\n\`\`\``;
    })
        .join('\n\n');
}
async function generateScenario(teamId, callsign, submissions) {
    const scenarioPlayer = (0, missionSpec_1.getScenarioPlayer)();
    const weightedAggregate = computeWeightedAggregate(submissions, scenarioPlayer.signal_weights);
    const outcomeType = determineOutcomeType(weightedAggregate, scenarioPlayer.outcome_thresholds);
    const artifactsMarkdown = buildArtifactsMarkdown(submissions);
    const qualitySignalsAll = {};
    for (const sub of submissions) {
        const signals = sub.quality_signals_json;
        if (signals) {
            const gateNum = sub.gate_number;
            for (const [k, v] of Object.entries(signals)) {
                qualitySignalsAll[`gate${gateNum}_${k}`] = v;
            }
        }
    }
    const prompt = scenarioPlayer.prompt_template
        .replace(/\{\{callsign\}\}/g, callsign)
        .replace(/\{\{quality_signals_json\}\}/g, JSON.stringify(qualitySignalsAll, null, 2))
        .replace(/\{\{artifacts_markdown\}\}/g, artifactsMarkdown)
        .replace(/\{\{weighted_aggregate\}\}/g, String(weightedAggregate))
        .replace(/\{\{outcome_type\}\}/g, outcomeType);
    try {
        const meshPrompt = (0, llmMeshClient_1.buildPrompt)({
            userContent: prompt,
            directives: ['[[max_tokens=3000]]'],
        });
        const buffer = await (0, llmMeshClient_1.executeVanillaPrompt)(meshPrompt);
        // Full response received — parse and store all acts
        const jsonMatch = buffer.match(/\[[\s\S]*\]/);
        if (!jsonMatch)
            throw new Error('No JSON array found in scenario response');
        const acts = JSON.parse(jsonMatch[0]);
        for (const act of acts) {
            await (0, queries_1.appendScenarioAct)(teamId, act);
        }
        await (0, queries_1.completeScenario)(teamId, outcomeType, weightedAggregate);
    }
    catch (err) {
        console.error(`Scenario generation error for team ${teamId}:`, err);
        await (0, queries_1.updateScenarioStatus)(teamId, 'error');
    }
}
//# sourceMappingURL=scenarioService.js.map