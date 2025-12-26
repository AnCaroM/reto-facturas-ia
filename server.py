# server.py (Para probar localmente con el Frontend)
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from extractor import extraer_informacion_factura
import uvicorn

app = FastAPI()

# Permitir que el Frontend (React) hable con este Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/procesar")
async def procesar_factura(file: UploadFile = File(...)):
    contenido = await file.read()
    texto = contenido.decode("utf-8")
    
    # Reutilizamos tu lógica existente
    factura = extraer_informacion_factura(texto)
    return factura

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)