export interface JoinCohortRequest {
    callsign: string;
}
export interface JoinCohortResponse {
    teamId: string;
    sessionToken: string;
    cohortId: string;
    missionId: string;
}
export interface TeamStateResponse {
    teamId: string;
    callsign: string;
    cohortId: string;
    missionId: string;
    currentGate: number;
    submissions: SubmissionSummary[];
}
export interface SubmissionSummary {
    gateNumber: number;
    artifact?: Record<string, unknown>;
    status: 'evaluating' | 'complete' | 'error';
    qualitySignals?: Record<string, unknown>;
    feedbackText?: string;
    submittedAt: string;
    evaluatedAt?: string;
}
export interface GateSpecResponse {
    gateNumber: number;
    name: string;
    skillFocus: string;
    briefing: string;
    instructions: string[];
    artifactSchema: Record<string, unknown>;
    hasMaterials: boolean;
}
export interface SubmitGateRequest {
    artifact: Record<string, unknown>;
}
export interface EvaluationResponse {
    status: 'evaluating' | 'complete' | 'error';
    feedbackText?: string;
    qualitySignals?: Record<string, unknown>;
    evaluatedAt?: string;
}
export interface ScenarioResponse {
    status: 'generating' | 'complete' | 'error';
    acts: ScenarioAct[];
    outcomeType?: 'clean_success' | 'partial_success' | 'failure';
    weightedAggregate?: number;
}
export interface ScenarioAct {
    act_number: number;
    act_title: string;
    prose: string;
}
export interface CreateCohortRequest {
    missionId?: string;
}
export interface CreateCohortResponse {
    cohortId: string;
    joinCode: string;
    missionId: string;
}
//# sourceMappingURL=api.d.ts.map