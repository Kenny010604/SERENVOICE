import apiClient from './apiClient';

export const contactService = {
  async sendMessage(contactData) {
    try {
      const response = await apiClient.post('/api/contacto', contactData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al enviar mensaje' };
    }
  }
};

export default contactService;