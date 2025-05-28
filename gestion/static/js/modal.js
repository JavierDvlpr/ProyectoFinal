document.addEventListener('DOMContentLoaded', function () {
    // Crear contenedor del modal
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');

    // Mapa de nombres de tablas a URLs
    const tableUrls = {
        'especialidades': {
            create: '/especialidad/create/',
            update: (id) => `/especialidad/${id}/update/`,
            delete: (id) => `/especialidad/${id}/delete/`
        },
        'medicos': {
            create: '/medico/create/',
            update: (id) => `/medico/${id}/update/`,
            delete: (id) => `/medico/${id}/delete/`
        },
        'pacientes': {
            create: '/paciente/create/',
            update: (id) => `/paciente/${id}/update/`,
            delete: (id) => `/paciente/${id}/delete/`
        },
        'citas': {
            create: '/cita/create/',
            update: (id) => `/cita/${id}/update/`,
            delete: (id) => `/cita/${id}/delete/`
        },
        'recetas': {
            create: '/receta/create/',
            update: (id) => `/receta/${id}/update/`,
            delete: (id) => `/receta/${id}/delete/`
        }
    };

    // Variables globales
    let currentTable = '';
    let currentAction = '';
    let currentId = null;

    // Función para abrir el modal
    function openModal(table, action) {
        currentTable = table;
        currentAction = action;
        currentId = null;

        const url = tableUrls[table][action];
        console.log('Abriendo modal para:', url); // Depuración
        fetch(url, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                modalContent.innerHTML = html;
                modal.classList.remove('hidden');

                // Manejar el envío del formulario
                const form = document.getElementById('modal-form');
                if (form) {
                    form.addEventListener('submit', handleSubmit);
                }

                // Manejar cierre del modal
                document.querySelectorAll('.modal-close').forEach(btn => {
                    btn.addEventListener('click', closeModal);
                });
            })
            .catch(error => {
                console.error('Error al cargar el modal:', error);
                showError(`Ocurrió un error al cargar el formulario: ${error.message}`);
            });
    }

    // Función para manejar el envío del formulario
    function handleSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const url = form.action;
        console.log('Enviando formulario a:', url); // Depuración

        fetch(url, {
            method: 'POST',
            body: new FormData(form),
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    showSuccess(data.message);
                    closeModal();
                    window.location.reload();
                } else {
                    const errorsDiv = document.getElementById('form-errors');
                    errorsDiv.innerHTML = Object.values(data.errors).flat().join('<br>');
                    errorsDiv.classList.remove('hidden');
                }
            })
            .catch(error => {
                console.error('Error al procesar la solicitud:', error);
                showError(`Ocurrió un error al procesar la solicitud: ${error.message}`);
            });
    }

    // Función para manejar la eliminación
    function confirmDelete(table, id) {
        currentTable = table;
        currentId = id;

        const url = tableUrls[table].delete(id);
        console.log('Abriendo modal de eliminación para:', url); // Depuración
        fetch(url, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                modalContent.innerHTML = html;
                modal.classList.remove('hidden');

                // Manejar el envío del formulario de eliminación
                const form = document.getElementById('modal-form');
                if (form) {
                    form.addEventListener('submit', function (e) {
                        e.preventDefault();
                        console.log('Enviando solicitud de eliminación a:', url); // Depuración
                        fetch(url, {
                            method: 'POST',
                            body: new FormData(form),
                            headers: { 'X-Requested-With': 'XMLHttpRequest' }
                        })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(`HTTP error! status: ${response.status}`);
                                }
                                return response.json();
                            })
                            .then(data => {
                                if (data.success) {
                                    showSuccess(data.message);
                                    closeModal();
                                    window.location.reload();
                                } else {
                                    showError('Error al eliminar el registro.');
                                }
                            })
                            .catch(error => {
                                console.error('Error al procesar la eliminación:', error);
                                showError(`Ocurrió un error al procesar la solicitud: ${error.message}`);
                            });
                    });
                }

                // Manejar cierre del modal
                document.querySelectorAll('.modal-close').forEach(btn => {
                    btn.addEventListener('click', closeModal);
                });
            })
            .catch(error => {
                console.error('Error al cargar el modal de eliminación:', error);
                showError(`Ocurrió un error al cargar el formulario: ${error.message}`);
            });
    }

    // Función para cerrar el modal
    function closeModal() {
        modal.classList.add('hidden');
        modalContent.innerHTML = '';
        currentTable = '';
        currentAction = '';
        currentId = null;
    }

    // Función para alternar tablas
    function toggleTable(tableId) {
        console.log('Toggling table:', tableId); // Depuración
        const table = document.getElementById(tableId + '-table');
        const arrow = document.getElementById(tableId + '-arrow');
        
        if (table.classList.contains('hidden')) {
            table.classList.remove('hidden');
            arrow.textContent = '▲';
        } else {
            table.classList.add('hidden');
            arrow.textContent = '▼';
        }
    }

    // Funciones de notificación
    function showSuccess(message) {
        alert(message); // Reemplazar con una notificación más elegante si se desea
    }

    function showError(message) {
        alert(message); // Reemplazar con una notificación más elegante si se desea
    }

    // Event listeners para botones
    document.querySelectorAll('.create-button').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation(); // Evitar que toggleTable se active
            const table = this.getAttribute('data-table');
            console.log('Botón crear clicado para:', table); // Depuración
            openModal(table, 'create');
        });
    });

    document.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const table = this.getAttribute('data-table');
            const id = this.getAttribute('data-id');
            const url = this.getAttribute('data-url');
            console.log('Botón editar clicado para:', url); // Depuración
            fetch(url, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(html => {
                    modalContent.innerHTML = html;
                    modal.classList.remove('hidden');

                    const form = document.getElementById('modal-form');
                    if (form) {
                        form.addEventListener('submit', handleSubmit);
                    }

                    document.querySelectorAll('.modal-close').forEach(btn => {
                        btn.addEventListener('click', closeModal);
                    });
                })
                .catch(error => {
                    console.error('Error al cargar el modal de edición:', error);
                    showError(`Ocurrió un error al cargar el formulario: ${error.message}`);
                });
        });
    });

    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const table = this.getAttribute('data-table');
            const id = this.getAttribute('data-id');
            console.log('Botón eliminar clicado para:', table, id); // Depuración
            confirmDelete(table, id);
        });
    });

    // Asignar event listeners para colapsar tablas
    const tableHeaders = document.querySelectorAll('.cursor-pointer');
    tableHeaders.forEach(header => {
        header.addEventListener('click', function (e) {
            const tableId = this.nextElementSibling.id.replace('-table', '');
            console.log('Header clicado para:', tableId); // Depuración
            toggleTable(tableId);
        });
    });
});