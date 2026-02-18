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