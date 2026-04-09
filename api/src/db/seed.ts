import {getDb} from "./dbClient";

async function runSeeder(){
    const db = await getDb();
    console.log("Seeding began.");

    await db.run("DELETE FROM SwapRequests");
    await db.run("DELETE FROM Shifts");
    await db.run("DELETE FROM Users");

    const now = new Date().toISOString();

    const user1Id = crypto.randomUUID();
    const user2Id = crypto.randomUUID();

    await db.run(`INSERT INTO Users (id, username) VALUES ('${user1Id}', 'YStoian')`);
    await db.run(`INSERT INTO Users (id, username) VALUES ('${user2Id}', 'SVolod')`);

    const shift1Id = crypto.randomUUID();
    const shift2Id = crypto.randomUUID();
    const shift3Id = crypto.randomUUID();

    await db.run(`
            INSERT INTO Shifts (id, userId, date, time, status, comment, createdAt)
            VALUES ('${shift1Id}', '${user1Id}', '2026-04-15', 'morning', 'scheduled', '', '${now}')
        `);
    await db.run(`
            INSERT INTO Shifts (id, userId, date, time, status, comment, createdAt)
            VALUES ('${shift2Id}', '${user1Id}', '2026-04-15', 'day', 'scheduled', '', '${now}')
        `);
    await db.run(`
            INSERT INTO Shifts (id, userId, date, time, status, comment, createdAt)
            VALUES ('${shift3Id}', '${user2Id}', '2026-04-16', 'day', 'scheduled', '', '${now}')
        `);

    await db.run(`
            INSERT INTO SwapRequests (id, requesterId, targetUserId, shiftId, status, createdAt)
            VALUES ('${crypto.randomUUID()}', '${user2Id}', '${user1Id}', '${shift3Id}', 'pending', '${now}')
        `);
}

runSeeder();