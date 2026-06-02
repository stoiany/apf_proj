import {
    createUserDto,
    updateUserDto,
    userQueryParamsDto,
    userResponseDto,
    userResponseRow
} from "../schemas/users.schemas";
import {getDb} from "../db/dbClient";
import {targetIdDto} from "../schemas/other.schemas";

export async function readUsersRepo(dto : userQueryParamsDto) : Promise<userResponseDto[]> {
    const db = await getDb();

    let sql = `SELECT id, username FROM Users`;

    if(dto.sortBy){
        const  dir = dto.sortDir === "desc" ? "DESC" : "ASC";

        sql += ` ORDER BY ${dto.sortBy} ${dir}`;
    }

    const rows = await db.all<userResponseRow[]>(sql);

    return rows.map((row) => {
        return {
            id: String(row.id),
            username: String(row.username),
        };
    });
}

export async function readUserByIdRepo(targetId : targetIdDto) : Promise<userResponseDto | null> {
    const db = await getDb();

    let sql = `SELECT id, username FROM Users WHERE id = ?`;

    const row = await db.get<userResponseRow>(sql, [targetId]);

    if(!row){
        return null;
    }

    return {
        id: String(row.id),
        username: String(row.username),
    }
}

export async function createUserRepo(dto: createUserDto) : Promise<userResponseDto> {
    const db = await getDb();

    const id = crypto.randomUUID();

    const sql = `
    INSERT INTO Users (id, username)
    VALUES (?, ?)
    `;

    await db.run(sql, [id, dto.username]);
    return {
        id: id,
        username: dto.username,
    }
}

export async function readUserByUsername(username: string): Promise<userResponseRow | null> {
    const db = await getDb();

    const sql = `SELECT id, username FROM Users WHERE username = ?`;
    const row = await db.get<userResponseRow>(sql, [username]);

    return row || null;
}

export async function updateUserRepo(dto: updateUserDto,
                                     targetId: string): Promise<userResponseDto> {
    const db = await getDb();

    const sql = `
        UPDATE Users 
        SET username = ? 
        WHERE id = ?
    `;

    await db.run(sql, [dto.username, targetId]);

    return {
        id: targetId,
        username: dto.username,
    }
}

export async function deleteUserRepo(targetId : targetIdDto): Promise<number> {
    const db = await getDb();
    const result = await db.run(`DELETE FROM Users WHERE id = ?`, [targetId]);

    return result.changes ?? 0;
}