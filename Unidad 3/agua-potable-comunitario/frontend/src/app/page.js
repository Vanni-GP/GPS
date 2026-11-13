'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import Navbar from '@/components/Navbar';
import { UserPlus, Trash2, Users, Droplet, DollarSign, AlertTriangle, Search } from 'lucide-react';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [tomas, setTomas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [fugas, setFugas] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    direccion_barrio: '',
    manzana: ''
  });

  const cargarDatos = async () => {
    try {
      const [resUsers, resTomas, resPagos, resFugas] = await Promise.all([
        api.getUsuarios(),
        api.getTomas(),
        api.getPagos(),
        api.getFugas()
      ]);
      setUsuarios(resUsers.data);
      setTomas(resTomas.data);
      setPagos(resPagos.data);
      setFugas(resFugas.data);
    } catch (err) {
      console.error('Error cargando métricas e información:', err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Métricas calculadas dinámicamente
  const totalUsuarios = usuarios.length;
  const tomasActivas = tomas.filter(t => t.estado_servicio === 'Activa').length;
  const tomasSuspendidas = tomas.filter(t => t.estado_servicio === 'Suspendida').length;
  
  const mesActual = new Date().getMonth();
  const añoActual = new Date().getFullYear();
  const recaudadoMes = pagos
    .filter(p => {
      const fecha = new Date(p.fecha_pago);
      return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
    })
    .reduce((sum, p) => sum + parseFloat(p.monto || 0), 0);

  const fugasPendientes = fugas.filter(f => f.estatus !== 'Atendido').length;

  // Filtro de búsqueda
  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.direccion_barrio.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createUsuario(form);
      setForm({ nombre: '', telefono: '', direccion_barrio: '', manzana: '' });
      cargarDatos();
    } catch (err) {
      alert('Error al registrar usuario');
    }
  };

  const handleEliminar = async (id) => {
    if (confirm('¿Deseas eliminar este usuario?')) {
      try {
        await api.deleteUsuario(id);
        cargarDatos();
      } catch (err) {
        alert('No se puede eliminar: el usuario tiene tomas de agua asignadas');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* TARJETAS DE MÉTRICAS GENERALES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-lg shadow border-l-4 border-blue-600 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">Vecinos Registrados</p>
              <h3 className="text-2xl font-black text-gray-800">{totalUsuarios}</h3>
            </div>
            <Users className="h-8 w-8 text-blue-500 opacity-80" />
          </div>

          <div className="bg-white p-5 rounded-lg shadow border-l-4 border-cyan-500 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">Tomas de Agua</p>
              <h3 className="text-xl font-bold text-gray-800">
                <span className="text-green-600">{tomasActivas} Activas</span> / <span className="text-red-500">{tomasSuspendidas} Susp.</span>
              </h3>
            </div>
            <Droplet className="h-8 w-8 text-cyan-500 opacity-80" />
          </div>

          <div className="bg-white p-5 rounded-lg shadow border-l-4 border-green-600 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">Recaudado este Mes</p>
              <h3 className="text-2xl font-black text-green-700">${recaudadoMes.toFixed(2)}</h3>
            </div>
            <DollarSign className="h-8 w-8 text-green-600 opacity-80" />
          </div>

          <div className="bg-white p-5 rounded-lg shadow border-l-4 border-amber-500 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">Fugas Por Atender</p>
              <h3 className="text-2xl font-black text-amber-600">{fugasPendientes}</h3>
            </div>
            <AlertTriangle className="h-8 w-8 text-amber-500 opacity-80" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FORMULARIO DE ALTA */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-fit">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              <span>Nuevo Registro</span>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Barrio / Sector</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={form.direccion_barrio}
                  onChange={(e) => setForm({ ...form, direccion_barrio: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Manzana</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={form.manzana}
                  onChange={(e) => setForm({ ...form, manzana: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium shadow"
              >
                Guardar Vecino
              </button>
            </form>
          </div>

          {/* TABLA DE VECINOS CON BUSCADOR */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <h2 className="text-xl font-semibold text-gray-700">Padrón de Vecinos</h2>
              <div className="relative w-full sm:w-64">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o barrio..."
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barrio / Manzana</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usuariosFiltrados.map((u) => (
                    <tr key={u.id_usuario}>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{u.id_usuario}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{u.nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{u.direccion_barrio} - {u.manzana}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{u.telefono || 'Sin registro'}</td>
                      <td className="px-4 py-3 text-sm text-center">
                        <button
                          onClick={() => handleEliminar(u.id_usuario)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-5 w-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {usuariosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                        No se encontraron vecinos registrados.
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