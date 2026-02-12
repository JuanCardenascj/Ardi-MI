from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Solicitud(Base):
    __tablename__ = "solicitudes"

    id = Column(Integer, primary_key=True, index=True)
    tipo_residuo = Column(String(100))
    direccion = Column(String(255))
    fecha_solicitud = Column(DateTime, default=datetime.utcnow)
    estado = Column(String(50), default="pendiente")

    usuario_id = Column(Integer, ForeignKey("usuarios.id"))

    usuario = relationship("Usuario")
