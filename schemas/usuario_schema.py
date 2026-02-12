from pydantic import BaseModel, EmailStr

class UsuarioCreate(BaseModel):
    nombre: str
    email: EmailStr
    password: str
    rol: str

class UsuarioResponse(BaseModel):
    id: int
    nombre: str
    email: str
    rol: str

    class Config:
        from_attributes = True
