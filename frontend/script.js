// ====================================================================
// ARDI-MI ♻️ - GESTIÓN DE RESIDUOS (script.js)
// VERSIÓN CONECTADA A LA API
// ====================================================================

// Configuración de la API
const API_URL = 'http://localhost:8000';
let currentUser = null;
let authToken = null;
let notificationInterval = null;

// ====================================================================
// 1. FUNCIONES DE UTILIDAD PARA LA API
// ====================================================================

// Función para hacer peticiones autenticadas
async function apiFetch(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error en la petición');
    }
    
    return response.json();
}

// ====================================================================
// 2. FUNCIONES DE VISTAS (SPA)
// ====================================================================

function showLoginForm() {
    document.getElementById('login-page').classList.remove('hidden');
    document.getElementById('password-page').classList.add('hidden');
    document.getElementById('register-page').classList.add('hidden');
    document.getElementById('dashboard-container').classList.add('hidden');
}

function showPasswordRecovery() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('password-page').classList.remove('hidden');
}

function showRegisterForm() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('register-page').classList.remove('hidden');
}

function showDashboard() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('password-page').classList.add('hidden');
    document.getElementById('register-page').classList.add('hidden');
    document.getElementById('dashboard-container').classList.remove('hidden');
    updateDashboard();
}

function logout() {
    currentUser = null;
    authToken = null;
    localStorage.removeItem('token');
    clearInterval(notificationInterval);
    showLoginForm();
}

// ====================================================================
// 3. AUTENTICACIÓN Y REGISTRO (CONECTADO A API)
// ====================================================================

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const whatsappNotification = document.getElementById('whatsappNotification').checked;
    
    if (!email || !password) {
        Swal.fire("Error", "Por favor complete todos los campos", "error");
        return;
    }
    
    try {
        // Login con la API
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);
        
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Credenciales incorrectas');
        }
        
        const data = await response.json();
        authToken = data.access_token;
        localStorage.setItem('token', authToken);
        
        // Obtener perfil del usuario
        const userProfile = await apiFetch('/usuarios/perfil');
        currentUser = {
            ...userProfile,
            whatsapp: whatsappNotification,
            points: 0
        };
        
        // Obtener puntos totales del usuario
        try {
            const puntosData = await apiFetch('/puntos/total');
            currentUser.points = puntosData.total;
        } catch (e) {
            console.log('Usuario sin puntos aún');
        }
        
        Swal.fire({
            title: "¡Bienvenido!",
            text: `Has iniciado sesión como ${currentUser.nombre}`,
            icon: "success"
        }).then(() => {
            showDashboard();
        });
        
    } catch (error) {
        Swal.fire("Error", error.message, "error");
    }
}

