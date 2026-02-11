// ====================================================================
// ARDI-MI ♻️ - GESTIÓN DE RESIDUOS (script.js)
// ====================================================================
/**
 * Array de solicitudes de recolección de muestra.
 * Se usan temporalmente en la sección de compañía para simular peticiones pendientes.
 */
const sampleRequests = [
  {
    id: 1,
    user: "Juan Pérez",
    date: "2023-11-15",
    type: "reciclable",
    weight: 5.2,
    address: "Calle Principal 123",
    phone: "555-1234",
    status: "pendiente",
    companyId: 3 // Asignado a la compañía demo
  },
  {
    id: 2,
    user: "María García",
    date: "2023-11-16",
    type: "organico",
    weight: 3.8,
    address: "Avenida Central 456",
    phone: "555-5678",
    status: "pendiente",
    companyId: 3
  },
  {
    id: 3,
    user: "Marta Valderrama",
    date: "2024-11-18",
    type: "organico",
    weight: 3.8,
    address: "Avenida Oriente 456",
    phone: "555-5678",
    status: "pendiente",
    companyId: 3
  }
];  

/**
 * Array de usuarios y compañías.
 */
const users = [
  // Usuarios Normales (user)
  { id: 1, name: "Usuario1 Demo", email: "user1@example.com", password: "123456", role: "user", phone: "1234567890", points: 150, whatsapp: true, status: 'active' },
  { id: 2, name: "Usuario2 Demo", email: "user2@example.com", password: "123456", role: "user", phone: "1111111111", points: 75, whatsapp: false, status: 'active' },
  // Compañía Recolectora (company)
  { id: 3, name: "ARDI-MI Recolección", email: "company@example.com", password: "123456", role: "company", phone: "0987654321", whatsapp: true, status: 'active' }
];

/**
 * Historial de solicitudes de recolección creadas por los usuarios.
 */
let collectionRequests = [
  { id: 1, userId: 1, date: "2025-05-15", type: "reciclable", weight: 5, points: 5, status: "completed", companyId: 3, vehicleId: 1 }, 
  { id: 2, userId: 1, date: "2025-05-20", type: "organico", weight: 3, points: 3, status: "pending" }
];

/**
 * Lista de vehículos de la compañía (companyId = 3).
 */
let vehicles = [
  { id: 1, companyId: 3, plate: "ABC123", brand: "Toyota", model: "Hilux", capacity: 1500, type: "mediano", status: "active" },
  { id: 2, companyId: 3, plate: "DEF456", brand: "Mercedes", model: "Atego", capacity: 5000, type: "grande", status: "active" },
  { id: 3, companyId: 3, plate: "KCH992", brand: "Peygout", model: "Tundra", capacity: 500, type: "compacto", status: "active"}
];

let currentUser = null;
let notificationInterval = null;
let currentEditingVehicleId = null;


// --------------------------------------------------------------------
// 2. PATRONES DE DISEÑO 
// --------------------------------------------------------------------

// Factory Method para creación de usuarios (se usa para registrar nuevos usuarios y compañías)
class UserFactory {
  createUser(data) { throw new Error("Método abstracto - debe ser implementado por subclases"); }
}

class RegularUserFactory extends UserFactory {
  createUser(data) {
    return {
      id: data.id, name: data.name, email: data.email, password: data.password, 
      role: 'user', phone: data.phone, points: 0, whatsapp: data.whatsapp || false, status: 'active'
    };
  }
}

class CompanyUserFactory extends UserFactory {
  createUser(data) {
    return {
      id: data.id, name: data.name, email: data.email, password: data.password, 
      role: 'company', phone: data.phone, whatsapp: data.whatsapp || false, status: 'active',
      companyId: data.id 
    };
  }
}

// Observer para notificaciones (usado para simular envíos por WhatsApp)
class NotificationSystem {
  constructor() { this.observers = []; }
  subscribe(observer) { this.observers.push(observer); }
  unsubscribe(observer) { this.observers = this.observers.filter(obs => obs !== observer); }
  notify(data) { this.observers.forEach(observer => observer.update(data)); }
}

class WhatsAppNotifier {
  update(data) {
    console.log(`Enviando notificación por WhatsApp a ${data.phone}: ${data.message}`);
    if (data.userId && users.some(u => u.id === data.userId && u.whatsapp)) {
      Swal.fire({ title: "Notificación por WhatsApp", text: data.message, icon: "info" });
    }
  }
}

