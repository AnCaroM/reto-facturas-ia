from openai import OpenAI
import os
from dotenv import load_dotenv
from models import InvoiceData

# Cargar variables de entorno (aunque en Lambda se inyectan solas, esto ayuda en local)
load_dotenv()

# Cliente de OpenAI
# Nota: En Lambda, la key viene de las variables de entorno que configuramos
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def extract_invoice_data(invoice_text: str):
    """
    Función principal que llama a OpenAI para extraer datos.
    Debe llamarse 'extract_invoice_data' para que lambda_function.py la encuentre.
    """
    
    # Prompt del sistema
    system_prompt = """
    Eres un experto en extracción de datos de facturas.
    Tu tarea es extraer la información de la factura proporcionada y devolverla EXCLUSIVAMENTE en formato JSON.
    El JSON debe cumplir estrictamente con el esquema definido.
    Si algún campo no está presente, usa null o una cadena vacía, pero no inventes datos.
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

        # Devolvemos el objeto Pydantic (lambda_function se encarga de convertirlo a dict)
        return completion.choices[0].message.parsed

    except Exception as e:
        print(f"Error en OpenAI: {e}")
        raise e