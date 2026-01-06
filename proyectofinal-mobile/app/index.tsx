import { Redirect } from 'expo-router';

export default function Index() {
  // Redirigir a tabs ya que el layout tiene anchor en (tabs)
  return <Redirect href="/(tabs)" />;
}