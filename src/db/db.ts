import sqlite3 from "better-sqlite3";

const db = new sqlite3("./jsonStorage.db");

db.serialize();

db.prepare(`CREATE TABLE IF NOT EXISTS json_rows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    json_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`).run();

export function saveJsonToDatabase(json: string) {
    return db.prepare(`INSERT INTO json_rows (json_data) VALUES (?)`).run(json);
}

export function readJsonRows(): {id: number, json_data: string, created_at: string}[] {
    return db.prepare("SELECT * FROM json_rows").all() as {id: number, json_data: string, created_at: string}[];
}