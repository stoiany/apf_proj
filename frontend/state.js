const items = [];

function deleteItemById(id){
    const index = items.findIndex(item => String(item.id) === String(id));
    if(index !== -1) {
        items.splice(index, 1);
    }
}

function addItem(dto){
    items.push(dto);
}

function updateItem(id, dto){
    const index = items.findIndex(item => String(item.id) === String(id));
    if(index !==-1){
        items[index] = dto;
    }
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