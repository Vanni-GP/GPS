import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

export const api = {
  // USUARIOS
  getUsuarios: () => axios.get(`${API_URL}/usuarios`),
  createUsuario: (data) => axios.post(`${API_URL}/usuarios`, data),
  deleteUsuario: (id) => axios.delete(`${API_URL}/usuarios/${id}`),

  // TOMAS DE AGUA
  getTomas: () => axios.get(`${API_URL}/tomas`),
  createToma: (data) => axios.post(`${API_URL}/tomas`, data),

  // PAGOS Y TESORERÍA
  getPagos: () => axios.get(`${API_URL}/pagos`),
  registrarPago: (data) => axios.post(`${API_URL}/pagos`, data),

  // RECIBOS
  getRecibos: () => axios.get(`${API_URL}/recibos`),
  generarRecibo: (data) => axios.post(`${API_URL}/recibos`, data),

  // FUGAS
  getFugas: () => axios.get(`${API_URL}/fugas`),
  registrarFuga: (data) => axios.post(`${API_URL}/fugas`, data),
  actualizarEstatusFuga: (id, estatus) => 
    axios.put(`${API_URL}/fugas/${id}/estatus?nuevo_estatus=${estatus}`),
};