const notificationSystem = new NotificationSystem();
const whatsappNotifier = new WhatsAppNotifier();
notificationSystem.subscribe(whatsappNotifier);


// --------------------------------------------------------------------
// 3. FUNCIONES DE CÁLCULO Y UTILIDAD
// --------------------------------------------------------------------

// Calcula los puntos del usuario según el tipo y peso de residuo 
function calculatePoints(type, weight) {
  const strategies = {
    organico: w => Math.floor(w * 0.8),
    inorganico: w => Math.floor(w * 0.5),
    reciclable: w => Math.floor(w * 1),
    peligroso: w => Math.floor(w * 2)
  };
  return strategies[type] ? strategies[type](weight) : 0;
}

// Obtiene el nombre completo del tipo de residuo
function getWasteTypeName(type) {
  const names = {
    organico: 'Orgánico 🍂', inorganico: 'Inorgánico 🏗️', 
    reciclable: 'Reciclable ♻️', peligroso: 'Peligroso ☣️'
  };
  return names[type] || type;
}

// Obtiene el nombre completo del estado
function getStatusName(status) {
  const names = {
    pending: 'Pendiente', accepted: 'Aceptada', completed: 'Completada', rejected: 'Rechazada', 
    active: 'Activo', inactive: 'Inactivo',
    pendiente: 'Pendiente', aceptada: 'Aceptada', rechazada: 'Rechazada', completada: 'Completada'
  };
  return names[status] || status;
}

// Revisa si hay notificaciones pendientes para el usuario actual (usado en setInterval)
function checkForNotifications() {
  const pendingRequests = collectionRequests.filter(r => r.userId === currentUser.id && r.status === 'accepted' && !r.notified);
  
  if (pendingRequests.length > 0) {
    const message = `Tu solicitud #${pendingRequests[0].id} ha sido ACEPTADA!`;
    notificationSystem.notify({ userId: currentUser.id, phone: currentUser.phone, message: message });
    pendingRequests[0].notified = true;
  }
}


// --------------------------------------------------------------------
// 4. FUNCIONES DE VISTAS (SPA)
// --------------------------------------------------------------------

// Muestra la pantalla de inicio de sesión
function showLoginForm() {
  document.getElementById('login-page').classList.remove('hidden');
  document.getElementById('password-page').classList.add('hidden');
  document.getElementById('register-page').classList.add('hidden');
  document.getElementById('dashboard-container').classList.add('hidden');
}

// Muestra la pantalla de recuperación de contraseña
function showPasswordRecovery() {
  document.getElementById('login-page').classList.add('hidden');
  document.getElementById('password-page').classList.remove('hidden');
}

// Muestra la pantalla de registro
function showRegisterForm() {
  document.getElementById('login-page').classList.add('hidden');
  document.getElementById('register-page').classList.remove('hidden');
}

// Muestra el Dashboard y actualiza su contenido
function showDashboard() {
  document.getElementById('login-page').classList.add('hidden');
  document.getElementById('password-page').classList.add('hidden');
  document.getElementById('register-page').classList.add('hidden');
  document.getElementById('dashboard-container').classList.remove('hidden');

   updateDashboard();
}

// Cierra la sesión del usuario actual
function logout() {
  currentUser = null;
  clearInterval(notificationInterval);
  showLoginForm();
}


// --------------------------------------------------------------------
// 5. AUTENTICACIÓN Y REGISTRO
// --------------------------------------------------------------------

// Proceso de inicio de sesión
function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const whatsappNotification = document.getElementById('whatsappNotification').checked;
  
  if (!email || !password) {
    Swal.fire("Error", "Por favor complete todos los campos", "error");
    return;
  }
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    currentUser = user;
    currentUser.whatsapp = whatsappNotification;
    
    Swal.fire({
      title: "¡Bienvenido!",
      text: `Has iniciado sesión como ${user.name}`,
      icon: "success"
    }).then(() => {
      showDashboard();
      
      if (whatsappNotification && user.phone) {
        setTimeout(() => {
          notificationSystem.notify({
            userId: user.id,
            phone: user.phone,
            message: `Se ha iniciado sesión en tu cuenta. Tu rol es: ${user.role}`
          });
        }, 2000);
      }
    });
  } else {
    Swal.fire("Error", "Credenciales incorrectas", "error");
  }
}

