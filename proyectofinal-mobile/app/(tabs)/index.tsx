import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Dimensions
} from "react-native";
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Config, ApiEndpoints, ApiClient } from '../../constants';


const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [conectado, setConectado] = useState(false);

  useEffect(() => {
    console.log('🔗 API_URL:', Config.API_URL);
    
    // Usar ApiClient para verificar conexión
    ApiClient.get(ApiEndpoints.HEALTH)
      .then((response) => {
        console.log('✅ Conectado a Flask:', response);
        setConectado(true);
      })
      .catch((err) => {
        console.log('❌ Error de conexión:', err);
        setConectado(false);
      });
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Header con gradiente */}
      <LinearGradient
        colors={['#1e3c72', '#2a5298', '#4a90e2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.logo}>🎙️ SerenVoice</Text>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, conectado && styles.statusDotActive]} />
            <Text style={styles.statusText}>
              {conectado ? 'Conectado' : 'Sin conexión'}
            </Text>
          </View>
        </View>

        {/* Navegación en el header */}
        <View style={styles.headerNav}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => router.push('/(auth)/PaginasPublicas/login')}
          >
            <Text style={styles.navButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButtonPrimary}
            onPress={() => router.push('/(auth)/PaginasPublicas/register')}
          >
            <Text style={styles.navButtonPrimaryText}>Registrarse</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Menú de navegación */}
      <View style={styles.menuBar}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/(tabs)')}
        >
          <Ionicons name="home-outline" size={20} color="#4dd4ac" />
          <Text style={styles.menuItemText}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/(auth)/PaginasPublicas/Analisis')}
        >
          <Ionicons name="analytics-outline" size={20} color="#b8c5d0" />
          <Text style={styles.menuItemText}>Análisis</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => { router.push('/(auth)/PaginasPublicas/Contacto') }}
        >
          <Ionicons name="mail-outline" size={20} color="#b8c5d0" />
          <Text style={styles.menuItemText}>Contacto</Text>
        </TouchableOpacity>
      </View>

      {/* Sección de Bienvenida */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Bienvenido a SerenVoice</Text>
        <Text style={styles.welcomeText}>
          Tu bienestar emocional comienza con tu voz. Analizamos patrones vocales 
          para detectar niveles de estrés y ansiedad, ayudándote a mantener un 
          equilibrio emocional.
        </Text>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/PaginasPublicas/Analisis')}
        >
          <Text style={styles.primaryButtonText}>Comenzar Análisis</Text>
        </TouchableOpacity>
      </View>

      {/* Características Principales */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Características Principales</Text>
        
        <View style={styles.featuresGrid}>
          {/* Feature 1 */}
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name="analytics-outline" size={40} color="#4a90e2" />
            </View>
            <Text style={styles.featureTitle}>Análisis Preciso</Text>
            <Text style={styles.featureText}>
              Utilizamos tecnología de punta para analizar los patrones de tu voz 
              con alta precisión.
            </Text>
          </View>

          {/* Feature 2 */}
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name="trending-up-outline" size={40} color="#4a90e2" />
            </View>
            <Text style={styles.featureTitle}>Seguimiento Continuo</Text>
            <Text style={styles.featureText}>
              Monitorea tu progreso a lo largo del tiempo con gráficas detalladas 
              y análisis comparativos.
            </Text>
          </View>

          {/* Feature 3 */}
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name="shield-checkmark-outline" size={40} color="#4a90e2" />
            </View>
            <Text style={styles.featureTitle}>Privacidad Garantizada</Text>
            <Text style={styles.featureText}>
              Tu información está segura con nosotros. Utilizamos encriptación de 
              nivel bancario.
            </Text>
          </View>
        </View>
      </View>

      {/* Testimonios */}
      <View style={styles.testimonialsSection}>
        <Text style={styles.sectionTitle}>Lo que dicen nuestros usuarios</Text>
        
        <View style={styles.testimonialCard}>
          <View style={styles.stars}>
            {[...Array(5)].map((_, i) => (
              <Ionicons key={i} name="star" size={16} color="#ffd700" />
            ))}
          </View>
          <Text style={styles.testimonialText}>
            "La precisión del análisis emocional es increíble. Pude identificar 
            patrones de estrés que no había notado antes."
          </Text>
          <Text style={styles.testimonialAuthor}>- María García</Text>
        </View>

        <View style={styles.testimonialCard}>
          <View style={styles.stars}>
            {[...Array(5)].map((_, i) => (
              <Ionicons key={i} name="star" size={16} color="#ffd700" />
            ))}
          </View>
          <Text style={styles.testimonialText}>
            "Llevo 3 meses usándola y ha sido un cambio radical en cómo manejo 
            mi ansiedad. ¡Altamente recomendado!"
          </Text>
          <Text style={styles.testimonialAuthor}>- Carlos López</Text>
        </View>

        <View style={styles.testimonialCard}>
          <View style={styles.stars}>
            {[...Array(5)].map((_, i) => (
              <Ionicons key={i} name="star" size={16} color="#ffd700" />
            ))}
          </View>
          <Text style={styles.testimonialText}>
            "La interfaz es muy intuitiva y los reportes me ayudan a entender 
            mejor mi bienestar emocional diario."
          </Text>
          <Text style={styles.testimonialAuthor}>- Ana Rodríguez</Text>
        </View>
      </View>

      {/* Nuestro Impacto */}
      <View style={styles.impactSection}>
        <Text style={styles.sectionTitle}>Nuestro Impacto</Text>
        
        <View style={styles.impactGrid}>
          <View style={styles.impactCard}>
            <Ionicons name="people-outline" size={50} color="#4a90e2" />
            <Text style={styles.impactNumber}>10,000+</Text>
            <Text style={styles.impactLabel}>Usuarios Activos</Text>
          </View>

          <View style={styles.impactCard}>
            <Ionicons name="happy-outline" size={50} color="#4a90e2" />
            <Text style={styles.impactNumber}>95%</Text>
            <Text style={styles.impactLabel}>Satisfacción</Text>
          </View>

          <View style={styles.impactCard}>
            <Ionicons name="headset-outline" size={50} color="#4a90e2" />
            <Text style={styles.impactNumber}>24/7</Text>
            <Text style={styles.impactLabel}>Soporte</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2025 SerenVoice — Todos los derechos reservados.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f2537",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff6b6b',
    marginRight: 6,
  },
  statusDotActive: {
    backgroundColor: '#51cf66',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  headerNav: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  navButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  navButtonPrimary: {
    backgroundColor: '#4dd4ac',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navButtonPrimaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  menuBar: {
    flexDirection: 'row',
    backgroundColor: '#1a3a52',
    paddingVertical: 12,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#2a4a62',
  },
  menuItem: {
    alignItems: 'center',
    gap: 4,
  },
  menuItemText: {
    color: '#b8c5d0',
    fontSize: 11,
    fontWeight: '600',
  },
  welcomeSection: {
    backgroundColor: '#1a3a52',
    margin: 20,
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 15,
    color: '#b8c5d0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 25,
  },
  primaryButton: {
    backgroundColor: '#4dd4ac',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#4dd4ac',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  featuresSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 25,
  },
  featuresGrid: {
    gap: 15,
  },
  featureCard: {
    backgroundColor: '#1a3a52',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
  },
  featureIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#b8c5d0',
    textAlign: 'center',
    lineHeight: 22,
  },
  testimonialsSection: {
    padding: 20,
    paddingTop: 40,
  },
  testimonialCard: {
    backgroundColor: '#1a3a52',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4dd4ac',
  },
  stars: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  testimonialText: {
    fontSize: 14,
    color: '#b8c5d0',
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 10,
  },
  testimonialAuthor: {
    fontSize: 13,
    color: '#4dd4ac',
    fontWeight: '600',
  },
  impactSection: {
    padding: 20,
    paddingTop: 40,
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  impactCard: {
    width: width / 3 - 20,
    backgroundColor: '#1a3a52',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  impactNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4dd4ac',
    marginTop: 10,
  },
  impactLabel: {
    fontSize: 12,
    color: '#b8c5d0',
    textAlign: 'center',
    marginTop: 5,
  },
  footer: {
    padding: 30,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1a3a52',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#6c8ba3',
  },
});