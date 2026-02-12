"""from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.usuario import Usuario
from app.schemas.usuario_schema import UsuarioCreate, UsuarioResponse
from app.auth.security import hash_password

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

# Dependencia DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# REGISTRO USUARIO
@router.post("/registro", response_model=UsuarioResponse)
def registrar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):

    # Verificar email existente
    usuario_existente = db.query(Usuario).filter(Usuario.email == usuario.email).first()

    if usuario_existente:
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    nuevo_usuario = Usuario(
        nombre=usuario.nombre,
        email=usuario.email,
        password=hash_password(usuario.password),
        rol=usuario.rol
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return nuevo_usuario"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.usuario import Usuario
from app.schemas.usuario_schema import UsuarioCreate, UsuarioResponse
from app.auth.security import hash_password
from app.auth.dependencies import get_current_user, require_role

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


# ======================
# DEPENDENCIA DB
# ======================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ======================
# REGISTRO USUARIO
# ======================
@router.post("/registro", response_model=UsuarioResponse)
def registrar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):

    usuario_existente = db.query(Usuario).filter(Usuario.email == usuario.email).first()

    if usuario_existente:
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    nuevo_usuario = Usuario(
        nombre=usuario.nombre,
        email=usuario.email,
        password=hash_password(usuario.password),
        rol=usuario.rol
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return nuevo_usuario


# ======================
# PERFIL USUARIO (PROTEGIDO)
# ======================
@router.get("/perfil")
def perfil(usuario = Depends(get_current_user)):
    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "email": usuario.email,
        "rol": usuario.rol
    }


# ======================
# SOLO ADMIN
# ======================
@router.get("/admin")
def solo_admin(usuario = Depends(require_role("admin"))):
    return {"mensaje": f"Bienvenido admin {usuario.nombre}"}
