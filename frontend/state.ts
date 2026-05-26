import {entity, Shift, SwapRequest, User} from "./types.ts";

export const state = {
    items: [] as (Shift | User | SwapRequest)[],
    currentEntity: "shifts" as entity,
    status: "idle", // "loading", "success", "empty", "error"
    error: null,
    filter: "all",
    sortState: "default",
    sortDirection: "desc"
};

export function setCurrentEntity(entity: entity) {
    state.currentEntity = entity;
    state.filter = "all";
    state.sortState = entity === "shifts" ? "date" : "username";
}

export function setItems(newItems : (Shift | User | SwapRequest)[]) {
    state.items = newItems;
}

export function setStatus(newStatus: string, newError:any = null) {
    state.status = newStatus;
    state.error = newError;
}

export function setFilter(filter : string) {
    state.filter = filter;
}

export function setSort(sortState: string, sortDir : string) {
    state.sortState = sortState;
    state.sortDirection = sortDir;
}

export function getProcessedItems() : (User | Shift | SwapRequest)[] {
    if(state.currentEntity === "shifts"){
        let processed = [...state.items] as Shift[];

        if (state.filter !== "all") {
            processed = processed.filter(item => String(item.status) === String(state.filter));
        }

        const tableTime = { "morning": "1", "day": "2", "evening": "3" };

        if (state.sortState === "date") {
            processed.sort((a, b) => state.sortDirection === "desc"
                ? b.date.localeCompare(a.date)
                : a.date.localeCompare(b.date));
        } else if (state.sortState === "time") {
            processed.sort((a, b) => state.sortDirection === "desc"
                ? tableTime[b.time].localeCompare(tableTime[a.time])
                : tableTime[a.time].localeCompare(tableTime[b.time]));
        }
        return processed;
    } else if(state.currentEntity === "users"){
        let processed = [...state.items] as User[];
        processed.sort((a, b) => state.sortDirection === "desc"
            ? b.username.localeCompare(a.username)
            : a.username.localeCompare(b.username));
        return processed;
    } else if(state.currentEntity === "swapRequests"){
        return [...state.items] as SwapRequest[];
    }

    return [];
}