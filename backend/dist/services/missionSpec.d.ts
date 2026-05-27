import { MissionSpec, GateDefinition } from '../types/mission';
export declare function loadMissionSpec(): MissionSpec;
export declare function getMission(): {
    id: string;
    title: string;
    setting: import("../types/mission").MissionSetting;
    characters: {
        handler: import("../types/mission").HandlerCharacter;
    };
    opening_briefing: string;
    gates: GateDefinition[];
    scenario_player: import("../types/mission").ScenarioPlayer;
};
export declare function getGate(gateNumber: number): GateDefinition;
export declare function getAllGates(): GateDefinition[];
export declare function getScenarioPlayer(): import("../types/mission").ScenarioPlayer;
//# sourceMappingURL=missionSpec.d.ts.map