// Proceso de registro de nuevo usuario o compañía
function register() {
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
  
  if (users.some(u => u.email === email)) {
    Swal.fire("Error", "Este correo ya está registrado", "error");
    return;
  }
  
  const factory = role === 'company' ? new CompanyUserFactory() : new RegularUserFactory();
  const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

  const newUser = factory.createUser({
    id: newId, name, email, password, phone, whatsapp: whatsappNotification,
  });

  // Si es compañía, asigna el companyId
  if (role === 'company') { newUser.companyId = newId; }
  
  users.push(newUser);
  
  Swal.fire({
    title: "¡Registro exitoso!",
    text: `Bienvenido ${name}, ahora puedes iniciar sesión`,
    icon: "success"
  }).then(() => {
    showLoginForm();
  });
}

// Envío de enlace de recuperación de contraseña (simulado)
function sendPasswordRecovery() {
  const email = document.getElementById('recoveryEmail').value;
  
  if (!email) { Swal.fire("Error", "Por favor ingrese su correo electrónico", "error"); return; }
  if (!users.some(u => u.email === email)) { Swal.fire("Error", "Este correo no está registrado", "error"); return; }
  
  Swal.fire({
    title: "Enlace enviado",
    text: `Se ha enviado un enlace para restablecer la contraseña a ${email}`,
    icon: "success"
  }).then(() => {
    showLoginForm();
  });
}


// --------------------------------------------------------------------
// 6. CONTROL DEL DASHBOARD (Función principal de carga de roles)
// --------------------------------------------------------------------

/**
 * Determina qué sección del dashboard mostrar, actualiza mensajes y roles.
 */
function updateDashboard() {
  if (!currentUser) return;
  
  // Ocultar todas las secciones de rol
  document.getElementById('user-section').classList.add('hidden');
  document.getElementById('company-section').classList.add('hidden');

  // Actualización del mensaje de bienvenida 
  document.getElementById('welcome-message').textContent = `Bienvenido, ${currentUser.name}!`;
  
  // Actualización del rol en el encabezado
  document.getElementById('user-role-display').textContent = 
    currentUser.role === 'user' ? 'Usuario' : 
    currentUser.role === 'company' ? 'Empresa Recolectora' : 'Error de Rol';

  // Mostrar la sección correspondiente
  if (currentUser.role === 'user') {
    document.getElementById('user-section').classList.remove('hidden');
    updateUserSection();
  } else if (currentUser.role === 'company') {
    document.getElementById('company-section').classList.remove('hidden');
    updateCompanySection();
  } 
  // La lógica de 'admin' es ELIMINADA.

  // Iniciar/Detener el intervalo de notificaciones
  clearInterval(notificationInterval);
  if (currentUser.whatsapp) {
    notificationInterval = setInterval(() => { checkForNotifications(); }, 30000);
  }
}


// --------------------------------------------------------------------
// 7. SECCIÓN USUARIO (Funcionalidad de Solicitud y Puntos)
// --------------------------------------------------------------------

/**
 * Actualiza los puntos del usuario y el historial de solicitudes, y dibuja el gráfico.
 */
function updateUserSection() {
  document.getElementById('total-points').textContent = currentUser.points;
  
  const userRequests = collectionRequests.filter(r => r.userId === currentUser.id);
  
  // Lógica del Gráfico de Puntos
  const ctx = document.getElementById('pointsChart').getContext('2d');
  
  if (window.pointsChart) { window.pointsChart.destroy(); }
  
  window.pointsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: userRequests.map(r => r.date),
      datasets: [{
        label: 'Puntos obtenidos',
        data: userRequests.map(r => r.points),
        backgroundColor: '#2e7d32'
      }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });

  renderUserRequestsList(userRequests);
}

