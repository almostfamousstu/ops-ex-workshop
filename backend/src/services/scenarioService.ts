import Anthropic from '@anthropic-ai/sdk';
import { getScenarioPlayer, getAllGates } from './missionSpec';
import { appendScenarioAct, completeScenario, updateScenarioStatus } from '../db/queries';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type SubmissionRow = Record<string, unknown>;

function computeWeightedAggregate(
  submissions: SubmissionRow[],
  signalWeights: Record<string, number>
): number {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const [key, weight] of Object.entries(signalWeights)) {
    for (const sub of submissions) {
      const signals = sub.quality_signals_json as Record<string, unknown> | null;
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

  if (totalWeight === 0) return 0;
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

function determineOutcomeType(
  aggregate: number,
  thresholds: { clean_success: string; partial_success: string; failure: string }
): 'clean_success' | 'partial_success' | 'failure' {
  const cleanVal = parseFloat(thresholds.clean_success.replace('>=', '').trim());
  const partialVal = parseFloat(thresholds.partial_success.replace('>=', '').trim());

  if (aggregate >= cleanVal) return 'clean_success';
  if (aggregate >= partialVal) return 'partial_success';
  return 'failure';
}

function buildArtifactsMarkdown(submissions: SubmissionRow[]): string {
  const gates = getAllGates();
  return submissions
    .map((sub) => {
      const gateNum = sub.gate_number as number;
      const gate = gates.find((g) => g.number === gateNum);
      const gateName = gate ? gate.name : `Gate ${gateNum}`;
      const artifact = sub.artifact_json as Record<string, unknown>;
      return `### Gate ${gateNum}: ${gateName}\n\`\`\`json\n${JSON.stringify(artifact, null, 2)}\n\`\`\``;
    })
    .join('\n\n');
}

export async function generateScenario(
  teamId: string,
  callsign: string,
  submissions: SubmissionRow[]
): Promise<void> {
  const scenarioPlayer = getScenarioPlayer();

  const weightedAggregate = computeWeightedAggregate(submissions, scenarioPlayer.signal_weights);
  const outcomeType = determineOutcomeType(weightedAggregate, scenarioPlayer.outcome_thresholds);
  const artifactsMarkdown = buildArtifactsMarkdown(submissions);

  const qualitySignalsAll: Record<string, unknown> = {};
  for (const sub of submissions) {
    const signals = sub.quality_signals_json as Record<string, unknown> | null;
    if (signals) {
      const gateNum = sub.gate_number as number;
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
    let buffer = '';
    const stream = anthropic.messages.stream({
      model: 'claude-haiku-4-5',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        buffer += event.delta.text;

        // Try to extract complete acts from the buffer as they arrive
        // Expecting JSON array: [{act_number, act_title, prose}, ...]
        // We parse acts as complete objects appear
      }
    }

    // Full response received — parse and store all acts
    const jsonMatch = buffer.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found in scenario response');

    const acts = JSON.parse(jsonMatch[0]) as Array<{
      act_number: number;
      act_title: string;
      prose: string;
    }>;

    for (const act of acts) {
      await appendScenarioAct(teamId, act);
    }

    await completeScenario(teamId, outcomeType, weightedAggregate);
  } catch (err) {
    console.error(`Scenario generation error for team ${teamId}:`, err);
    await updateScenarioStatus(teamId, 'error');
  }
}
