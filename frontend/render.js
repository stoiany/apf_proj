export function renderTableStatus(status, error) {
    const el = document.getElementById("tableStatus");
    if (!el) return;

    if (status === "loading") el.innerHTML = "<p>Завантаження даних...</p>";
    else if (status === "empty") el.innerHTML = "<p>Записів поки що немає.</p>";
    else if (status === "error") el.innerHTML = `<p>Помилка: ${error?.message}</p>`;
    else el.innerHTML = "";
}

export function renderTable(items) {
    const tbody = document.getElementById("itemsTableBody");
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

export function fillForm(item) {
    document.getElementById("dateInput").value = item.date;
    document.getElementById("timeSlotSelect").value = item.time;
    document.getElementById("nameInput").value = item.username;
    document.getElementById("statusInput").value = item.status;
    document.getElementById("commentInput").value = item.comment || "";
}

export function changeFormToEdit(id) {
    document.getElementById("formTitle").innerHTML = "Форма редагування запису";
    document.getElementById("actionButtons").innerHTML = `
        <button type="button" class="save-button" data-id="${id}">Зберегти</button>
        <button type="button" class="reset-button">Стерти</button>
        <button type="button" class="cancelEdit-button">Відмінити</button>
    `;
}

export function changeFormToCreate() {
    document.getElementById("formTitle").innerHTML = "Форма створення запису";
    document.getElementById("actionButtons").innerHTML = `
        <button type="submit" class="submit-button">Підтвердити</button>
        <button type="button" class="reset-button">Стерти</button>
    `;
}

export function clearError(inputId, errorId){
    document.getElementById(inputId).classList.remove("invalid");
    document.getElementById(errorId).innerHTML = "";
}

export function clearErrors(){
    clearError("dateInput", "dateError");
    clearError("timeSlotSelect", "timeError");
    clearError("nameInput", "nameError");
    clearError("commentInput", "commentError");
    clearError("statusInput", "statusError");
}

export function showError(inputId, errorId, message){
    document.getElementById(inputId).classList.add("invalid");
    document.getElementById(errorId).innerHTML = message;
}

export function readForm() {
    return {
        id: Date.now().toString(),
        date: document.getElementById("dateInput").value,
        time: document.getElementById("timeSlotSelect").value,
        username: document.getElementById("nameInput").value,
        status: document.getElementById("statusInput").value,
        comment: document.getElementById("commentInput").value
    };
}

export function clearForm() {
    document.getElementById("dateInput").value = "";
    document.getElementById("timeSlotSelect").value = "";
    document.getElementById("nameInput").value = "";
    document.getElementById("statusInput").value = "";
    document.getElementById("commentInput").value = "";
}

export function setFormLoading(isLoading) {
    const buttons = document.querySelectorAll("#actionButtons button");

    buttons.forEach(btn => {
        btn.disabled = isLoading;
    });
}