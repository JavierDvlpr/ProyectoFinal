document.addEventListener('DOMContentLoaded', function () {
    // Obtener el token CSRF desde el input csrfmiddlewaretoken
    function getCsrfToken() {
        const tokenElement = document.querySelector('input[name="csrfmiddlewaretoken"]');
        return tokenElement ? tokenElement.value : '';
    }

    // Función para alternar visibilidad de resultados
    function toggleReporte(reporteId) {
        const table = document.getElementById(`${reporteId}-table`);
        const arrow = document.getElementById(`${reporteId}-arrow`);
        if (table.classList.contains('hidden')) {
            table.classList.remove('hidden');
            arrow.textContent = '▲';
        } else {
            table.classList.add('hidden');
            arrow.textContent = '▼';
        }
    }

    // Función para mostrar resultados
    function mostrarResultados(reporteId, columns, rows) {
        const resultsDiv = document.getElementById(`reporte-${reporteId}-results`);
        if (rows.length === 0) {
            resultsDiv.innerHTML = '<p class="text-gray-400">No se encontraron resultados.</p>';
            return;
        }

        let html = '<table class="w-full"><thead class="bg-dark-700"><tr>';
        columns.forEach(col => {
            html += `<th class="p-4 text-left text-gray-300 font-semibold">${col}</th>`;
        });
        html += '</tr></thead><tbody class="divide-y divide-dark-700">';
        rows.forEach(row => {
            html += '<tr class="hover:bg-dark-700">';
            row.forEach(cell => {
                html += `<td class="p-3 text-gray-200">${cell || '-'}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        resultsDiv.innerHTML = html;
    }

    // Función para mostrar errores
    function mostrarError(reporteId, mensaje) {
        const resultsDiv = document.getElementById(`reporte-${reporteId}-results`);
        resultsDiv.innerHTML = `<p class="text-red-500">${mensaje}</p>`;
    }

    // Función para ejecutar el reporte
    function ejecutarReporte(reporteId, fechaInput) {
        const formData = new FormData();
        formData.append('reporte_id', reporteId);
        if (fechaInput) {
            formData.append('fecha_input', fechaInput);
        }

        console.log('Enviando solicitud AJAX a /reportes/ejecutar/', { reporteId, fechaInput }); // Depuración

        fetch('/reportes/ejecutar/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': getCsrfToken()
            }
        })
            .then(response => {
                console.log(`Respuesta recibida, status: ${response.status}`); // Depuración
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error || `HTTP error! status: ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Datos recibidos:', data); // Depuración
                if (data.success) {
                    mostrarResultados(reporteId, data.columns, data.rows);
                    // Asegurar que la tabla de resultados esté visible
                    const table = document.getElementById(`reporte-${reporteId}-table`);
                    if (table.classList.contains('hidden')) {
                        toggleReporte(`reporte-${reporteId}`);
                    }
                    // Habilitar botones de exportación
                    const exportButtons = document.querySelectorAll(`#reporte-${reporteId}-table .export-btn`);
                    exportButtons.forEach(btn => btn.disabled = false);
                } else {
                    mostrarError(reporteId, data.error || 'Error desconocido al ejecutar el reporte');
                }
            })
            .catch(error => {
                console.error('Error al ejecutar el reporte:', error);
                mostrarError(reporteId, `Error: ${error.message}`);
            });
    }

    // Función para exportar reporte
    function exportarReporte(reporteId, fechaInput, formato) {
        const formData = new FormData();
        formData.append('reporte_id', reporteId);
        if (fechaInput) {
            formData.append('fecha_input', fechaInput);
        }

        const url = formato === 'pdf' ? '/reportes/exportar/pdf/' : '/reportes/exportar/excel/';
        console.log(`Enviando solicitud AJAX a ${url}`, { reporteId, fechaInput }); // Depuración

        // Mostrar mensaje de carga
        const loadingDiv = document.getElementById('loading');
        loadingDiv.classList.remove('hidden');

        fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCsrfToken()
            }
        })
            .then(response => {
                console.log(`Respuesta recibida, status: ${response.status}`); // Depuración
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error || `HTTP error! status: ${response.status}`);
                    });
                }
                return response.blob().then(blob => ({ blob, headers: response.headers }));
            })
            .then(({ blob, headers }) => {
                const contentDisposition = headers.get('Content-Disposition') || '';
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                const filename = filenameMatch ? filenameMatch[1] : `reporte_${formato}.${formato}`;
                
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                
                // Ocultar mensaje de carga
                loadingDiv.classList.add('hidden');
            })
            .catch(error => {
                console.error(`Error al exportar ${formato.toUpperCase()}:`, error);
                mostrarError(reporteId, `Error al exportar ${formato.toUpperCase()}: ${error.message}`);
                loadingDiv.classList.add('hidden');
            });
    }

    // Manejar botones "Ejecutar"
    document.querySelectorAll('.ejecutar-reporte').forEach(button => {
        button.addEventListener('click', function () {
            const reporteId = this.getAttribute('data-reporte-id');
            const requiereFecha = this.getAttribute('data-requiere-fecha') === 'true';
            
            console.log(`Clic en Ejecutar para reporte ID: ${reporteId}, Requiere fecha: ${requiereFecha}`); // Depuración
            
            if (requiereFecha) {
                // Mostrar formulario de fecha
                const table = document.getElementById(`reporte-${reporteId}-table`);
                if (table.classList.contains('hidden')) {
                    toggleReporte(`reporte-${reporteId}`);
                }
            } else {
                // Ejecutar reporte sin fecha
                ejecutarReporte(reporteId, null);
            }
        });
    });

    // Manejar formularios de fecha
    document.querySelectorAll('form[id^="fecha-form-"]').forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const reporteId = this.id.replace('fecha-form-', '');
            const fechaInput = this.querySelector(`input[name="fecha"]`).value;
            console.log(`Formulario de fecha enviado para reporte ${reporteId}, Fecha: ${fechaInput}`); // Depuración
            if (fechaInput) {
                ejecutarReporte(reporteId, fechaInput);
            } else {
                mostrarError(reporteId, 'Por favor, seleccione una fecha.');
            }
        });
    });

    // Manejar botones de exportación
    document.querySelectorAll('.export-pdf').forEach(button => {
        button.addEventListener('click', function () {
            const reporteId = this.getAttribute('data-reporte-id');
            const tableContainer = this.closest('.table-container');
            const fechaInput = tableContainer.querySelector('input[name="fecha"]')?.value || null;
            console.log(`Exportando PDF para reporte ${reporteId}, Fecha: ${fechaInput}`); // Depuración
            exportarReporte(reporteId, fechaInput, 'pdf');
        });
    });

    document.querySelectorAll('.export-excel').forEach(button => {
        button.addEventListener('click', function () {
            const reporteId = this.getAttribute('data-reporte-id');
            const tableContainer = this.closest('.table-container');
            const fechaInput = tableContainer.querySelector('input[name="fecha"]')?.value || null;
            console.log(`Exportando Excel para reporte ${reporteId}, Fecha: ${fechaInput}`); // Depuración
            exportarReporte(reporteId, fechaInput, 'excel');
        });
    });

    // Asignar eventos a los headers de resultados
    document.querySelectorAll('.cursor-pointer').forEach(header => {
        header.addEventListener('click', function () {
            const reporteId = this.nextElementSibling.id.replace('-table', '');
            toggleReporte(reporteId);
        });
    });

    // Deshabilitar botones de exportación inicialmente
    document.querySelectorAll('.export-btn').forEach(button => {
        button.disabled = true;
    });
});