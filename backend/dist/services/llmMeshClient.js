"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPrompt = buildPrompt;
exports.executeVanillaPrompt = executeVanillaPrompt;
const BASE_URL = (process.env.LLM_MESH_BASE_URL ?? 'https://analytics-qa.iriworldwide.com/llmadmin/api').replace(/\/$/, '');
const MODEL = process.env.LLM_MESH_MODEL ?? 'gpt-4o';
function buildPrompt({ systemContent, userContent, directives = [] }) {
    const parts = [];
    if (directives.length > 0) {
        parts.push(directives.join('\n'));
    }
    if (systemContent) {
        parts.push(`[[SYSTEM]]\n${systemContent}\n[[/SYSTEM]]`);
    }
    parts.push(userContent);
    return parts.join('\n\n');
}
function extractText(result) {
    if (typeof result === 'string')
        return result;
    if (result !== null && typeof result === 'object') {
        const r = result;
        if (typeof r['outcome'] === 'string')
            return r['outcome'];
        if (r['message'] !== null && typeof r['message'] === 'object') {
            const msg = r['message'];
            if (typeof msg['content'] === 'string')
                return msg['content'];
        }
    }
    throw new Error(`Unexpected LLM Mesh result shape: ${JSON.stringify(result)}`);
}
async function executeVanillaPrompt(prompt, options) {
    const apiKey = process.env.LLM_MESH_API_KEY;
    if (!apiKey) {
        throw new Error('LLM_MESH_API_KEY is not set. Add it to .env before running AI evaluations.');
    }
    const body = {
        config: {
            templateName: 'ops-ex-workshop',
            prompt,
        },
        model: MODEL,
        useCache: options?.useCache ?? false,
        asyncrun: false,
    };
    const response = await fetch(`${BASE_URL}/llm/execution`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        throw new Error(`LLM Mesh HTTP ${response.status}: ${await response.text()}`);
    }
    const data = (await response.json());
    if (data.code !== 1) {
        throw new Error(`LLM Mesh returned code ${data.code}: ${data.message ?? JSON.stringify(data)}`);
    }
    return extractText(data.result);
}
//# sourceMappingURL=llmMeshClient.js.map