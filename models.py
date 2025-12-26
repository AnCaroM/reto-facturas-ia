from pydantic import BaseModel, Field
from typing import List

class Cliente(BaseModel):
    nombre: str = Field(..., description="Nombre o razón social del cliente")
    identificacion: str = Field(..., description="NIT, CC o identificación del cliente")
    direccion: str = Field(..., description="Dirección física completa")

class ItemFactura(BaseModel):
    cantidad: int
    descripcion: str
    precio_unitario: float = Field(..., description="Precio de una unidad sin símbolos de moneda")
    subtotal_item: float = Field(..., description="Precio total por la cantidad (precio * cantidad)")

class Totales(BaseModel):
    subtotal: float
    iva: float
    total_general: float

class Factura(BaseModel):
    numero_factura: str = Field(..., description="Código único de la factura (ej: FV-2024-001)")
    fecha_emision: str = Field(..., description="Fecha en formato ISO 8601 (YYYY-MM-DD)")
    forma_pago: str = Field(..., description="Ej: Contado, Crédito 30 días")
    cliente: Cliente
    items: List[ItemFactura]
    montos: Totales