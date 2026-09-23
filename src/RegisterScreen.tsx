import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // Tolerancia a fallos: validación de campos vacíos[cite: 3]
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Por favor completa todos los campos."); 
      return;
    }

    // Tolerancia a fallos: validación de contraseñas[cite: 3]
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true); // Indicador de estado visual[cite: 3]
    try {
      // Simulación de petición de registro al backend .NET[cite: 3]
      setTimeout(() => {
        setIsLoading(false);
        Alert.alert(
          "Registro Exitoso", 
          "Tu cuenta ha sido creada. Ahora puedes iniciar sesión.",
          [{ text: "OK", onPress: onNavigateToLogin }]
        );
      }, 1500);
    } catch (error) {
      Alert.alert("Error de conexión", "No se pudo conectar al servidor.");
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
        <Text className="text-3xl font-bold text-blue-900 mb-2 text-center">Crear Cuenta</Text>
        <Text className="text-base text-gray-500 mb-8 text-center">Únete a Avisos TEC</Text>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-1">Nombre Completo</Text>
          <TextInput
            className="bg-white border border-gray-300 rounded-lg p-4 text-base"
            placeholder="Ej. Juan Pérez"
            value={name}
            onChangeText={setName}
            accessibilityLabel="Entrada de nombre"
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-1">Correo Institucional</Text>
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

        <View className="mb-4">
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

        <View className="mb-8">
          <Text className="text-sm font-semibold text-gray-700 mb-1">Confirmar Contraseña</Text>
          <TextInput
            className="bg-white border border-gray-300 rounded-lg p-4 text-base"
            placeholder="********"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            accessibilityLabel="Confirmar contraseña"
          />
        </View>

        <TouchableOpacity
          className={`rounded-lg p-4 flex-row justify-center items-center mb-4 ${isLoading ? 'bg-blue-400' : 'bg-blue-600'}`}
          onPress={handleRegister}
          disabled={isLoading}
          accessibilityRole="button"
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">Registrarse</Text>
          )}
        </TouchableOpacity>

        {/* Botón para regresar al Login */}
        <TouchableOpacity onPress={onNavigateToLogin} className="py-2" accessibilityRole="button">
          <Text className="text-center text-blue-600 font-semibold">¿Ya tienes cuenta? Inicia sesión aquí</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};