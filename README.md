# ♻️ ARDI-MI - Sistema de Gestión de Recolección de Residuos

![Logo de ARDI-MI](frontend/images/logo.png)

> **🔒 Repositorio Privado**  
> Este código es propiedad de ARDI-MI y no está disponible para uso público.  
> El acceso está restringido exclusivamente al equipo de desarrollo autorizado.

---

## 🏢 Sobre la Compañía

**ARDI-MI** es una empresa dedicada a la **recolección de residuos sólidos** en hogares y comunidades.  
Trabajamos bajo un modelo de suscripción, donde cada hogar o familia contratante tiene derecho a solicitar la recolección de sus desechos de manera ágil, responsable y sostenible.

Nuestro sistema tecnológico permite:

- Gestionar solicitudes de recolección desde los hogares.
- Administrar la flota de vehículos recolectores.
- Asignar rutas de recogida eficientes.
- Calcular puntos por reciclaje para fomentar la cultura ambiental.
- Generar reportes y estadísticas en tiempo real.

---

## 🧩 Funcionalidades del Sistema

### 👤 Para los Usuarios (Hogares)

- **Registro e inicio de sesión** con autenticación segura.
- **Crear solicitudes de recolección** seleccionando:
  - Tipo de residuo (orgánico, inorgánico, reciclable, peligroso)
  - Peso aproximado
  - Ubicación en mapa interactivo (arrastrando un marcador)
- **Historial de solicitudes** con estados: pendiente, aceptada, completada, rechazada.
- **Acumulación de puntos** por cada kg recolectado.
- **Gráfico de puntos** para visualizar el historial de aportes ambientales.
- **Notificaciones en tiempo real** sobre el estado de sus solicitudes.

### 🏭 Para la Empresa (ARDI-MI)

- **Panel administrativo** con vista general del sistema.
- **Gestión de solicitudes pendientes**: aceptar, rechazar o completar recolecciones.
- **Registro de peso real** al completar una recolección (asignación automática de puntos).
- **Gestión de vehículos recolectores**: CRUD completo (placa, marca, modelo, capacidad, tipo).
- **Gestión de usuarios registrados** en la plataforma.
- **Estadísticas visuales** con gráficos de estado de solicitudes.
- **Asignación de rutas** según disponibilidad de vehículos.

---

## 🛠️ Tecnologías Utilizadas

| Capa | Tecnología |
|------|------------|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla), Leaflet (mapas), Chart.js, SweetAlert2, Toastify |
| **Backend** | Python, FastAPI, Uvicorn |
| **Base de Datos** | MySQL, SQLAlchemy (ORM) |
| **Autenticación** | JWT, bcrypt |
| **Geolocalización** | OpenStreetMap + Leaflet |

---

## 📁 Estructura del Proyecto
ARDI-MI/
├── frontend/ # Interfaz de usuario
│ ├── index.html
│ ├── script.js
│ ├── styles.css
│ └── images/
│
├── ardimi_api/ # Backend FastAPI
│ ├── app/
│ │ ├── auth/ # Autenticación JWT
│ │ ├── models/ # Modelos SQLAlchemy
│ │ ├── routes/ # Endpoints de la API
│ │ ├── schemas/ # Esquemas Pydantic
│ │ ├── database.py
│ │ └── main.py
│ ├── requirements.txt
│ ├── .env
│ └── database.sql
│
└── README.md

text

---

## ⚙️ Instalación y Configuración (Solo para desarrollo interno)

### 1️⃣ Clonar repositorio (acceso restringido)

```bash
git clone https://github.com/JuanCardenascj/Ardi-MI
2️⃣ Crear y activar entorno virtual
bash
python -m venv venv
venv\Scripts\activate   # Windows
source venv/bin/activate # Linux/Mac
3️⃣ Instalar dependencias
bash
pip install -r requirements.txt
4️⃣ Configurar variables de entorno (.env)
env
DATABASE_URL=mysql+pymysql://usuario:contraseña@localhost/ardimi_api
SECRET_KEY=tu_clave_secreta
5️⃣ Importar base de datos
Ejecutar el archivo database.sql en phpMyAdmin o MySQL.

6️⃣ Ejecutar servidor backend
bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
7️⃣ Abrir frontend
Abrir frontend/index.html en el navegador o usar Live Server.

📊 Flujo de Trabajo del Sistema
text
1. Usuario se registra / inicia sesión
         ↓
2. Usuario crea solicitud de recolección
   - Selecciona tipo de residuo, peso y ubicación en mapa
         ↓
3. La solicitud queda en estado "Pendiente"
         ↓
4. La empresa visualiza la solicitud en su panel
         ↓
5. La empresa acepta o rechaza la solicitud
         ↓
6. Si es aceptada:
   - Se asigna a un vehículo recolector
   - Se programa ruta de recogida
   - Se realiza la recolección
   - Se registra el peso real
         ↓
7. Se asignan puntos automáticamente al usuario
   (según tipo de residuo y peso)
         ↓
8. El usuario puede canjear sus puntos por recompensas
   (próximamente)