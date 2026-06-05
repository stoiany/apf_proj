import * as api from "./apiClient.ts";
import {state, setItems, setStatus, setFilter, setSort, getProcessedItems, setCurrentEntity} from "./state.js";
import * as ui from "./render.js";
import {entity, formSchemas, Shift, SwapRequest, User} from "./types.ts";
import {validateData} from "./validation.ts";

function setupNavigation(){
    const navButtons = document.querySelectorAll('header .nav-btn');
    const navSections = document.querySelectorAll('main > .view');

    navButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const targetBtn = e.currentTarget as HTMLButtonElement;
            const targetId = targetBtn.getAttribute('data-target');
            const targetEntity = targetBtn.getAttribute('data-entity');

            if(!targetId) return;

            navButtons.forEach(btn => btn.classList.remove('active'));
            targetBtn.classList.add('active');

            navSections.forEach(sec => {
                if(sec.id === targetId){
                    sec.classList.remove('hidden');
                } else {
                    sec.classList.add('hidden');
                }
            });

            setCurrentEntity(targetEntity as "shifts" | "users");
            await loadData();
        });
    });
}

setupNavigation();

function updateView() {
    ui.renderTableStatus(state.status, state.error);
    if (state.status === "success") {
        ui.renderTable(state.currentEntity, getProcessedItems());
    } else {
        ui.renderTable(state.currentEntity, []);
    }
}

async function loadData() {
    setStatus("loading");
    const currentEntity = state.currentEntity;
    updateView();
    try {
        let data;
        if(currentEntity === "shifts"){
            data = await api.getShifts();
        } else if(currentEntity === "users"){
            data = await api.getUsers();
        } else if(currentEntity === "swapRequests"){
            const rawSwaps = await api.getSwapRequests();
            const shifts = await api.getShifts() || [];
            const users = await api.getUsers() || [];

            ui.renderSwapCreationData(shifts, users);

            const tableTime: Record<string, string> = { "morning": "Ранок", "day": "День", "evening": "Вечір" };

            data = rawSwaps?.map(swap => {
                const shift = shifts.find(s => String(s.id) === String(swap.shiftId));
                if (shift) {
                    const timeStr = tableTime[shift.time] || shift.time;
                    return { ...swap, shiftInfo: `${shift.date} (${timeStr})` };
                }
                return swap;
            });
        } else if (currentEntity === "stats") {
            const stats = await api.getShiftsStats() || [];
            ui.renderStatsOverview(stats);

            const users = await api.getUsers() || [];
            ui.renderUserScheduleList(users);
        }

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

document.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;
    const id = target.dataset.id;
    const entity = target.dataset.entity as entity;
    const form = target.closest('.view')?.querySelector('form') as HTMLFormElement;

    if (!id || !entity) return;

    if (target.classList.contains("delete-btn")) {
        try {
            if(entity === "shifts"){
                await api.deleteShift(id);
            } else if(entity === "users"){
                await api.deleteUser(id);
            } else if(entity === "swapRequests"){
                await api.deleteSwapRequest(id);
            }
            await loadData();
        } catch (err) {
            const errText = (err as any)?.message || String(err);
            alert(`Помилка видалення: ${errText}`);
        }
    }

    if (target.classList.contains("edit-btn")) {
        const item = state.items.find(i => String(i.id) === String(id));
        if (item) {
            ui.fillForm(entity, item);
            ui.changeFormToEdit(form, id);
        }
    }
});

// новий код по сабміту і ресету форми

document.addEventListener("reset", (e) => {
    const form = e.target as HTMLFormElement;

    if(formSchemas[form.id]){
        ui.clearFormErrors(form);
        ui.changeFormToCreate(form);
    }
});

document.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;

    const schema = formSchemas[form.id];
    if(!schema) return;

    const formData = ui.readForm(form);
    const validationResult = validateData(formData, schema);
    if(!validationResult.isValid){
        ui.showFormErrors(form, validationResult.errors);
        return;
    }

    ui.setFormLoading(form, true);

    const editId = e.submitter?.dataset.id; // pressed button; if EDIT button, it contains editId

    try {
        if(form.id === "shiftsForm"){
            if(editId){
                const dto = { ...formData, id: editId} as Shift;
                await api.updateShift(editId, dto);
                ui.changeFormToCreate(form);
            } else {
                const dto = { ...formData } as unknown as Shift;
                await api.createShift(dto);
            }
        }

        else if(form.id === "usersForm"){
            if(editId){
                const dto = {...formData, id: editId} as User;
                await api.updateUser(editId, dto);
                ui.changeFormToCreate(form);
            } else {
                const dto = {...formData} as unknown as User;
                await api.createUser(dto);
            }
        }

        else if(form.id === "swapRequestsForm") {
            const dto = { ...formData, status: "pending" } as unknown as SwapRequest;

            await api.createSwapRequest(dto);
            form.classList.add("hidden");
        }

        form.reset();
        await loadData();
    } catch(err) {
        const errStatus = (err as any)?.status || String(err);
        const errMessage = (err as any)?.message || "Невідома помилка";

        if (errStatus === 404) {
            alert("Редагований запис не знайдено.");
            form.reset();
            ui.changeFormToCreate(form);
            await loadData();
        } else if (errStatus === 409) {
            alert("Такий запис вже існує.");
            await loadData();
        } else if (errStatus === 403) {
            alert(`Відмовлено в доступі: ${errMessage}`);
        } else {
            alert(`Помилка сервера: ${errStatus} - ${errMessage}`);
        }
    } finally {
        ui.setFormLoading(form, false);
    }
});

