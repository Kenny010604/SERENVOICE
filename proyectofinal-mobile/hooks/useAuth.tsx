import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../constants';
import { useRouter } from 'expo-router';

// ============================================
// 📝 TIPOS
// ============================================
export interface UserData {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  genero?: string;
  fecha_nacimiento?: string;
  edad?: number;
  usa_medicamentos?: boolean;
  auth_provider?: string;
  foto_perfil?: string;
  notificaciones?: boolean;
  roles?: string[];
}

export interface RegisterData {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  genero?: string;
  fechaNacimiento?: string;
  usa_medicamentos?: boolean;
  foto_perfil?: File | null;
}

export interface LoginData {
  correo: string;
  contrasena: string;
}

export interface UpdateProfileData {
  nombre?: string;
  apellido?: string;
  correo?: string;
  genero?: string;
  fecha_nacimiento?: string;
  usa_medicamentos?: boolean;
  notificaciones?: boolean;
  contraseñaActual?: string;
  contraseñaNueva?: string;
  confirmarContraseña?: string;
  foto_perfil?: any;
  remover_foto?: boolean;
  edad?: number;
}

export interface GoogleAuthData {
  google_uid: string;
  email: string;
  nombre?: string;
  apellido?: string;
  foto_perfil?: string;
  fecha_nacimiento?: string;
  genero?: string;
}

