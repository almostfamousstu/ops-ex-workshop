import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { MissionSpec, GateDefinition } from '../types/mission';

let _spec: MissionSpec | null = null;

export function loadMissionSpec(): MissionSpec {
  if (_spec) return _spec;

  const missionsPath = process.env.MISSIONS_PATH || path.join(__dirname, '..', '..', '..', 'missions');
  const filePath = path.join(missionsPath, 'monaco-syndicate.yaml');

  if (!fs.existsSync(filePath)) {
    throw new Error(`Mission spec not found at ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  _spec = yaml.load(raw) as MissionSpec;
  console.log(`Mission spec loaded: ${_spec.mission.title}`);
  return _spec;
}

export function getMission() {
  return loadMissionSpec().mission;
}

export function getGate(gateNumber: number): GateDefinition {
  const spec = loadMissionSpec();
  const gate = spec.mission.gates.find((g) => g.number === gateNumber);
  if (!gate) throw new Error(`Gate ${gateNumber} not found in mission spec`);
  return gate;
}

export function getAllGates(): GateDefinition[] {
  return loadMissionSpec().mission.gates;
}

export function getScenarioPlayer() {
  return loadMissionSpec().mission.scenario_player;
}
