import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import path from "path";
import fs from "fs";

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
    if (dbInstance) return dbInstance;

    const dataDir = path.join(__dirname, "../../data");

    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    dbInstance = await open({
        filename: path.join(dataDir, "app.db"),
        driver: sqlite3.Database,
    });

    await dbInstance.exec("PRAGMA foreign_keys = ON;");

    return dbInstance;
}