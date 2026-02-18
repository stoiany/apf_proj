function clearError(inputId, errorId){
    document.getElementById(inputId).classList.remove("invalid");
    document.getElementById(errorId).innerHTML = "";
}

function clearErrors(){
    clearError("dateInput", "dateError");
    clearError("timeSlotSelect", "timeError");
    clearError("nameInput", "nameError");
    clearError("commentInput", "commentError");
    clearError("statusInput", "statusError");
}

function showError(inputId, errorId, message){
    document.getElementById(inputId).classList.add("invalid");
    document.getElementById(errorId).innerHTML = message;
}

function readForm() {
    return {
        id: Date.now().toString(),
        date: document.getElementById("dateInput").value,
        time: document.getElementById("timeSlotSelect").value,
        username: document.getElementById("nameInput").value,
        status: document.getElementById("statusInput").value,
        comment: document.getElementById("commentInput").value
    };
}

function fillForm(item){
    document.getElementById("dateInput").value = item.date;
    document.getElementById("timeSlotSelect").value = item.time;
    document.getElementById("nameInput").value = item.username;
    document.getElementById("statusInput").value = item.status;
    document.getElementById("commentInput").value = item.comment;
}

function startEditById(id){
    const index = items.findIndex(item => String(item.id) === String(id));
    if (index === -1) {
        return;
    }
    fillForm(items[index]);
    document.getElementById("formTitle").innerHTML = "Форма редагування запису";
    const btns = document.getElementById("actionButtons");
    btns.innerHTML = `
        <button type="button" class="save-button" data-id="${id}">Зберегти</button>
        <button type="button" class="reset-button">Стерти</button>
        <button type="button" class="cancelEdit-button">Відмінити</button>
    `;
}

function startForm(){
    document.getElementById("formTitle").innerHTML = "Форма створення запису";
    const btns = document.getElementById("actionButtons");
    btns.innerHTML = `
            <button type="submit" class="submit-button">Підтвердити</button>
            <button type="button" class="reset-button">Стерти</button>
    `;
}

function clearForm() {
    document.getElementById("dateInput").value = "";
    document.getElementById("timeSlotSelect").value = "";
    document.getElementById("nameInput").value = "";
    document.getElementById("statusInput").value = "";
    document.getElementById("commentInput").value = "";
}

function renderTable(items) {
    const tbody = document.getElementById("itemsTableBody");
    const tableTime = {
        "morning": "Ранок",
        "day": "День",
        "evening": "Вечір"
    }

    const tableStatus = {
        "scheduled": "Заплановано",
        "completed": "Виконано",
        "missed": "Пропущено"
    }
    tbody.innerHTML = items.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${item.date}</td>
                <td>${tableTime[item.time] || item.time}</td>
                <td>${item.username}</td>
                <td>${tableStatus[item.status] || item.status}</td>
                <td>${item.comment}</td>
                <td>
                    <button type="button" class="delete-btn" data-id="${item.id}">Delete</button>
                    <button type="button" class="edit-btn" data-id="${item.id}">Edit</button>
                </td>
            </tr>
        `).join("");
}