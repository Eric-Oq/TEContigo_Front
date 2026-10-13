import React from 'react';
import { View, Text, TouchableOpacity, Image} from 'react-native';
import { useAuth } from './AuthContext';

// Interfaz basada en la tabla Reports de PostgreSQL
interface Report {
  id: number;
  userId: number; // Mapeado de user_id
  name: string;
  category: string;
  status: 'PUBLICADO' | 'EN_PROCESO' | 'TERMINADO';
  description: string;
  photoPath?: string; // Mapeado de photo_path
}

interface ReportCardProps {
  report: Report;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const { currentUser } = useAuth();

  // Lógica de permisos basada en la documentación del proyecto
  const isOwner = currentUser?.id === report.userId;
  const isAdmin = currentUser?.role === 'ADMIN';
  const isModerator = currentUser?.role === 'MODERATOR';

  const canEdit = isOwner || isAdmin || isModerator;
  const canDelete = isOwner || isAdmin || isModerator;
  const canChangeStatus = isAdmin || isModerator;

  // Colores dinámicos para el estado (Jerarquía visual y Claridad)
  const getStatusStyle = (status: string) => {
      switch (status) {
        case 'PUBLICADO': 
          return { bg: 'bg-publicado', text: 'text-publicado' };
        case 'EN_PROCESO': 
          return { bg: 'bg-proceso', text: 'text-proceso' };
        case 'TERMINADO': 
          return { bg: 'bg-terminado', text: 'text-terminado' }; 
        default: 
          return { bg: 'bg-red-800', text: 'text-black font-bold' };
      }
    };

  const statusStyles = getStatusStyle(report.status);

  return (
    <View className=" reportcard rounded-xl shadow-sm mb-4 border border-gray-300 overflow-hidden">
      {/* Optimización de datos: Carga perezosa de imagen si existe */}
      {report.photoPath && (
        <Image 
          source={{ uri: report.photoPath }} 
          className="w-full h-40" 
          resizeMode="cover"
          accessibilityLabel={`Imagen del reporte ${report.name}`}
        />
      )}
      
      {/*Pastillas de estados PUBLICADO, EN_PROCESO, TERMINADO y Titulo del reporte*/}
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-lg font-bold text-gray-900 dark:text-white flex-1 mr-4">{report.name}</Text>
          <View className={`px-2 py-1 ml-2 rounded-full ${statusStyles.bg}`}>
            <Text className={`text-xs font-semibold ${statusStyles.text}`}>{report.status}</Text>
          </View>
        </View>

      {/* Categoría y descripción del reporte */}
        <Text className="text-sm text-gray-500 dark:text-white font-medium mb-2">{report.category}</Text>
        <Text className="text-gray-600 dark:text-white text-base mb-4" numberOfLines={3}>
          {report.description}
        </Text>

      {/* Botones de acción condicionales basados en roles */}
        <View className="flex-row border-t border-gray-300 dark:border-white pt-4 gap-x-3">
          
          {canEdit && (
            <TouchableOpacity 
              accessibilityRole="button" 
              className="bg-blue-100 dark:bg-blue-500 px-4 py-1.5 rounded-full items-center justify-center border border-blue-200 dark:border-blue-800"
            >
              <Text className="text-blue-700 dark:text-white font-semibold text-sm">Editar</Text>
            </TouchableOpacity>
          )}

          {canDelete && (
            <TouchableOpacity 
              accessibilityRole="button" 
              className="bg-red-100 dark:bg-red-500 px-4 py-1.5 rounded-full items-center justify-center border border-red-200 dark:border-red-800"
            >
              <Text className="text-red-700 dark:text-white font-semibold text-sm">Eliminar</Text>
            </TouchableOpacity>
          )}

          {canChangeStatus && (
            <TouchableOpacity 
              accessibilityRole="button" 
              className="bg-purple-100 dark:bg-purple-900/30 px-4 py-1.5 rounded-full items-center justify-center border border-purple-200 dark:border-purple-800"
            >
              <Text className="text-purple-700 dark:text-purple-400 font-semibold text-sm">Cambiar Estado</Text>
            </TouchableOpacity>
          )}
          
        </View>
      </View>
    </View>
  );
};