'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import Navbar from '@/components/Navbar';
import { CreditCard, FileSpreadsheet, Search, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function CobranzaPage() {
  const [pagos, setPagos] = useState([]);
  const [tomas, setTomas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const [form, setForm] = useState({
    fecha_pago: new Date().toISOString().split('T')[0],
    mes_cubierto: 'Octubre',
    año_cubierto: 2026,
    monto: 150.00,
    id_toma: ''
  });

  const cargarDatos = async () => {
    try {
      const [resPagos, resTomas] = await Promise.all([
        api.getPagos(),
        api.getTomas()
      ]);
      setPagos(resPagos.data);
      setTomas(resTomas.data);
    } catch (err) {
      console.error('Error en módulo cobranza:', err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Lógica de filtrado dinámico por fecha y texto
  const pagosFiltrados = pagos.filter((p) => {
    const coincideTexto =
      (p.nombre_usuario || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.numero_contrato || '').toLowerCase().includes(busqueda.toLowerCase());

    const fechaPago = p.fecha_pago ? p.fecha_pago.split('T')[0] : '';
    const coincideFechaInicio = !fechaInicio || fechaPago >= fechaInicio;
    const coincideFechaFin = !fechaFin || fechaPago <= fechaFin;

    return coincideTexto && coincideFechaInicio && coincideFechaFin;
  });

  // Exportar histórico a Excel (.xlsx)
  const exportarExcel = () => {
    const dataExcel = pagosFiltrados.map((p) => ({
      'ID Pago': p.id_pago,
      'Fecha': p.fecha_pago ? p.fecha_pago.split('T')[0] : '',
      'Contrato': p.numero_contrato || 'N/A',
      'Nombre Vecino': p.nombre_usuario || 'S/N',
      'Periodo Cubierto': `${p.mes_cubierto} ${p.año_cubierto}`,
      'Monto ($ MXN)': parseFloat(p.monto)
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'CorteCobranza');
    XLSX.writeFile(workbook, `Reporte_Cobranza_Agua_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.registrarPago({
        ...form,
        monto: parseFloat(form.monto),
        año_cubierto: parseInt(form.año_cubierto),
        id_toma: parseInt(form.id_toma)
      });
      const nuevoPago = res.data;

      const folioUnico = `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      await api.generarRecibo({
        folio: folioUnico,
        fecha_emision: form.fecha_pago,
        monto_total: parseFloat(form.monto),
        codigo_qr: `QR-PAGO-${nuevoPago.id_pago}`,
        id_pago: parseInt(nuevoPago.id_pago)
      });

      alert('¡Pago registrado y recibo emitido exitosamente!');
      setForm({ ...form, id_toma: '' });
      cargarDatos();
    } catch (err) {
      console.error('Error al procesar la transacción:', err);
      alert('Error al procesar el pago o generar el recibo.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Caja de Cobro de Servicio</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FORMULARIO DE COBRO */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-fit">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span>Registrar Cobro</span>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Seleccionar Toma / Vecino</label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={form.id_toma}
                  onChange={(e) => setForm({ ...form, id_toma: e.target.value })}
                >
                  <option value="">Selecciona contrato...</option>
                  {tomas.map((t) => (
                    <option key={t.id_toma} value={t.id_toma}>
                      {t.numero_contrato} - {t.nombre_usuario}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mes</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                    value={form.mes_cubierto}
                    onChange={(e) => setForm({ ...form, mes_cubierto: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Año</label>
                  <input
                    type="number"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                    value={form.año_cubierto}
                    onChange={(e) => setForm({ ...form, año_cubierto: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Monto ($ MXN)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={form.monto}
                  onChange={(e) => setForm({ ...form, monto: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha</label>
                <input
                  type="date"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={form.fecha_pago}
                  onChange={(e) => setForm({ ...form, fecha_pago: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 font-medium shadow"
              >
                Cobrar e Imprimir
              </button>
            </form>
          </div>

          {/* TABLA DE HISTÓRICO CON FILTROS Y EXPORTACIÓN */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
              <h2 className="text-xl font-semibold text-gray-700">Histórico de Cobros</h2>
              <button
                onClick={exportarExcel}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs px-3 py-2 rounded-md font-medium flex items-center space-x-1 shadow"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Exportar a Excel</span>
              </button>
            </div>

            {/* CONTROLES DE FILTRADO */}
            <div className="bg-gray-50 p-3 rounded-md mb-4 border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar vecino / contrato..."
                  className="w-full pl-8 pr-2 py-1.5 border rounded text-xs"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="date"
                  className="w-full p-1.5 border rounded text-xs"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="date"
                  className="w-full p-1.5 border rounded text-xs"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vecino</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periodo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pagosFiltrados.map((p) => (
                    <tr key={p.id_pago}>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {p.fecha_pago ? p.fecha_pago.split('T')[0] : ''}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{p.nombre_usuario || 'S/N'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{p.mes_cubierto} {p.año_cubierto}</td>
                      <td className="px-4 py-3 text-sm font-bold text-green-700">${parseFloat(p.monto).toFixed(2)}</td>
                    </tr>
                  ))}
                  {pagosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                        No hay cobros registrados con los criterios seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}