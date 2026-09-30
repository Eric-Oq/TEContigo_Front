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
    <View className=" reportcard rounded-xl shadow-sm mb-4 border border-gray-100 overflow-hidden">
      {/* Optimización de datos: Carga perezosa de imagen si existe */}
      {report.photoPath && (
        <Image 
          source={{ uri: report.photoPath }} 
          className="w-full h-40" 
          resizeMode="cover"
          accessibilityLabel={`Imagen del reporte ${report.name}`}
        />
      )}
      
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-lg font-bold text-gray-900 flex-1">{report.name}</Text>
          <View className={`px-2 py-1 rounded-full ${statusStyles.bg}`}>
            <Text className={`text-xs font-semibold ${statusStyles.text}`}>{report.status}</Text>
          </View>
        </View>

        <Text className="text-sm text-blue-600 font-medium mb-2">{report.category}</Text>
        <Text className="text-gray-600 text-base mb-4" numberOfLines={3}>
          {report.description}
        </Text>

        {/* Botones de acción condicionales basados en roles */}
        <View className="flex-row border-t border-gray-100 pt-3 gap-x-8">
          {canEdit && (
            <TouchableOpacity accessibilityRole="button" className="py-2">
              <Text className="text-blue-600 font-semibold">Editar</Text>
            </TouchableOpacity>
          )}
          {canDelete && (
            <TouchableOpacity accessibilityRole="button" className="py-2">
              <Text className="text-red-600 font-semibold">Eliminar</Text>
            </TouchableOpacity>
          )}
          {canChangeStatus && (
            <TouchableOpacity accessibilityRole="button" className="py-2">
              <Text className="text-purple-600 font-semibold">Cambiar Estado</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};