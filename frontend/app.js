const items = [];

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

function validate(dto){
    clearErrors();

    let isValid = true;
    if(dto.date === ""){
        showError("dateInput", "dateError", "Обов'язкове поле.");
        isValid = false;
    }
    if(dto.time === ""){
        showError("timeSlotSelect", "timeError", "Обов'язкове поле.");
        isValid = false;
    }
    const name = dto.username.trim();
    if(name === ""){
        showError("nameInput", "nameError", "Обов'язкове поле.");
        isValid = false;
    } else if(dto.username.length > 25){
        showError("nameInput", "nameError", "Ім'я користувача не може бути більше за 25 символів.");
        isValid = false;
    }
    const comment = dto.comment.trim();
    if(comment.length > 30 ){
        showError("commentInput", "commentError", "Максимальна кількість символів: 30");
        isValid = false;
    }
    if(dto.status === ""){
        showError("statusInput", "statusError", "Обов'язкове поле.");
        isValid = false;
    }
    return isValid;
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

function deleteItemById(id){
    const index = items.findIndex(item => String(item.id) === String(id));
    if(index !== -1) {
        items.splice(index, 1);
    }
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
    `
}

const tbody = document.getElementById("itemsTableBody");
tbody.addEventListener("click", (event) => {
    const target = event.target;

    if(target.classList.contains("delete-btn")){
        const id = target.dataset.id;
        deleteItemById(id);
        renderTable(items);
    }

    if(target.classList.contains("edit-btn")){
        const id = target.dataset.id;
        startEditById(id);
    }
});

const form = document.getElementById("createForm");
form.addEventListener("click", (event) => {
    const target = event.target;

    if(target.classList.contains("reset-button")){
        clearForm();
    }

    if(target.classList.contains("submit-button")){
        event.preventDefault();
        const dto = readForm();
        const isValid = validate(dto);
        if(isValid !== true){
            return;
        }
        items.push(dto);
        renderTable(items);
        clearForm();
    }

    if(target.classList.contains("save-button")){
        const id = target.dataset.id;
        const dto = readForm();
        const isValid = validate(dto);
        if(isValid !== true){
            return;
        }
        const index = items.findIndex(item => String(item.id) === String(id));
        if(index === -1){
            alert("Запис який Ви намагаєтеся зберігти більше не існує.");
        }
        items[index] = dto;
        renderTable(items);
        clearForm();
        document.getElementById("formTitle").innerHTML = "Форма створення запису";
        const btns = document.getElementById("actionButtons");
        btns.innerHTML = `
            <button type="submit" class="submit-button">Підтвердити</button>
            <button type="button" class="reset-button">Стерти</button>
        `;
    }

    if(target.classList.contains("cancelEdit-button")){
        clearForm();
        document.getElementById("formTitle").innerHTML = "Форма створення запису";
        const btns = document.getElementById("actionButtons");
        btns.innerHTML = `
            <button type="submit" class="submit-button">Підтвердити</button>
            <button type="button" class="reset-button">Стерти</button>
        `;
    }
});