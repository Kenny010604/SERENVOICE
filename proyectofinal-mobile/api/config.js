import axios from 'axios';

// ⚠️ Reemplaza con tu IP local (no pongas "localhost")
const API = axios.create({
  baseURL: 'http:// 192.168.56.1:5000' // ← ejemplo: cambia por tu IP real
});

export default API;
