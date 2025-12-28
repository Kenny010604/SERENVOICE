import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { FaGoogle } from 'react-icons/fa';
import authService from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import logger from '../../utils/logger';

const GoogleLoginButton = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = useGoogleLogin({
    scope: 'openid email profile https://www.googleapis.com/auth/user.birthday.read https://www.googleapis.com/auth/user.gender.read',
    onSuccess: async (tokenResponse) => {
      try {
        logger.debug('[GOOGLE LOGIN] Token recibido de Google');
        
        // Obtener información básica del usuario
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        const userInfo = await userInfoResponse.json();
        logger.debug('[GOOGLE LOGIN] Información básica del usuario:', userInfo);

        // Obtener información extendida (fecha de nacimiento y género) usando People API
        const peopleResponse = await fetch(
          'https://people.googleapis.com/v1/people/me?personFields=birthdays,genders',
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );
        const peopleData = await peopleResponse.json();
        logger.debug('[GOOGLE LOGIN] Información extendida (People API):', peopleData);
        logger.debug('[GOOGLE LOGIN] Birthdays completo:', JSON.stringify(peopleData.birthdays, null, 2));
        logger.debug('[GOOGLE LOGIN] Genders completo:', JSON.stringify(peopleData.genders, null, 2));

        // Extraer fecha de nacimiento y género de People API
        let fechaNacimiento = null;
        let genero = null;

        // Procesar fecha de nacimiento
        if (peopleData.birthdays && peopleData.birthdays.length > 0) {
          // Buscar el cumpleaños que tenga año completo (fuente ACCOUNT)
          const birthday = peopleData.birthdays.find(b => b.date?.year) || peopleData.birthdays[0];
          if (birthday.date) {
            const { year, month, day } = birthday.date;
            if (year && month && day) {
              // Formato: YYYY-MM-DD
              fechaNacimiento = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              logger.debug('[GOOGLE LOGIN] Fecha de nacimiento extraída:', fechaNacimiento);
            } else {
              logger.debug('[GOOGLE LOGIN] Fecha sin año completo, se ignorará:', birthday.date);
            }
          }
        }

        // Procesar género
        if (peopleData.genders && peopleData.genders.length > 0) {
          const gender = peopleData.genders.find(g => g.metadata?.primary) || peopleData.genders[0];
          if (gender.value) {
            // Google devuelve: male, female, other, unknown
            const genderMap = {
              'male': 'M',
              'female': 'F',
              'other': 'O',
              'unknown': null
            };
            genero = genderMap[gender.value.toLowerCase()] || null;
            logger.debug('[GOOGLE LOGIN] Género extraído:', genero, '(original:', gender.value, ')');
          }
        }

        // Preparar datos para enviar al backend
        const googleData = {
          google_uid: userInfo.sub,
          correo: userInfo.email,
          nombre: userInfo.given_name || userInfo.name || '',
          apellido: userInfo.family_name || '',
          foto_perfil: userInfo.picture || '',
          fecha_nacimiento: fechaNacimiento,
          genero: genero
        };

        logger.debug('[GOOGLE LOGIN] Enviando al backend:', googleData);

        // Enviar al backend
        const data = await authService.googleAuth(googleData);

        // Extraer roles del backend
        const userRoles = data.user.roles || ['usuario'];
        const role = userRoles[0].toLowerCase();

        // Verificar si el usuario necesita completar su perfil
        if (!data.user.edad || !data.user.genero) {
          logger.debug('[GOOGLE LOGIN] Usuario necesita completar perfil');
          // Redirigir a completar perfil si falta información básica
          navigate('/actualizar-perfil', { 
            state: { 
              message: 'Por favor completa tu perfil para continuar',
              fromGoogle: true 
            } 
          });
          return;
        }

        // Redirigir según el rol si el perfil está completo
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        logger.error('[GOOGLE LOGIN] Error:', error);
        alert('Error al iniciar sesión con Google: ' + error.message);
      }
    },
    onError: () => {
      logger.error('[GOOGLE LOGIN] Error en autenticación de Google');
      alert('Error al conectar con Google. Por favor intenta de nuevo.');
    },
  });

  return (
    <button
      type="button"
      className="google-button"
      onClick={() => handleGoogleLogin()}
    >
      <FaGoogle className="google-icon" />
      Continuar con Google
    </button>
  );
};

export default GoogleLoginButton;
