export declare function ensureBucketAndSeedFiles(): Promise<void>;
export declare function getPresignedUrl(objectKey: string, expirySeconds?: number): Promise<string>;
export declare function getMinioStream(objectKey: string): Promise<NodeJS.ReadableStream>;
//# sourceMappingURL=minio.d.ts.map