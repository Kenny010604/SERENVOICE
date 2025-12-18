// proyectofinal-frontend/src/services/notificacionesService.js
import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:5000/api/notificaciones';

class NotificacionesService {
  async getNotificaciones(limit = 50, onlyUnread = false) {
    try {
      const token = authService.getToken();
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit, only_unread: onlyUnread }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      throw error;
    }
  }

  async getUnreadCount() {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data?.data?.count || 0;
    } catch (error) {
      console.error('Error al obtener contador:', error);
      return 0;
    }
  }

  async markAsRead(idNotificacion) {
    try {
      const token = authService.getToken();
      const response = await axios.put(
        `${API_URL}/${idNotificacion}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error al marcar como leída:', error);
      throw error;
    }
  }

  async markAllAsRead() {
    try {
      const token = authService.getToken();
      const response = await axios.put(
        `${API_URL}/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
      throw error;
    }
  }

  async archiveNotificacion(idNotificacion) {
    try {
      const token = authService.getToken();
      const response = await axios.put(
        `${API_URL}/${idNotificacion}/archive`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error al archivar:', error);
      throw error;
    }
  }

  async deleteNotificacion(idNotificacion) {
    try {
      const token = authService.getToken();
      const response = await axios.delete(`${API_URL}/${idNotificacion}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error al eliminar:', error);
      throw error;
    }
  }

  async getUrgentNotifications() {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/urgent`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener urgentes:', error);
      throw error;
    }
  }

  async getPreferences() {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/preferences`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener preferencias:', error);
      throw error;
    }
  }

  async updatePreferences(preferences) {
    try {
      const token = authService.getToken();
      const response = await axios.put(
        `${API_URL}/preferences`,
        preferences,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error al actualizar preferencias:', error);
      throw error;
    }
  }

  async pauseNotifications(horas = null) {
    try {
      const token = authService.getToken();
      const response = await axios.post(
        `${API_URL}/pause`,
        { horas },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error al pausar notificaciones:', error);
      throw error;
    }
  }

  async resumeNotifications() {
    try {
      const token = authService.getToken();
      const response = await axios.post(
        `${API_URL}/resume`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error al reanudar notificaciones:', error);
      throw error;
    }
  }
}

export default new NotificacionesService();
