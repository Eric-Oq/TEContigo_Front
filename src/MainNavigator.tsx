import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { ReportCard } from './ReportCard';
import { useAuth } from './AuthContext';
import {useColorScheme} from 'nativewind'; // Importamos useColorScheme de NativeWind
import {Feather} from '@expo/vector-icons';


// Dummy data para Avisos
const mockAvisos = [
  {
    id: 1,
    userId: 2, 
    name: "Fuga de agua en el edificio A",
    category: "Mantenimiento",
    status: "PUBLICADO" as const,
    description: "Hay una fuga importante en los baños del segundo piso del edificio A. El agua está llegando al pasillo.",
  },
  {
    id: 2,
    userId: 1, 
    name: "Proyector dañado en aula 103",
    category: "Equipo",
    status: "EN_PROCESO" as const,
    description: "El proyector no enciende, el cable HDMI parece estar trozado. Ya se avisó a soporte.",
  }
];

// Dummy data para Objetos Perdidos/Encontrados
const mockObjetos = [
  { id: 1, name: "Termo Yeti Azul", location: "Cafetería central", date: "14/09/2026", status: "PERDIDO" },
  { id: 2, name: "Llaves con llavero de Pikachu", location: "Biblioteca, 2do piso", date: "13/09/2026", status: "ENCONTRADO" }
];

// Dummy data para Chats
const mockChats = [
  { id: 1, user: "María López (Admin)", lastMessage: "Ya enviamos a mantenimiento al edificio A.", time: "10:30 AM" },
  { id: 2, user: "Carlos (Soporte)", lastMessage: "¿Podrías confirmar si el proyector ya funciona?", time: "Ayer" }
];


export const MainNavigator = () => {
  const [activeTab, setActiveTab] = useState('Avisos');
  const { currentUser, logout } = useAuth(); // Importamos los datos del usuario actual y la función de salir[cite: 1]

  const tabs = ['Avisos', 'Objetos', 'Chats', 'Perfil'];
  const {colorScheme,toggleColorScheme} = useColorScheme();

  const toggleDarkMode = () => {
    toggleColorScheme(); 
  };

  return (
    <View className="flex-1 ">
      {/* Contenido principal scrolleable */}
    <ScrollView 
          className="flex-1"
          contentContainerStyle={{ 
            paddingHorizontal: 16, 
            paddingTop: 60, // <--- Esta es la clave para esquivar la Dynamic Island/Notch
            paddingBottom: 40 
          }}
        >

          {/* Podrías usar un Text con estilos dinámicos para cambiar el color según la pestaña activa
            <Text 
              className={`text-3xl font-bold mb-6 dark:text-white ${
                activeTab === 'Perfil' ? 'text-[#1B396A]' : 
                activeTab === 'Chats' ? 'text-green-600' : 
                activeTab === 'Objetos' ? 'text-orange-500' : 
                'text-gray-900' // Color por defecto para 'Avisos'
              }`}
            >
              {activeTab}
            </Text>
          */}
    <Text className="mb-6 mt-3 title1">{activeTab}</Text>

        {/* Pestaña: AVISOS */}
        {activeTab === 'Avisos' && (
          <View>
            {mockAvisos.map(aviso => (
              <ReportCard key={aviso.id} report={aviso} />
            ))}
          </View>
        )}

        {/* Pestaña: OBJETOS */}
        {activeTab === 'Objetos' && (
          <View>
            {mockObjetos.map(objeto => (
              <View key={objeto.id} className="bg-white rounded-xl shadow-sm mb-4 p-4 border border-gray-100">
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-lg font-bold text-gray-900 flex-1">{objeto.name}</Text>
                  <View className={`px-2 py-1 rounded-full ${objeto.status === 'PERDIDO' ? 'bg-red-100' : 'bg-green-100'}`}>
                    <Text className={`text-xs font-semibold ${objeto.status === 'PERDIDO' ? 'text-red-800' : 'text-green-800'}`}>
                      {objeto.status}
                    </Text>
                  </View>
                </View>
                <Text className="text-gray-600 mb-1">📍 Lugar: {objeto.location}</Text>
                <Text className="text-gray-500 text-sm">📅 Fecha: {objeto.date}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Pestaña: CHATS */}
        {activeTab === 'Chats' && (
          <View>
            {mockChats.map(chat => (
              <TouchableOpacity key={chat.id} className="bg-white rounded-xl p-4 mb-3 flex-row items-center border border-gray-100 shadow-sm">
                <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
                  <Text className="text-blue-600 font-bold text-lg">{chat.user.charAt(0)}</Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between mb-1">
                    <Text className="font-bold text-gray-900">{chat.user}</Text>
                    <Text className="text-xs text-gray-500">{chat.time}</Text>
                  </View>
                  <Text className="text-gray-600 text-sm" numberOfLines={1}>{chat.lastMessage}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Pestaña: PERFIL */}
          {activeTab === 'Perfil' && (
            <View className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm items-center">
              
              {/* Avatar genérico */}
              <View className="w-24 h-24 bg-blue-600 rounded-full items-center justify-center mb-4 mt-2">
                <Text className="text-white text-3xl font-bold">
                  {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              
              {/* Información del usuario */}
              <Text className="text-xl font-bold text-gray-900 dark:text-white mb-1">{currentUser?.email}</Text>
              <Text className="text-blue-600 dark:text-blue-400 font-semibold mb-6">Rol de cuenta: {currentUser?.role}</Text>

              {/* Botón de Modo Oscuro */}
              <TouchableOpacity 
                className="flex-row items-center justify-between bg-gray-200 dark:bg-black rounded-full px-2 py-2 w-40 mb-8 border border-gray-300 dark:border-gray-800" 
                onPress={toggleColorScheme}
                activeOpacity={0.8}
              >
                {colorScheme === 'dark' ? (
                  <>
                    <View className="bg-white rounded-full p-2">
                      <Feather name="moon" size={20} color="black" />
                    </View>
                    <Text className="text-white font-bold text-sm flex-1 text-center pr-2">
                      NIGHT MODE
                    </Text>
                  </>
                ) : (
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

              {/* Botón de Cerrar Sesión */}
              <TouchableOpacity 
                className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 py-3 px-8 rounded-lg w-full items-center"
                onPress={logout}
                accessibilityRole="button"
              >
                <Text className="text-red-600 dark:text-red-400 font-bold text-base">Cerrar Sesión</Text>
              </TouchableOpacity>

            </View>
          )}

        <View className="h-10" />
      </ScrollView>

      {/* Barra de navegación inferior */}
      <View className="flex-row bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-600 pb-5 pt-3">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            className="flex-1 items-center justify-center"
            onPress={() => setActiveTab(tab)}
            accessibilityRole="button"
          >
            <View className={`w-6 h-6 mb-1 rounded-full ${activeTab === tab ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <Text className={`text-xs ${activeTab === tab ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};