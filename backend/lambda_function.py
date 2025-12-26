import json
import base64
import os
from openai import OpenAI
from pydantic import BaseModel, Field
from typing import List, Optional

# --- DEFINICIÓN DE MODELOS (Lo que estaba en models.py) ---
class ItemFactura(BaseModel):
    descripcion: str
    cantidad: float
    precio_unitario: float
    subtotal_item: float

class Cliente(BaseModel):
    nombre: str
    identificacion: str  # NIT, RUT, DNI
    direccion: Optional[str] = None

class Montos(BaseModel):
    subtotal: float
    impuestos: float
    total_general: float
    moneda: str

class InvoiceData(BaseModel):
    numero_factura: str
    fecha_emision: str
    cliente: Cliente
    items: List[ItemFactura]
    montos: Montos

# --- LÓGICA DE EXTRACCIÓN (Lo que estaba en extractor.py) ---
def extract_invoice_data_internal(invoice_text: str):
    # Inicializamos el cliente aquí adentro para asegurar que tome la ENV actualizada
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    
    system_prompt = """
    Eres un experto en extracción de datos de facturas.
    Tu tarea es extraer la información de la factura proporcionada y devolverla EXCLUSIVAMENTE en formato JSON.
    El JSON debe cumplir estrictamente con el esquema definido.
    
    REGLAS IMPORTANTES:
    1. FECHAS: Debes convertir SIEMPRE la fecha de emisión al formato estandar YYYY-MM-DD. 
       (Ejemplo: Si dice "18 de Diciembre de 2024", debes devolver "2024-12-18").
    2. Si algún campo no está presente, usa null o una cadena vacía.
    """

    try:
        completion = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": invoice_text},
            ],
            response_format=InvoiceData,
        )
        return completion.choices[0].message.parsed
    except Exception as e:
        print(f"Error OpenAI: {str(e)}")
        raise e

# --- HANDLER DE AWS LAMBDA ---
def lambda_handler(event, context):
    # Configuración CORS
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    }

    # Preflight request
    if event.get('requestContext', {}).get('http', {}).get('method') == 'OPTIONS':
        return { "statusCode": 200, "headers": headers, "body": "" }

    try:
        print("Evento recibido:", json.dumps(event)[:200]) # Log parcial para debug
        
        # 1. Obtener el cuerpo limpio
        raw_body = event.get("body", "")
        
        # Decodificar Base64 si es necesario
        if event.get("isBase64Encoded", False):
            try:
                raw_body = base64.b64decode(raw_body).decode("utf-8")
            except:
                pass

        # Parsear JSON si viene envuelto
        texto_factura = raw_body
        if raw_body.strip().startswith("{"):
            try:
                parsed = json.loads(raw_body)
                if "body" in parsed:
                    texto_factura = parsed["body"]
            except:
                pass

        if not texto_factura:
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({"detail": "El texto de la factura está vacío"})
            }

        # 2. Llamar a la lógica interna (ya no hay imports externos)
        result_data = extract_invoice_data_internal(texto_factura)

        # 3. Retornar éxito
        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps(result_data.model_dump())
        }

    except Exception as e:
        print(f"ERROR CRÍTICO: {str(e)}")
        import traceback
        traceback.print_exc() # Esto imprimirá el error real en CloudWatch
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"detail": f"Error interno: {str(e)}"})
        }