/**
 * Renderiza la lista de solicitudes del usuario actual.
 */
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
                <strong>Solicitud #${request.id}</strong> - ${getWasteTypeName(request.type)} (${request.weight} kg)
                <br>
                <span>Fecha: ${request.date} | Puntos: ${request.points}</span>
            </div>
            <span class="status-badge status-${request.status}">${getStatusName(request.status)}</span>
        `;
        list.appendChild(li);
    });
}


// Crea una nueva solicitud de recolección
function createCollectionRequest() {
  const date = document.getElementById('collectionDate').value;
  const type = document.getElementById('wasteType').value;
  const weight = parseFloat(document.getElementById('wasteWeight').value);

  if (!date || !type || !weight || weight <= 0) {
    Swal.fire("Error", "Por favor complete todos los campos correctamente", "error"); return;
  }

  const points = calculatePoints(type, weight);

  const newRequest = {
    id: collectionRequests.length > 0 ? Math.max(...collectionRequests.map(r => r.id)) + 1 : 1,
    userId: currentUser.id, date, type, weight, points, status: 'pending', notified: false
  };

  collectionRequests.push(newRequest);
  currentUser.points += points;
  
  Swal.fire({
    title: "¡Solicitud creada!",
    text: `Se ha creado tu solicitud para el ${date}. Puntos estimados: ${points}. Puntos Totales: ${currentUser.points}`,
    icon: "success"
  }).then(() => { updateUserSection(); });
}


// --------------------------------------------------------------------
// 8. SECCIÓN EMPRESA (Funcionalidad de Gestión)
// --------------------------------------------------------------------

/**
 * Actualiza la sección de la compañía (vehículos, usuarios, peticiones) y dibuja el gráfico.
 */
function updateCompanySection() {
    // 1. Cargar peticiones pendientes, vehículos y usuarios gestionados
    loadPendingRequests();
    renderVehiclesList(); 
    searchUsers(true); 

    // 2. LÓGICA DEL GRÁFICO DE ESTADÍSTICAS (CompanyStatsChart)
    
    // Combina collectionRequests y sampleRequests para un panorama completo
    const allRequests = [
        ...collectionRequests.filter(r => r.companyId === currentUser.id),
        ...sampleRequests.map(r => ({ ...r, status: r.status === 'pendiente' ? 'pending' : r.status }))
    ];

    // Contar el estado de las solicitudes y normalizar el estado
    const counts = allRequests.reduce((acc, r) => {
        let statusKey = r.status === 'pendiente' ? 'pending' : r.status === 'aceptada' ? 'accepted' : r.status === 'completada' ? 'completed' : r.status;
        acc[statusKey] = (acc[statusKey] || 0) + 1;
        return acc;
    }, {});

    const labels = ['Pendiente', 'Aceptada', 'Rechazada', 'Completada'];
    const data = [
        counts['pending'] || 0, counts['accepted'] || 0, counts['rejected'] || 0, counts['completed'] || 0
    ];

    const ctx = document.getElementById('companyStatsChart').getContext('2d');
    
    // Destruye el gráfico anterior si existe
    if (window.companyChart) { window.companyChart.destroy(); }
    
    window.companyChart = new Chart(ctx, {
      type: 'pie', // Gráfico de pastel o tortas
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#FFC107', '#4CAF50', '#F44336', '#03A9F4']
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { title: { display: true, text: 'Estado de Solicitudes Gestionadas' } }
      }
    });
}

/**
 * Carga y muestra las solicitudes pendientes.
 */
function loadPendingRequests() {
  const container = document.getElementById('pending-requests-container');
  container.innerHTML = '';
  
  const pendingRequests = sampleRequests.filter(req => req.status === 'pendiente');
  
  if(pendingRequests.length === 0) { container.innerHTML = '<p>No hay solicitudes pendientes de asignación en este momento.</p>'; return; }
  
  pendingRequests.forEach(request => {
    const requestCard = document.createElement('div');
    requestCard.className = 'request-card';
    
    requestCard.innerHTML = `
      <div class="request-header">
        <h4>Solicitud #${request.id} - ${request.user}</h4>
        <span class="status-badge status-pendiente">Pendiente</span>
      </div>
      <div class="request-details">
        <div class="detail-item"><span class="detail-label">Fecha:</span><span>${request.date}</span></div>
        <div class="detail-item"><span class="detail-label">Tipo:</span><span>${getWasteTypeName(request.type)}</span></div>
        <div class="detail-item"><span class="detail-label">Peso:</span><span>${request.weight} kg</span></div>
        <div class="detail-item"><span class="detail-label">Dirección:</span><span>${request.address}</span></div>
        <div class="detail-item"><span class="detail-label">Teléfono:</span><span>${request.phone}</span></div>
      </div>
      <div class="request-actions">
        <button onclick="acceptRequestSample(${request.id})" style="background-color: var(--primary);">Aceptar</button>
        <button onclick="rejectRequestSample(${request.id})" style="background-color: #d32f2f;">Rechazar</button>
        <button onclick="viewRequestDetails(${request.id})">Detalles</button>
      </div>
    `; 
    
    container.appendChild(requestCard);
  });
  updateRequestsSelect();
}

// Acepta una solicitud de muestra
function acceptRequestSample(requestId) {
  const request = sampleRequests.find(req => req.id === requestId);
  if(request) {
    request.status = 'aceptada';
    
    // Simulación de aceptar también en el array principal para el gráfico
    const originalRequest = collectionRequests.find(r => r.userId === 1 && r.status === 'pending'); 
    if (originalRequest) { originalRequest.status = 'accepted'; originalRequest.companyId = currentUser.id; originalRequest.vehicleId = vehicles[0].id; }

    Swal.fire({ title: 'Solicitud Aceptada', text: `Has aceptado la solicitud #${requestId}.`, icon: 'success' });
    updateCompanySection(); 
  }
}

