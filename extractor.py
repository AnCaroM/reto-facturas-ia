import os
from dotenv import load_dotenv
from openai import OpenAI
from models import Factura

load_dotenv()
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def extraer_informacion_factura(texto_factura: str) -> Factura:
    """
    Recibe el texto crudo de una factura y retorna un objeto Factura validado.
    """
    prompt_system = """
    Eres un asistente contable experto. Tu misión es extraer datos de facturas en texto plano.
    Instrucciones críticas:
    1. Si hay valores monetarios, conviértelos a float (ej: '$ 2.500.000' -> 2500000.0).
    2. Las fechas deben estar estrictamente en formato YYYY-MM-DD.
    3. Extrae todas las líneas de items sin omitir ninguna.
    """

    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini",  # Modelo económico y rápido
        messages=[
            {"role": "system", "content": prompt_system},
            {"role": "user", "content": f"Analiza la siguiente factura:\n\n{texto_factura}"},
        ],
        response_format=Factura,
    )

    return completion.choices[0].message.parsed