from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.solicitud import Solicitud
from app.schemas.solicitud_schema import SolicitudCreate, SolicitudResponse
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/solicitudes", tags=["Solicitudes"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()