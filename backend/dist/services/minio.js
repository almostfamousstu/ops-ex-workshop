"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureBucketAndSeedFiles = ensureBucketAndSeedFiles;
exports.getPresignedUrl = getPresignedUrl;
exports.getMinioStream = getMinioStream;
const minio_1 = require("minio");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let _client = null;
const BUCKET = process.env.MINIO_BUCKET || 'quicksilver';
function getClient() {
    if (_client)
        return _client;
    _client = new minio_1.Client({
        endPoint: process.env.MINIO_ENDPOINT || 'localhost',
        port: parseInt(process.env.MINIO_PORT || '9000', 10),
        useSSL: process.env.MINIO_USE_SSL === 'true',
        accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
        secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin_dev',
    });
    return _client;
}
async function ensureBucketAndSeedFiles() {
    const client = getClient();
    const exists = await client.bucketExists(BUCKET);
    if (!exists) {
        await client.makeBucket(BUCKET, 'us-east-1');
        console.log(`MinIO bucket '${BUCKET}' created`);
    }
    // Seed Gate 3 CSV if not already uploaded
    const key = 'gate3/gate3_intercept.csv';
    try {
        await client.statObject(BUCKET, key);
        console.log('Gate 3 intercept CSV already in MinIO');
    }
    catch {
        const missionsPath = process.env.MISSIONS_PATH || path_1.default.join(__dirname, '..', '..', '..', 'missions');
        const csvPath = path_1.default.join(missionsPath, 'materials', 'gate3_intercept.csv');
        if (fs_1.default.existsSync(csvPath)) {
            await client.fPutObject(BUCKET, key, csvPath, { 'Content-Type': 'text/csv' });
            console.log('Gate 3 intercept CSV uploaded to MinIO');
        }
        else {
            console.warn(`Gate 3 CSV not found at ${csvPath} — skipping upload`);
        }
    }
    // Seed Gate 2 materials if not already uploaded
    const gate2Materials = [
        { key: 'gate2/gate2_renoux_profile.txt', filename: 'gate2_renoux_profile.txt', contentType: 'text/plain' },
        { key: 'gate2/gate2_auction_programme.txt', filename: 'gate2_auction_programme.txt', contentType: 'text/plain' },
        { key: 'gate2/gate2_hermitage_schematic.svg', filename: 'gate2_hermitage_schematic.svg', contentType: 'image/svg+xml' },
        { key: 'gate2/gate2_intercept_fragment.txt', filename: 'gate2_intercept_fragment.txt', contentType: 'text/plain' },
    ];
    const missionsPath = process.env.MISSIONS_PATH || path_1.default.join(__dirname, '..', '..', '..', 'missions');
    for (const material of gate2Materials) {
        try {
            await client.statObject(BUCKET, material.key);
            console.log(`Gate 2 material already in MinIO: ${material.key}`);
        }
        catch {
            const filePath = path_1.default.join(missionsPath, 'materials', material.filename);
            if (fs_1.default.existsSync(filePath)) {
                await client.fPutObject(BUCKET, material.key, filePath, { 'Content-Type': material.contentType });
                console.log(`Gate 2 material uploaded to MinIO: ${material.key}`);
            }
            else {
                console.warn(`Gate 2 material not found at ${filePath} — skipping upload`);
            }
        }
    }
}
async function getPresignedUrl(objectKey, expirySeconds = 3600) {
    const client = getClient();
    return client.presignedGetObject(BUCKET, objectKey, expirySeconds);
}
async function getMinioStream(objectKey) {
    const client = getClient();
    return client.getObject(BUCKET, objectKey);
}
//# sourceMappingURL=minio.js.map