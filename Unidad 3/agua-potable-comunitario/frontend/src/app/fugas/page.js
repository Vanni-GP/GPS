'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import Navbar from '@/components/Navbar';
import { AlertTriangle } from 'lucide-react';

export default function FugasPage() {
  const [fugas, setFugas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({
    ubicacion: '',
    descripcion: '',
    fecha_reporte: new Date().toISOString().split('T')[0],
    estatus: 'Pendiente',
    id_usuario: ''
  });

  const cargarDatos = async () => {
    try {
      const [resFugas, resUsuarios] = await Promise.all([
        api.getFugas(),
        api.getUsuarios()
      ]);
      setFugas(resFugas.data);
      setUsuarios(resUsuarios.data);
    } catch (err) {
      console.error('Error en módulo fugas:', err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.registrarFuga(form);
      setForm({
        ubicacion: '',
        descripcion: '',
        fecha_reporte: new Date().toISOString().split('T')[0],
        estatus: 'Pendiente',
        id_usuario: ''
      });
      cargarDatos();
    } catch (err) {
      alert('Error al reportar fuga');
    }
  };

  const handleCambiarEstatus = async (id, estatus) => {
    try {
      await api.actualizarEstatusFuga(id, estatus);
      cargarDatos();
    } catch (err) {
      alert('Error al cambiar estatus');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar/>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Control de Incidencias y Fugas</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-fit">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-500"/>
              <span>Reportar Incidencia</span>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Ubicación de la Fuga</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Calle Principal frente al pozo"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={form.ubicacion}
                  onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción del Problema</label>
                <textarea
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  rows="3"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reportado Por</label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={form.id_usuario}
                  onChange={(e) => setForm({ ...form, id_usuario: e.target.value })}
                >
                  <option value="">Selecciona vecino...</option>
                  {usuarios.map((u) => (
                    <option key={u.id_usuario} value={u.id_usuario}>
                      {u.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 font-medium shadow"
              >
                Levantar Reporte
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Fugas en Atención</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ubicación</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estatus</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acción</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fugas.map((f) => (
                    <tr key={f.id_reporte}>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{f.ubicacion}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{f.descripcion}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          f.estatus === 'Atendido' ? 'bg-green-100 text-green-800' :
                          f.estatus === 'En Reparación' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {f.estatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <select
                          className="text-xs border rounded p-1"
                          value={f.estatus}
                          onChange={(e) => handleCambiarEstatus(f.id_reporte, e.target.value)}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="En Reparación">En Reparación</option>
                          <option value="Atendido">Atendido</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {fugas.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                        No hay reportes de fugas activos.
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