import fs from "fs";
import path from "path";
import { getDb } from "./dbClient";

export async function migrate(): Promise<void> {
    const db = await getDb();

    await db.exec(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id INTEGER PRIMARY KEY,
            filename TEXT NOT NULL UNIQUE,
            appliedAt TEXT NOT NULL
        );
    `);

    const migrationsDir = path.join(__dirname, "migrations");
    const files = fs
        .readdirSync(migrationsDir)
        .filter((f) => /^\d+_.+\.sql$/.test(f))
        .sort();

    const applied = await db.all<{ filename: string }[]>(
        "SELECT filename FROM schema_migrations;"
    );
    const appliedSet = new Set(applied.map((x) => x.filename));

    for (const file of files) {
        if (appliedSet.has(file)) continue;

        const fullPath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(fullPath, "utf8").trim();

        if (!sql) continue;

        await db.exec(sql);

        const now = new Date().toISOString();
        await db.run(
            `INSERT INTO schema_migrations (filename, appliedAt) VALUES ('${file.replace(/'/g, "''")}', '${now}')`
        );

        console.log(`[Migrate] Applied: ${file}`);
    }
}