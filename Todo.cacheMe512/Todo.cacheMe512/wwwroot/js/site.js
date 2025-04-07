const uri = 'api/todoitems';
let todos = [];
let pendingDeleteId = null;
let deleteModal;

document.addEventListener('DOMContentLoaded', () => {
    deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        if (pendingDeleteId !== null) {
            deleteItemConfirmed(pendingDeleteId);
            pendingDeleteId = null;
            deleteModal.hide();
        }
    });

    getItems();
});


function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    alertContainer.innerHTML = ''; // clear previous alerts if needed

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    alertContainer.append(wrapper);
}
function clearAlert() {
    const alertContainer = document.getElementById('alert-container');
    if (alertContainer) {
        alertContainer.innerHTML = '';
    }
}

function getItems() {
    fetch(uri)
        .then(response => response.json())
        .then(data => _displayItems(data))
        .catch(error => console.error('Unable to get items.', error));
}

function addItem() {
    const addNameTextbox = document.getElementById('add-name');

    const item = {
        isComplete: false,
        name: addNameTextbox.value.trim()
    };

    fetch(uri, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    })
        .then(response => response.json())
        .then(() => {
            getItems();
            addNameTextbox.value = '';
        })
        .catch(error => console.error('Unable to add item.', error));
}

function deleteItem(id) {
    fetch(`${uri}/${id}`, {
        method: 'DELETE'
    })
        .then(() => getItems())
        .catch(error => console.error('Unable to delete item.', error));
}

function displayEditForm(id) {

    const item = todos.find(item => item.id === id);

    if (!item) {
        console.error("Item not found for edit:", id);
        return;
    }

    document.getElementById('edit-name').value = item.name;
    document.getElementById('edit-id').value = item.id;
    document.getElementById('edit-isComplete').checked = item.isComplete;

    const form = document.getElementById('editForm');
    form.classList.remove('d-none');
    form.style.display = 'block';

    setEditMode(true);
    showAlert('Changes are not saved until you click Save.', 'warning', 5000);
}

function updateItem(event) {
    event.preventDefault();

    const form = document.getElementById('edit-form');

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const itemId = document.getElementById('edit-id').value;
    const item = {
        id: parseInt(itemId, 10),
        isComplete: document.getElementById('edit-isComplete').checked,
        name: document.getElementById('edit-name').value.trim()
    };

    fetch(`${uri}/${itemId}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    })
        .then(() => {
            getItems();
            clearAlert();
            showAlert('To-do updated successfully!', 'success');
        })
        .catch(error => {
            console.error('Unable to update item.', error);
            showAlert('Failed to update item. Please try again.', 'danger');
        });

    closeInput();
    setEditMode(false);
    form.classList.remove('was-validated');
}

function closeInput() {
    const form = document.getElementById('editForm');
    form.classList.add('d-none');
    form.style.display = 'none';
    clearAlert();
    setEditMode(false);
}

function _displayCount(itemCount) {
    const name = (itemCount === 1) ? 'to-do' : 'to-dos';

    document.getElementById('counter').innerText = `${itemCount} ${name}`;
}

function _displayItems(data) {
    const tBody = document.getElementById('todos');
    tBody.innerHTML = '';

    _displayCount(data.length);

    const button = document.createElement('button');

    data.forEach(item => {
        let isCompleteCheckbox = document.createElement('input');
        isCompleteCheckbox.type = 'checkbox';
        isCompleteCheckbox.disabled = true;
        isCompleteCheckbox.checked = item.isComplete;
        isCompleteCheckbox.className = 'form-check-input';

        let editButton = document.createElement('button');
        editButton.innerText = 'Edit';
        editButton.className = 'btn btn-sm btn-outline-primary me-2';
        editButton.addEventListener('click', () => displayEditForm(item.id));

        let deleteButton = document.createElement('button');
        deleteButton.innerText = 'Delete';
        deleteButton.className = 'btn btn-sm btn-outline-danger delete-btn';
        deleteButton.addEventListener('click', () => showDeleteConfirmation(item.id));

        let tr = tBody.insertRow();

        let td1 = tr.insertCell(0);
        td1.appendChild(isCompleteCheckbox);

        let td2 = tr.insertCell(1);
        td2.appendChild(document.createTextNode(item.name));

        let td3 = tr.insertCell(2);
        td3.appendChild(editButton);

        let td4 = tr.insertCell(3);
        td4.appendChild(deleteButton);
    });

    todos = data;
}

function showDeleteConfirmation(id) {
    pendingDeleteId = id;
    deleteModal.show();
}

function deleteItemConfirmed(id) {
    fetch(`${uri}/${id}`, {
        method: 'DELETE'
    })
        .then(() => getItems())
        .catch(error => console.error('Unable to delete item.', error));
}

function setEditMode(enabled) {
    const addButton = document.getElementById('add-button');
    const deleteButtons = document.querySelectorAll('.delete-btn');

    if (addButton) addButton.disabled = enabled;

    deleteButtons.forEach(btn => {
        btn.disabled = enabled;
    });
}
