const tableEl = document.getElementById("table");

const items = [];

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
    const dto = readForm();
    items.push(dto);
    renderTable(items);
    clearForm();
});