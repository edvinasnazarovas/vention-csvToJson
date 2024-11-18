"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveJsonToDatabase = saveJsonToDatabase;
exports.readJsonRows = readJsonRows;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const db = new better_sqlite3_1.default("./src/db/jsonStorage.db");
db.serialize();
db.prepare(`CREATE TABLE IF NOT EXISTS json_rows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    json_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`).run();
function saveJsonToDatabase(json) {
    return db.prepare(`INSERT INTO json_rows (json_data) VALUES (?)`).run(json);
}
function readJsonRows() {
    return db.prepare("SELECT * FROM json_rows").all();
}
