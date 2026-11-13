'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import Navbar from '@/components/Navbar';
import { FileText, QrCode, Printer, X, User } from 'lucide-react';

export default function RecibosPage() {
  const [recibos, setRecibos] = useState([]);
  const [reciboSeleccionado, setReciboSeleccionado] = useState(null);

  useEffect(() => {
    api.getRecibos().then(res => setRecibos(res.data)).catch(console.error);
  }, []);

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Ocultar Navbar al imprimir */}
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 print:p-0 print:max-w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 print:hidden">Recibos Digitales Emitidos</h1>

        {/* TABLA DE RECIBOS */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 print:hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Folio</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titular / Vecino</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Emisión</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verificación QR</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acción</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recibos.map((r) => (
                  <tr key={r.folio}>
                    <td className="px-4 py-3 text-sm font-mono font-bold text-blue-600">{r.folio}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 flex items-center space-x-1">
                      <User className="h-4 w-4 text-gray-500 inline" />
                      <span>{r.nombre_usuario || 'S/N'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.fecha_emision}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">${parseFloat(r.monto_total).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 flex items-center space-x-1">
                      <QrCode className="h-4 w-4 text-gray-700" />
                      <span className="font-mono text-xs">{r.codigo_qr}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <button
                        onClick={() => setReciboSeleccionado(r)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded flex items-center justify-center space-x-1 mx-auto"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>Ver Recibo</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {recibos.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                      No hay recibos generados aún.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL Y PLANTILLA IMPRESA DEL RECIBO */}
        {reciboSeleccionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 print:static print:bg-white print:p-0">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 border border-gray-200 print:shadow-none print:border-none print:max-w-full print:p-0">
              
              {/* Botones de control (Se ocultan al imprimir) */}
              <div className="flex justify-between items-center mb-6 print:hidden">
                <h3 className="text-lg font-bold text-gray-800">Comprobante Oficial de Pago</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handleImprimir}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center space-x-1 shadow"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Imprimir / Guardar PDF</span>
                  </button>
                  <button
                    onClick={() => setReciboSeleccionado(null)}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* FORMATO IMPRESO DEL RECIBO CON DATOS DEL USUARIO */}
              <div className="border-2 border-blue-900 p-6 rounded-md bg-slate-50 print:bg-white print:border-black">
                <div className="text-center border-b pb-4 mb-4 border-gray-300">
                  <h2 className="text-xl font-bold text-blue-900 uppercase tracking-wide print:text-black">
                    SISTEMA DE AGUA POTABLE EJIDAL
                  </h2>
                  <p className="text-xs text-gray-600">Comité de Administración de Agua Potable Comunitario</p>
                  <p className="text-xs text-gray-500">Comprobante Oficial de Pago</p>
                </div>

                {/* FOLIO Y FECHA */}
                <div className="grid grid-cols-2 text-sm mb-4 gap-2">
                  <div>
                    <span className="text-gray-500 block text-xs">FOLIO RECIBO:</span>
                    <span className="font-mono font-bold text-gray-800">{reciboSeleccionado.folio}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 block text-xs">FECHA DE EMISIÓN:</span>
                    <span className="font-semibold text-gray-800">{reciboSeleccionado.fecha_emision}</span>
                  </div>
                </div>

                {/* DATOS DEL TITULAR Y TOMA DE AGUA */}
                <div className="bg-white p-3 rounded border mb-4 text-sm space-y-1 print:border-gray-300">
                  <p className="text-xs font-bold text-gray-500 uppercase">Datos del Suscriptor</p>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre del Titular:</span>
                    <span className="font-bold text-gray-900">{reciboSeleccionado.nombre_usuario || 'No especificado'}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Contrato No:</span>
                    <span className="font-mono font-semibold">{reciboSeleccionado.numero_contrato || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Ubicación / Sector:</span>
                    <span>{reciboSeleccionado.direccion_barrio || 'S/D'}</span>
                  </div>
                </div>

                {/* DETALLE DEL PAGO */}
                <div className="border-t border-b py-3 my-2 border-gray-200 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID de Transacción:</span>
                    <span className="font-semibold">PAGO-{reciboSeleccionado.id_pago}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado de Liquidación:</span>
                    <span className="text-green-700 font-bold uppercase">PAGADO / CUBIERTO</span>
                  </div>
                  <div className="flex justify-between text-base pt-2 border-t font-bold text-gray-900">
                    <span>MONTO TOTAL RECIBIDO:</span>
                    <span>${parseFloat(reciboSeleccionado.monto_total).toFixed(2)} MXN</span>
                  </div>
                </div>

                {/* PIE Y VALIDACIÓN */}
                <div className="mt-6 flex justify-between items-center pt-2">
                  <div className="text-center border-t border-gray-400 pt-1 w-32">
                    <p className="text-[10px] text-gray-500">Firma del Tesorero</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-white border p-1 rounded inline-block font-mono text-[10px] text-gray-700">
                      [{reciboSeleccionado.codigo_qr}]
                    </div>
                    <p className="text-[9px] text-gray-400 mt-1">Sello Digital de Validación</p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}