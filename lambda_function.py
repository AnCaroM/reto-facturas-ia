import json
from extractor import extraer_informacion_factura

def lambda_handler(event, context):
    """
    Entry point para AWS Lambda.
    Espera un evento JSON con la estructura: { "body": "texto_de_la_factura" }
    """
    try:
        # Obtener el texto de la factura (asumiendo llamada API Gateway o invocación directa)
        factura_texto = event.get("body", "")
        
        if not factura_texto:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "No se proporcionó texto de factura"})
            }

        # Procesar
        datos_factura = extraer_informacion_factura(factura_texto)
        
        # Retornar JSON puro
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(datos_factura.model_dump(), default=str)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }