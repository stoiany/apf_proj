const API_BASE_URL = "http://localhost:3000/api";

async function request(path, options = {}){
    const url = `${API_BASE_URL}${path}`;
    let response;

    try {
        response = await fetch(url, options);
    } catch (e) {
        throw {
            status: 0,
            message: "Network or CORS error.",
            details: e?.message || String(e)
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
            return rawText;
        }
    }

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
    return await request("/shifts", { method: "GET" });
}

export async function getShiftById(id) {
    return await request(`/shifts/${encodeURIComponent(id)}`, { method: "GET" });
}

export async function createShift(dto) {
    return await request("/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
}

export async function updateShift(id, dto) {
    return await request(`/shifts/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
}

export async function deleteShift(id) {
    return await request(`/shifts/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function getShiftsStats() {
    return await request("/shifts/stats", { method: "GET" });
}

// USERS

export async function getUsers() {
    return await request("/users", { method: "GET" });
}

export async function getUserById(id) {
    return await request(`/users/${encodeURIComponent(id)}`, { method: "GET" });
}

export async function createUser(dto) {
    return await request("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
}

export async function updateUser(id, dto) {
    return await request(`/users/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
}

export async function deleteUser(id) {
    return await request(`/users/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// SWAP REQUESTS

export async function getSwapRequests() {
    return await request("/swapRequests", { method: "GET" });
}

export async function getSwapRequestById(id) {
    return await request(`/swapRequests/${encodeURIComponent(id)}`, { method: "GET" });
}

export async function createSwapRequest(dto) {
    return await request("/swapRequests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
}

export async function updateSwapRequest(id, dto) {
    return await request(`/swapRequests/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
}

export async function deleteSwapRequest(id) {
    return await request(`/swapRequests/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// SCHEDULES

export async function getScheduleByUserId(id) {
    return await request(`/schedules/${encodeURIComponent(id)}`, { method: "GET" });
}