import {
    createShiftDto,
    shiftQueryParamsDto,
    shiftResponseDto,
    shiftResponseRow,
    updateShiftDto
} from "../schemas/shift.schemas";
import {ShiftStatus, ShiftTime} from "../services/shifts.services";
import {getDb} from "../db/dbClient";
import {targetIdDto} from "../schemas/other.schemas";
import {createUserRepo, readUserByUsername} from "./users.repo";

export async function readShiftsRepo(
    dto : shiftQueryParamsDto
): Promise<shiftResponseDto[]> {
    const db = await getDb();
    const params : any[] = [];

    let sql = `
        SELECT Shifts.id, 
               Users.username,
               Shifts.date,
               Shifts.time,
               Shifts.status,
               Shifts.comment,
               Shifts.createdAt 
        FROM Shifts
        JOIN Users ON Shifts.userId = Users.id
        WHERE 1=1
    `;

    if (dto.userId) {
        sql += ` AND Shifts.userId = ?`;
        params.push(dto.userId);
    }

    if (dto.status) {
        sql += ` AND Shifts.status = ?`;
        params.push(dto.status);
    }

    if(dto.sortBy){
        const dir = dto.sortDir === "desc" ? "DESC" : "ASC";

        sql += ` ORDER BY ${dto.sortBy} ${dir}`;
    }

    const rows = await db.all<shiftResponseRow[]>(sql, params);

    return rows.map((row : shiftResponseRow) => {
        return {
            id: String(row.id),
            username: String(row.username),
            date: String(row.date),
            time: String(row.time) as ShiftTime,
            status: String(row.status) as ShiftStatus,
            comment: row.comment ? String(row.comment) : "",
            createdAt: String(row.createdAt)
        };
    });
}

export async function readShiftByIdRepo(targetId : targetIdDto) : Promise<shiftResponseDto | null> {
    const db = await getDb();

    let sql = `
        SELECT Shifts.id,
               Users.username,
               Shifts.date,
               Shifts.time,
               Shifts.status,
               Shifts.comment,
               Shifts.createdAt
        FROM Shifts
                 JOIN Users ON Shifts.userId = Users.id
        WHERE Shifts.id = ?;
    `;

    const row = await db.get<shiftResponseRow>(sql, [targetId]);

    if(!row){
        return null;
    }

    return {
        id: String(row.id),
        username: String(row.username),
        date: String(row.date),
        time: String(row.time) as ShiftTime,
        status: String(row.status) as ShiftStatus,
        comment: row.comment ? String(row.comment) : "",
        createdAt: String(row.createdAt)
    }
}

export async function checkShiftCollisionRepo(date: string, time: ShiftTime): Promise<boolean> {
    const db = await getDb();
    const sql = `
        SELECT 1 FROM Shifts 
        WHERE date = ? 
          AND time = ? 
          AND status != 'canceled' 
        LIMIT 1
    `;
    const row = await db.get(sql, [date, time]);

    return !!row;
}

export async function checkShiftCollisionOnUpdateRepo(date: string, time: ShiftTime, shiftId: string): Promise<boolean> {
    const db = await getDb();
    const sql = `
        SELECT 1 FROM Shifts 
        WHERE date = ? 
          AND time = ? 
          AND status != 'canceled' 
          AND id != ?
        LIMIT 1
    `;
    const row = await db.get(sql, [date, time, shiftId]);

    return !!row;
}

