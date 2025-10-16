// --- DATOS DE SIMULACIÓN ---
const sampleRequests = [
  {
    id: 1,
    user: "Juan Pérez",
    date: "2023-11-15",
    type: "reciclable",
    weight: 5.2,
    address: "Calle Principal 123",
    phone: "555-1234",
    status: "pendiente"
  },
  {
    id: 2,
    user: "María García",
    date: "2023-11-16",
    type: "organico",
    weight: 3.8,
    address: "Avenida Central 456",
    phone: "555-5678",
    status: "pendiente"
  },
  {
    id: 3,
    user: "Marta Valderrama",
    date: "2024-11-18",
    type: "organico",
    weight: 3.8,
    address: "Avenida Oriente 456",
    phone: "555-5678",
    status: "pendiente"
  }
];  

const users = [
  { id: 1, name: "Usuario1 Demo", email: "user1@example.com", password: "123456", role: "user", phone: "1234567890", points: 150, whatsapp: true, status: 'active' },
  { id: 2, name: "Usuario2 Demo", email: "user2@example.com", password: "123456", role: "user", phone: "1111111111", points: 75, whatsapp: false, status: 'active' },
  { id: 3, name: "Empresa Demo", email: "company@example.com", password: "123456", role: "company", phone: "0987654321", whatsapp: true, status: 'active' },
  { id: 4, name: "Admin Demo", email: "admin@example.com", password: "123456", role: "admin", phone: "5555555555", whatsapp: true, status: 'active' },
];

let collectionRequests = [
  { id: 1, userId: 1, date: "2025-05-15", type: "reciclable", weight: 5, points: 5, status: "completed", companyId: 2, vehicleId: 1 },
  { id: 2, userId: 1, date: "2025-05-20", type: "organico", weight: 3, points: 3, status: "pending" }
];

let vehicles = [
  { id: 1, companyId: 3, plate: "ABC123", brand: "Toyota", model: "Hilux", capacity: 1500, type: "mediano", status: "active" },
  { id: 2, companyId: 3, plate: "DEF456", brand: "Mercedes", model: "Atego", capacity: 5000, type: "grande", status: "active" },
  { id: 3, companyId: 3, plate: "KCH992", brand: "Peygout", model: "Tundra", capacity: 500, type: "compacto", status: "active"}
];

let currentUser = null;
let notificationInterval = null;
let currentEditingVehicleId = null;

// --- PATRONES DE DISEÑO ---

// Implementación del patrón Factory Method para creación de usuarios
class UserFactory {
  createUser(data) {
    throw new Error("Método abstracto - debe ser implementado por subclases");
  }
}

class RegularUserFactory extends UserFactory {
  createUser(data) {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'user',
      phone: data.phone,
      points: 0,
      whatsapp: data.whatsapp || false,
      status: 'active'
    };
  }
}

class CompanyUserFactory extends UserFactory {
  createUser(data) {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'company',
      phone: data.phone,
      whatsapp: data.whatsapp || false,
      status: 'active'
    };
  }
}

// Implementación del patrón Observer para notificaciones
class NotificationSystem {
  constructor() {
    this.observers = [];
  }
  
  subscribe(observer) {
    this.observers.push(observer);
  }
  
  unsubscribe(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }
  
  notify(data) {
    this.observers.forEach(observer => observer.update(data));
  }
}

class WhatsAppNotifier {
  update(data) {
    console.log(`Enviando notificación por WhatsApp a ${data.phone}: ${data.message}`);
    if (data.userId && users.some(u => u.id === data.userId && u.whatsapp)) {
      Swal.fire({
        title: "Notificación por WhatsApp",
        text: data.message,
        icon: "info"
      });
    }
  }
}

// Crear instancias de los patrones
const notificationSystem = new NotificationSystem();
const whatsappNotifier = new WhatsAppNotifier();
notificationSystem.subscribe(whatsappNotifier);


// --- FUNCIONES DE CÁLCULO (Strategy Pattern) y UTILIDAD ---

// Función para calcular puntos (Strategy pattern)
function calculatePoints(type, weight) {
  const strategies = {
    organico: w => Math.floor(w * 0.8),    // 0.8 puntos/kg
    inorganico: w => Math.floor(w * 0.5),  // 0.5 puntos/kg
    reciclable: w => Math.floor(w * 1),    // 1 punto/kg
    peligroso: w => Math.floor(w * 2)      // 2 puntos/kg
  };
  
  return strategies[type] ? strategies[type](weight) : 0;
}

