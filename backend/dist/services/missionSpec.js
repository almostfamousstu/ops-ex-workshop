"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadMissionSpec = loadMissionSpec;
exports.getMission = getMission;
exports.getGate = getGate;
exports.getAllGates = getAllGates;
exports.getScenarioPlayer = getScenarioPlayer;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const js_yaml_1 = __importDefault(require("js-yaml"));
let _spec = null;
function loadMissionSpec() {
    if (_spec)
        return _spec;
    const missionsPath = process.env.MISSIONS_PATH || path_1.default.join(__dirname, '..', '..', '..', 'missions');
    const filePath = path_1.default.join(missionsPath, 'monaco-syndicate.yaml');
    if (!fs_1.default.existsSync(filePath)) {
        throw new Error(`Mission spec not found at ${filePath}`);
    }
    const raw = fs_1.default.readFileSync(filePath, 'utf-8');
    _spec = js_yaml_1.default.load(raw);
    console.log(`Mission spec loaded: ${_spec.mission.title}`);
    return _spec;
}
function getMission() {
    return loadMissionSpec().mission;
}
function getGate(gateNumber) {
    const spec = loadMissionSpec();
    const gate = spec.mission.gates.find((g) => g.number === gateNumber);
    if (!gate)
        throw new Error(`Gate ${gateNumber} not found in mission spec`);
    return gate;
}
function getAllGates() {
    return loadMissionSpec().mission.gates;
}
function getScenarioPlayer() {
    return loadMissionSpec().mission.scenario_player;
}
//# sourceMappingURL=missionSpec.js.map