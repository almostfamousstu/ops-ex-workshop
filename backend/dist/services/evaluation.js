"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateGate = evaluateGate;
exports.extractDossierFields = extractDossierFields;
const llmMeshClient_1 = require("./llmMeshClient");
const missionSpec_1 = require("./missionSpec");
const queries_1 = require("../db/queries");
async function evaluateGate(submissionId, gateNumber, artifact, team) {
    const gate = (0, missionSpec_1.getGate)(gateNumber);
    const mission = (0, missionSpec_1.getMission)();
    const rubricText = gate.rubric
        .map((r) => `- ${r.dimension} (weight ${r.weight}): ${r.description}`)
        .join('\n');
    const signalSchemaText = Object.entries(gate.quality_signal_schema)
        .map(([k, v]) => `  "${k}": ${v}`)
        .join('\n');
    const systemPrompt = `You are ${mission.characters.handler.name}, evaluating a team submission for ${mission.title}.

Voice guide: ${mission.characters.handler.voice_guide}

Your job:
1. Score the submission against the rubric dimensions.
2. Extract quality signals as structured data.
3. Write feedback in Cipher's voice.

Rubric for Gate ${gateNumber} — ${gate.name}:
${rubricText}

Quality signals to extract (JSON keys and types):
{
${signalSchemaText}
}

Respond with a single JSON object:
{
  "quality_signals": { ...signals matching the schema above... },
  "feedback_text": "Cipher's voice feedback (${gate.feedback_style.split('.')[0]})"
}

For float signals: score 0.0–1.0 based on the rubric weight descriptions.
For bool signals: true/false.
For string signals: extract the specific value from the artifact.
No preamble. No commentary outside the JSON.`;
    const userPrompt = `Team callsign: ${team.callsign}
Gate: ${gateNumber} — ${gate.name}

Artifact submitted:
${JSON.stringify(artifact, null, 2)}`;
    try {
        const prompt = (0, llmMeshClient_1.buildPrompt)({
            systemContent: systemPrompt,
            userContent: userPrompt,
            directives: [`[[response_format="{\\"type\\": \\"json_object\\"}"]]`, '[[max_tokens=1024]]'],
        });
        const rawText = await (0, llmMeshClient_1.executeVanillaPrompt)(prompt);
        // Extract JSON from the response (handle markdown code fences)
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch)
            throw new Error('No JSON found in LLM response');
        const parsed = JSON.parse(jsonMatch[0]);
        await (0, queries_1.updateSubmissionEvaluation)(submissionId, parsed.quality_signals, parsed.feedback_text, 'complete');
    }
    catch (err) {
        console.error(`Evaluation error for submission ${submissionId}:`, err);
        await (0, queries_1.updateSubmissionEvaluation)(submissionId, {}, 'Evaluation unavailable. Proceed to the next phase.', 'error');
    }
}
async function extractDossierFields(step3Output) {
    const systemPrompt = `You are a structured data extractor. Given a block of text describing an undercover operative's cover identity, extract the following fields and return them as a JSON object.

Fields to extract:
- cover_name: The operative's cover name (full name as a string)
- employer: The cover employer or organisation
- pretext: The stated reason for attending the auction
- nationality: The operative's cover nationality
- background_summary: A brief professional background summary (1-2 sentences)
- vulnerability: The main identified weakness in the cover
- prepared_response: The prepared answer to neutralise the vulnerability

Rules:
- Return only the JSON object. No preamble, no commentary.
- If a field is not present in the text, omit it from the JSON (do not return null or empty string).
- Keep values concise — do not pad or rephrase beyond what the text provides.`;
    const prompt = (0, llmMeshClient_1.buildPrompt)({
        systemContent: systemPrompt,
        userContent: step3Output,
        directives: [`[[response_format="{\\"type\\": \\"json_object\\"}"]]`, '[[max_tokens=512]]'],
    });
    const rawText = await (0, llmMeshClient_1.executeVanillaPrompt)(prompt);
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch)
        throw new Error('No JSON found in extraction response');
    return JSON.parse(jsonMatch[0]);
}
//# sourceMappingURL=evaluation.js.map