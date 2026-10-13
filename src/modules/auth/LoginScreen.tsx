// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../AuthContext';
import { authApi } from '../../api/auth/authApi';
import { ApiError } from '../../api/auth/client';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    // Aquí no se valida el dominio institucional a propósito: la cuenta de
    // administrador sembrada en la BD podría no usarlo y quedaría bloqueada.
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      Alert.alert('Revisa tus datos', 'Escribe tu correo y tu contraseña para continuar.');
      return;
    }

    setIsLoading(true);

    try {
      const session = await authApi.login({ email: normalizedEmail, password });
      login(session, normalizedEmail);
      // Si sale bien, AuthContext cambia el estado y la app reemplaza esta
      // pantalla; no hace falta navegar desde aquí.
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Ocurrió un error inesperado. Inténtalo de nuevo.';

      Alert.alert('No se pudo iniciar sesión', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
          paddingVertical: 24,
        }}
      >
        <Text className="text-3xl font-bold text-blue-900 mb-2 text-center">
          Avisos TEC
        </Text>
        <Text className="text-base text-gray-500 mb-8 text-center">
          Inicia sesión con tu correo institucional
        </Text>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-1">
            Correo Electrónico
          </Text>
          <TextInput
            className="bg-white border border-gray-300 rounded-lg p-4 text-base"
            placeholder="ejemplo@tectijuana.edu.mx"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            maxLength={100}
            value={email}
            onChangeText={setEmail}
            accessibilityLabel="Entrada de correo electrónico"
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-1">
            Contraseña
          </Text>
          <TextInput
            className="bg-white border border-gray-300 rounded-lg p-4 text-base"
            placeholder="********"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            value={password}
            onChangeText={setPassword}
            accessibilityLabel="Entrada de contraseña"
          />
        </View>

        <TouchableOpacity
          className={`rounded-lg p-4 flex-row justify-center items-center mb-4 ${
            isLoading ? 'bg-blue-400' : 'bg-blue-600'
          }`}
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

        <TouchableOpacity
          onPress={onNavigateToRegister}
          className="py-2"
          accessibilityRole="button"
        >
          <Text className="text-center text-blue-600 font-semibold">
            ¿No tienes cuenta? Regístrate aquí
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};