async function register() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const phone = document.getElementById('registerPhone').value;
    const role = document.getElementById('registerRole').value;
    const whatsappNotification = document.getElementById('registerWhatsappNotification').checked;
    
    if (!name || !email || !password || !confirmPassword) {
        Swal.fire("Error", "Por favor complete todos los campos obligatorios", "error");
        return;
    }
    
    if (password !== confirmPassword) {
        Swal.fire("Error", "Las contraseñas no coinciden", "error");
        return;
    }
    
    try {
        const userData = {
            nombre: name,
            email: email,
            password: password,
            rol: role
        };
        
        const response = await fetch(`${API_URL}/usuarios/registro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error en el registro');
        }
        
        Swal.fire({
            title: "¡Registro exitoso!",
            text: `Bienvenido ${name}, ahora puedes iniciar sesión`,
            icon: "success"
        }).then(() => {
            showLoginForm();
        });
        
    } catch (error) {
        Swal.fire("Error", error.message, "error");
    }
}

function sendPasswordRecovery() {
    const email = document.getElementById('recoveryEmail').value;
    
    if (!email) {
        Swal.fire("Error", "Por favor ingrese su correo electrónico", "error");
        return;
    }
    
    Swal.fire({
        title: "Enlace enviado",
        text: `Se ha enviado un enlace para restablecer la contraseña a ${email}`,
        icon: "success"
    }).then(() => {
        showLoginForm();
    });
}

// ====================================================================
// 4. CONTROL DEL DASHBOARD
// ====================================================================

async function updateDashboard() {
    if (!currentUser) return;
    
    document.getElementById('user-section').classList.add('hidden');
    document.getElementById('company-section').classList.add('hidden');
    
    document.getElementById('welcome-message').textContent = `Bienvenido, ${currentUser.nombre}!`;
    document.getElementById('user-role-display').textContent = 
        currentUser.rol === 'user' ? 'Usuario' : 
        currentUser.rol === 'company' ? 'Empresa Recolectora' : 'Admin';
    
    if (currentUser.rol === 'user') {
        document.getElementById('user-section').classList.remove('hidden');
        await updateUserSection();
    } else if (currentUser.rol === 'company') {
        document.getElementById('company-section').classList.remove('hidden');
        await updateCompanySection();
    }
}

// ====================================================================
// 5. SECCIÓN USUARIO (CONECTADA A API)
// ====================================================================

async function updateUserSection() {
    document.getElementById('total-points').textContent = currentUser.points;
    await loadUserRequests();
}

async function loadUserRequests() {
    try {
        const requests = await apiFetch('/solicitudes/');
        renderUserRequestsList(requests);
        
        // Actualizar gráfico
        const ctx = document.getElementById('pointsChart').getContext('2d');
        if (window.pointsChart) window.pointsChart.destroy();
        
        window.pointsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: requests.map(r => new Date(r.fecha_solicitud).toLocaleDateString()),
                datasets: [{
                    label: 'Puntos obtenidos',
                    data: requests.map(r => calculatePoints(r.tipo_residuo, 1)), // Peso estimado
                    backgroundColor: '#2e7d32'
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
    } catch (error) {
        console.error('Error cargando solicitudes:', error);
    }
}

function renderUserRequestsList(requests) {
    const list = document.getElementById('user-requests-list');
    list.innerHTML = '';
    
    if (requests.length === 0) {
        list.innerHTML = '<p>No has realizado ninguna solicitud aún.</p>';
        return;
    }
    
    requests.forEach(request => {
        const li = document.createElement('li');
        li.className = 'list-item';
        li.innerHTML = `
            <div class="item-info">
                <strong>Solicitud #${request.id}</strong> - ${getWasteTypeName(request.tipo_residuo)}
                <br>
                <span>Fecha: ${new Date(request.fecha_solicitud).toLocaleDateString()} | Estado: ${getStatusName(request.estado)}</span>
            </div>
            <span class="status-badge status-${request.estado}">${getStatusName(request.estado)}</span>
        `;
        list.appendChild(li);
    });
}

async function createCollectionRequest() {
    const date = document.getElementById('collectionDate').value;
    const type = document.getElementById('wasteType').value;
    const weight = parseFloat(document.getElementById('wasteWeight').value);
    
    if (!date || !type || !weight || weight <= 0) {
        Swal.fire("Error", "Por favor complete todos los campos correctamente", "error");
        return;
    }
    
    // Obtener dirección (puedes agregar un campo en el formulario)
    const address = prompt("Por favor ingresa la dirección de recolección:");
    if (!address) return;
    
    try {
        const newRequest = await apiFetch('/solicitudes/', {
            method: 'POST',
            body: JSON.stringify({
                tipo_residuo: type,
                direccion: address
            })
        });
        
        // Calcular y sumar puntos (1 punto por kg como base)
        const pointsEarned = Math.floor(weight);
        currentUser.points += pointsEarned;
        
        Swal.fire({
            title: "¡Solicitud creada!",
            text: `Se ha creado tu solicitud. Puntos estimados: ${pointsEarned}`,
            icon: "success"
        }).then(() => {
            updateUserSection();
            document.getElementById('collectionDate').value = '';
            document.getElementById('wasteType').value = '';
            document.getElementById('wasteWeight').value = '';
        });
        
    } catch (error) {
        Swal.fire("Error", error.message, "error");
    }
}

// ====================================================================
// 6. SECCIÓN EMPRESA (CONECTADA A API)
// ====================================================================

async function updateCompanySection() {
    await loadPendingRequests();
    await loadVehicles();
}

async function loadPendingRequests() {
    try {
        const requests = await apiFetch('/solicitudes/pendientes');
        const container = document.getElementById('pending-requests-container');
        container.innerHTML = '';
        
        if (requests.length === 0) {
            container.innerHTML = '<p>No hay solicitudes pendientes.</p>';
            return;
        }
        
        requests.forEach(request => {
            const card = document.createElement('div');
            card.className = 'request-card';
            card.innerHTML = `
                <div class="request-header">
                    <h4>Solicitud #${request.id}</h4>
                    <span class="status-badge status-pendiente">Pendiente</span>
                </div>
                <div class="request-details">
                    <div class="detail-item"><span class="detail-label">Tipo:</span><span>${getWasteTypeName(request.tipo_residuo)}</span></div>
                    <div class="detail-item"><span class="detail-label">Dirección:</span><span>${request.direccion}</span></div>
                    <div class="detail-item"><span class="detail-label">Fecha:</span><span>${new Date(request.fecha_solicitud).toLocaleDateString()}</span></div>
                </div>
                <div class="request-actions">
                    <button onclick="acceptRequest(${request.id})" style="background-color: var(--primary);">Aceptar</button>
                    <button onclick="rejectRequest(${request.id})" style="background-color: #d32f2f;">Rechazar</button>
                </div>
            `;
            container.appendChild(card);
        });
        
        updateRequestsSelect(requests);
    } catch (error) {
        console.error('Error cargando solicitudes:', error);
    }
}

async function acceptRequest(requestId) {
    try {
        await apiFetch(`/solicitudes/${requestId}/estado`, {
            method: 'PUT',
            body: JSON.stringify({ estado: 'aceptada' })
        });
        
        Swal.fire('Éxito', 'Solicitud aceptada', 'success');
        await updateCompanySection();
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
}

async function rejectRequest(requestId) {
    Swal.fire({
        title: '¿Rechazar solicitud?',
        text: "¿Estás seguro?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, rechazar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await apiFetch(`/solicitudes/${requestId}/estado`, {
                    method: 'PUT',
                    body: JSON.stringify({ estado: 'rechazada' })
                });
                Swal.fire('Rechazada', 'La solicitud ha sido rechazada', 'success');
                await updateCompanySection();
            } catch (error) {
                Swal.fire('Error', error.message, 'error');
            }
        }
    });
}

async function registerCollection() {
    const select = document.getElementById('request-select');
    const weightInput = document.getElementById('collected-weight');
    const requestId = parseInt(select.value);
    const collectedWeight = parseFloat(weightInput.value);
    
    if (!requestId || isNaN(collectedWeight) || collectedWeight <= 0) {
        Swal.fire("Error", "Selecciona una solicitud e ingresa un peso válido", "error");
        return;
    }
    
    try {
        await apiFetch(`/solicitudes/${requestId}/estado`, {
            method: 'PUT',
            body: JSON.stringify({ 
                estado: 'completada',
                peso_real: collectedWeight
            })
        });
        
        Swal.fire('Éxito', 'Recolección registrada', 'success');
        weightInput.value = '';
        await updateCompanySection();
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
}

async function loadVehicles() {
    try {
        const vehicles = await apiFetch('/vehiculos/');
        const list = document.getElementById('vehicles-list');
        list.innerHTML = '';
        
        if (vehicles.length === 0) {
            list.innerHTML = '<p>No hay vehículos registrados.</p>';
            return;
        }
        
        vehicles.forEach(vehicle => {
            const li = document.createElement('li');
            li.className = 'list-item';
            li.innerHTML = `
                <div class="item-info">
                    <strong>${vehicle.placa}</strong> - ${vehicle.marca} ${vehicle.modelo}
                    <br><span>Capacidad: ${vehicle.capacidad} kg | Tipo: ${vehicle.tipo}</span>
                </div>
                <div class="item-actions">
                    <span class="status-badge status-${vehicle.estado}">${getStatusName(vehicle.estado)}</span>
                    <button onclick="deleteVehicle(${vehicle.id})" style="background-color: #f44336;"><i class="fas fa-trash"></i></button>
                </div>
            `;
            list.appendChild(li);
        });
    } catch (error) {
        console.error('Error cargando vehículos:', error);
    }
}

async function deleteVehicle(vehicleId) {
    Swal.fire({
        title: '¿Eliminar vehículo?',
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await apiFetch(`/vehiculos/${vehicleId}`, {
                    method: 'DELETE'
                });
                Swal.fire('Eliminado', 'Vehículo eliminado', 'success');
                await loadVehicles();
            } catch (error) {
                Swal.fire('Error', error.message, 'error');
            }
        }
    });
}

function showAddVehicleModal() {
    Swal.fire({
        title: 'Añadir Vehículo',
        html: `
            <input id="plate" class="swal2-input" placeholder="Placa">
            <input id="brand" class="swal2-input" placeholder="Marca">
            <input id="model" class="swal2-input" placeholder="Modelo">
            <input id="capacity" type="number" class="swal2-input" placeholder="Capacidad (kg)">
            <select id="type" class="swal2-select">
                <option value="compacto">Compacto</option>
                <option value="mediano">Mediano</option>
                <option value="grande">Grande</option>
            </select>
        `,
        showCancelButton: true,
        confirmButtonText: 'Guardar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await apiFetch('/vehiculos/', {
                    method: 'POST',
                    body: JSON.stringify({
                        placa: document.getElementById('plate').value,
                        marca: document.getElementById('brand').value,
                        modelo: document.getElementById('model').value,
                        capacidad: parseFloat(document.getElementById('capacity').value),
                        tipo: document.getElementById('type').value
                    })
                });
                Swal.fire('Éxito', 'Vehículo añadido', 'success');
                await loadVehicles();
            } catch (error) {
                Swal.fire('Error', error.message, 'error');
            }
        }
    });
}

function updateRequestsSelect(requests) {
    const select = document.getElementById('request-select');
    select.innerHTML = '<option value="">Seleccione una solicitud</option>';
    
    requests.forEach(request => {
        const option = document.createElement('option');
        option.value = request.id;
        option.textContent = `Solicitud #${request.id} - ${request.tipo_residuo}`;
        select.appendChild(option);
    });
}

