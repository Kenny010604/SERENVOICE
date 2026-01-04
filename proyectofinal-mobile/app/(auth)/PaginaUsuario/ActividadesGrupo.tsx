import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import groupsService from '../../../constants/groupsService';

// Definir el tipo de las actividades
interface Actividad {
  id?: string;
  titulo: string;
  descripcion: string;
}

export default function ActividadesGrupo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [nuevo, setNuevo] = useState<{ titulo: string; descripcion: string }>({ titulo: '', descripcion: '' });
  const [loading, setLoading] = useState<boolean>(true);

  // Función para cargar las actividades
  const cargar = async () => {
    if (!id) return;
    try {
      const data = await groupsService.listarActividades(id);
      setActividades(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [id]);

  // Función para crear una nueva actividad
  const crear = async () => {
    if (!nuevo.titulo.trim()) {
      Alert.alert('Error', 'El título es requerido');
      return;
    }
    try {
      await groupsService.crearActividad(id!, {
        titulo: nuevo.titulo,
        descripcion: nuevo.descripcion,
        id: ''
      });
      setNuevo({ titulo: '', descripcion: '' });
      cargar();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo crear la actividad');
    }
  };

  // Función para eliminar una actividad
  const eliminar = async (actividadId: string) => {
    Alert.alert(
      'Confirmar',
      '¿Eliminar esta actividad?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await groupsService.eliminarActividad(id!, actividadId);
              cargar();
            } catch (e) {
              console.error(e);
              Alert.alert('Error', 'No se pudo eliminar la actividad');
            }
          }
        }
      ]
    );
  };

  const renderActividad = ({ item }: { item: Actividad }) => (
    <View style={styles.actividadItem}>
      <View style={styles.actividadInfo}>
        <Text style={styles.actividadTitulo}>{item.titulo}</Text>
        <Text style={styles.actividadDesc}>{item.descripcion}</Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteBtn} 
        onPress={() => eliminar(item.id!)}
      >
        <Text style={styles.deleteBtnText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Actividades del grupo</Text>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Título"
          value={nuevo.titulo}
          onChangeText={(text) => setNuevo(n => ({ ...n, titulo: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Descripción"
          value={nuevo.descripcion}
          onChangeText={(text) => setNuevo(n => ({ ...n, descripcion: text }))}
        />
        <TouchableOpacity style={styles.crearBtn} onPress={crear}>
          <Text style={styles.crearBtnText}>Crear</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4A90A4" />
      ) : (
        <FlatList
          data={actividades}
          keyExtractor={(item) => item.id || Math.random().toString()}
          renderItem={renderActividad}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay actividades</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  form: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  crearBtn: {
    backgroundColor: '#4A90A4',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  crearBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actividadItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actividadInfo: {
    flex: 1,
  },
  actividadTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  actividadDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deleteBtn: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
});