// Funciones de ayuda
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
    // Estados de sampleRequests:
    pendiente: 'Pendiente',
    aceptada: 'Aceptada',
    rechazada: 'Rechazada',
    completada: 'Completada'
  };
  return names[status] || status;
}

// --- FUNCIONES DE VISTAS (SPA) ---

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
  clearInterval(notificationInterval);
  showLoginForm();
}

// --- FUNCIONES DE AUTENTICACIÓN ---

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
  
  const newUser = factory.createUser({
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    name,
    email,
    password,
    phone,
    whatsapp: whatsappNotification,
  });
  
  users.push(newUser);
  
  Swal.fire({
    title: "¡Registro exitoso!",
    text: `Bienvenido ${name}, ahora puedes iniciar sesión`,
    icon: "success"
  }).then(() => {
    showLoginForm();
  });
}

function sendPasswordRecovery() {
  const email = document.getElementById('recoveryEmail').value;
  
  if (!email) {
    Swal.fire("Error", "Por favor ingrese su correo electrónico", "error");
    return;
  }
  
  if (!users.some(u => u.email === email)) {
    Swal.fire("Error", "Este correo no está registrado", "error");
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

// --- CONTROL DEL DASHBOARD ---

function updateDashboard() {
  if (!currentUser) return;
  
  document.getElementById('welcome-message').textContent = `Bienvenido, ${currentUser.name}`;
  document.getElementById('user-role-display').textContent = 
    currentUser.role === 'user' ? 'Usuario' : 
    currentUser.role === 'company' ? 'Empresa Recolectora' : 'Administrador';
  
  document.getElementById('user-section').classList.add('hidden');
  document.getElementById('company-section').classList.add('hidden');
  document.getElementById('admin-section').classList.add('hidden');
  
  if (currentUser.role === 'user') {
    document.getElementById('user-section').classList.remove('hidden');
    updateUserSection();
  } else if (currentUser.role === 'company') {
    document.getElementById('company-section').classList.remove('hidden');
    updateCompanySection();
  } else if (currentUser.role === 'admin') {
    document.getElementById('admin-section').classList.remove('hidden');
    updateAdminSection();
  }
  
  clearInterval(notificationInterval);
  if (currentUser.whatsapp) {
    notificationInterval = setInterval(() => {
      checkForNotifications();
    }, 30000);
  }
}

// --- SECCIÓN USUARIO ---

//Gráficos del Usuario!
function renderUserStatsChart() {
    const userRequests = collectionRequests.filter(r => r.userId === currentUser.id);
    
    // Contar tipos de residuos
    const counts = userRequests.reduce((acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1;
        return acc;
    }, {});
    
    const types = ['organico', 'inorganico', 'reciclable', 'peligroso'];
    const labels = types.map(getWasteTypeName);
    const data = types.map(type => counts[type] || 0);

    const ctx = document.getElementById('userStatsChart').getContext('2d');
    
    // Destruye el gráfico anterior si existe
    if (window.userStatsChart) {
        window.userStatsChart.destroy();
    }
    
    // Crea el nuevo gráfico de pastel/anillo (Doughnut)
    window.userStatsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cantidad de Solicitudes por Tipo',
                data: data,
                backgroundColor: ['#4CAF50', '#795548', '#03A9F4', '#FF5722']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Distribución de tus Solicitudes'
                }
            }
        }
    });
}

function updateUserSection() {
  document.getElementById('total-points').textContent = currentUser.points;
  
  const userRequests = collectionRequests.filter(r => r.userId === currentUser.id);
  const ctx = document.getElementById('pointsChart').getContext('2d');
  
  if (window.pointsChart) {
    window.pointsChart.destroy();
  }
  
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
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  renderUserStatsChart();
}

function createCollectionRequest() {
  const date = document.getElementById('collectionDate').value;
  const type = document.getElementById('wasteType').value;
  const weight = parseFloat(document.getElementById('wasteWeight').value);

  if (!date || !type || !weight || weight <= 0) {
    Swal.fire("Error", "Por favor complete todos los campos correctamente", "error");
    return;
  }

  const points = calculatePoints(type, weight);

  const newRequest = {
    id: collectionRequests.length + 1,
    userId: currentUser.id,
    date,
    type,
    weight,
    points,
    status: 'pending',
    notified: false
  };

  collectionRequests.push(newRequest);

  currentUser.points += points;
  
  Swal.fire({
    title: "¡Solicitud creada!",
    text: `Se ha creado tu solicitud para el ${date}. Puntos estimados: ${points}. Puntos Totales: ${currentUser.points}`,
    icon: "success"
  }).then(() => {
    updateUserSection(); //Refresca la sección para mostrar los nuevos puntos!
  });
}


