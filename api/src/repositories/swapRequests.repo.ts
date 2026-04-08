import {swapReqQueryParamsDto, swapRequestResponseDto} from "../schemas/swapRequest.schemas";
import {getDb} from "../db/dbClient";

export const swapRequests = [
    {
        id: "d2773ca2-d632-48a6-9e78-12ddd471ad24",
        requesterId: "e399c4ca-3211-4869-bb98-3f5f55b3ff43",
        targetUserId: "8d485c4c-3e69-4438-9f2f-a1f3dbb42ead",
        shiftId: "e409299e-8501-4be4-b4fa-8b06ab0fa25e",
        status: "pending",
        createdAt: "2026-03-15T16:11:01.533Z",
    },
];

export async function readSwapRequestsRepo(dto : swapReqQueryParamsDto) : Promise<swapRequestResponseDto[]> {
    const db = await getDb();

    let sql = `
        SELECT SwapRequests.id,
               Requester.username AS requester,
               Target.username AS targetUser,
               SwapRequests.shiftId,
               SwapRequests.status
        FROM SwapRequests
        JOIN Users AS Requester ON SwapRequests.requesterId = Requester.id
        JOIN Users AS Target ON SwapRequests.targetUserId = Target.id
        WHERE 1=1;
    `;

    if (dto.status) {
        sql += ` AND SwapRequests.status = '${dto.status}'`;
    }

    if (dto.requesterId) {
        sql += ` AND SwapRequests.requesterId = '${dto.requesterId}'`;
    }

    if (dto.targetUserId) {
        sql += ` AND SwapRequests.targetUserId = '${dto.targetUserId}'`;
    }

    if(dto.sortBy){
        const dir = dto.sortDir === "desc" ? "DESC" : "ASC";

        sql += ` ORDER BY ${dto.sortBy} ${dir}`;
    }

    const rows = await db.all<swapRequestResponseDto[]>(sql);
    return rows.map((row : swapRequestResponseDto) => {
        return {
            id: String(row.id),
            requester: row.requester,
            targetUser: row.targetUser,
            shiftId: row.shiftId,
            status: row.status,
            createdAt: String(row.createdAt),
        }
    })
}

export async function readSwapRequestByIdRepo(targetId: string): Promise<swapRequestResponseDto | null> {
    const db = await getDb();

    let sql = `
        SELECT SwapRequests.id,
               Requester.username AS requester,
               Target.username AS targetUser,
               SwapRequests.shiftId,
               SwapRequests.status
        FROM SwapRequests
        JOIN Users AS Requester ON SwapRequests.requesterId = Requester.id
        JOIN Users AS Target ON SwapRequests.targetUserId = Target.id
        WHERE SwapRequests.id = '${targetId}'
    `;

    const row = await db.get<swapRequestResponseDto>(sql);

    if(!row){
        return null;
    }

    return {
        id: row.id,
        requester: row.requester,
        targetUser: row.targetUser,
        shiftId: row.shiftId,
        status: row.status,
        createdAt: String(row.createdAt),
    }
}

export async function checkSwapRequestCollision(requesterId: string, targetUserId: string, shiftId: string): Promise<boolean> {
    const db = await getDb();
    const sql = `
        SELECT 1 FROM SwapRequests 
        WHERE requesterId = '${requesterId}' 
          AND targetUserId = '${targetUserId}' 
          AND shiftId = '${shiftId}'
        LIMIT 1
    `;
    const row = await db.get(sql);
    return !!row;
}

export async function createSwapRequestRepo(data: {
    requesterId: string,
    targetUserId: string,
    shiftId: string,
}): Promise<any> {
    const db = await getDb();
    const swapRequestId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const status = "pending";
    const sql = `
        INSERT INTO SwapRequests (id, requesterId, targetUserId, shiftId, status, createdAt)
        VALUES ('${swapRequestId}', '${data.requesterId}', '${data.targetUserId}', '${data.shiftId}', '${status}', '${createdAt}')
    `;
    await db.run(sql);
    return {
        id: swapRequestId,
        requesterId: data.requesterId,
        targetUserId: data.targetUserId,
        shiftId: data.shiftId,
        status: status as swapRequestResponseDto["status"],
        createdAt: createdAt,
    }
}

export async function updateSwapRequestRepo(
    id: string,
    fields: { requesterId?: string; targetUserId?: string; shiftId?: string; status?: string }
): Promise<void> {
    const db = await getDb();
    const updates: string[] = [];

    if (fields.requesterId) updates.push(`requesterId = '${fields.requesterId}'`);
    if (fields.targetUserId) updates.push(`targetUserId = '${fields.targetUserId}'`);
    if (fields.shiftId) updates.push(`shiftId = '${fields.shiftId}'`);
    if (fields.status) updates.push(`status = '${fields.status}'`);

    if (updates.length > 0) {
        const sql = `UPDATE SwapRequests SET ${updates.join(", ")} WHERE id = '${id}'`;
        await db.run(sql);
    }
}

export async function deleteSwapRequestRepo(id: string): Promise<number> {
    const db = await getDb();
    const result = await db.run(`DELETE FROM SwapRequests WHERE id = '${id}'`);
    return result.changes ?? 0;
}