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
        addItem(dto);
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
            alert("Запису що Ви намагаєтеся редагувати не існує.");
        }
        dto.id = id;
        updateItem(id, dto);
        renderTable(items);
        clearForm();
        startForm();
    }

    if(target.classList.contains("cancelEdit-button")){
        clearForm();
        startForm();
    }
});