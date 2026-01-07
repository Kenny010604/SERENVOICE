// src/navigation/MainNavigator.js
// Navegador principal con tabs para usuarios autenticados

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import AnalyzeVoiceScreen from '../screens/main/AnalyzeVoiceScreen';
import AnalysisResultScreen from '../screens/main/AnalysisResultScreen';
import HistoryScreen from '../screens/main/HistoryScreen';
import GamesScreen from '../screens/main/GamesScreen';
import GameDetailScreen from '../screens/main/GameDetailScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import AnalysisDetailScreen from '../screens/main/AnalysisDetailScreen';
import RecommendationsScreen from '../screens/main/RecommendationsScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';

// Game Components
import BreathingGame from '../components/games/BreathingGame';
import MemoryGame from '../components/games/MemoryGame';
import MandalaGame from '../components/games/MandalaGame';
import PuzzleGame from '../components/games/PuzzleGame';
import MindfulnessGame from '../components/games/MindfulnessGame';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack para Dashboard
const DashboardStack = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
      <Stack.Screen name="AnalysisDetail" component={AnalysisDetailScreen} />
      <Stack.Screen name="Recommendations" component={RecommendationsScreen} />
    </Stack.Navigator>
  );
};

// Stack para Análisis
const AnalyzeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AnalyzeHome" component={AnalyzeVoiceScreen} />
      <Stack.Screen name="AnalysisResult" component={AnalysisResultScreen} />
    </Stack.Navigator>
  );
};

// Stack para Historial
const HistoryStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HistoryHome" component={HistoryScreen} />
      <Stack.Screen name="AnalysisDetail" component={AnalysisDetailScreen} />
    </Stack.Navigator>
  );
};

// Stack para Juegos
const GamesStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GamesHome" component={GamesScreen} />
      <Stack.Screen name="GameDetail" component={GameDetailScreen} />
      {/* Pantallas de juegos */}
      <Stack.Screen name="BreathingGame" component={BreathingGame} />
      <Stack.Screen name="MemoryGame" component={MemoryGame} />
      <Stack.Screen name="MandalaGame" component={MandalaGame} />
      <Stack.Screen name="PuzzleGame" component={PuzzleGame} />
      <Stack.Screen name="MindfulnessGame" component={MindfulnessGame} />
    </Stack.Navigator>
  );
};

// Stack para Perfil
const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Recommendations" component={RecommendationsScreen} />
    </Stack.Navigator>
  );
};

const MainNavigator = () => {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          paddingBottom: 8,
          paddingTop: 5,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Analyze':
              iconName = focused ? 'mic' : 'mic-outline';
              break;
            case 'History':
              iconName = focused ? 'time' : 'time-outline';
              break;
            case 'Games':
              iconName = focused ? 'game-controller' : 'game-controller-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardStack}
        options={{ tabBarLabel: 'Inicio' }}
      />
      <Tab.Screen 
        name="Analyze" 
        component={AnalyzeStack}
        options={{ tabBarLabel: 'Analizar' }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryStack}
        options={{ tabBarLabel: 'Historial' }}
      />
      <Tab.Screen 
        name="Games" 
        component={GamesStack}
        options={{ tabBarLabel: 'Juegos' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
