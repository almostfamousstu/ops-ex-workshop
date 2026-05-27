interface TeamInfo {
    id: string;
    callsign: string;
    current_gate: number;
}
export declare function evaluateGate(submissionId: string, gateNumber: number, artifact: Record<string, unknown>, team: TeamInfo): Promise<void>;
interface CoverDossierFields {
    cover_name?: string;
    employer?: string;
    pretext?: string;
    nationality?: string;
    background_summary?: string;
    vulnerability?: string;
    prepared_response?: string;
}
export declare function extractDossierFields(step3Output: string): Promise<CoverDossierFields>;
export {};
//# sourceMappingURL=evaluation.d.ts.map