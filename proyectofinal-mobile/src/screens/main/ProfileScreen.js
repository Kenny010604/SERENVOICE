// src/screens/main/ProfileScreen.js
// Pantalla de perfil del usuario

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { GradientBackground } from '../../components/common';
import { getInitials, formatDate } from '../../utils/helpers';

const ProfileScreen = ({ navigation }) => {
  const { colors, toggleTheme, isDark } = useTheme();
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simular refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleLogout = async () => {
    let confirmed = false;
    if (Platform.OS === 'web') {
      confirmed = window.confirm('¿Estás seguro de que quieres cerrar sesión?');
    } else {
      await new Promise((resolve) => {
        Alert.alert(
          'Cerrar sesión',
          '¿Estás seguro de que quieres cerrar sesión?',
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
            {
              text: 'Cerrar sesión',
              style: 'destructive',
              onPress: () => resolve(true)
            },
          ]
        );
      }).then(result => confirmed = result);
    }
    
    if (confirmed) {
      try {
        await logout();
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    }
  };

  const menuItems = [
    {
      id: 'edit',
      icon: 'create-outline',
      label: 'Editar perfil',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      id: 'notifications',
      icon: 'notifications-outline',
      label: 'Notificaciones',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      id: 'recommendations',
      icon: 'bulb-outline',
      label: 'Recomendaciones',
      onPress: () => navigation.navigate('Recommendations'),
    },
    {
      id: 'settings',
      icon: 'settings-outline',
      label: 'Configuración',
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Mi perfil</Text>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.panel }]}>
          <View style={styles.avatarSection}>
            {user?.foto_perfil ? (
              <Image
                source={{ uri: user.foto_perfil }}
                style={styles.avatar}
              />
            ) : (
              <View
                style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.avatarText}>
                  {getInitials(user?.nombre, user?.apellido)}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.editAvatarButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.nombre} {user?.apellido}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {user?.correo}
          </Text>

          {user?.fecha_nacimiento && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.infoText, { color: colors.textMuted }]}>
                {formatDate(user.fecha_nacimiento, 'short')}
              </Text>
            </View>
          )}

          <View style={[styles.memberSince, { borderTopColor: colors.border }]}>
            <Text style={[styles.memberLabel, { color: colors.textMuted }]}>
              Miembro desde
            </Text>
            <Text style={[styles.memberDate, { color: colors.textSecondary }]}>
              {formatDate(user?.fecha_creacion || new Date(), 'short')}
            </Text>
          </View>
        </View>

        {/* Theme Toggle */}
        <TouchableOpacity
          style={[styles.themeCard, { backgroundColor: colors.panel }]}
          onPress={toggleTheme}
        >
          <View style={styles.themeLeft}>
            <View style={[styles.themeIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons
                name={isDark ? 'moon' : 'sunny'}
                size={22}
                color={colors.primary}
              />
            </View>
            <View>
              <Text style={[styles.themeLabel, { color: colors.text }]}>
                Modo {isDark ? 'oscuro' : 'claro'}
              </Text>
              <Text style={[styles.themeHint, { color: colors.textSecondary }]}>
                Toca para cambiar
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.toggleTrack,
              {
                backgroundColor: isDark ? colors.primary : colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.toggleThumb,
                {
                  transform: [{ translateX: isDark ? 20 : 0 }],
                },
              ]}
            />
          </View>
        </TouchableOpacity>

        {/* Menu */}
        <View style={[styles.menuCard, { backgroundColor: colors.panel }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}
              onPress={item.onPress}
            >
              <View style={[styles.menuIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name={item.icon} size={20} color={colors.primary} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.text }]}>
                {item.label}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.error + '15' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>
            Cerrar sesión
          </Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={[styles.version, { color: colors.textMuted }]}>
          SerenVoice v1.0.0
        </Text>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarSection: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 13,
  },
  memberSince: {
    width: '100%',
    borderTopWidth: 1,
    paddingTop: 16,
    alignItems: 'center',
  },
  memberLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  memberDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  themeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  themeHint: {
    fontSize: 12,
    marginTop: 2,
  },
  toggleTrack: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  menuCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
  },
});

export default ProfileScreen;




