// src/utils/validators.js
// Funciones de validación para formularios

export const validators = {
  // Validar email
  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  // Validar que solo contenga letras y espacios
  isValidName(name) {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    return regex.test(name);
  },

  // Validar contraseña (mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número)
  isValidPassword(password) {
    if (password.length < 8) {
      return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'La contraseña debe tener al menos una mayúscula' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'La contraseña debe tener al menos una minúscula' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'La contraseña debe tener al menos un número' };
    }
    return { valid: true, message: '' };
  },

  // Calcular edad
  calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  },

  // Validar edad (13-65 años)
  isValidAge(birthDate) {
    const age = this.calculateAge(birthDate);
    if (age < 13) {
      return { valid: false, message: 'Debes tener al menos 13 años para registrarte' };
    }
    if (age > 65) {
      return { valid: false, message: 'El registro está limitado a personas de hasta 65 años' };
    }
    return { valid: true, message: '' };
  },

  // Sanitizar texto (remover caracteres peligrosos)
  sanitizeText(text) {
    if (!text) return '';
    return text
      .replace(/[<>]/g, '')
      .trim();
  },

  // Sanitizar email
  sanitizeEmail(email) {
    if (!email) return '';
    return email.toLowerCase().trim();
  },
};

export default validators;