// --- SECCIÓN EMPRESA RECOLECTORA ---

function loadPendingRequests() {
  const container = document.getElementById('pending-requests-container');
  container.innerHTML = '';
  
  // Usando sampleRequests para solicitudes pendientes (como en el original)
  const pendingRequests = sampleRequests.filter(req => req.status === 'pendiente');
  
  if(pendingRequests.length === 0) {
    container.innerHTML = '<p>No hay solicitudes pendientes de asignación en este momento.</p>';
    return;
  }
  
  pendingRequests.forEach(request => {
    const requestCard = document.createElement('div');
    requestCard.className = 'request-card';
    
    requestCard.innerHTML = `
      <div class="request-header">
        <h4>Solicitud #${request.id} - ${request.user}</h4>
        <span class="status-badge status-pendiente">Pendiente</span>
      </div>
      <div class="request-details">
        <div class="detail-item">
          <span class="detail-label">Fecha:</span>
          <span>${request.date}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Tipo:</span>
          <span>${getWasteTypeName(request.type)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Peso:</span>
          <span>${request.weight} kg</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Dirección:</span>
          <span>${request.address}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Teléfono:</span>
          <span>${request.phone}</span>
        </div>
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

function acceptRequestSample(requestId) {
  const request = sampleRequests.find(req => req.id === requestId);
  if(request) {
    request.status = 'aceptada';
    Swal.fire({
      title: 'Solicitud Aceptada',
      text: `Has aceptado la solicitud #${requestId} de ${request.user}. Procede a registrar la recolección.`,
      icon: 'success'
    });
    loadPendingRequests();
  }
}

function rejectRequestSample(requestId) {
  Swal.fire({
    title: '¿Rechazar solicitud?',
    text: "¿Estás seguro de que deseas rechazar esta solicitud?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, rechazar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      const request = sampleRequests.find(req => req.id === requestId);
      if(request) {
        request.status = 'rechazada';
        Swal.fire('Rechazada', `La solicitud #${requestId} ha sido rechazada.`, 'success');
        loadPendingRequests();
      }
    }
  });
}

function viewRequestDetails(requestId) {
  const request = sampleRequests.find(req => req.id === requestId);
  if(request) {
    Swal.fire({
      title: `Detalles de Solicitud #${requestId}`,
      html: `
        <div style="text-align: left;">
          <p><strong>Usuario:</strong> ${request.user}</p>
          <p><strong>Fecha:</strong> ${request.date}</p>
          <p><strong>Tipo de residuo:</strong> ${getWasteTypeName(request.type)}</p>
          <p><strong>Peso estimado:</strong> ${request.weight} kg</p>
          <p><strong>Dirección:</strong> ${request.address}</p>
          <p><strong>Teléfono:</strong> ${request.phone}</p>
          <p><strong>Estado:</strong> ${getStatusName(request.status)}</p>
        </div>
      `,
      confirmButtonText: 'Cerrar'
    });
  }
}

function updateRequestsSelect() {
  const select = document.getElementById('request-select');
  select.innerHTML = '<option value="">Seleccione una solicitud</option>';
  
  const acceptedRequests = sampleRequests.filter(req => req.status === 'aceptada');
  
  acceptedRequests.forEach(request => {
    const option = document.createElement('option');
    option.value = request.id;
    option.textContent = `Solicitud #${request.id} - ${request.user} (${request.weight}kg)`;
    select.appendChild(option);
  });
}

