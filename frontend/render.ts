import {Shift} from "./types.ts";

export function renderTableStatus(status : string, error:any = null) {
    const el = document.getElementById("tableStatus");
    if (!el) return;

    const errText = error?.message || String(error);
    if (status === "loading") el.innerHTML = "<p>Завантаження даних...</p>";
    else if (status === "empty") el.innerHTML = "<p>Записів поки що немає.</p>";
    else if (status === "error") el.innerHTML = `<p>Помилка: ${errText}</p>`;
    else el.innerHTML = "";
}

export function renderTable(items:Shift[]) {
    const tbody = document.getElementById("itemsTableBody") as HTMLElement;
    const tableTime = { "morning": "Ранок", "day": "День", "evening": "Вечір" };
    const tableStatus = { "scheduled": "Заплановано", "completed": "Виконано", "missed": "Пропущено" };

    tbody.innerHTML = items.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${item.date}</td>
            <td>${tableTime[item.time] || item.time}</td>
            <td>${item.username}</td>
            <td>${tableStatus[item.status] || item.status}</td>
            <td>${item.comment || ""}</td>
            <td>
                <button type="button" class="delete-btn" data-id="${item.id}">Delete</button>
                <button type="button" class="edit-btn" data-id="${item.id}">Edit</button>
            </td>
        </tr>
    `).join("");
}

export function fillForm(item:Shift) {
    (document.getElementById("dateInput") as HTMLInputElement).value = item.date;
    (document.getElementById("timeSlotSelect") as HTMLInputElement).value = item.time;
    (document.getElementById("nameInput") as HTMLInputElement).value = item.username;
    (document.getElementById("statusInput") as HTMLInputElement).value = item.status;
    (document.getElementById("commentInput") as HTMLInputElement).value = item.comment || "";
}

export function changeFormToEdit(id:string) {
    (document.getElementById("formTitle") as HTMLElement).innerHTML = "Форма редагування запису";
    (document.getElementById("actionButtons") as HTMLElement).innerHTML = `
        <button type="button" class="save-button" data-id="${id}">Зберегти</button>
        <button type="button" class="reset-button">Стерти</button>
        <button type="button" class="cancelEdit-button">Відмінити</button>
    `;
}

export function changeFormToCreate() {
    (document.getElementById("formTitle") as HTMLElement).innerHTML = "Форма створення запису";
    (document.getElementById("actionButtons") as HTMLElement).innerHTML = `
        <button type="submit" class="submit-button">Підтвердити</button>
        <button type="button" class="reset-button">Стерти</button>
    `;
}

export function clearError(inputId:string, errorId:string){
    (document.getElementById(inputId) as HTMLElement).classList.remove("invalid");
    (document.getElementById(errorId) as HTMLElement).innerHTML = "";
}

export function clearErrors(){
    clearError("dateInput", "dateError");
    clearError("timeSlotSelect", "timeError");
    clearError("nameInput", "nameError");
    clearError("commentInput", "commentError");
    clearError("statusInput", "statusError");
}

export function showError(inputId:string, errorId:string, message:string){
    (document.getElementById(inputId) as HTMLElement).classList.add("invalid");
    (document.getElementById(errorId) as HTMLElement).innerHTML = message;
}

export function readForm() {
    return {
        id: Date.now().toString(),
        date: (document.getElementById("dateInput") as HTMLInputElement).value,
        time: (document.getElementById("timeSlotSelect") as HTMLInputElement).value,
        username: (document.getElementById("nameInput") as HTMLInputElement).value,
        status: (document.getElementById("statusInput") as HTMLInputElement).value,
        comment: (document.getElementById("commentInput") as HTMLInputElement).value
    } as Shift;
}

export function clearForm() {
    (document.getElementById("dateInput") as HTMLInputElement).value = "";
    (document.getElementById("timeSlotSelect") as HTMLInputElement).value = "";
    (document.getElementById("nameInput") as HTMLInputElement).value = "";
    (document.getElementById("statusInput") as HTMLInputElement).value = "";
    (document.getElementById("commentInput") as HTMLInputElement).value = "";
}

export function setFormLoading(isLoading:boolean) {
    const buttons = document.querySelectorAll("#actionButtons button");

    buttons.forEach(btn => {
        (btn as HTMLButtonElement).disabled = isLoading;
    });
}