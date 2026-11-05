from fastapi import FastAPI
from pydantic import BaseModel
import psycopg2
import os

app = FastAPI()

# Configuración de la base de datos usando el NOMBRE DEL SERVICIO "db"
DB_HOST = os.getenv("DB_HOST", "db") # <--- AQUÍ OCURRE LA MAGIA DE DOCKER
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASSWORD")

def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS
    )

class Solicitud(BaseModel):
    tipo_residuo: str
    direccion: str

@app.get("/")
def read_root():
    return {"mensaje": "API Ardi-MI funcionando correctamente"}

@app.post("/solicitudes")
def crear_solicitud(solicitud: Solicitud):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Crear tabla si no existe
        cur.execute("""
            CREATE TABLE IF NOT EXISTS solicitudes (
                id SERIAL PRIMARY KEY,
                tipo_residuo VARCHAR(50),
                direccion VARCHAR(255)
            )
        """)
        
        # Guardar dato (IDA)
        cur.execute(
            "INSERT INTO solicitudes (tipo_residuo, direccion) VALUES (%s, %s) RETURNING id",
            (solicitud.tipo_residuo, solicitud.direccion)
        )
        nuevo_id = cur.fetchone()[0]
        conn.commit()
        
        # Leer dato de vuelta (VUELTA)
        cur.execute("SELECT id, tipo_residuo, direccion FROM solicitudes WHERE id = %s", (nuevo_id,))
        resultado = cur.fetchone()
        
        cur.close()
        conn.close()
        
        return {
            "mensaje": "Dato guardado y recuperado desde PostgreSQL exitosamente",
            "datos": {
                "id": resultado[0],
                "tipo_residuo": resultado[1],
                "direccion": resultado[2]
            }
        }
    except Exception as e:
        return {"error": str(e)}

    #Comentario de prueba