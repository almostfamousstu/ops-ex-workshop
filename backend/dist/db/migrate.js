"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pool_1 = __importDefault(require("./pool"));
async function migrate() {
    const sql = fs_1.default.readFileSync(path_1.default.join(__dirname, 'schema.sql'), 'utf-8');
    await pool_1.default.query(sql);
    console.log('Migration complete');
    await pool_1.default.end();
}
migrate().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
//# sourceMappingURL=migrate.js.map