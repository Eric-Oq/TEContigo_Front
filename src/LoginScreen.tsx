import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import {Feather} from '@expo/vector-icons';
import { useAuth } from './AuthContext';
import {useColorScheme} from 'nativewind'; // Importamos useColorScheme de NativeWind

// Añadimos la interfaz para recibir la función de navegación
interface LoginScreenProps {
  onNavigateToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const {colorScheme,toggleColorScheme} = useColorScheme();

  const toggleDarkMode = () => {
    toggleColorScheme(); 
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa tu correo y contraseña."); 
      return;
    }

    setIsLoading(true); 
    try {
      setTimeout(() => {
        login({ id: 1, email: email, role: 'USER' }); 
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      Alert.alert("Error de conexión", "No se pudo conectar al servidor. Revisa tu internet.");
      setIsLoading(false);
    }
  };

return (
    // 1. Evita que el teclado tape los campos
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50 dark:bg-gray-900"
    >
      {/* 2. Permite scrollear si rotan la pantalla */}
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        {/* 3. Limita el ancho en pantallas grandes (Tablets/Web) pero ocupa 100% en celular */}
        <View className="w-full max-w-md px-6 py-10">

          <Text className="title1">Avisos TEC</Text>
          <Text className="title2">Inicia sesión con tu correo institucional</Text>

          {/* Campo: Correo Electrónico */}
          <View className="mb-4">
            <Text className="title3">Correo Electrónico</Text>
            <TextInput
              // dark:border-gray-700 evita que el borde brille mucho de noche
              className="bg-white border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg p-4 text-base dark:text-white"
              placeholder="ejemplo@tec.mx"
              placeholderTextColor="#9CA3AF" // Mantiene el placeholder visible en modo oscuro
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              accessibilityLabel="Entrada de correo electrónico" 
            />
          </View>

          {/* Campo: Contraseña */}
          <View className="mb-6">
            <Text className="title3">Contraseña</Text>
            <TextInput
              className="bg-white border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-4 text-base"
              placeholder="********"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              accessibilityLabel="Entrada de contraseña" 
            />
          </View>

          {/* Botón de Ingreso */}
          <TouchableOpacity
            // Cambia de color si isLoading es true
            className={`rounded-lg p-4 flex-row justify-center items-center mb-4 ${isLoading ? 'bg-blue-400' : 'bg-blue-600'}`}
            onPress={handleLogin}
            disabled={isLoading}
            accessibilityRole="button"
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">Ingresar</Text>
            )}
          </TouchableOpacity>

          {/* Enlace al Registro */}
          <TouchableOpacity onPress={onNavigateToRegister} className="py-2" accessibilityRole="button">
            <Text className="title4">¿No tienes cuenta? Regístrate aquí</Text>
          </TouchableOpacity>
          
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};