// Rechaza una solicitud de muestra
function rejectRequestSample(requestId) {
  Swal.fire({
    title: '¿Rechazar solicitud?', text: "¿Estás seguro de que deseas rechazar esta solicitud?", icon: 'warning',
    showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, rechazar', cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      const request = sampleRequests.find(req => req.id === requestId);
      if(request) {
        request.status = 'rechazada';
        const originalRequest = collectionRequests.find(r => r.userId === 1 && r.status === 'pending');
        if (originalRequest) { originalRequest.status = 'rejected'; }
        
        Swal.fire('Rechazada', `La solicitud #${requestId} ha sido rechazada.`, 'success');
        updateCompanySection();
      }
    }
  });
}

// Muestra detalles de una solicitud de muestra
function viewRequestDetails(requestId) {
  const request = sampleRequests.find(req => req.id === requestId);
  if(request) {
    Swal.fire({
      title: `Detalles de Solicitud #${requestId}`,
      html: `<div style="text-align: left;"><p><strong>Usuario:</strong> ${request.user}</p><p><strong>Fecha:</strong> ${request.date}</p><p><strong>Tipo de residuo:</strong> ${getWasteTypeName(request.type)}</p><p><strong>Peso estimado:</strong> ${request.weight} kg</p><p><strong>Dirección:</strong> ${request.address}</p><p><strong>Teléfono:</strong> ${request.phone}</p><p><strong>Estado:</strong> ${getStatusName(request.status)}</p></div>`,
      confirmButtonText: 'Cerrar'
    });
  }
}

/**
 * Llena el <select> de registro de recolección con solicitudes ACEPTADAS.
 */
function updateRequestsSelect() {
  const select = document.getElementById('request-select');
  select.innerHTML = '<option value="">Seleccione una solicitud</option>';
  
  const acceptedRequests = [
    ...sampleRequests.filter(req => req.status === 'aceptada'),
    ...collectionRequests.filter(req => req.status === 'accepted' && req.companyId === currentUser.id)
  ];
  
  acceptedRequests.forEach(request => {
    const option = document.createElement('option');
    option.value = request.id;
    option.textContent = `Solicitud #${request.id} - ${request.user || users.find(u => u.id === request.userId)?.name} (${request.weight}kg)`;
    select.appendChild(option);
  });
}

/**
 * Registra la recolección completada y actualiza el estado de la solicitud.
 */
function registerCollection() {
  const select = document.getElementById('request-select');
  const weightInput = document.getElementById('collected-weight');
  const requestId = parseInt(select.value);
  const collectedWeight = parseFloat(weightInput.value);

  if(!requestId || isNaN(collectedWeight) || collectedWeight <= 0) {
    Swal.fire({ title: 'Error', text: 'Por favor selecciona una solicitud e ingresa un peso válido', icon: 'error' });
    return;
  }
  
  let request = sampleRequests.find(req => req.id === requestId);
  if (!request) { request = collectionRequests.find(req => req.id === requestId); }

  if (request) {
    request.status = 'completed'; // Estandariza a 'completed'
    request.collectedWeight = collectedWeight;
    request.collectionDate = new Date().toISOString().split('T')[0];
    
    Swal.fire({ title: 'Recolección Registrada', html: `<p>Has registrado la recolección para:</p><p><strong>Solicitud #${request.id}</strong></p><p><strong>Peso recolectado:</strong> ${collectedWeight} kg</p>`, icon: 'success' });
    
    // Mueve la solicitud completada de sampleRequests a collectionRequests (si aplica)
    if (sampleRequests.some(r => r.id === requestId)) {
        const index = sampleRequests.findIndex(r => r.id === requestId);
        if (index > -1) {
            const completedRequest = sampleRequests.splice(index, 1)[0];
            completedRequest.userId = completedRequest.userId || 1; // Asegura userId
            completedRequest.points = calculatePoints(completedRequest.type, collectedWeight); 
            completedRequest.companyId = currentUser.id; 
            collectionRequests.push(completedRequest);
        }
    }
    
    updateCompanySection(); // Refresca la sección completa
    weightInput.value = '';
  } else {
    Swal.fire({ title: 'Error', text: 'Solicitud no encontrada', icon: 'error' });
  }
}

