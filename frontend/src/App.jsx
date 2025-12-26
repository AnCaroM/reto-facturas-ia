import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

function App() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [error, setError] = useState('');

  // Detectar URL: Si estamos en Docker usa el nombre del servicio, si no, localhost
  const apiUrl = import.meta.env.VITE_API_URL || 'https://ys4lryv53qrop5qj7ewtzcgng40twztf.lambda-url.us-east-1.on.aws/';

  const downloadCSV = () => {
    if (facturas.length === 0) return;
    const rows = [];
    const headers = ["Archivo", "Nro_Factura", "Fecha", "Cliente", "NIT", "Item_Desc", "Cantidad", "Precio_Unit", "Subtotal_Item", "Total_Factura"];
    rows.push(headers.join(","));
    facturas.forEach(f => {
      f.items.forEach(item => {
        const row = [f.nombreArchivo, f.numero_factura, f.fecha_emision, `"${f.cliente.nombre}"`, f.cliente.identificacion, `"${item.descripcion}"`, item.cantidad, item.precio_unitario, item.subtotal_item, f.montos.total_general];
        rows.push(row.join(","));
      });
    });
    const blob = new Blob([rows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reporte_facturas.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setLoading(true);
    setError('');

    for (const file of files) {
      try {
        const textContent = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsText(file);
        });

        // Intentamos enviar a la API
        const response = await axios.post(apiUrl,
          { body: textContent },
          { headers: { 'Content-Type': 'application/json' } }
        );

        setFacturas(prev => [...prev, { ...response.data, nombreArchivo: file.name }]);
      } catch (err) {
        console.error(err);
        setError(`Error al procesar ${file.name}. Asegúrate de que el Backend esté corriendo.`);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <FileText className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Facturas AI</h1>
              <p className="text-sm text-slate-500">Sistema de extracción inteligente</p>
            </div>
          </div>

          {facturas.length > 0 && (
            <button onClick={downloadCSV} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg">
              <Download className="w-4 h-4" /> Exportar CSV
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Sidebar / Upload Area */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border-2 border-dashed border-emerald-100 hover:border-emerald-300 transition-all text-center group">
              <input type="file" multiple accept=".txt" onChange={handleFileUpload} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <div className="bg-emerald-50 group-hover:bg-emerald-100 p-4 rounded-full transition-colors mb-4">
                  <Upload className="w-8 h-8 text-emerald-600" />
                </div>
                <span className="font-semibold text-slate-700">Subir Facturas (.txt)</span>
                <span className="text-sm text-slate-400 mt-1">Arrastra o haz clic aquí</span>
              </label>
            </div>

            {/* Lista de Procesados */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-600 text-sm uppercase tracking-wide flex justify-between">
                <span>Historial</span>
                <span className="bg-slate-200 text-slate-600 px-2 rounded-md text-xs py-0.5">{facturas.length}</span>
              </div>
              <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
                {facturas.map((f, idx) => (
                  <div key={idx} onClick={() => setSelectedFactura(f)}
                    className={`p-4 cursor-pointer transition-all hover:bg-slate-50 ${selectedFactura === f ? 'bg-emerald-50/60 border-l-4 border-emerald-500' : 'border-l-4 border-transparent'}`}
                  >
                    <div className="font-bold text-slate-800 text-sm mb-1">{f.cliente.nombre}</div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{f.numero_factura}</span>
                      <span className="font-mono font-bold text-emerald-600 text-sm">${f.montos.total_general.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="p-6 flex flex-col items-center justify-center text-emerald-600 bg-slate-50/50">
                    <Loader2 className="animate-spin w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">Analizando documentos...</span>
                  </div>
                )}
                {facturas.length === 0 && !loading && (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    No hay facturas procesadas aún.
                  </div>
                )}
              </div>
            </div>
            {error && (
              <div className="flex items-start gap-3 bg-red-50 p-4 rounded-xl border border-red-100 text-red-600 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Main Viewer */}
          <div className="lg:col-span-8">
            {selectedFactura ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Factura Header */}
                <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{selectedFactura.cliente.nombre}</h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {selectedFactura.numero_factura}</span>
                      <span>•</span>
                      <span>{selectedFactura.fecha_emision}</span>
                    </div>
                  </div>
                  <div className="text-right bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Total a Pagar</div>
                    <div className="text-3xl font-bold text-emerald-600 tracking-tight">
                      ${selectedFactura.montos.total_general.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Tabla de Items */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider font-semibold border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Descripción</th>
                        <th className="px-6 py-4 text-center">Cant.</th>
                        <th className="px-6 py-4 text-right">Precio Unit.</th>
                        <th className="px-6 py-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selectedFactura.items.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-700">{item.descripcion}</td>
                          <td className="px-6 py-4 text-center text-slate-500">{item.cantidad}</td>
                          <td className="px-6 py-4 text-right text-slate-500">${item.precio_unitario.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right font-bold text-slate-700">${item.subtotal_item.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50/50 border-t border-slate-100">
                      <tr>
                        <td colSpan="3" className="px-6 py-3 text-right text-slate-500">Subtotal</td>
                        <td className="px-6 py-3 text-right text-slate-700 font-medium">${selectedFactura.montos.subtotal.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="px-6 py-3 text-right text-slate-500">Impuestos</td>
                        <td className="px-6 py-3 text-right text-slate-700 font-medium">${selectedFactura.montos.impuestos.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/30 min-h-[500px]">
                <CheckCircle className="w-20 h-20 mb-4 opacity-20" />
                <p className="font-medium">Selecciona una factura para ver el detalle</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;