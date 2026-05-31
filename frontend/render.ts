import {entity, Shift, ShiftStat, SwapRequest, TopUser, User} from "./types.ts";

export function renderTableStatus(status : string, error:any = null) {
    const el = document.getElementById("tableStatus");
    if (!el) return;

    const errText = error?.message || String(error);
    if (status === "loading") el.innerHTML = "<p>Завантаження даних...</p>";
    else if (status === "empty") el.innerHTML = "<p>Записів поки що немає.</p>";
    else if (status === "error") el.innerHTML = `<p>Помилка: ${errText}</p>`;
    else el.innerHTML = "";
}

export function renderTable(entity: entity, items:(Shift | User | SwapRequest)[]) {
    if(entity === "shifts"){
        const tbody = document.getElementById("itemsTableBody") as HTMLElement;
        if (!tbody) return;

        const tableTime: Record<string, string> = { "morning": "Ранок", "day": "День", "evening": "Вечір" };
        const tableStatus: Record<string, string> = { "scheduled": "Заплановано", "completed": "Виконано", "missed": "Пропущено" };

        tbody.innerHTML = (items as Shift[]).map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${item.date}</td>
            <td>${tableTime[item.time] || item.time}</td>
            <td>${item.username}</td>
            <td>${tableStatus[item.status] || item.status}</td>
            <td>${item.comment || ""}</td>
            <td>
                <button type="button" class="edit-btn" data-id="${item.id}" data-entity="shifts">Edit</button>
                <button type="button" class="delete-btn" data-id="${item.id}" data-entity="shifts">Delete</button>
            </td>
        </tr>
    `).join("");

    } else if(entity === "users"){
        const tbody = document.getElementById("usersTableBody") as HTMLElement;
        if (!tbody) return;

        tbody.innerHTML = (items as User[]).map((item) => `
        <tr>
            <td>${item.id}</td>
            <td>${item.username}</td>
            <td>
                <button type="button" class="edit-btn" data-id="${item.id}" data-entity="users">Edit</button>
                <button type="button" class="delete-btn" data-id="${item.id}" data-entity="users">Delete</button>
            </td>
        </tr>
    `).join("");
    }

    else if (entity === "swapRequests") {
        const tbody = document.getElementById("swapRequestsTableBody") as HTMLElement;
        if (!tbody) return;

        const statusMap: Record<string, string> = { "pending": "Очікує", "approved": "Схвалено", "rejected": "Відхилено" };

        tbody.innerHTML = (items as SwapRequest[]).map((item) => `
        <tr>
            <td>${item.requester}</td>
            <td>${item.targetUser}</td>
            <td>${(item as SwapRequest).shiftInfo || item.shiftId}</td>
            <td>${statusMap[item.status || "pending"] || item.status}</td>
            <td>
                <button type="button" class="delete-btn" data-id="${item.id}" data-entity="swapRequests">Видалити</button>
            </td>
        </tr>
    `).join("");
    }
}

export function fillForm(entity: entity, item: Shift | User | SwapRequest) {
    if (entity === "shifts") {
        const shift = item as Shift;
        (document.getElementById("shift-date") as HTMLInputElement).value = shift.date;
        (document.getElementById("shift-time") as HTMLInputElement).value = shift.time;
        (document.getElementById("shift-username") as HTMLInputElement).value = shift.username;
        (document.getElementById("shift-status") as HTMLInputElement).value = shift.status;
        (document.getElementById("shift-comment") as HTMLInputElement).value = shift.comment || "";
    } else if (entity === "users") {
        const user = item as User;
        (document.getElementById("user-name") as HTMLInputElement).value = user.username;
    }
}

export function changeFormToEdit(form: HTMLFormElement, id:string) {
    const title = form.querySelector(".form-title") as HTMLTitleElement;
    const actionButtons = form.querySelector(".action-buttons") as HTMLElement;

    if(form.dataset.editTitle){
        title.innerHTML = form.dataset.editTitle;
    }

    actionButtons.innerHTML = `
        <button type="submit" class="save-button" data-id="${id}">Зберегти</button>
        <button type="reset" class="reset-button">Стерти</button>
        <button type="reset" class="cancelEdit-button">Відмінити</button>
    `;
}

export function changeFormToCreate(form: HTMLFormElement) {
    const title = form.querySelector(".form-title") as HTMLTitleElement;
    const actionButtons = form.querySelector(".action-buttons") as HTMLElement;

    if(form.dataset.createTitle){
        title.innerHTML = form.dataset.createTitle;
    }

    actionButtons.innerHTML = `
        <button type="submit" class="submit-button">Підтвердити</button>
        <button type="reset" class="reset-button">Стерти</button>
    `;
}

export function clearFieldError(form: HTMLFormElement, fieldName: string){
    const input = form.querySelector(`[name="${fieldName}"]`) as HTMLElement;
    const errorText = form.querySelector(`[data-error-for="${fieldName}"]`) as HTMLElement;

    if(input) input.classList.remove("invalid");
    if(errorText) errorText.innerHTML = "";
}

export function clearFormErrors(form: HTMLFormElement){
    const invalidInputs = form.querySelectorAll(".invalid");
    invalidInputs.forEach(input => input.classList.remove("invalid"));

    const errorTexts = form.querySelectorAll("[data-error-for]");
    errorTexts.forEach(error => error.innerHTML = "");
}

export function showFieldError(form: HTMLFormElement, fieldName: string, message: string){
    const input = form.querySelector(`[name="${fieldName}"]`) as HTMLElement;
    const errorText = form.querySelector(`[data-error-for="${fieldName}"]`) as HTMLElement;

    if(input) input.classList.add("invalid");
    if(errorText) errorText.innerHTML = message;
}

export function showFormErrors(form: HTMLFormElement, errors: Record<string, string>){
    clearFormErrors(form);

    for(const fieldName in errors){
        showFieldError(form, fieldName, errors[fieldName]);
    }
}

export function readForm(form : HTMLFormElement): Record<string, string> {
    const formData = new FormData(form);
    return Object.fromEntries(formData.entries()) as Record<string, string>;
}

export function setFormLoading(form: HTMLFormElement, isLoading: boolean) {
    const buttons = form.querySelectorAll("button");

    buttons.forEach(btn => {
        (btn as HTMLButtonElement).disabled = isLoading;
    });
}

export function renderSwapCreationData(shifts: Shift[], users: User[]) {
    const tbody = document.getElementById("swapsShiftsTableBody");
    const select = document.getElementById("swap-receiver");

    if (tbody) {
        const tableTime: Record<string, string> = { "morning": "Ранок", "day": "День", "evening": "Вечір" };
        tbody.innerHTML = shifts.map(shift => `
        <tr>
            <td>${shift.date}</td>
            <td>${tableTime[shift.time] || shift.time}</td>
            <td>${shift.username}</td>
            <td>
                <button type="button" class="select-shift-btn" 
                    data-id="${shift.id}" 
                    data-requester="${shift.username}"
                    data-date="${shift.date}"
                    data-time="${tableTime[shift.time] || shift.time}">Обрати</button>
            </td>
        </tr>
        `).join("");
    }

    if (select) {
        select.innerHTML = '<option value="">Оберіть користувача</option>' +
            users.map(u => `<option value="${u.username}">${u.username}</option>`).join("");
    }
}

export function renderStatsOverview(stats: ShiftStat[]) {
    const container = document.getElementById("stats-container");
    if (!container) return;
    const statusMap: Record<string, string> = { "scheduled": "Заплановано", "completed": "Виконано", "missed": "Пропущено" };

    container.innerHTML = stats.map(s => `
        <div class="nav-btn" style="cursor: default;">
            ${statusMap[s.status] || s.status}: <strong>${s.count}</strong>
        </div>
    `).join("");
}

export function renderTop3Users(users: TopUser[]) {
    const tbody = document.getElementById("top3-table-body");
    if (!tbody) return;
    if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3">Немає даних</td></tr>`;
        return;
    }
    tbody.innerHTML = users.map((u, index) => `
        <tr><td>${index + 1}</td><td>${u.username}</td><td>${u.count}</td></tr>
    `).join("");
}

export function renderUserScheduleList(users: User[]) {
    const select = document.getElementById("schedule-user-select");
    if (!select) return;
    select.innerHTML = '<option value="">Оберіть користувача</option>' +
        users.map(u => `<option value="${u.id}">${u.username}</option>`).join("");
}

export function renderUserScheduleTable(shifts: Shift[]) {
    const tbody = document.getElementById("user-schedule-table-body");
    if (!tbody) return;
    if (shifts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">Немає змін</td></tr>`;
        return;
    }
    const timeMap: Record<string, string> = { "morning": "Ранок", "day": "День", "evening": "Вечір" };
    const statusMap: Record<string, string> = { "scheduled": "Заплановано", "completed": "Виконано", "missed": "Пропущено" };

    tbody.innerHTML = shifts.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${item.date}</td>
            <td>${timeMap[item.time] || item.time}</td>
            <td>${item.username}</td>
            <td>${statusMap[item.status] || item.status}</td>
        </tr>
    `).join("");
}