// --------------------------------------------------------------------
// 9. GESTIÓN DE VEHÍCULOS (Compañía)
// --------------------------------------------------------------------

// Renderiza la lista de vehículos de la compañía actual.
function renderVehiclesList() {
    const list = document.getElementById('vehicles-list');
    list.innerHTML = '';
    const companyVehicles = vehicles.filter(v => v.companyId === currentUser.id);
    
    if (companyVehicles.length === 0) { list.innerHTML = '<p>No tienes vehículos registrados.</p>'; return; }
    
    companyVehicles.forEach(vehicle => {
        const li = document.createElement('li');
        li.className = 'list-item';
        li.innerHTML = `
            <div class="item-info">
                <strong>Placa: ${vehicle.plate}</strong> - ${vehicle.brand} ${vehicle.model}
                <br><span>Capacidad: ${vehicle.capacity} kg | Tipo: ${vehicle.type}</span>
            </div>
            <div class="item-actions">
                <span class="status-badge status-${vehicle.status}">${getStatusName(vehicle.status)}</span>
                <button onclick="showEditVehicleModal(${vehicle.id})"><i class="fas fa-edit"></i></button>
                <button onclick="deleteVehicle(${vehicle.id})" style="background-color: #f44336;"><i class="fas fa-trash"></i></button>
            </div>
        `;
        list.appendChild(li);
    });
}

// Muestra el modal para añadir un nuevo vehículo
function showAddVehicleModal() { 
  Swal.fire({
        title: 'Añadir Nuevo Vehículo',
        html: `
            <input id="vehicle-plate" class="swal2-input" placeholder="Placa" required>
            <input id="vehicle-brand" class="swal2-input" placeholder="Marca" required>
            <input id="vehicle-model" class="swal2-input" placeholder="Modelo" required>
            <input id="vehicle-capacity" type="number" class="swal2-input" placeholder="Capacidad (kg)" min="1" required>
            <select id="vehicle-type" class="swal2-select">
                <option value="compacto">Compacto</option>
                <option value="mediano">Mediano</option>
                <option value="grande">Grande</option>
            </select>
        `,
        showCancelButton: true, confirmButtonText: 'Guardar', cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const plate = document.getElementById('vehicle-plate').value;
            const brand = document.getElementById('vehicle-brand').value;
            const model = document.getElementById('vehicle-model').value;
            const capacity = parseInt(document.getElementById('vehicle-capacity').value);
            const type = document.getElementById('vehicle-type').value;

            if (!plate || !brand || !model || isNaN(capacity) || capacity <= 0) {
                Swal.showValidationMessage(`Por favor completa todos los campos.`);
                return false;
            }
            return { plate, brand, model, capacity, type };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            addVehicle(result.value);
        }
    });
}

// Añade el vehículo a la lista
function addVehicle({ plate, brand, model, capacity, type }) {
    const newVehicle = {
        id: vehicles.length > 0 ? Math.max(...vehicles.map(v => v.id)) + 1 : 1,
        companyId: currentUser.id, plate, brand, model, capacity, type, status: 'active'
    };
    vehicles.push(newVehicle);
    Swal.fire('¡Añadido!', 'Vehículo registrado con éxito.', 'success');
    renderVehiclesList();
}

