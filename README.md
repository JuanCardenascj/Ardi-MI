# ♻️ ARDI-MI API

Sistema backend desarrollado con FastAPI para la gestión de recolección de residuos.

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