export async function createShiftRepo(dto : createShiftDto): Promise<shiftResponseDto> {
    const db = await getDb();

    const shiftId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await db.run("BEGIN TRANSACTION");

    try {
        const user = await readUserByUsername(dto.username);
        let userId: string;
        if (!user) {
            const newUser = await createUserRepo({username: dto.username});
            userId = String(newUser.id);
        } else {
            userId = String(user.id);
        }

        const sql = `
        INSERT INTO Shifts (id, userId, date, time, status, comment, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await db.run(sql, [shiftId, userId, dto.date, dto.time, dto.status, dto.comment, createdAt]);

        await db.run("COMMIT");

        return {
            id: String(shiftId),
            username: String(dto.username),
            date: String(dto.date),
            time: String(dto.time) as ShiftTime,
            status: String(dto.status) as ShiftStatus,
            comment: dto.comment ? String(dto.comment) : "",
            createdAt: String(createdAt)
        }
    } catch (error) {
        await db.run("ROLLBACK");
        throw error;
    }
}

export async function updateShiftRepo(
    targetId: string,
    dto: updateShiftDto,
    existingShift: shiftResponseDto
): Promise<shiftResponseDto> {
    const db = await getDb();

    let finalUsername = String(existingShift.username);
    let updateFields: string[] = [];
    const params: any[] = [];

    if (dto.username !== undefined) {
        const user = await readUserByUsername(dto.username);
        let userId : string;
        if(!user){
            const newUser = await createUserRepo({username : dto.username});
            userId = String(newUser.id);
        } else {
            userId = String(user.id);
        }

        finalUsername = dto.username;
        updateFields.push(`userId = ?`);
        params.push(userId);
    }

    if (dto.status !== undefined){
        updateFields.push(`status = ?`);
        params.push(dto.status);
    }
    if (dto.date !== undefined){
        updateFields.push(`date = ?`);
        params.push(dto.date);
    }
    if (dto.time !== undefined) {
        updateFields.push(`time = ?`);
        params.push(dto.time);
    }
    if (dto.comment !== undefined) {
        updateFields.push(`comment = ?`);
        params.push(dto.comment);
    }

    if (updateFields.length > 0) {
        params.push(targetId);
        const sql = `UPDATE Shifts SET ${updateFields.join(", ")} WHERE id = ?`;
        await db.run(sql, params);
    }

    return {
        id: targetId,
        username: finalUsername,
        date: dto.date !== undefined ? dto.date : String(existingShift.date),
        time: (dto.time !== undefined ? dto.time : String(existingShift.time)) as ShiftTime,
        status: (dto.status !== undefined ? dto.status : String(existingShift.status)) as ShiftStatus,
        comment: dto.comment !== undefined ? dto.comment : (existingShift.comment ? String(existingShift.comment) : ""),
        createdAt: String(existingShift.createdAt),
    };
}

export async function deleteShiftRepo(targetId : targetIdDto): Promise<number> {
    const db = await getDb();
    const result = await db.run(`DELETE FROM Shifts WHERE id = ?`, [targetId]);

    return result.changes ?? 0;
}

export async function getShiftsStatsRepo(): Promise<{ status: string; count: number }[]> {
    const db = await getDb();
    const sql = `
        SELECT status, COUNT(id) as count 
        FROM Shifts 
        GROUP BY status
    `;
    const rows = await db.all(sql);

    return rows.map((row: any) => ({
        status: String(row.status),
        count: Number(row.count)
    }));
}

export async function getTop3UsersByShiftCountRepo(date : string): Promise<{ username: string; count: number }[]> {
    const db = await getDb();
    const sql = `
        SELECT u.username, 
               COUNT(s.id) as count 
        FROM Shifts s
        JOIN Users u ON s.userId = u.id
        WHERE s.date LIKE ?
        GROUP BY u.username
        ORDER BY count DESC
        LIMIT 3
    `;
    const rows = await db.all(sql, [`%${date}%`]);

    return rows.map((row: any) => ({
        username: String(row.username),
        count: Number(row.count)
    }));
}

export async function getTop3ByTimeRepo(time : string): Promise<{ username: string; id: string; count: number }[]> {
    const db = await getDb();
    const sql = `
        SELECT u.username, 
               u.id,
               COUNT(s.id) as count 
        FROM Shifts s
        JOIN Users u ON s.userId = u.id
        WHERE s.time LIKE ?
        GROUP BY u.username
        ORDER BY count DESC
        LIMIT 3
    `;
    const rows = await db.all(sql, [`%${time}%`]);

    return rows.map((row: any) => ({
        username: String(row.username),
        id: row.id,
        count: Number(row.count)
    }));
}

// export async function checkUserMatchesUsernameRepo(currentUserId: string, targetUsername: string): Promise<boolean> {
//     const db = await getDb();
//
//     const sql = `SELECT username FROM Users WHERE id = ?`;
//     const row = await db.get<{username: string}>(sql, [currentUserId]);
//
//     return !(!row || row.username !== targetUsername);
// }

export async function checkShiftOwnershipRepo(shiftId: string, currentUserId: string): Promise<boolean> {
    const db = await getDb();

    const sql = `SELECT 1 FROM Shifts WHERE id = ? AND userId = ?`;
    const row = await db.get(sql, [shiftId, currentUserId]);

    return !!row;
}