function registerCollection() {
  const select = document.getElementById('request-select');
  const weightInput = document.getElementById('collected-weight');
  const requestId = parseInt(select.value);
  const collectedWeight = parseFloat(weightInput.value);
  
  if(!requestId) {
    Swal.fire({ title: 'Error', text: 'Por favor selecciona una solicitud', icon: 'error' });
    return;
  }
  
  if(isNaN(collectedWeight) || collectedWeight <= 0) {
    Swal.fire({ title: 'Error', text: 'Por favor ingresa un peso válido', icon: 'error' });
    return;
  }
  
  const request = sampleRequests.find(req => req.id === requestId);

  if (request) {
    request.status = 'completada';
    request.collectedWeight = collectedWeight;
    request.collectionDate = new Date().toISOString().split('T')[0];
    
    Swal.fire({
      title: 'Recolección Registrada',
      html: `
        <p>Has registrado la recolección para:</p>
        <p><strong>Solicitud #${request.id}</strong></p>
        <p><strong>Usuario:</strong> ${request.user}</p>
        <p><strong>Peso recolectado:</strong> ${collectedWeight} kg</p>
      `,
      icon: 'success'
    });
    
    loadPendingRequests();
    updateRequestsSelect();
    weightInput.value = '';

  } else {
     Swal.fire({ title: 'Error', text: 'Solicitud no encontrada', icon: 'error' });
  }
}

function updateCompanySection() {
  loadPendingRequests();
  renderVehiclesList();
  searchUsers(); 
  
  const ctx = document.getElementById('companyStatsChart').getContext('2d');
  
  if (window.companyChart) {
    window.companyChart.destroy();
  }

  /*Usar la lista de SampleRequests y collectionRequests */
  const completed = collectionRequests.filter(r => r.status === 'completed').length + sampleRequests.filter(r => r.status === 'completada').length;
  const accepted = collectionRequests.filter(r => r.status === 'accepted').length + sampleRequests.filter(r => r.status === 'aceptada').length;
  const rejected = collectionRequests.filter(r => r.status === 'rejected').length + sampleRequests.filter(r => r.status === 'rechazada').length;

  window.companyChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Completadas', 'Aceptadas', 'Rechazadas'],
      datasets: [{
        data: [completed, accepted, rejected
          /*collectionRequests.filter(r => currentUser && r.companyId === currentUser.id && r.status === 'completed').length,
          collectionRequests.filter(r => currentUser && r.companyId === currentUser.id && r.status === 'accepted').length,
          collectionRequests.filter(r => currentUser && r.companyId === currentUser.id && r.status === 'rejected').length*/
        ],
        backgroundColor: ['#2e7d32', '#ffc107', '#f44336']
      }]
    }
  });
}

// --- GESTIÓN DE VEHÍCULOS (Empresa) ---

function showAddVehicleForm(vehicleId = null) {
  currentEditingVehicleId = vehicleId;
  const modal = document.getElementById('vehicle-modal');
  const title = document.getElementById('vehicle-modal-title');
  
  if (vehicleId) {
    title.textContent = "Editar Vehículo";
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      document.getElementById('vehicle-plate').value = vehicle.plate;
      document.getElementById('vehicle-brand').value = vehicle.brand;
      document.getElementById('vehicle-model').value = vehicle.model;
      document.getElementById('vehicle-capacity').value = vehicle.capacity;
      document.getElementById('vehicle-type').value = vehicle.type;
    }
  } else {
    title.textContent = "Añadir Nuevo Vehículo";
    ['plate', 'brand', 'model', 'capacity'].forEach(field => {
      document.getElementById(`vehicle-${field}`).value = '';
    });
    document.getElementById('vehicle-type').value = 'compacto';
  }
  
  modal.classList.remove('hidden');
}

function closeVehicleModal() {
  document.getElementById('vehicle-modal').classList.add('hidden');
  currentEditingVehicleId = null;
}

function saveVehicle() {
  const plate = document.getElementById('vehicle-plate').value;
  const brand = document.getElementById('vehicle-brand').value;
  const model = document.getElementById('vehicle-model').value;
  const capacity = parseInt(document.getElementById('vehicle-capacity').value);
  const type = document.getElementById('vehicle-type').value;
  
  if (!plate || !brand || !model || isNaN(capacity) || capacity <= 0) {
    Swal.fire("Error", "Por favor complete todos los campos correctamente", "error");
    return;
  }
  
  const companyId = currentUser ? currentUser.id : 3;
  
  if (currentEditingVehicleId) {
    //Lógica para Editar
    const index = vehicles.findIndex(v => v.id === currentEditingVehicleId);
    if (index !== -1) {
      vehicles[index] = {
        ...vehicles[index],
        plate,
        brand,
        model,
        capacity,
        type
      };
      Swal.fire("Éxito", "Vehículo actualizado correctamente", "success");
    }
  } else {
    //Lógica para Añadir
    const newVehicle = {
      id: vehicles.length > 0 ? Math.max(...vehicles.map(v => v.id)) + 1 : 1,
      companyId: companyId,
      plate,
      brand,
      model,
      capacity,
      type,
      status: 'active'
    };
    vehicles.push(newVehicle);
    Swal.fire("Éxito", "Vehículo añadido correctamente", "success");
  }
  
  closeVehicleModal();
  renderVehiclesList();
}