// Muestra el modal para editar un vehículo
function showEditVehicleModal(vehicleId) {
  const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    currentEditingVehicleId = vehicleId; // Guarda el ID para usarlo en la función 'editVehicle'

    Swal.fire({
        title: `Editar Vehículo: ${vehicle.plate}`,
        html: `
            <input id="edit-plate" class="swal2-input" placeholder="Placa" value="${vehicle.plate}" required>
            <input id="edit-brand" class="swal2-input" placeholder="Marca" value="${vehicle.brand}" required>
            <input id="edit-model" class="swal2-input" placeholder="Modelo" value="${vehicle.model}" required>
            <input id="edit-capacity" type="number" class="swal2-input" placeholder="Capacidad (kg)" value="${vehicle.capacity}" min="1" required>
            <select id="edit-type" class="swal2-select">
                <option value="compacto" ${vehicle.type === 'compacto' ? 'selected' : ''}>Compacto</option>
                <option value="mediano" ${vehicle.type === 'mediano' ? 'selected' : ''}>Mediano</option>
                <option value="grande" ${vehicle.type === 'grande' ? 'selected' : ''}>Grande</option>
            </select>
            <select id="edit-status" class="swal2-select">
                <option value="active" ${vehicle.status === 'active' ? 'selected' : ''}>Activo</option>
                <option value="inactive" ${vehicle.status === 'inactive' ? 'selected' : ''}>Inactivo</option>
            </select>
        `,
        showCancelButton: true, confirmButtonText: 'Guardar', cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const plate = document.getElementById('edit-plate').value;
            const brand = document.getElementById('edit-brand').value;
            const model = document.getElementById('edit-model').value;
            const capacity = parseInt(document.getElementById('edit-capacity').value);
            const type = document.getElementById('edit-type').value;
            const status = document.getElementById('edit-status').value;

            if (!plate || !brand || !model || isNaN(capacity) || capacity <= 0) {
                Swal.showValidationMessage(`Por favor completa todos los campos.`);
                return false;
            }
            return { plate, brand, model, capacity, type, status };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            editVehicle(currentEditingVehicleId, result.value);
            currentEditingVehicleId = null; // Limpia la referencia
        }
    });
}

// Guarda los cambios del vehículo
function editVehicle(id, data) {
    const vehicleIndex = vehicles.findIndex(v => v.id === id);
    if (vehicleIndex > -1) {
        Object.assign(vehicles[vehicleIndex], data);
        Swal.fire('¡Actualizado!', 'Vehículo modificado con éxito.', 'success');
        renderVehiclesList();
    }
}
// Elimina un vehículo
function deleteVehicle(id) {
    Swal.fire({
        title: '¿Estás seguro?', text: "No podrás revertir esta acción!", icon: 'warning',
        showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            vehicles = vehicles.filter(v => v.id !== id);
            Swal.fire('¡Eliminado!', 'El vehículo ha sido eliminado.', 'success');
            renderVehiclesList();
        }
    });
}

// --------------------------------------------------------------------
// 10. GESTIÓN DE USUARIOS (Compañía)
// --------------------------------------------------------------------

// Muestra el modal para añadir un nuevo usuario
function showAddUserModal() {
  Swal.fire({
        title: 'Añadir Nuevo Usuario',
        html: `
            <input id="new-user-name" class="swal2-input" placeholder="Nombre completo" required>
            <input id="new-user-email" type="email" class="swal2-input" placeholder="Correo electrónico" required>
            <input id="new-user-password" type="password" class="swal2-input" placeholder="Contraseña inicial" required>
            <input id="new-user-phone" class="swal2-input" placeholder="Teléfono" required>
            <label><input type="checkbox" id="new-user-whatsapp" checked> Recibir notificaciones por WhatsApp</label>
        `,
        showCancelButton: true, confirmButtonText: 'Registrar', cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const name = document.getElementById('new-user-name').value;
            const email = document.getElementById('new-user-email').value;
            const password = document.getElementById('new-user-password').value;
            const phone = document.getElementById('new-user-phone').value;
            const whatsapp = document.getElementById('new-user-whatsapp').checked;

            if (!name || !email || !password || !phone) {
                Swal.showValidationMessage(`Por favor completa todos los campos.`);
                return false;
            }
            if (users.some(u => u.email === email)) {
                Swal.showValidationMessage(`Este correo ya está registrado.`);
                return false;
            }
            return { name, email, password, phone, whatsapp };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            addUserManually(result.value);
        }
    });
}

// Añade un nuevo usuario (gestionado por la compañía)
function addUserManually({ name, email, password, phone, whatsapp }) {
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

    const newUser = { id: newId, name, email, password, role: 'user', phone, points: 0, whatsapp, status: 'active' };
    users.push(newUser);
    Swal.fire('¡Añadido!', 'Usuario registrado con éxito.', 'success');
    searchUsers(true); // Refresca la lista de usuarios gestionados
}

