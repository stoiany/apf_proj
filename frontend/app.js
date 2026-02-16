const tableEl = document.getElementById("table");

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

function validate(){
    clearErrors();

    let isValid = true;
    const date = document.getElementById("dateInput").value;
    const currentDate = new Date();
    const isoDate = currentDate.toISOString().slice(0,10);
    if(date === ""){
        showError("dateInput", "dateError", "Оберіть дату чергування.");
        isValid = false;
        return isValid;
    } else if(date < isoDate){
        showError("dateInput", "dateError", "Введене значення не коректне.");
        isValid = false;
        return isValid
    }
    if(document.getElementById("timeSlotSelect").value === ""){
        showError("timeSlotSelect", "timeError", "Оберіть час зі списку.");
        isValid = false;
        return isValid;
    }
    const name = document.getElementById("nameInput").value.trim();
    if(name === ""){
        showError("nameInput", "nameError", "Обов'язкове поле.");
        isValid = false;
        return isValid;
    }
    const comment = document.getElementById("commentInput").value.trim();
    if(comment.length > 30 ){
        showError("commentInput", "commentError", "Максимальна кількість символів: 30");
        isValid = false;
        return isValid;
    }
    if(document.getElementById("statusInput").value === ""){
        showError("statusInput", "statusError", "Оберіть статус запису.");
        isValid = false;
        return isValid;
    }
    return isValid;
}

function readForm() {
    return {
        date: document.getElementById("dateInput").value,
        time: document.getElementById("timeSlotSelect").value,
        username: document.getElementById("nameInput").value,
        status: document.getElementById("statusInput").value,
        comment: document.getElementById("commentInput").value
    };
}

function clearForm() {
    return {
        date: document.getElementById("dateInput").value = "",
        time: document.getElementById("timeSlotSelect").value = "",
        username: document.getElementById("nameInput").value = "",
        status: document.getElementById("statusInput").value = "",
        comment: document.getElementById("commentInput").value = ""
    };
}

function renderTable(items) {
    const tbody = document.getElementById("itemsTableBody");
    tbody.innerHTML = items.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${item.date}</td>
                <td>${item.time}</td>
                <td>${item.username}</td>
                <td>${item.status}</td>
                <td>${item.comment}</td>
                <td>
                    <button type="button" class="delete-btn" data-id="${item.id}">Delete</button>
                </td>
            </tr>
        `).join("");
}

const btn = document.getElementById("reset-button");
btn.addEventListener("click", () => {
    clearForm();
});

const form = document.getElementById("createForm");
form.addEventListener("submit", (event) => {
    event.preventDefault();
    const isValid = validate();
    if(isValid !== true){
        return;
    }
    const dto = readForm();
    items.push(dto);
    renderTable(items);
    clearForm();
});