function renderVehiclesList() {
  const container = document.getElementById('vehicles-list');
  container.innerHTML = '';
  
  const companyVehicles = vehicles.filter(v => currentUser && v.companyId === currentUser.id);
  
  if (companyVehicles.length === 0) {
    container.innerHTML = '<p>No hay vehículos registrados</p>';
    return;
  }
  
  companyVehicles.forEach(vehicle => {
    const statusText = vehicle.status === 'active' ? 'Activo' : 'Inactivo';
    const statusClass = `status-${vehicle.status}`;
    
    const card = document.createElement('div');
    card.className = 'vehicle-card';
    card.innerHTML = `
      <h4>${vehicle.brand} ${vehicle.model} <span class="status-badge ${statusClass}">${statusText}</span></h4>
      <div class="vehicle-property"><strong>Placa:</strong> ${vehicle.plate}</div>
      <div class="vehicle-property"><strong>Capacidad:</strong> ${vehicle.capacity} kg</div>
      <div class="vehicle-property"><strong>Tipo:</strong> ${vehicle.type}</div>
      <div class="vehicle-actions">
        <button onclick="showAddVehicleForm(${vehicle.id})">Editar</button>
        <button onclick="toggleVehicleStatus(${vehicle.id})">${vehicle.status === 'active' ? 'Desactivar' : 'Activar'}</button>
        <button onclick="deleteVehicle(${vehicle.id})">Eliminar</button>
      </div>
    `;
    
    container.appendChild(card);
  });
}

function toggleVehicleStatus(vehicleId) {
  const vehicle = vehicles.find(v => v.id === vehicleId);
  if (vehicle) {
    vehicle.status = vehicle.status === 'active' ? 'inactive' : 'active';
    renderVehiclesList();
    Swal.fire("Éxito", `Vehículo ${vehicle.status === 'active' ? 'activado' : 'desactivado'}`, "success");
  }
}

function deleteVehicle(vehicleId) {
  Swal.fire({
    title: "¿Eliminar vehículo?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  }).then((result) => {
    if (result.isConfirmed) {
      const index = vehicles.findIndex(v => v.id === vehicleId);
      if (index !== -1) {
        const isAssigned = collectionRequests.some(r => r.vehicleId === vehicleId);
        
        if (isAssigned) {
          Swal.fire("Error", "No se puede eliminar un vehículo asignado a solicitudes", "error");
        } else {
          vehicles.splice(index, 1);
          renderVehiclesList();
          Swal.fire("Éxito", "Vehículo eliminado correctamente", "success");
        }
      }
    }
  });
}

// --- GESTIÓN DE USUARIOS (Empresa - Búsqueda) ---

