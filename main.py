from fastapi import FastAPI
from app.database import Base, engine
from app.models.usuario import Usuario
from app.models import solicitud


from app.routes.usuario_routes import router as usuario_router
from app.routes.auth_routes import router as auth_router

app = FastAPI(title="API ARDI-MI")

Base.metadata.create_all(bind=engine)

app.include_router(usuario_router)
app.include_router(auth_router)

@app.get("/")
def home():
    return {"mensaje": "API ARDI-MI funcionando"}
