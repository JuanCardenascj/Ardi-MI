from pydantic import BaseModel
from datetime import datetime

class SolicitudBase(BaseModel):
    tipo_residuo: str
    direccion: str

class SolicitudCreate(SolicitudBase):
    pass

class SolicitudResponse(SolicitudBase):
    id: int
    estado: str
    fecha_solicitud: datetime
    usuario_id: int

    class Config:
        from_attributes = True
