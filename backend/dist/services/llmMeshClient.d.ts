interface BuildPromptOptions {
    systemContent?: string;
    userContent: string;
    directives?: string[];
}
export declare function buildPrompt({ systemContent, userContent, directives }: BuildPromptOptions): string;
export declare function executeVanillaPrompt(prompt: string, options?: {
    useCache?: boolean;
}): Promise<string>;
export {};
//# sourceMappingURL=llmMeshClient.d.ts.map