function searchUsers() {
  const searchTerm = document.getElementById('user-search').value.toLowerCase();
  const managedUsersList = document.getElementById('managed-users-list');
  managedUsersList.innerHTML = '';
  
  let filteredUsers = users.filter(u => 
    u.role === 'user' && 
    u.status === 'active' && 
    (u.name.toLowerCase().includes(searchTerm) || 
     u.email.toLowerCase().includes(searchTerm))
  );
  
  if (filteredUsers.length === 0) {
    managedUsersList.innerHTML = '<li>No se encontraron usuarios</li>';
    return;
  }
  
  filteredUsers.forEach(user => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <strong>${user.name}</strong> (${user.email})<br>
        Teléfono: ${user.phone} | Puntos: ${user.points}
      </div>
      <button onclick="deleteUser(${user.id})">Desactivar</button>
    `;
    managedUsersList.appendChild(li);
  });
}

// --- SECCIÓN ADMINISTRADOR ---

function updateAdminSection() {
  const usersList = document.getElementById('users-list');
  usersList.innerHTML = '';
  
  users.filter(u => u.role === 'user').forEach(user => {
    const statusText = user.status === 'active' ? 'Activo' : 'Inactivo';
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <strong>${user.name}</strong> (${user.email})<br>
        Teléfono: ${user.phone} | Puntos: ${user.points} | 
        Estado: <span class="status-badge status-${user.status}">${statusText}</span>
      </div>
      <div>
        <button onclick="editUser(${user.id})">Editar</button>
        <button onclick="deleteUser(${user.id})">${user.status === 'active' ? 'Desactivar' : 'Activar'}</button>
      </div>
    `;
    usersList.appendChild(li);
  });
  
  const companiesList = document.getElementById('companies-list');
  companiesList.innerHTML = '';
  
  users.filter(u => u.role === 'company').forEach(company => {
    const statusText = company.status === 'active' ? 'Activa' : 'Inactiva';
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <strong>${company.name}</strong> (${company.email})<br>
        Teléfono: ${company.phone} | 
        Estado: <span class="status-badge status-${company.status}">${statusText}</span>
      </div>
      <div>
        <button onclick="editCompany(${company.id})">Editar</button>
        <button onclick="deleteCompany(${company.id})">${company.status === 'active' ? 'Desactivar' : 'Activar'}</button>
      </div>
    `;
    companiesList.appendChild(li);
  });
  
  filterAdminData();
}

function updateAdminStats(requests) {
  const ctx = document.getElementById('adminRequestsChart').getContext('2d');
  
  if (window.adminChart) {
    window.adminChart.destroy();
  }
  
  const types = ['organico', 'inorganico', 'reciclable', 'peligroso'];
  
  window.adminChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: types.map(getWasteTypeName),
      datasets: [{
        label: 'Solicitudes por tipo',
        data: types.map(type => 
          requests.filter(r => r.type === type).length
        ),
        backgroundColor: '#2e7d32'
      }, {
        label: 'Peso total (kg)',
        data: types.map(type => 
          requests.filter(r => r.type === type).reduce((sum, r) => sum + r.weight, 0)
        ),
        backgroundColor: '#81c784',
        type: 'line',
        yAxisID: 'y1'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Cantidad de solicitudes'
          }
        },
        y1: {
          position: 'right',
          beginAtZero: true,
          title: {
            display: true,
            text: 'Peso total (kg)'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
}

function filterAdminData() {
  const startDate = document.getElementById('admin-start-date').value;
  const endDate = document.getElementById('admin-end-date').value;
  const filterType = document.getElementById('admin-filter-type').value;
  const minWeight = parseFloat(document.getElementById('admin-min-weight').value) || 0;
  const maxWeight = parseFloat(document.getElementById('admin-max-weight').value) || Infinity;
  
  let filteredRequests = [...collectionRequests];
  
  if (startDate) {
    filteredRequests = filteredRequests.filter(r => r.date >= startDate);
  }
  
  if (endDate) {
    filteredRequests = filteredRequests.filter(r => r.date <= endDate);
  }
  
  if (filterType !== 'all') {
    filteredRequests = filteredRequests.filter(r => r.type === filterType);
  }
  
  filteredRequests = filteredRequests.filter(r => 
    r.weight >= minWeight && r.weight <= maxWeight
  );
  
  const allRequestsList = document.getElementById('all-requests-list');
  allRequestsList.innerHTML = '';
  
  filteredRequests.forEach(request => {
    const user = users.find(u => u.id === request.userId);
    const company = request.companyId ? users.find(u => u.id === request.companyId) : null;
    
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <strong>${user ? user.name : 'Usuario Eliminado'}</strong><br>
        Fecha: ${request.date} | Tipo: ${getWasteTypeName(request.type)} | 
        Peso: ${request.weight}kg | Puntos: ${request.points}<br>
        Estado: ${getStatusName(request.status)} 
        ${company ? `| Empresa: ${company.name}` : ''}
      </div>
      <div>
        <button onclick="editRequest(${request.id})">Editar</button>
        <button onclick="deleteRequest(${request.id})">Eliminar</button>
      </div>
    `;
    allRequestsList.appendChild(li);
  });
  
  updateAdminStats(filteredRequests);
}

