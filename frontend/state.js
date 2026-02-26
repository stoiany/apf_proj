const STORAGE_KEY = "lab_items";

function saveToStorage(items){
    const json = JSON.stringify(items);
    localStorage.setItem(STORAGE_KEY, json);
}

function loadFromStorage(STORAGE_KEY){
    const json = localStorage.getItem(STORAGE_KEY);
    if(json === null) return [];
    try {
        const data = JSON.parse(json);
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

let items = loadFromStorage(STORAGE_KEY);

function deleteItemById(id){
    const index = items.findIndex(item => String(item.id) === String(id));
    if(index !== -1) {
        items.splice(index, 1);
    }
    saveToStorage(items);
}

function addItem(dto){
    const isDuplicate = items.some(item => String(item.date) === String(dto.date) && String(item.time) === String(dto.time));
    if(isDuplicate === true){
        return { success: false, message: "Запис на цей час вже існує." };
    }
    items.push(dto);
    saveToStorage(items);
    return { success: true };
}

function updateItem(id, dto){
    const index = items.findIndex(item => String(item.id) === String(id));
    if(index === -1){
        return { success: false, message: "Запису що Ви намагаєтеся відредагувати не існує." };
    }
    const isDuplicate = items.some(item => String(item.date) === String(dto.date) && String(item.time) === String(dto.time) && String(item.id) !== String(dto.id));
    if(isDuplicate === true){
        return { success: false, message: "Запис на цей час вже існує." };
    }
    items[index] = dto;
    saveToStorage(items);
    return { success: true };
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
    } else if(dto.username.length > 30){
        showError("nameInput", "nameError", "Ім'я користувача не може бути більше за 30 символів.");
        isValid = false;
    }

    const comment = dto.comment.trim();
    if(comment.length > 80){
        showError("commentInput", "commentError", "Максимальна кількість символів: 80");
        isValid = false;
    }
    if(dto.status === ""){
        showError("statusInput", "statusError", "Обов'язкове поле.");
        isValid = false;
    }

    return isValid;
}

let processedItems = items;

function filterArray(filter){
    if(filter !== "all"){
        processedItems = items.filter(item => String(item.status) === String(filter));
    } else {
        processedItems = items.slice();
    }
}

let sortState;

let sortDirection = "desc";

const tableTime = {
    "morning": "1",
    "day": "2",
    "evening": "3"
}

function sortArray(){
    if(sortState === "date"){
        if(sortDirection === "desc"){
            processedItems.sort((a,b) => b.date.localeCompare(a.date));
            sortDirection = "asc";
        } else {
            processedItems.sort((a,b) => a.date.localeCompare(b.date));
            sortDirection = "desc";
        }
    } else if(sortState === "time"){
        if(sortDirection === "desc"){
            processedItems.sort((a,b) => tableTime[b.time].localeCompare(tableTime[a.time]));
            sortDirection = "asc";
        } else {
            processedItems.sort((a,b) => tableTime[a.time].localeCompare(tableTime[b.time]));
            sortDirection = "desc";
        }
    }
}