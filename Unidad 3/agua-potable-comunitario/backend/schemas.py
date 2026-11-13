from pydantic import BaseModel
from typing import Optional

# --- MÓDULO 1: USUARIOS ---
class UsuarioBase(BaseModel):
    nombre: str
    telefono: Optional[str] = None
    direccion_barrio: str
    manzana: Optional[str] = None

# --- MÓDULO 2: TOMAS DE AGUA ---
class TomaAguaBase(BaseModel):
    numero_contrato: str
    tipo_toma: str  # Ej: 'Doméstica', 'Comercial'
    estado_servicio: str  # Ej: 'Activa', 'Suspendida'
    id_usuario: int

# --- MÓDULO 3: PAGOS ---
class PagoBase(BaseModel):
    fecha_pago: str  # Formato 'YYYY-MM-DD'
    mes_cubierto: str
    año_cubierto: int
    monto: float
    id_toma: int

# --- MÓDULO 4: RECIBOS ---
class ReciboBase(BaseModel):
    folio: str
    fecha_emision: str
    monto_total: float
    codigo_qr: Optional[str] = None
    id_pago: int

# --- MÓDULO 5: REPORTES DE FUGAS ---
class ReporteFugaBase(BaseModel):
    ubicacion: str
    descripcion: str
    fecha_reporte: str
    estatus: str  # Ej: 'Pendiente', 'En Reparación', 'Atendido'
    id_usuario: int