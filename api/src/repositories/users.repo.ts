import {
    createUserDto,
    updateUserDto,
    userQueryParamsDto,
    userResponseDto,
    userResponseRow
} from "../schemas/users.schemas";
import {getDb} from "../db/dbClient";
import {targetIdDto} from "../schemas/other.schemas";

export const users = [
    {
        id: "e399c4ca-3211-4869-bb98-3f5f55b3ff43",
        username: "Yaroslav Stoian",
    },
    {
        id: "8d485c4c-3e69-4438-9f2f-a1f3dbb42ead",
        username: "Vova",
    },
    {
        id: "310475d3-04fc-4600-b9e3-7e66d19bb3bf",
        username: "Dmytro",
    },
    {
        id: "f47461ab-7c91-4e79-8573-5fb51dd79ed2",
        username: "Ihor",
    },
];

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

    let sql = `SELECT id, username FROM Users WHERE id = '${targetId}'`;

    const row = await db.get<userResponseRow>(sql);

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

    const safeUsername = dto.username.replace(/'/g, "''");

    const sql = `
    INSERT INTO Users (id, username)
    VALUES ('${id}', '${safeUsername}')
    `;

    await db.run(sql);
    return {
        id: id,
        username: dto.username,
    }
}

export async function readUserByUsername(username: string): Promise<userResponseRow | null> {
    const db = await getDb();
    const safeUsername = username.replace(/'/g, "''");

    const sql = `SELECT id, username FROM Users WHERE username = '${safeUsername}'`;
    const row = await db.get<userResponseRow>(sql);

    return row || null;
}

export async function updateUserRepo(dto: updateUserDto,
                                     targetId: string): Promise<userResponseDto> {
    const db = await getDb();
    const safeUsername = dto.username.replace(/'/g, "''");

    const sql = `
        UPDATE Users 
        SET username = '${safeUsername}' 
        WHERE id = '${targetId}'
    `;

    await db.run(sql);

    return {
        id: targetId,
        username: dto.username,
    }
}

export async function deleteUserRepo(targetId : targetIdDto): Promise<number> {
    const db = await getDb();
    const result = await db.run(`DELETE FROM Users WHERE id = '${targetId}'`);

    return result.changes ?? 0;
}