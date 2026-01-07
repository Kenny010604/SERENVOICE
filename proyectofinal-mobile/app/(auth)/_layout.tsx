import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="Dashboard" />
      <Stack.Screen name="historial" />
      <Stack.Screen name="recomendaciones" />
      <Stack.Screen name="Analisis" />
      <Stack.Screen name="editarperfil" />
    </Stack>
  );
}