// Funciones CRUD de Admin
function addUserManually() {
  Swal.fire({
    title: 'Agregar Nuevo Usuario',
    html: `
      <input type="text" id="new-user-name" class="swal2-input" placeholder="Nombre completo" required>
      <input type="email" id="new-user-email" class="swal2-input" placeholder="Email" required>
      <input type="password" id="new-user-password" class="swal2-input" placeholder="Contraseña" required>
      <input type="tel" id="new-user-phone" class="swal2-input" placeholder="Teléfono">
      <input type="number" id="new-user-points" class="swal2-input" placeholder="Puntos iniciales" value="0">
      <select id="new-user-role" class="swal2-select">
        <option value="user">Usuario</option>
        <option value="company">Empresa</option>
        <option value="admin">Administrador</option>
      </select>
      <label style="display: block; margin-top: 10px;"><input type="checkbox" id="new-user-whatsapp" checked> WhatsApp</label>
    `,
    showCancelButton: true,
    confirmButtonText: 'Registrar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      return {
        name: document.getElementById('new-user-name').value,
        email: document.getElementById('new-user-email').value,
        password: document.getElementById('new-user-password').value,
        phone: document.getElementById('new-user-phone').value,
        points: parseInt(document.getElementById('new-user-points').value) || 0,
        role: document.getElementById('new-user-role').value,
        whatsapp: document.getElementById('new-user-whatsapp').checked,
        status: 'active'
      };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        ...result.value
      };
      
      if (users.some(u => u.email === newUser.email)) {
         Swal.fire('Error', 'Este correo ya está registrado', 'error');
         return;
      }

      users.push(newUser);
      updateAdminSection();
      Swal.fire('¡Registrado!', 'El nuevo usuario ha sido creado.', 'success');
    }
  });
}

function editUser(userId) {
  const user = users.find(u => u.id === userId);
  if (!user) return;

  Swal.fire({
    title: `Editar Usuario: ${user.name}`,
    html: `
      <input type="text" id="edit-user-name" value="${user.name}" class="swal2-input" placeholder="Nombre">
      <input type="email" id="edit-user-email" value="${user.email}" class="swal2-input" placeholder="Email">
      <input type="tel" id="edit-user-phone" value="${user.phone}" class="swal2-input" placeholder="Teléfono">
      <input type="number" id="edit-user-points" value="${user.points}" class="swal2-input" placeholder="Puntos">
      <select id="edit-user-status" class="swal2-select">
        <option value="active" ${user.status === 'active' ? 'selected' : ''}>Activo</option>
        <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Inactivo</option>
      </select>
      <label style="display: block; margin-top: 10px;"><input type="checkbox" id="edit-user-whatsapp" ${user.whatsapp ? 'checked' : ''}> WhatsApp</label>
    `,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      return {
        name: document.getElementById('edit-user-name').value,
        email: document.getElementById('edit-user-email').value,
        phone: document.getElementById('edit-user-phone').value,
        points: parseInt(document.getElementById('edit-user-points').value),
        status: document.getElementById('edit-user-status').value,
        whatsapp: document.getElementById('edit-user-whatsapp').checked
      };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      Object.assign(user, result.value);
      updateAdminSection();
      Swal.fire('¡Actualizado!', 'El usuario ha sido modificado.', 'success');
    }
  });
}

function deleteUser(userId) {
  Swal.fire({
    title: '¿Desactivar/Activar usuario?',
    text: "Esta acción cambiará el estado del usuario.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Sí, cambiar estado',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      const user = users.find(u => u.id === userId);
      if (user) {
        user.status = user.status === 'active' ? 'inactive' : 'active';
        updateAdminSection();
        Swal.fire('¡Estado Cambiado!', `El usuario ha sido marcado como ${user.status}.`, 'success');
      }
    }
  });
}

function addCompanyManually() {
  Swal.fire({
    title: 'Agregar Nueva Empresa',
    html: `
      <input type="text" id="new-company-name" class="swal2-input" placeholder="Nombre de la empresa" required>
      <input type="email" id="new-company-email" class="swal2-input" placeholder="Email" required>
      <input type="password" id="new-company-password" class="swal2-input" placeholder="Contraseña" required>
      <input type="tel" id="new-company-phone" class="swal2-input" placeholder="Teléfono" required>
      <label style="display: block; margin-top: 10px;"><input type="checkbox" id="new-company-whatsapp" checked> WhatsApp</label>
    `,
    showCancelButton: true,
    confirmButtonText: 'Registrar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      return {
        name: document.getElementById('new-company-name').value,
        email: document.getElementById('new-company-email').value,
        password: document.getElementById('new-company-password').value,
        phone: document.getElementById('new-company-phone').value,
        whatsapp: document.getElementById('new-company-whatsapp').checked,
        role: 'company',
        status: 'active'
      };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const newCompany = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        ...result.value
      };
      if (users.some(u => u.email === newCompany.email)) {
         Swal.fire('Error', 'Este correo ya está registrado', 'error');
         return;
      }
      
      users.push(newCompany);
      updateAdminSection();
      Swal.fire('¡Registrada!', 'La nueva empresa ha sido creada.', 'success');
    }
  });
}

