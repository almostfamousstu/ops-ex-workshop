export interface MissionSetting {
    location: string;
    antagonist: string;
    macguffin: string;
    time_pressure: string;
}
export interface HandlerCharacter {
    name: string;
    voice_guide: string;
}
export interface GateMaterial {
    id: string;
    filename: string;
    label: string;
    description: string;
    minio_key: string;
}
export interface RubricDimension {
    dimension: string;
    weight: number;
    description: string;
}
export interface GateDefinition {
    id: string;
    number: number;
    name: string;
    skill_focus: string;
    briefing: string;
    instructions: string[];
    artifact_schema: Record<string, unknown>;
    materials?: GateMaterial[];
    rubric: RubricDimension[];
    quality_signal_schema: Record<string, string>;
    feedback_style: string;
}
export interface ScenarioPlayer {
    prompt_template: string;
    outcome_thresholds: {
        clean_success: string;
        partial_success: string;
        failure: string;
    };
    signal_weights: Record<string, number>;
    staging: string[];
}
export interface MissionSpec {
    mission: {
        id: string;
        title: string;
        setting: MissionSetting;
        characters: {
            handler: HandlerCharacter;
        };
        opening_briefing: string;
        gates: GateDefinition[];
        scenario_player: ScenarioPlayer;
    };
}
//# sourceMappingURL=mission.d.ts.map