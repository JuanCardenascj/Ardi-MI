# ♻️ ARDI-MI API

Es una propuesta para un sistema backend desarrollado con FastAPI para la gestión de recolección de residuos.

Ardi-MI esta encarga de recolectar los residuos de cada uno de los hogares que tengan su contrato con la compañia.
Cada hogar o cada familia tiene el derecho, teniendo sus servicios contratados, de realizar la solicitud, definir cual sera su residuo y su peso aproximado (la compañia dispondra de multiples disponibles de pesos para el pesaje de los desechos), añadira su dirección y solicitara todo ok. 
De aqui en adelante, la solicitud es creada, es notificada al centro del panel central de la compañia, y esta le asignara dos o tres rutas de recogidas, dependiendo de la disponibilidad de vehiculos recolectores, t solo quedara que esto sea recogido, y vuelto a pesar por los carros en sus pesos, y confirmado el peso.


---

## 🚀 Tecnologías utilizadas

- Python
- FastAPI
- SQLAlchemy
- MySQL
- Uvicorn
- Pydantic
- Passlib (bcrypt)

---

## 📦 Funcionalidades

- Registro de usuarios
- Autenticación
- Gestión de solicitudes de recolección
- Arquitectura modular
- Base de datos relacional

---

## 🧱 Arquitectura

El proyecto sigue una arquitectura basada en capas:

app/
├── models
├── schemas
├── routers
├── database.py
├── main.py


---

## ⚙️ Instalación

### 1️⃣ Clonar repositorio

https://github.com/JuanCardenascj/Ardi-MI


---

### 2️⃣ Crear entorno virtual

python -m venv venv


---

### 3️⃣ Activar entorno virtual

Windows:

venv\Scripts\activate


Linux / Mac:

source venv/bin/activate


---

### 4️⃣ Instalar dependencias

pip install -r requirements.txt


---

### 5️⃣ Configurar base de datos

Importar el archivo:

database.sql


---

### 6️⃣ Ejecutar servidor

uvicorn app.main:app --reload


---

## 🌱 Datos de prueba

Puedes ejecutar:

python seed_data.py


---

## 📚 Documentación automática

Swagger:

http://127.0.0.1:8000/docs


---

## 👨‍💻 Autor

Juan David Cárdenas  
Ingeniería de Software