function editCompany(companyId) {
  const company = users.find(u => u.id === companyId && u.role === 'company');
  if (!company) return;

  Swal.fire({
    title: `Editar Empresa: ${company.name}`,
    html: `
      <input type="text" id="edit-company-name" value="${company.name}" class="swal2-input" placeholder="Nombre">
      <input type="email" id="edit-company-email" value="${company.email}" class="swal2-input" placeholder="Email">
      <input type="tel" id="edit-company-phone" value="${company.phone}" class="swal2-input" placeholder="Teléfono">
      <select id="edit-company-status" class="swal2-select">
        <option value="active" ${company.status === 'active' ? 'selected' : ''}>Activa</option>
        <option value="inactive" ${company.status === 'inactive' ? 'selected' : ''}>Inactiva</option>
      </select>
      <label style="display: block; margin-top: 10px;"><input type="checkbox" id="edit-company-whatsapp" ${company.whatsapp ? 'checked' : ''}> WhatsApp</label>
    `,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      return {
        name: document.getElementById('edit-company-name').value,
        email: document.getElementById('edit-company-email').value,
        phone: document.getElementById('edit-company-phone').value,
        status: document.getElementById('edit-company-status').value,
        whatsapp: document.getElementById('edit-company-whatsapp').checked
      };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      Object.assign(company, result.value);
      updateAdminSection();
      Swal.fire('¡Actualizado!', 'La empresa ha sido modificada.', 'success');
    }
  });
}

function deleteCompany(companyId) {
  Swal.fire({
    title: '¿Desactivar/Activar empresa?',
    text: "Esta acción cambiará el estado de la empresa.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Sí, cambiar estado',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      const company = users.find(u => u.id === companyId);
      if (company) {
        company.status = company.status === 'active' ? 'inactive' : 'active';
        updateAdminSection();
        Swal.fire('¡Estado Cambiado!', `La empresa ha sido marcada como ${company.status}.`, 'success');
      }
    }
  });
}

function editRequest(requestId) {
    Swal.fire('Funcionalidad Pendiente', `Editar solicitud #${requestId} aún no está implementado.`, 'info');
}

function deleteRequest(requestId) {
    Swal.fire({
        title: '¿Eliminar solicitud?',
        text: "Esta acción eliminará la solicitud de forma permanente.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const initialLength = collectionRequests.length;
            collectionRequests = collectionRequests.filter(r => r.id !== requestId);
            if (collectionRequests.length < initialLength) {
                filterAdminData();
                Swal.fire('¡Eliminada!', 'La solicitud ha sido eliminada.', 'success');
            } else {
                Swal.fire('Error', 'Solicitud no encontrada.', 'error');
            }
        }
    });
}

// --- FUNCIONES DE EXPORTACIÓN ---

function exportUsersToPDF() {
  const usersToExport = users.filter(u => u.role === 'user');
  let content = [
    ['ID', 'Nombre', 'Email', 'Teléfono', 'Puntos', 'Estado']
  ];
  
  usersToExport.forEach(user => {
    content.push([
      user.id,
      user.name,
      user.email,
      user.phone,
      user.points,
      user.status === 'active' ? 'Activo' : 'Inactivo'
    ]);
  });
  
  const csvContent = content.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'usuarios_ardimi.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  Swal.fire('Reporte Generado', 'El reporte de usuarios se ha descargado en formato CSV.', 'success');
}

function exportRequestsToExcel() {
  let content = [
    ['ID', 'Usuario', 'Fecha', 'Tipo', 'Peso (kg)', 'Puntos', 'Estado', 'Empresa']
  ];
  
  collectionRequests.forEach(request => {
    const user = users.find(u => u.id === request.userId);
    const company = request.companyId ? users.find(u => u.id === request.companyId) : null;
    
    content.push([
      request.id,
      user ? user.name : 'Desconocido',
      request.date,
      getWasteTypeName(request.type).replace(/[\u2600-\u26FF\u2700-\u27BF]/g, '').trim(),
      request.weight,
      request.points,
      getStatusName(request.status),
      company ? company.name : 'N/A'
    ]);
  });
  
  const csvContent = content.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'solicitudes_ardimi.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  Swal.fire('Reporte Generado', 'El reporte de solicitudes se ha descargado en formato CSV.', 'success');
}


// --- LÓGICA DE INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', function() {
    // Inicia la aplicación mostrando la vista de Login
    showLoginForm();
});