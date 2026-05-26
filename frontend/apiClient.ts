import {Shift, SwapRequest, User} from "./types";

const API_BASE_URL = "http://localhost:3000/api/v1";

async function request<T>(path : string, options : RequestInit = {}) : Promise<T | null> {
    const url = `${API_BASE_URL}${path}`;
    let response : Response;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        response = await fetch(url, {...options, signal: controller.signal });

        clearTimeout(timeoutId);

    } catch (e) {
        clearTimeout(timeoutId);
        if (e instanceof Error && e.name === 'AbortError') {
            throw {
                status: 408,
                code: "TIMEOUT",
                message: "Request timeout: сервер занадто довго не відповідає.",
                details: e.message
            };
        }

        throw {
            status: 0,
            message: "Network or CORS error.",
            details: e instanceof Error ? e.message : String(e)
        };
    }

    if(response.status === 204){
        return null;
    }

    const rawText = await response.text();

    if(response.ok){
        if(!rawText) return null;
        try{
            return JSON.parse(rawText);
        } catch {
            return rawText as unknown as T;
        }
    }

    // if response.ok is false
    let errPayload = null;
    try {
        errPayload = rawText ? JSON.parse(rawText) : null;
    } catch {

    }

    throw {
        status: response.status,
        code: errPayload?.code || "UNKNOWN_ERROR",
        message: errPayload?.message || "HTTP error (unknown format)",
        details: errPayload?.details || rawText || null,
    }
}

// SHIFTS

export async function getShifts() {
    return await request<Shift[]>("/shifts", { method: "GET" });
}

// export async function getShiftById(id) {
//     return await request<Shift>(`/shifts/${encodeURIComponent(id)}`, { method: "GET" });
// }

export async function createShift(dto : Shift) {
    return await request("/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
}

export async function updateShift(id : string, dto : Shift) {
    return await request(`/shifts/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
}

export async function deleteShift(id : string) {
    return await request(`/shifts/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// export async function getShiftsStats() {
//     return await request("/shifts/stats", { method: "GET" });
// }

// USERS

export async function getUsers() {
    return await request<User[]>("/users", { method: "GET" });
}

// export async function getUserById(id: string) {
//     return await request(`/users/${encodeURIComponent(id)}`, { method: "GET" });
// }

export async function createUser(dto: User) {
    return await request("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
}

export async function updateUser(id : string, dto : User) {
    return await request(`/users/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
}

export async function deleteUser(id : string) {
    return await request(`/users/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// SWAP REQUESTS

export async function getSwapRequests() {
    return await request<SwapRequest[]>("/swapRequests", { method: "GET" });
}

// export async function getSwapRequestById(id) {
//     return await request(`/swapRequests/${encodeURIComponent(id)}`, { method: "GET" });
// }

export async function createSwapRequest(dto : SwapRequest) {
    return await request("/swapRequests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
}

export async function updateSwapRequest(id : string, dto : SwapRequest) {
    return await request(`/swapRequests/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
}

export async function deleteSwapRequest(id : string) {
    return await request(`/swapRequests/${encodeURIComponent(id)}`, { method: "DELETE" });
}
//
// // SCHEDULES
//
// export async function getScheduleByUserId(id) {
//     return await request(`/schedules/${encodeURIComponent(id)}`, { method: "GET" });
// }