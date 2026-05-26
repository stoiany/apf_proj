import * as api from "./apiClient.ts";
import {state, setItems, setStatus, setFilter, setSort, getProcessedItems, setCurrentEntity} from "./state.js";
import * as ui from "./render.js";
import {entity, formSchemas, Shift, SwapRequest, User} from "./types.ts";
import {validateData} from "./validation.ts";
import {createShift, createUser, updateShift, updateUser} from "./apiClient.ts";

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
                await updateShift(editId, dto);
                ui.changeFormToCreate(form);
            } else {
                const dto = { ...formData } as unknown as Shift;
                await createShift(dto);
            }
        }

        else if(form.id === "usersForm"){
            if(editId){
                const dto = {...formData, id: editId} as User;
                await updateUser(editId, dto);
                ui.changeFormToCreate(form);
            } else {
                const dto = {...formData} as unknown as User;
                await createUser(dto);
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
        if (errStatus === 404) {
            alert("Редагований запис не знайдено.");
            form.reset();
            ui.changeFormToCreate(form);
            await loadData();
        } else if (errStatus === 409) {
            alert("Такий запис вже існує.");
            await loadData();
        } else {
            alert(`Помилка сервера: ${errStatus}`);
        }
    } finally {
        ui.setFormLoading(form,     false);
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

// --- ЛОГІКА ДЛЯ ЗАПИТІВ НА ОБМІН (SWAP REQUESTS) ---

// 1. Перемикання підвкладок "Список запитів" та "Створити новий"
document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    const listBtn = target.closest(".swaps-nav-list");
    const createBtn = target.closest(".swaps-nav-create");

    if (listBtn) {
        // Робимо кнопки активними/неактивними
        document.querySelectorAll(".swaps-nav-list").forEach(b => b.classList.add("active"));
        document.querySelectorAll(".swaps-nav-create").forEach(b => b.classList.remove("active"));

        // Перемикаємо видимість блоків
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

// 2. Вибір зміни для обміну (заповнення прихованих полів)
document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const selectShiftBtn = target.closest(".select-shift-btn") as HTMLButtonElement;

    if (selectShiftBtn) {
        // Зчитуємо дані з кнопки, на яку клікнули
        const shiftId = selectShiftBtn.dataset.id;
        const requester = selectShiftBtn.dataset.requester;
        const date = selectShiftBtn.dataset.date;
        const time = selectShiftBtn.dataset.time;

        if (!shiftId || !requester) return;

        // Показуємо форму
        const form = document.getElementById("swapRequestsForm") as HTMLFormElement;
        form.classList.remove("hidden");

        // Записуємо дані у твої приховані інпути
        (document.getElementById("swap-shift-id") as HTMLInputElement).value = shiftId;
        (document.getElementById("swap-requester") as HTMLInputElement).value = requester;

        // Виводимо інформацію для юзера текстом (щоб він бачив, що обрав)
        const shiftInfoEl = document.getElementById("swap-shift-info");
        const reqInfoEl = document.getElementById("swap-requester-info");
        if (shiftInfoEl) shiftInfoEl.innerText = `${date} (Час: ${time})`;
        if (reqInfoEl) reqInfoEl.innerText = requester;
    }

    // Кнопка скасування форми
    if (target.id === "cancel-swap-btn") {
        const form = document.getElementById("swapRequestsForm") as HTMLFormElement;
        form.reset();
        form.classList.add("hidden");
    }
});

void loadData();