/**
 * Filtra y renderiza la lista de usuarios.
 * @param {boolean} forceRender Si es true, renderiza toda la lista sin filtrar.
 */
function searchUsers(forceRender) {
    const searchTerm = document.getElementById('user-search-input').value.toLowerCase();
    
    let filteredUsers = users.filter(u => u.role === 'user'); 
    
    if (!forceRender && searchTerm) {
        filteredUsers = filteredUsers.filter(u => 
            u.name.toLowerCase().includes(searchTerm) || 
            u.email.toLowerCase().includes(searchTerm)
        );
    }
    
    renderManagedUsersList(filteredUsers);
}

// Renderiza la lista de usuarios que la compañía gestiona
function renderManagedUsersList(managedUsers) {
    const list = document.getElementById('managed-users-list');
    list.innerHTML = '';

    if (managedUsers.length === 0) { list.innerHTML = '<p>No se encontraron usuarios que coincidan con la búsqueda.</p>'; return; }

    managedUsers.forEach(user => {
        const li = document.createElement('li');
        li.className = 'list-item';
        li.innerHTML = `
            <div class="item-info">
                <strong>${user.name}</strong> (${user.email})
                <br><span>Puntos: ${user.points} | Teléfono: ${user.phone}</span>
            </div>
            <div class="item-actions">
                <span class="status-badge status-${user.status}">${getStatusName(user.status)}</span>
                <button onclick="editUser(${user.id})"><i class="fas fa-edit"></i></button>
                <button onclick="toggleUserStatus(${user.id})" style="background-color: ${user.status === 'active' ? '#ff9800' : '#4CAF50'};"><i class="fas fa-power-off"></i></button>
                <button onclick="deleteUser(${user.id})" style="background-color: #f44336;"><i class="fas fa-trash"></i></button>
            </div>
        `;
        list.appendChild(li);
    });
}

// Muestra el modal para editar datos de un usuario
function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    Swal.fire({
        title: `Editar Usuario: ${user.name}`,
        html: `
            <input id="edit-user-name" class="swal2-input" placeholder="Nombre" value="${user.name}" required>
            <input id="edit-user-email" type="email" class="swal2-input" placeholder="Email" value="${user.email}" required>
            <input id="edit-user-phone" class="swal2-input" placeholder="Teléfono" value="${user.phone}">
            <input id="edit-user-points" type="number" class="swal2-input" placeholder="Puntos" value="${user.points}" min="0">
            <select id="edit-user-status" class="swal2-select">
                <option value="active" ${user.status === 'active' ? 'selected' : ''}>Activo</option>
                <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Inactivo</option>
            </select>
            <label><input type="checkbox" id="edit-user-whatsapp" ${user.whatsapp ? 'checked' : ''}> WhatsApp</label>
        `,
        showCancelButton: true, confirmButtonText: 'Guardar', cancelButtonText: 'Cancelar',
        preConfirm: () => {
            return {
                name: document.getElementById('edit-user-name').value, email: document.getElementById('edit-user-email').value,
                phone: document.getElementById('edit-user-phone').value, points: parseInt(document.getElementById('edit-user-points').value),
                status: document.getElementById('edit-user-status').value, whatsapp: document.getElementById('edit-user-whatsapp').checked
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Object.assign(user, result.value);
            searchUsers(true); // CORREGIDO: Refresca la lista de la Compañía
            Swal.fire('¡Actualizado!', 'El usuario ha sido modificado.', 'success');
        }
    });
}

// Cambia el estado (activo/inactivo) de un usuario
function toggleUserStatus(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    user.status = user.status === 'active' ? 'inactive' : 'active';
    searchUsers(true); // CORREGIDO: Refresca la lista de la Compañía
    Swal.fire('¡Estado cambiado!', `El usuario ahora está ${getStatusName(user.status)}.`, 'success');
}

// Elimina un usuario
function deleteUser(userId) {
    Swal.fire({
        title: '¿Estás seguro?', text: "¡No podrás revertir esto!", icon: 'warning',
        showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const index = users.findIndex(u => u.id === userId);
            if (index > -1) { users.splice(index, 1); }
            collectionRequests = collectionRequests.filter(r => r.userId !== userId);

            searchUsers(true); // CORREGIDO: Refresca la lista de la Compañía
            Swal.fire('¡Eliminado!', 'El usuario y sus datos han sido eliminados.', 'success');
        }
    });
}