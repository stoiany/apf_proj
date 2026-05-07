import * as api from "./apiClient.ts";
import { state, setItems, setStatus, setFilter, setSort, getProcessedItems } from "./state.js";
import * as ui from "./render.js";
import {Shift} from "./types.ts";

function updateView() {
    ui.renderTableStatus(state.status, state.error);
    if (state.status === "success") {
        ui.renderTable(getProcessedItems());
    } else {
        ui.renderTable([]);
    }
}

async function loadData() {
    setStatus("loading");
    updateView();
    try {
        const data = await api.getShifts();
        if (!data || data.length === 0) {
            setStatus("empty");
            setItems([]);
        } else {
            setStatus("success");
            setItems(data);
        }
    } catch (err) {
        setStatus("error", err);
    }
    updateView();
}

function validate(dto:Shift) {
    ui.clearErrors();
    let isValid = true;
    if (dto.date === "") { ui.showError("dateInput", "dateError", "Обов'язкове поле."); isValid = false; }
    if (dto.time as string === "") { ui.showError("timeSlotSelect", "timeError", "Обов'язкове поле."); isValid = false; }
    const name = dto.username.trim();
    if (name === "") { ui.showError("nameInput", "nameError", "Обов'язкове поле."); isValid = false; }
    else if (name.length > 30) { ui.showError("nameInput", "nameError", "Не більше 30 символів."); isValid = false; }
    const comment = (dto.comment || "").trim();
    if (comment.length > 80) { ui.showError("commentInput", "commentError", "Максимум 80 символів"); isValid = false; }
    if (dto.status as string === "") { ui.showError("statusInput", "statusError", "Обов'язкове поле."); isValid = false; }
    return isValid;
}

document.getElementById("filterInput")?.addEventListener("change", (e) => {
    const target = e.target as HTMLSelectElement;
    setFilter(target.value);
    updateView();
});

document.getElementById("sortInput")?.addEventListener("change", (e) => {
    const target = e.target as HTMLSelectElement;
    setSort("date", target.value === "dateAsc" ? "asc" : "desc");
    updateView();
});

document.getElementById("tableHead")?.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("dateSort")) setSort("date", state.sortDirection === "asc" ? "desc" : "asc");
    if (target.classList.contains("timeSort")) setSort("time", state.sortDirection === "asc" ? "desc" : "asc");
    updateView();
});

document.getElementById("itemsTableBody")?.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;
    const id = target.dataset.id;

    if (!id) return;

    if (target.classList.contains("delete-btn")) {
        try {
            await api.deleteShift(id);
            await loadData();
        } catch (err) {
            const errText = (err as any)?.message || String(err);
            alert(`Помилка видалення: ${errText}`);
        }
    }

    if (target.classList.contains("edit-btn")) {
        const item = state.items.find(i => String(i.id) === String(id));
        if (item) {
            ui.fillForm(item);
            ui.changeFormToEdit(id);
        }
    }
});

document.getElementById("createForm")?.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;

    if (target.classList.contains("reset-button")) ui.clearForm();

    if (target.classList.contains("cancelEdit-button")) {
        ui.clearForm();
        ui.changeFormToCreate();
    }

    if (target.classList.contains("submit-button")) {
        e.preventDefault();
        const dto = ui.readForm();
        if (!validate(dto)) return;

        ui.setFormLoading(true);

        try {
            await api.createShift(dto);
            ui.clearForm();
            await loadData();
        } catch (err) {
            const errStatus = (err as any)?.status || String(err);
            if (errStatus === 409) {
                alert("Запис на цей час вже існує.");
                await loadData();

            } else {
                alert(`Помилка сервера: ${errStatus}`);
            }
        } finally {
            ui.setFormLoading(false);
        }
    }

    if (target.classList.contains("save-button")) {
        const id = target.dataset.id;
        const dto = ui.readForm();
        if (!validate(dto)) return;

        ui.setFormLoading(true);

        try {
            if(!id) return;
            await api.updateShift(id, dto);
            ui.clearForm();
            ui.changeFormToCreate();
            await loadData();
        } catch (err) {
            const errStatus = (err as any)?.status || String(err);
            if (errStatus === 404) {
                alert("Запис що ви намагаєтеся редагувати більше не існує.");
                ui.clearForm();
                ui.changeFormToCreate();
                await loadData();

            } else if (errStatus === 409) {
                alert("Запис на цей час вже існує.");
                await loadData();

            } else {
                alert(`Помилка сервера: ${errStatus}`);
            }
        } finally {
            ui.setFormLoading(false);
        }
    }
});

const fieldsToValidate = [
    { inputId: "dateInput", errorId: "dateError" },
    { inputId: "timeSlotSelect", errorId: "timeError" },
    { inputId: "nameInput", errorId: "nameError" },
    { inputId: "statusInput", errorId: "statusError" },
    { inputId: "commentInput", errorId: "commentError" }
]

fieldsToValidate.forEach(field => {
    const input = document.getElementById(field.inputId);
    input?.addEventListener("blur", (event) => {
        const target = event.target as HTMLInputElement;
        const value = target.value.trim();

        if (field.inputId === "commentInput" && value === "") {
            ui.clearError(field.inputId, field.errorId);
        } else if (value === "") {
            ui.showError(field.inputId, field.errorId, "Обов'язкове поле.");
        }
    });

    input?.addEventListener("input", (event) => {
        const target = event.target as HTMLInputElement;
        const value = target.value.trim();

        if (field.inputId === "commentInput" && value === "") {
            ui.clearError(field.inputId, field.errorId);
        } else if (value === "") {
            ui.showError(field.inputId, field.errorId, "Обов'язкове поле.");
        } else if (field.inputId === "nameInput" && value.length > 30) {
            ui.showError(field.inputId, field.errorId, "Ім'я користувача не може бути більше 30 символів.");
        } else if (field.inputId === "commentInput" && value.length > 80) {
            ui.showError(field.inputId, field.errorId, "Коментар не може бути більше 80 символів.");
        } else {
            ui.clearError(field.inputId, field.errorId);
        }
    });
});

void loadData();