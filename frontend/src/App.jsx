import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, Download, Loader2 } from 'lucide-react';

function App() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [error, setError] = useState('');

  // --- FUNCIÓN 1: Generar y Descargar CSV (Ya la tenías) ---
  const downloadCSV = () => {
    if (facturas.length === 0) return;

    const rows = [];
    const headers = [
      "Archivo", "Nro_Factura", "Fecha", "Cliente", "NIT",
      "Item_Desc", "Cantidad", "Precio_Unit", "Subtotal_Item", "Total_Factura"
    ];

    rows.push(headers.join(","));

    facturas.forEach(f => {
      f.items.forEach(item => {
        const row = [
          f.nombreArchivo,
          f.numero_factura,
          f.fecha_emision,
          `"${f.cliente.nombre}"`,
          f.cliente.identificacion,
          `"${item.descripcion}"`,
          item.cantidad,
          item.precio_unitario,
          item.subtotal_item,
          f.montos.total_general
        ];
        rows.push(row.join(","));
      });
    });

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "reporte_facturas_ia.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- FUNCIÓN 2: Subida de Archivos (AQUÍ ESTÁ EL CAMBIO IMPORTANTE) ---
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setLoading(true);
    setError('');

    // Toma la URL de la variable de entorno (Vercel) o usa localhost
    const apiUrl = import.meta.env.VITE_API_URL || 'https://ys4lryv53qrop5qj7ewtzcgng40twztf.lambda-url.us-east-1.on.aws/';

    for (const file of files) {
      try {
        // 1. Leemos el archivo TXT aquí mismo en el navegador
        const textContent = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (e) => reject(e);
          reader.readAsText(file);
        });

        // 2. Enviamos un JSON con el texto dentro del campo "body"
        // Esto se alinea perfecto con tu nuevo lambda_function.py
        const response = await axios.post(apiUrl,
          { body: textContent },
          { headers: { 'Content-Type': 'application/json' } }
        );

        // 3. Guardamos el resultado
        // (La Lambda devuelve el JSON listo en response.data)
        setFacturas(prev => [...prev, { ...response.data, nombreArchivo: file.name }]);

      } catch (err) {
        console.error(err);
        const errorMsg = err.response?.data?.detail || err.message;
        setError(`Error en ${file.name}: ${errorMsg}`);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-700">🧾 Gestor de Facturas AI</h1>

          {facturas.length > 0 && (
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Download className="w-5 h-5" /> Descargar CSV
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-dashed border-indigo-200 hover:border-indigo-400 transition-colors text-center">
              <input
                type="file" multiple accept=".txt"
                onChange={handleFileUpload}
                className="hidden" id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-12 h-12 text-indigo-500 mb-3" />
                <span className="font-medium text-gray-600">Sube tus facturas (.txt)</span>
              </label>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-100 font-semibold border-b flex justify-between items-center">
                <span>Procesadas ({facturas.length})</span>
              </div>
              <div className="divide-y max-h-[500px] overflow-y-auto">
                {facturas.map((f, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedFactura(f)}
                    className={`p-4 cursor-pointer hover:bg-indigo-50 transition-colors ${selectedFactura === f ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}`}
                  >
                    <div className="font-bold text-gray-800">{f.cliente.nombre}</div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">{f.numero_factura}</span>
                      <span className="font-mono font-bold text-green-600 text-sm">${f.montos.total_general.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="p-4 flex justify-center text-indigo-600">
                    <Loader2 className="animate-spin w-5 h-5 mr-2" /> Procesando...
                  </div>
                )}
              </div>
            </div>
            {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</div>}
          </div>

          <div className="md:col-span-2">
            {selectedFactura ? (
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <div className="flex justify-between items-center mb-6 pb-6 border-b">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedFactura.cliente.nombre}</h2>
                    <div className="text-gray-500 flex items-center mt-1">
                      <FileText className="w-4 h-4 mr-1" /> {selectedFactura.numero_factura}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Total a Pagar</div>
                    <div className="text-3xl font-bold text-indigo-600">
                      ${selectedFactura.montos.total_general.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 uppercase">
                      <tr>
                        <th className="px-4 py-3 rounded-l-lg">Descripción</th>
                        <th className="px-4 py-3 text-center">Cant.</th>
                        <th className="px-4 py-3 text-right">Unitario</th>
                        <th className="px-4 py-3 text-right rounded-r-lg">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedFactura.items.map((item, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{item.descripcion}</td>
                          <td className="px-4 py-3 text-center">{item.cantidad}</td>
                          <td className="px-4 py-3 text-right">${item.precio_unitario.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-semibold">${item.subtotal_item.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 min-h-[400px]">
                <FileText className="w-16 h-16 mb-4 opacity-20" />
                <p>Selecciona una factura para ver el detalle</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;