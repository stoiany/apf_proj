renderTable(items);

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
        addItem(dto);
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