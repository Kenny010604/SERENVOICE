// src/screens/main/SettingsScreen.js
// Pantalla de configuración de la aplicación

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const SettingsScreen = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  
  console.log('[SettingsScreen] Componente renderizado');
  console.log('[SettingsScreen] logout function:', typeof logout);
  
  // Estados de configuración
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoAnalysis, setAutoAnalysis] = useState(false);
  const [dataCollection, setDataCollection] = useState(true);

  const handleLogout = async () => {
    console.log('[SettingsScreen] handleLogout llamado');
    
    let confirmed = false;
    if (Platform.OS === 'web') {
      // En web, usar window.confirm
      confirmed = window.confirm('¿Estás seguro de que deseas cerrar sesión?');
    } else {
      // En mobile, usar Alert.alert
      await new Promise((resolve) => {
        Alert.alert(
          'Cerrar Sesión',
          '¿Estás seguro de que deseas cerrar sesión?',
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
            { 
              text: 'Cerrar Sesión', 
              style: 'destructive',
              onPress: () => resolve(true)
            },
          ]
        );
      }).then(result => confirmed = result);
    }
    
    if (confirmed) {
      console.log('[SettingsScreen] Logout confirmado');
      try {
        await logout();
        console.log('[SettingsScreen] Logout completado');
      } catch (error) {
        console.error('[SettingsScreen] Error al cerrar sesión:', error);
      }
    } else {
      console.log('[SettingsScreen] Logout cancelado');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar Cuenta',
      '⚠️ Esta acción es irreversible. Se eliminarán todos tus datos, análisis e historial. ¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmar Eliminación',
              'Escribe "ELIMINAR" para confirmar la eliminación de tu cuenta.',
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Confirmar', style: 'destructive' },
              ]
            );
          }
        },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://serenvoice.com/privacy');
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://serenvoice.com/terms');
  };

  const handleSupport = () => {
    Linking.openURL('mailto:support@serenvoice.com');
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onValueChange, 
    isSwitch = false,
    onPress,
    showArrow = false,
    danger = false,
  }) => (
    <TouchableOpacity 
      style={[styles.settingItem, { backgroundColor: colors.panel }]}
      onPress={onPress}
      disabled={isSwitch && !onPress}
      activeOpacity={isSwitch ? 1 : 0.7}
    >
      <View style={[
        styles.settingIcon, 
        { backgroundColor: danger ? '#FF525220' : `${colors.primary}15` }
      ]}>
        <Ionicons 
          name={icon} 
          size={22} 
          color={danger ? '#FF5252' : colors.primary} 
        />
      </View>
      
      <View style={styles.settingContent}>
        <Text style={[
          styles.settingTitle, 
          { color: danger ? '#FF5252' : colors.text }
        ]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {isSwitch && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#767577', true: `${colors.primary}50` }}
          thumbColor={value ? colors.primary : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
        />
      )}

      {showArrow && (
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={colors.textSecondary} 
        />
      )}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
      {title}
    </Text>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    gradient: {
      flex: 1,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 20,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    backText: {
      marginLeft: 5,
      fontSize: 16,
      color: colors.primary,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    sectionHeader: {
      fontSize: 13,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: 20,
      marginBottom: 10,
      marginLeft: 4,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      borderRadius: 14,
      marginBottom: 8,
    },
    settingIcon: {
      width: 42,
      height: 42,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '500',
    },
    settingSubtitle: {
      fontSize: 13,
      marginTop: 2,
    },
    versionContainer: {
      alignItems: 'center',
      paddingVertical: 30,
    },
    versionText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    buildText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GradientBackground>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Configuración</Text>
          <Text style={styles.headerSubtitle}>
            Personaliza tu experiencia en SerenVoice
          </Text>
        </View>

        {/* Settings Content */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Apariencia */}
          <SectionHeader title="Apariencia" />
          
          <SettingItem
            icon="moon-outline"
            title="Modo Oscuro"
            subtitle="Cambiar el tema de la aplicación"
            isSwitch
            value={isDark}
            onValueChange={toggleTheme}
          />

          {/* Notificaciones */}
          <SectionHeader title="Notificaciones" />
          
          <SettingItem
            icon="notifications-outline"
            title="Notificaciones Push"
            subtitle="Recibir alertas y recordatorios"
            isSwitch
            value={notifications}
            onValueChange={setNotifications}
          />
          
          <SettingItem
            icon="volume-medium-outline"
            title="Efectos de Sonido"
            subtitle="Sonidos al grabar y analizar"
            isSwitch
            value={soundEffects}
            onValueChange={setSoundEffects}
          />

          {/* Análisis */}
          <SectionHeader title="Análisis" />
          
          <SettingItem
            icon="flash-outline"
            title="Análisis Automático"
            subtitle="Analizar automáticamente al terminar de grabar"
            isSwitch
            value={autoAnalysis}
            onValueChange={setAutoAnalysis}
          />

          {/* Privacidad */}
          <SectionHeader title="Privacidad" />
          
          <SettingItem
            icon="analytics-outline"
            title="Recopilación de Datos"
            subtitle="Ayudar a mejorar SerenVoice"
            isSwitch
            value={dataCollection}
            onValueChange={setDataCollection}
          />
          
          <SettingItem
            icon="shield-checkmark-outline"
            title="Política de Privacidad"
            showArrow
            onPress={handlePrivacyPolicy}
          />
          
          <SettingItem
            icon="document-text-outline"
            title="Términos de Servicio"
            showArrow
            onPress={handleTermsOfService}
          />

          {/* Soporte */}
          <SectionHeader title="Soporte" />
          
          <SettingItem
            icon="help-circle-outline"
            title="Centro de Ayuda"
            subtitle="Preguntas frecuentes y guías"
            showArrow
            onPress={() => {}}
          />
          
          <SettingItem
            icon="mail-outline"
            title="Contactar Soporte"
            subtitle="support@serenvoice.com"
            showArrow
            onPress={handleSupport}
          />
          
          <SettingItem
            icon="star-outline"
            title="Calificar la App"
            subtitle="Déjanos tu opinión en la tienda"
            showArrow
            onPress={() => {}}
          />

          {/* Cuenta */}
          <SectionHeader title="Cuenta" />
          
          <SettingItem
            icon="log-out-outline"
            title="Cerrar Sesión"
            showArrow
            onPress={handleLogout}
          />
          
          <SettingItem
            icon="trash-outline"
            title="Eliminar Cuenta"
            subtitle="Esta acción es irreversible"
            danger
            showArrow
            onPress={handleDeleteAccount}
          />

          {/* Versión */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>SerenVoice v1.0.0</Text>
            <Text style={styles.buildText}>Build 2025.01</Text>
          </View>
        </ScrollView>
      </GradientBackground>
    </SafeAreaView>
  );
};

export default SettingsScreen;




