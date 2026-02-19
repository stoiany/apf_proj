renderTable(items);

const fieldsToValidate = [
    { inputId: "dateInput", errorId: "dateError" },
    { inputId: "timeSlotSelect", errorId: "timeError" },
    { inputId: "nameInput", errorId: "nameError" },
    { inputId: "statusInput", errorId: "statusError" },
    { inputId: "commentInput", errorId: "commentError" }
]

fieldsToValidate.forEach(field => {
   const input = document.getElementById(field.inputId);

   input.addEventListener("blur", (event) => {
       const value = event.target.value.trim();

       if(field.inputId === "commentInput" && value === ""){
           clearError(field.inputId, field.errorId);
       }
       else if(value === ""){
           showError(field.inputId, field.errorId, "Обов'язкове поле.");
       }
   });

   input.addEventListener("input", (event) => {
       const value = event.target.value.trim();

       if(field.inputId === "commentInput" && value === ""){
           clearError(field.inputId, field.errorId);
       }
       else if(value === ""){
           showError(field.inputId, field.errorId, "Обов'язкове поле.");
       }
       else if(field.inputId === "nameInput" && value.length > 30){
           showError(field.inputId, field.errorId, "Ім'я користувача не може бути більше 30 символів.");
       }
       else if(field.inputId === "commentInput" && value.length > 80){
           showError(field.inputId, field.errorId, "Коментар не може бути більше 80 символів.");
       }
       else {
           clearError(field.inputId, field.errorId);
       }
   });
});

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
        const result = addItem(dto);
        if(result.success === false){ alert(result.message); return; }
        renderTable(items);
        clearForm();
    }

    if(target.classList.contains("save-button")){
        const id = target.dataset.id;
        const dto = readForm();
        const isValid = validate(dto);
        if(isValid === false){ return; }
        dto.id = id;
        const result = updateItem(id, dto);
        if(result.success === false){ alert(result.message); return; }
        renderTable(items);
        clearForm();
        startForm();
    }

    if(target.classList.contains("cancelEdit-button")){
        clearForm();
        startForm();
    }
});