// ============================================
// 🎣 HOOK useAuth
// ============================================
export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);

  // ✅ Cargar usuario al iniciar
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🔄 Iniciando Auth...');
        
        const userStr = await AsyncStorage.getItem('user');
        console.log('📦 User en AsyncStorage:', userStr ? 'Encontrado ✅' : 'No encontrado ❌');
        
        // ✅ Validar que no sea "undefined" como string
        if (userStr && userStr !== 'undefined' && userStr !== 'null') {
          try {
            const userData = JSON.parse(userStr);
            console.log('👤 Usuario cargado desde AsyncStorage:', userData);
            setUser(userData);
            console.log('✅ Usuario establecido en estado');
          } catch (parseError) {
            console.error('❌ Error parseando usuario, limpiando storage:', parseError);
            // Limpiar storage corrupto
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('token');
          }
        } else {
          console.log('ℹ️ No hay usuario guardado o está corrupto');
          // Limpiar si está corrupto
          if (userStr === 'undefined' || userStr === 'null') {
            await AsyncStorage.removeItem('user');
          }
        }
      } catch (err) {
        console.error('❌ Error cargando usuario:', err);
      } finally {
        setLoading(false);
        console.log('✅ Auth inicializado');
      }
    };

    initAuth();
  }, []);

  // ==========================================
  // 🔵 REGISTRO
  // ==========================================
  const register = async (
    userData: RegisterData | FormData,
    isMultipart?: boolean
  ): Promise<{ success: boolean; requiresVerification?: boolean }> => {
    try {
      setLoading(true);
      setError(null);

      console.log('📝 Registrando usuario:', userData);

      let response;
      if (isMultipart) {
        response = await fetch(`${Config.API_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            // No se debe poner Content-Type, fetch lo pone automáticamente para FormData
          },
          body: userData as FormData,
        });
      } else {
        response = await fetch(`${Config.API_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
      }

      const result = await response.json();
      console.log('📥 Respuesta registro:', result);

      if (!response.ok || !result.success) {
        const mensajeError = result.error || 'Error en el registro';
        console.error('❌ Registro fallido:', mensajeError);
        setError(mensajeError);
        return { success: false };
      }

      console.log('✅ Registro exitoso');

      if (result.user) {
        await AsyncStorage.setItem('user', JSON.stringify(result.user));
        setUser(result.user);
        console.log('👤 Usuario guardado tras registro');
      }

      return {
        success: true,
        requiresVerification: result.requiresVerification,
      };

    } catch (error: any) {
      console.error('❌ Error en register:', error);
      setError(error.message || 'Error inesperado');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 🟩 LOGIN
  // ==========================================
  const login = async (data: LoginData): Promise<{ success: boolean; requiresVerification?: boolean }> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔐 Iniciando sesión con:', data.correo);

      const response = await fetch(`${Config.API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('📊 Status respuesta login:', response.status);

      const result = await response.json();
      console.log('📥 Respuesta login completa:', result);

      if (!response.ok || !result.success) {
        setError(result.error || 'Error al iniciar sesión');
        return { 
          success: false, 
          requiresVerification: result.requiresVerification 
        };
      }

      if (!result.token) {
        console.error('❌ El backend no devolvió un token');
        setError('Error: No se recibió token de autenticación');
        return { success: false };
      }

      console.log('🔑 Token recibido:', result.token.substring(0, 50) + '...');
      console.log('👤 Usuario recibido:', result.user);

      await AsyncStorage.setItem('token', result.token);
      await AsyncStorage.setItem('user', JSON.stringify(result.user));
      
      setUser(result.user);
      console.log('✅ Login exitoso, token y usuario guardados');

      const tokenGuardado = await AsyncStorage.getItem('token');
      console.log('🔍 Verificación - Token guardado:', tokenGuardado ? 'SÍ ✅' : 'NO ❌');

      return { success: true };

    } catch (err: any) {
      console.error('❌ Error en login:', err);
      setError(err.message || 'Error inesperado');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 🟢 GOOGLE AUTH
  // ==========================================
  const googleAuth = async (data: GoogleAuthData): Promise<{ success: boolean }> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔵 Google Auth - Enviando:', data);

      const response = await fetch(`${Config.API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('📥 Google Auth - Respuesta:', result);

      if (!response.ok || !result.success) {
        setError(result.error || 'Error en autenticación con Google');
        return { success: false };
      }

      await AsyncStorage.setItem('token', result.token);
      await AsyncStorage.setItem('user', JSON.stringify(result.user));
      
      setUser(result.user);
      console.log('✅ Google Auth exitoso');

      return { success: true };

    } catch (err: any) {
      console.error('❌ Error en googleAuth:', err);
      setError(err.message || 'Error inesperado');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 🔵 VERIFICAR TOKEN
  // ==========================================
  const verifyToken = async (): Promise<{ success: boolean; user?: UserData }> => {
    try {
      setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem('token');
      console.log('🔑 Token encontrado:', token ? 'Sí ✅' : 'No ❌');
      
      if (!token) {
        console.log('❌ No hay token guardado');
        return { success: false };
      }

      const url = `${Config.API_URL}/api/auth/verify`;
      console.log('📡 Verificando token en:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📥 Status respuesta verify:', response.status);

      const text = await response.text();
      console.log('📄 Respuesta raw:', text.substring(0, 200));

      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('❌ Error parseando JSON:', parseError);
        console.error('Texto recibido:', text);
        await logout();
        return { success: false };
      }

      console.log('📦 Datos parseados:', result);

      if (!response.ok || !result.success) {
        console.log('❌ Token inválido o expirado');
        await logout();
        return { success: false };
      }

      console.log('✅ Usuario verificado:', result.user);
      
      setUser(result.user);
      await AsyncStorage.setItem('user', JSON.stringify(result.user));

      return { success: true, user: result.user };

    } catch (err: any) {
      console.error('❌ Error en verifyToken:', err);
      console.error('Stack:', err.stack);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 🟠 ACTUALIZAR PERFIL - CORREGIDO ✅
  // ==========================================
  const updateProfile = async (data: UpdateProfileData): Promise<{ success: boolean; user?: UserData }> => {
    try {
      setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        setError('No autenticado');
        return { success: false };
      }

      console.log('📤 Actualizando perfil con datos:', data);

      // ✅ Crear FormData correctamente
      const formData = new FormData();
      
      if (data.nombre) formData.append('nombre', data.nombre);
      if (data.apellido) formData.append('apellido', data.apellido);
      if (data.correo) formData.append('correo', data.correo);
      if (data.genero) formData.append('genero', data.genero);
      if (data.fecha_nacimiento) {
        formData.append('fecha_nacimiento', data.fecha_nacimiento);
      }
      if (data.edad !== undefined) {
        formData.append('edad', data.edad.toString());
      }
      if (data.usa_medicamentos !== undefined) {
        formData.append('usa_medicamentos', data.usa_medicamentos.toString());
      }
      if (data.notificaciones !== undefined) {
        formData.append('notificaciones', data.notificaciones.toString());
      }
      
      // ✅ Contraseñas (solo si no es usuario de Google)
      if (data.contraseñaNueva && data.contraseñaActual) {
        formData.append('contraseñaActual', data.contraseñaActual);
        formData.append('contraseñaNueva', data.contraseñaNueva);
        if (data.confirmarContraseña) {
          formData.append('confirmarContraseña', data.confirmarContraseña);
        }
      }
      
      // ✅ Foto de perfil
      if (data.foto_perfil) {
        formData.append('foto_perfil', data.foto_perfil);
      }
      if (data.remover_foto) {
        formData.append('remover_foto', 'true');
      }

      console.log('📡 Enviando a: /api/usuarios/perfil');

      // ✅ Usar el endpoint correcto: /api/usuarios/perfil
      const response = await fetch(`${Config.API_URL}/api/usuarios/perfil`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // NO incluir Content-Type con FormData, React Native lo maneja automáticamente
        },
        body: formData,
      });

      console.log('📥 Status respuesta:', response.status);

      const result = await response.json();
      console.log('📦 Respuesta completa:', result);

      if (!response.ok || !result.success) {
        const errorMsg = result.error || 'Error al actualizar perfil';
        console.error('❌ Error:', errorMsg);
        setError(errorMsg);
        return { success: false };
      }

      // ✅ Actualizar usuario en storage y estado
      const updatedUser = result.usuario || result.user;
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      console.log('✅ Perfil actualizado correctamente');

      return { success: true, user: updatedUser };

    } catch (err: any) {
      console.error('❌ Error en updateProfile:', err);
      setError(err.message || 'Error inesperado');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 📧 REENVIAR VERIFICACIÓN
  // ==========================================
  const resendVerification = async (): Promise<{ success: boolean }> => {
    try {
      setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        setError('No autenticado');
        return { success: false };
      }

      const response = await fetch(`${Config.API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || 'Error al reenviar verificación');
        return { success: false };
      }

      return { success: true };

    } catch (err: any) {
      console.error('Error en resendVerification:', err);
      setError(err.message || 'Error inesperado');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 🔑 OLVIDÉ MI CONTRASEÑA
  // ==========================================
  const forgotPassword = async (correo: string): Promise<{ success: boolean }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${Config.API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || 'Error al solicitar recuperación');
        return { success: false };
      }

      return { success: true };

    } catch (err: any) {
      console.error('Error en forgotPassword:', err);
      setError(err.message || 'Error inesperado');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 🔑 RESTABLECER CONTRASEÑA
  // ==========================================
  const resetPassword = async (token: string, nueva_contrasena: string): Promise<{ success: boolean }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${Config.API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, nueva_contrasena }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || 'Error al restablecer contraseña');
        return { success: false };
      }

      return { success: true };

    } catch (err: any) {
      console.error('Error en resetPassword:', err);
      setError(err.message || 'Error inesperado');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 🚪 LOGOUT
  // ==========================================
  const logout = async () => {
    try {
      console.log('🚪 Cerrando sesión...');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
      setError(null);
      router.replace('/(auth)/PaginasPublicas/login');
      console.log('✅ Sesión cerrada');
    } catch (err) {
      console.error('Error en logout:', err);
    }
  };

  // ==========================================
  // 📱 OBTENER USUARIO ACTUAL
  // ==========================================
  const getCurrentUser = async (): Promise<UserData | null> => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        return userData;
      }
      return null;
    } catch (err) {
      console.error('Error obteniendo usuario:', err);
      return null;
    }
  };

  // ==========================================
  // 🔄 REFRESCAR USUARIO DESDE BACKEND
  // ==========================================
  const refreshUser = async (): Promise<{ success: boolean; user?: UserData }> => {
    try {
      console.log('[REFRESH] 🔄 Iniciando refresh de usuario...');
      setLoading(true);
      
      const token = await AsyncStorage.getItem('token');
      console.log('[REFRESH] 🔑 Token:', token ? `${token.substring(0, 20)}...` : 'NO HAY TOKEN');
      
      if (!token) {
        console.error('[REFRESH] ❌ No hay token');
        return { success: false };
      }

      const url = `${Config.API_URL}/api/usuarios/perfil`;
      console.log('[REFRESH] 📡 Petición a:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('[REFRESH] 📥 Status:', response.status);
      console.log('[REFRESH] 📥 OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[REFRESH] ❌ Error response:', errorText);
        return { success: false };
      }

      const data = await response.json();
      console.log('[REFRESH] 📦 Datos recibidos:', data);

      // El backend devuelve { success: true, data: { usuario: {...} } }
      const userData = data.data?.usuario || data.usuario;
      
      if (!userData) {
        console.error('[REFRESH] ❌ No se encontró usuario en la respuesta');
        console.error('[REFRESH] Estructura recibida:', JSON.stringify(data));
        return { success: false };
      }
      
      console.log('[REFRESH] ✅ Usuario obtenido:', userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      console.log('[REFRESH] ✅ Usuario actualizado en estado y storage');

      return { success: true, user: userData };

    } catch (err: any) {
      console.error('[REFRESH] ❌ Error:', err);
      console.error('[REFRESH] ❌ Error stack:', err.stack);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 📤 RETORNAR FUNCIONES Y ESTADO
  // ==========================================
  return {
    // Estado
    loading,
    error,
    user,
    
    // Funciones
    register,
    login,
    googleAuth,
    verifyToken,
    updateProfile,
    resendVerification,
    forgotPassword,
    resetPassword,
    logout,
    getCurrentUser,
    refreshUser,
    
    // Helpers
    setError,
    setUser,
  };
}