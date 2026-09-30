import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
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
    <View className="flex-1 bg-gray-50 dark:bg-gray-900 justify-center items-center px-6">
      
       {/* Botón de Modo Oscuro*/}
        <TouchableOpacity 
          className="absolute bottom-16 left-36 flex-row items-center justify-between bg-gray-200 dark:bg-black rounded-full px-2 py-2 w-40 mb-6 border border-gray-300 dark:border-gray-800" 
          onPress={toggleDarkMode}
          activeOpacity={0.8}
        >
          {colorScheme === 'dark' ? (
            /* --- Diseño NIGHT MODE --- */
            /* Ícono de luna a la izquierda en un círculo blanco, texto a la derecha */
            <>
              <View className="bg-white rounded-full p-2">
                <Feather name="moon" size={20} color="black" />
              </View>
              <Text className="text-white font-bold text-sm flex-2 text-center pr-2">
                NIGHT MODE
              </Text>
            </>
          ) : (
            /* --- Diseño DAY MODE --- */
            /* Texto a la izquierda, ícono de sol a la derecha en un círculo blanco */
            <>
              <Text className="text-black font-bold text-sm flex-1 text-center pl-2">
                DAY MODE
              </Text>
              <View className="bg-white rounded-full p-2 shadow-sm border border-gray-300">
                <Feather name="sun" size={20} color="black" />
              </View>
            </>
          )}
        </TouchableOpacity>
      
      <View className="w-full max-w-md">

        <Text className="title1">Avisos TEC</Text>
        <Text className="title2">Inicia sesión con tu correo institucional</Text>

        <View className="mb-4">
          <Text className="title3">Correo Electrónico</Text>
          <TextInput
            className="bg-white border border-gray-300  dark:bg-gray-800 rounded-lg p-4 text-base dark:text-white"
            placeholder="ejemplo@tec.mx"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            accessibilityLabel="Entrada de correo electrónico" 
          />
        </View>

        <View className="mb-6">
          <Text className="title3">Contraseña</Text>
          <TextInput
            className="bg-white border border-gray-300  dark:bg-gray-800 dark:text-white rounded-lg p-4 text-base"
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
          <Text className="title4">¿No tienes cuenta? Regístrate aquí</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};