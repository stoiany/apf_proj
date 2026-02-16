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
    const currentDate = new Date();
    const isoDate = currentDate.toISOString().slice(0,10);
    if(dto.date === ""){
        showError("dateInput", "dateError", "Оберіть дату чергування.");
        isValid = false;
    } else if(dto.date < isoDate){
        showError("dateInput", "dateError", "Введене значення не коректне.");
        isValid = false;
    }
    if(dto.time === ""){
        showError("timeSlotSelect", "timeError", "Оберіть час зі списку.");
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
        showError("statusInput", "statusError", "Оберіть статус запису.");
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

const tbody = document.getElementById("itemsTableBody");
tbody.addEventListener("click", (event) => {
    const target = event.target;

    if(target.classList.contains("delete-btn")){
        const id = target.dataset.id;
        deleteItemById(id);
        renderTable(items);
    }
});

const btn = document.getElementById("reset-button");
btn.addEventListener("click", () => {
    clearForm();
});

const form = document.getElementById("createForm");
form.addEventListener("submit", (event) => {
    event.preventDefault();
    const dto = readForm();
    const isValid = validate(dto);
    if(isValid !== true){
        return;
    }
    items.push(dto);
    renderTable(items);
    clearForm();
});