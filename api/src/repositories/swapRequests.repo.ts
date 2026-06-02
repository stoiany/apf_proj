import {swapReqQueryParamsDto, swapRequestResponseDto} from "../schemas/swapRequest.schemas";
import {getDb} from "../db/dbClient";

export async function readSwapRequestsRepo(dto : swapReqQueryParamsDto) : Promise<swapRequestResponseDto[]> {
    const db = await getDb();
    const params: any[] = [];

    let sql = `
        SELECT SwapRequests.id,
               Requester.username AS requester,
               Target.username AS targetUser,
               SwapRequests.shiftId,
               SwapRequests.status,
               SwapRequests.createdAt
        FROM SwapRequests
        JOIN Users AS Requester ON SwapRequests.requesterId = Requester.id
        JOIN Users AS Target ON SwapRequests.targetUserId = Target.id
        WHERE 1=1
    `;

    if (dto.status) {
        sql += ` AND SwapRequests.status = ?`;
        params.push(dto.status);
    }

    if (dto.requesterId) {
        sql += ` AND SwapRequests.requesterId = ?`;
        params.push(dto.requesterId);
    }

    if (dto.targetUserId) {
        sql += ` AND SwapRequests.targetUserId = ?`;
        params.push(dto.targetUserId);
    }

    if(dto.sortBy){
        const dir = dto.sortDir === "desc" ? "DESC" : "ASC";
        sql += ` ORDER BY ${dto.sortBy} ${dir}`;
    }

    const rows = await db.all<any[]>(sql, params);

    return rows.map((row : any) => {
        return {
            id: String(row.id),
            requester: String(row.requester),
            targetUser: String(row.targetUser),
            shiftId: String(row.shiftId),
            status: row.status as swapRequestResponseDto["status"],
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
               SwapRequests.status,
               SwapRequests.createdAt
        FROM SwapRequests
                 JOIN Users AS Requester ON SwapRequests.requesterId = Requester.id
                 JOIN Users AS Target ON SwapRequests.targetUserId = Target.id
        WHERE SwapRequests.id = ?
    `;

    const row = await db.get<any>(sql, [targetId]);

    if(!row){
        return null;
    }

    return {
        id: String(row.id),
        requester: String(row.requester),
        targetUser: String(row.targetUser),
        shiftId: String(row.shiftId),
        status: row.status as swapRequestResponseDto["status"],
        createdAt: String(row.createdAt),
    }
}

export async function checkSwapRequestCollision(requesterId: string, targetUserId: string, shiftId: string): Promise<boolean> {
    const db = await getDb();
    const sql = `
        SELECT 1 FROM SwapRequests
        WHERE requesterId = ?
          AND targetUserId = ?
          AND shiftId = ?
        LIMIT 1
    `;
    const row = await db.get(sql, [requesterId, targetUserId, shiftId]);
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
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    await db.run(sql, [swapRequestId, data.requesterId, data.targetUserId, data.shiftId, status, createdAt]);

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
    const params: any[] = [];

    if (fields.requesterId) {
        updates.push(`requesterId = ?`);
        params.push(fields.requesterId);
    }
    if (fields.targetUserId) {
        updates.push(`targetUserId = ?`);
        params.push(fields.targetUserId);
    }
    if (fields.shiftId) {
        updates.push(`shiftId = ?`);
        params.push(fields.shiftId);
    }
    if (fields.status) {
        updates.push(`status = ?`);
        params.push(fields.status);
    }

    if (updates.length > 0) {
        params.push(id);
        const sql = `UPDATE SwapRequests SET ${updates.join(", ")} WHERE id = ?`;
        await db.run(sql, params);
    }
}

export async function deleteSwapRequestRepo(id: string): Promise<number> {
    const db = await getDb();
    const result = await db.run(`DELETE FROM SwapRequests WHERE id = ?`, [id]);
    return result.changes ?? 0;
}