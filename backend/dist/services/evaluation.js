"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateGate = evaluateGate;
exports.extractDossierFields = extractDossierFields;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const missionSpec_1 = require("./missionSpec");
const queries_1 = require("../db/queries");
const anthropic = new sdk_1.default({ apiKey: process.env.ANTHROPIC_API_KEY });
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
        const response = await anthropic.messages.create({
            model: 'claude-haiku-4-5',
            max_tokens: 1024,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
        });
        const rawText = response.content
            .filter((b) => b.type === 'text')
            .map((b) => b.text)
            .join('');
        // Extract JSON from the response (handle markdown code fences)
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch)
            throw new Error('No JSON found in Claude response');
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
    const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 512,
        system: systemPrompt,
        messages: [{ role: 'user', content: step3Output }],
    });
    const rawText = response.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('');
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch)
        throw new Error('No JSON found in extraction response');
    return JSON.parse(jsonMatch[0]);
}
//# sourceMappingURL=evaluation.js.map