// validation on change or losing focus
['input', 'focusout'].forEach(eventType => {
    document.addEventListener(eventType, (e) => {
        const target = e.target as HTMLElement;

        if(target.tagName !== "INPUT" && target.tagName !== "SELECT" && target.tagName !== "TEXTAREA"){
            return;
        }

        const form = target.closest('form') as HTMLFormElement;
        if (!form) return;

        const schema = formSchemas[form.id];
        if (!schema) return;

        const fieldName = (target as HTMLInputElement).name;
        if(!fieldName) return;

        const formData = ui.readForm(form);
        const validationResult = validateData(formData, schema);

        if(validationResult.errors[fieldName]){
            ui.showFieldError(form, fieldName, validationResult.errors[fieldName]);
        } else {
            ui.clearFieldError(form, fieldName);
        }
    });
});

// SWAP REQUESTS

document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    const listBtn = target.closest(".swaps-nav-list");
    const createBtn = target.closest(".swaps-nav-create");

    if (listBtn) {
        document.querySelectorAll(".swaps-nav-list").forEach(b => b.classList.add("active"));
        document.querySelectorAll(".swaps-nav-create").forEach(b => b.classList.remove("active"));

        document.getElementById("swaps-list-view")?.classList.remove("hidden");
        document.getElementById("swaps-create-view")?.classList.add("hidden");
    }

    if (createBtn) {
        document.querySelectorAll(".swaps-nav-create").forEach(b => b.classList.add("active"));
        document.querySelectorAll(".swaps-nav-list").forEach(b => b.classList.remove("active"));

        document.getElementById("swaps-create-view")?.classList.remove("hidden");
        document.getElementById("swaps-list-view")?.classList.add("hidden");
    }
});

// Вибір зміни для обміну
document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const selectShiftBtn = target.closest(".select-shift-btn") as HTMLButtonElement;

    if (selectShiftBtn) {
        const shiftId = selectShiftBtn.dataset.id;
        const requester = selectShiftBtn.dataset.requester;
        const date = selectShiftBtn.dataset.date;
        const time = selectShiftBtn.dataset.time;

        if (!shiftId || !requester) return;

        const form = document.getElementById("swapRequestsForm") as HTMLFormElement;
        form.classList.remove("hidden");

        (document.getElementById("swap-shift-id") as HTMLInputElement).value = shiftId;
        (document.getElementById("swap-requester") as HTMLInputElement).value = requester;

        const shiftInfoEl = document.getElementById("swap-shift-info");
        const reqInfoEl = document.getElementById("swap-requester-info");
        if (shiftInfoEl) shiftInfoEl.innerText = `${date} (Час: ${time})`;
        if (reqInfoEl) reqInfoEl.innerText = requester;
    }

    if (target.id === "cancel-swap-btn") {
        const form = document.getElementById("swapRequestsForm") as HTMLFormElement;
        form.reset();
        form.classList.add("hidden");
    }
});

document.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;
    if (target.id === "load-top3-btn") {
        const monthVal = (document.getElementById("top3-month-input") as HTMLInputElement).value;
        if (!monthVal) return alert("Оберіть місяць!");

        try {
            const data = await api.getTop3Users(`${monthVal}-01`);
            ui.renderTop3Users(data || []);
        } catch (err) {
            alert("Помилка завантаження топу");
        }
    } else if(target.id === "load-top3-by-time-btn"){
        const timeVal = (document.getElementById("top3-time-input") as HTMLSelectElement).value;
        if(!timeVal) return alert("Оберіть час.");

        try {
            const data = await api.getTop3UsersByTime(timeVal);
            ui.renderTop3UsersByTime(data || []);
        } catch (err) {
            alert("Помилка завантаження топу");
        }
    }
});

// show-user-schedule
document.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;
    const id = target.dataset.id;

    if(!id) return;
    if (target.classList.contains("show-user-schedule")) {
        try {
            const shifts = await api.getScheduleByUserId(id);
            ui.renderUserScheduleTable(shifts || []);
        } catch (err) {
            alert("Помилка завантаження розкладу");
        }
    }
});

document.addEventListener("change", async (e) => {
    const target = e.target as HTMLElement;
    if (target.id === "schedule-user-select") {
        const userId = (target as HTMLSelectElement).value;
        const tbody = document.getElementById("user-schedule-table-body");

        if (!userId) {
            if (tbody) tbody.innerHTML = "";
            return;
        }

        try {
            const shifts = await api.getScheduleByUserId(userId);
            ui.renderUserScheduleTable(shifts || []);
        } catch (err) {
            alert("Помилка завантаження розкладу");
        }
    }
});

void loadData();