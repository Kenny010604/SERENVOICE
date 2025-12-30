import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { name: 'Inicio', path: '/(tabs)', icon: 'home-outline' },
    { name: 'Análisis', path: '/(auth)/Analisis', icon: 'analytics-outline' },
    { name: 'Historial', path: '/(auth)/historial', icon: 'time-outline' },
    { name: 'Perfil', path: '/(auth)/editarperfil', icon: 'person-outline' },
  ];

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.logo}>🎙️ SerenVoice</Text>
        
        <View style={styles.authButtons}>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/PaginasPublicas/login')}
          >
            <Text style={styles.loginText}>Iniciar Sesión</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => router.push('/(auth)/PaginasPublicas/register')}
          >
            <Text style={styles.registerText}>Registrarse</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.nav}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.path}
            style={[
              styles.navItem,
              pathname === item.path && styles.navItemActive
            ]}
            onPress={() => router.push(item.path as any)}
          >
            <Ionicons 
              name={item.icon as any} 
              size={20} 
              color={pathname === item.path ? '#4dd4ac' : '#b8c5d0'} 
            />
            <Text style={[
              styles.navText,
              pathname === item.path && styles.navTextActive
            ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1a3a52',
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#2a4a62',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  logo: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  authButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  loginButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  loginText: {
    color: '#4dd4ac',
    fontSize: 14,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#4dd4ac',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  registerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#0f2537',
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  navItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#4dd4ac',
  },
  navText: {
    color: '#b8c5d0',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  navTextActive: {
    color: '#4dd4ac',
    fontWeight: '700',
  },
});