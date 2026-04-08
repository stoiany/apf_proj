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
        WHERE 1=1;
    `;

    if (dto.userId) {
        sql += ` AND Shifts.userId = '${dto.userId}'`;
    }

    if (dto.status) {
        sql += ` AND Shifts.status = '${dto.status}'`;
    }

    if(dto.sortBy){
        const dir = dto.sortDir === "desc" ? "DESC" : "ASC";

        sql += ` ORDER BY ${dto.sortBy} ${dir}`;
    }

    const rows = await db.all<shiftResponseRow[]>(sql);

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
        WHERE Shifts.id = '${targetId}';
    `;

    const row = await db.get<shiftResponseRow>(sql);

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
        WHERE date = '${date}' 
          AND time = '${time}' 
          AND status != 'canceled' 
        LIMIT 1
    `;
    const row = await db.get(sql);

    return !!row;
}

export async function checkShiftCollisionOnUpdateRepo(date: string, time: ShiftTime, shiftId: string): Promise<boolean> {
    const db = await getDb();
    const sql = `
        SELECT 1 FROM Shifts 
        WHERE date = '${date}' 
          AND time = '${time}' 
          AND status != 'canceled' 
          AND id != '${shiftId}'
        LIMIT 1
    `;
    const row = await db.get(sql);

    return !!row;
}

export async function createShiftRepo(dto : createShiftDto): Promise<shiftResponseDto> {
    const db = await getDb();
    const safeComment = dto.comment ? `'${dto.comment.replace(/'/g, "''")}'` : "NULL";

    const shiftId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const safeUsername = dto.username.replace(/'/g, "''");

    await db.run("BEGIN TRANSACTION");

    try {
        const user = await readUserByUsername(safeUsername);
        let userId: string;
        if (!user) {
            const newUser = await createUserRepo({username: dto.username});
            userId = String(newUser.id);
        } else {
            userId = String(user.id);
        }

        const sql = `
        INSERT INTO Shifts (id, userId, date, time, status, comment, createdAt)
        VALUES ('${shiftId}', '${userId}', '${dto.date}', '${dto.time}', '${dto.status}', ${safeComment}, '${createdAt}')
        `;

        await db.run(sql);

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

    if (dto.username !== undefined) {
        const safeUsername = dto.username.replace(/'/g, "''");

        const user = await readUserByUsername(safeUsername);
        let userId : string;
        if(!user){
            const newUser = await createUserRepo({username : dto.username});
            userId = String(newUser.id);
        } else {
            userId = String(user.id);
        }

        finalUsername = dto.username;
        updateFields.push(`userId = '${userId}'`);
    }

    if (dto.status !== undefined) updateFields.push(`status = '${dto.status}'`);
    if (dto.date !== undefined) updateFields.push(`date = '${dto.date}'`);
    if (dto.time !== undefined) updateFields.push(`time = '${dto.time}'`);
    if (dto.comment !== undefined) {
        const safeComment = dto.comment ? `'${dto.comment.replace(/'/g, "''")}'` : "NULL";
        updateFields.push(`comment = ${safeComment}`);
    }

    if (updateFields.length > 0) {
        const sql = `UPDATE Shifts SET ${updateFields.join(", ")} WHERE id = '${targetId}'`;
        await db.run(sql);
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
    const result = await db.run(`DELETE FROM Shifts WHERE id = '${targetId}'`);

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