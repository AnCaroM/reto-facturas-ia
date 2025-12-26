import os
import pandas as pd
from extractor import extraer_informacion_factura

DIRECTORIO_DATA = "data"
ARCHIVO_SALIDA = "reporte_facturas.csv"

def procesar_carpeta():
    registros_para_csv = []
    
    # Listar archivos .txt
    archivos = [f for f in os.listdir(DIRECTORIO_DATA) if f.endswith(".txt")]
    print(f"📂 Encontrados {len(archivos)} archivos para procesar...")

    for archivo in archivos:
        ruta_completa = os.path.join(DIRECTORIO_DATA, archivo)
        print(f"Processing {archivo}...", end=" ", flush=True)
        
        try:
            # 1. Leer texto
            with open(ruta_completa, "r", encoding="utf-8") as f:
                contenido = f.read()
            
            # 2. Extraer con IA
            factura = extraer_informacion_factura(contenido)
            
            # 3. Aplanar datos para CSV (Una fila por cada Ítem vendido)
            for item in factura.items:
                fila = {
                    "Archivo": archivo,
                    "Nro_Factura": factura.numero_factura,
                    "Fecha": factura.fecha_emision,
                    "Cliente": factura.cliente.nombre,
                    "NIT_Cliente": factura.cliente.identificacion,
                    "Forma_Pago": factura.forma_pago,
                    # Datos del Item
                    "Item_Desc": item.descripcion,
                    "Cantidad": item.cantidad,
                    "Precio_Unit": item.precio_unitario,
                    "Subtotal_Item": item.subtotal_item,
                    # Totales Generales (repetidos por fila)
                    "Total_Factura": factura.montos.total_general,
                    "IVA_Factura": factura.montos.iva
                }
                registros_para_csv.append(fila)
            
            print("✅ OK")
            
        except Exception as e:
            print(f"❌ Error: {e}")

    # 4. Exportar
    if registros_para_csv:
        df = pd.DataFrame(registros_para_csv)
        df.to_csv(ARCHIVO_SALIDA, index=False, encoding="utf-8-sig") # sig para tildes en Excel
        print(f"\n✨ Proceso terminado. Resultados guardados en '{ARCHIVO_SALIDA}'")
    else:
        print("\n⚠️ No se generaron registros.")

if __name__ == "__main__":
    procesar_carpeta()