// ====================================================================
// 7. FUNCIONES DE UTILIDAD (Sin cambios)
// ====================================================================

function calculatePoints(type, weight) {
    const strategies = {
        organico: w => Math.floor(w * 0.8),
        inorganico: w => Math.floor(w * 0.5),
        reciclable: w => Math.floor(w * 1),
        peligroso: w => Math.floor(w * 2)
    };
    return strategies[type] ? strategies[type](weight) : 0;
}

function getWasteTypeName(type) {
    const names = {
        organico: 'Orgánico 🍂',
        inorganico: 'Inorgánico 🏗️',
        reciclable: 'Reciclable ♻️',
        peligroso: 'Peligroso ☣️'
    };
    return names[type] || type;
}

function getStatusName(status) {
    const names = {
        pending: 'Pendiente',
        accepted: 'Aceptada',
        completed: 'Completada',
        rejected: 'Rechazada',
        active: 'Activo',
        inactive: 'Inactivo',
        pendiente: 'Pendiente',
        aceptada: 'Aceptada',
        rechazada: 'Rechazada',
        completada: 'Completada'
    };
    return names[status] || status;
}

// ====================================================================
// 8. INICIALIZACIÓN
// ====================================================================

// Verificar si hay token guardado al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
        authToken = savedToken;
        try {
            const userProfile = await apiFetch('/usuarios/perfil');
            currentUser = userProfile;
            showDashboard();
        } catch (error) {
            console.log('Sesión expirada');
            localStorage.removeItem('token');
            showLoginForm();
        }
    } else {
        showLoginForm();
    }
});