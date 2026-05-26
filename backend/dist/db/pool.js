"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const loadEnv_1 = require("../config/loadEnv");
(0, loadEnv_1.loadEnv)();
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Add it to your .env (root) or shell environment before running backend scripts.');
}
let parsedConnection;
try {
    parsedConnection = new URL(connectionString);
}
catch {
    throw new Error('DATABASE_URL is not a valid URL. Example: postgresql://user:password@localhost:5432/dbname');
}
if (!parsedConnection.password) {
    throw new Error('DATABASE_URL must include a password. Example: postgresql://user:password@localhost:5432/dbname');
}
const pool = new pg_1.Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});
pool.on('error', (err) => {
    console.error('Unexpected DB pool error', err);
});
exports.default = pool;
//# sourceMappingURL=pool.js.map