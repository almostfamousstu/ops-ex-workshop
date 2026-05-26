export declare function createCohort(missionId: string, joinCode: string): Promise<{
    id: string;
    joinCode: string;
}>;
export declare function getCohortByJoinCode(joinCode: string): Promise<any>;
export declare function getCohortById(cohortId: string): Promise<any>;
export declare function createTeam(cohortId: string, callsign: string): Promise<{
    id: string;
    sessionToken: string;
}>;
export declare function getTeamByToken(token: string): Promise<any>;
export declare function advanceTeamGate(teamId: string, toGate: number): Promise<void>;
export declare function getTeamsByCohorId(cohortId: string): Promise<any[]>;
export declare function createSubmission(teamId: string, gateNumber: number, artifactJson: object): Promise<string>;
export declare function updateSubmissionEvaluation(submissionId: string, qualitySignals: object, feedbackText: string, status: 'complete' | 'error'): Promise<void>;
export declare function getSubmission(teamId: string, gateNumber: number): Promise<any>;
export declare function getAllSubmissionsForTeam(teamId: string): Promise<any[]>;
export declare function upsertScenario(teamId: string): Promise<string>;
export declare function appendScenarioAct(teamId: string, act: {
    act_number: number;
    act_title: string;
    prose: string;
}): Promise<void>;
export declare function completeScenario(teamId: string, outcomeType: string, weightedAggregate: number): Promise<void>;
export declare function getScenario(teamId: string): Promise<any>;
export declare function updateScenarioStatus(teamId: string, status: 'generating' | 'complete' | 'error'): Promise<void>;
export declare function listAllCohorts(): Promise<any[]>;
//# sourceMappingURL=queries.d.ts.map