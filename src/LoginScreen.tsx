import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from './AuthContext';

// Añadimos la interfaz para recibir la función de navegación
interface LoginScreenProps {
  onNavigateToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

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
    <View className="flex-1 bg-gray-50 justify-center px-6">
      <Text className="text-3xl font-bold text-blue-900 mb-2 text-center">Avisos TEC</Text>
      <Text className="text-base text-gray-500 mb-8 text-center">Inicia sesión con tu correo institucional</Text>

      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</Text>
        <TextInput
          className="bg-white border border-gray-300 rounded-lg p-4 text-base"
          placeholder="ejemplo@tec.mx"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          accessibilityLabel="Entrada de correo electrónico" 
        />
      </View>

      <View className="mb-6">
        <Text className="text-sm font-semibold text-gray-700 mb-1">Contraseña</Text>
        <TextInput
          className="bg-white border border-gray-300 rounded-lg p-4 text-base"
          placeholder="********"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          accessibilityLabel="Entrada de contraseña" 
        />
      </View>

      <TouchableOpacity
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

      {/* Nuevo botón para ir al registro */}
      <TouchableOpacity onPress={onNavigateToRegister} className="py-2" accessibilityRole="button">
        <Text className="text-center text-blue-600 font-semibold">¿No tienes cuenta? Regístrate aquí</Text>
      </TouchableOpacity>
    </View>
  );
};