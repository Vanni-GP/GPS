'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import Navbar from '@/components/Navbar';
import { Droplet } from 'lucide-react';

export default function TomasPage() {
  const [tomas, setTomas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({
    numero_contrato: '',
    tipo_toma: 'Doméstica',
    estado_servicio: 'Activa',
    id_usuario: ''
  });

  const cargarDatos = async () => {
    try {
      const [resTomas, resUsuarios] = await Promise.all([
        api.getTomas(),
        api.getUsuarios()
      ]);
      setTomas(resTomas.data);
      setUsuarios(resUsuarios.data);
    } catch (err) {
      console.error('Error al cargar datos de tomas:', err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createToma(form);
      setForm({ numero_contrato: '', tipo_toma: 'Doméstica', estado_servicio: 'Activa', id_usuario: '' });
      cargarDatos();
    } catch (err) {
      alert('Error al registrar la toma de agua');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar/>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Registro de Tomas de Agua</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-fit">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center space-x-2">
              <Droplet className="h-5 w-5 text-blue-600"/>
              <span>Nueva Toma</span>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Número de Contrato</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. CNT-2026-001"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={form.numero_contrato}
                  onChange={(e) => setForm({ ...form, numero_contrato: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Toma</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={form.tipo_toma}
                  onChange={(e) => setForm({ ...form, tipo_toma: e.target.value })}
                >
                  <option value="Doméstica">Doméstica</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Especial">Especial / Escuela</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado del Servicio</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={form.estado_servicio}
                  onChange={(e) => setForm({ ...form, estado_servicio: e.target.value })}
                >
                  <option value="Activa">Activa</option>
                  <option value="Suspendida">Suspendida</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Titular de la Toma</label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={form.id_usuario}
                  onChange={(e) => setForm({ ...form, id_usuario: e.target.value })}
                >
                  <option value="">Selecciona un vecino...</option>
                  {usuarios.map((u) => (
                    <option key={u.id_usuario} value={u.id_usuario}>
                      {u.nombre} ({u.direccion_barrio})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium shadow"
              >
                Asignar Toma
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Tomas Instaladas</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contrato</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titular</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tomas.map((t) => (
                    <tr key={t.id_toma}>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{t.numero_contrato}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{t.tipo_toma}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          t.estado_servicio === 'Activa' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {t.estado_servicio}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">{t.nombre_usuario || t.id_usuario}</td>
                    </tr>
                  ))}
                  {tomas.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                        No hay tomas instaladas registradas.
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