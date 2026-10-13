import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { reportsApi } from './api/reports/reportsApi';
import type { Report, ReportFields } from './api/reports/reportsApi';
import { ReportCard } from './modules/reports/ReportCard';
import { ReportFormModal } from './modules/reports/ReportFormModal';
import { ReportStatusModal } from './modules/reports/ReportStatusModal';
import { useAuth } from './AuthContext';

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
  const { accessToken, currentUser, logout } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [isLoadingMoreReports, setIsLoadingMoreReports] = useState(false);
  const [hasMoreReports, setHasMoreReports] = useState(false);
  const [reportPageNumber, setReportPageNumber] = useState(1);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [isReportFormVisible, setIsReportFormVisible] = useState(false);
  const [reportBeingEdited, setReportBeingEdited] = useState<Report | null>(null);
  const [reportChangingStatus, setReportChangingStatus] = useState<Report | null>(null);

  const tabs = ['Avisos', 'Objetos', 'Chats', 'Perfil'];

  const loadReports = useCallback(async (pageNumber = 1, append = false) => {
    if (!accessToken) {
      setReports([]);
      setIsLoadingReports(false);
      setIsLoadingMoreReports(false);
      setHasMoreReports(false);
      return;
    }

    if (append) {
      setIsLoadingMoreReports(true);
    } else {
      setIsLoadingReports(true);
    }
    setReportsError(null);
    try {
      const page = await reportsApi.list(accessToken, pageNumber);
      setReports((current) => (append ? [...current, ...page.items] : page.items));
      setReportPageNumber(page.pageNumber);
      setHasMoreReports(page.pageNumber < page.totalPages);
    } catch (error) {
      setReportsError(
        error instanceof Error ? error.message : 'No se pudieron cargar los reportes.'
      );
    } finally {
      if (append) {
        setIsLoadingMoreReports(false);
      } else {
        setIsLoadingReports(false);
      }
    }
  }, [accessToken]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const showRequestError = (error: unknown) => {
    Alert.alert(
      'No se pudo completar la operación',
      error instanceof Error ? error.message : 'Inténtalo de nuevo.'
    );
  };

  const handleSaveReport = async (fields: ReportFields) => {
    if (!accessToken) {
      showRequestError(new Error('Inicia sesión para administrar reportes.'));
      return;
    }

    try {
      if (reportBeingEdited) {
        await reportsApi.update(reportBeingEdited.id, fields, accessToken);
      } else {
        await reportsApi.create(fields, accessToken);
      }
      setIsReportFormVisible(false);
      setReportBeingEdited(null);
      await loadReports();
    } catch (error) {
      showRequestError(error);
    }
  };

  const handleDeleteReport = (report: Report) => {
    Alert.alert('Eliminar reporte', `¿Deseas eliminar "${report.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            if (!accessToken) {
              showRequestError(new Error('Inicia sesión para administrar reportes.'));
              return;
            }
            try {
              await reportsApi.delete(report.id, accessToken);
              await loadReports();
            } catch (error) {
              showRequestError(error);
            }
          })();
        },
      },
    ]);
  };

  const handleChangeStatus = async (status: string) => {
    if (!reportChangingStatus) return;
    if (!accessToken) {
      showRequestError(new Error('Inicia sesión para administrar reportes.'));
      return;
    }
    try {
      await reportsApi.update(reportChangingStatus.id, { status }, accessToken);
      setReportChangingStatus(null);
      await loadReports();
    } catch (error) {
      showRequestError(error);
    }
  };

  const openCreateForm = () => {
    setReportBeingEdited(null);
    setIsReportFormVisible(true);
  };

  const openEditForm = (report: Report) => {
    setReportBeingEdited(report);
    setIsReportFormVisible(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo cerrar la sesión en el servidor.';
      Alert.alert('Sesión cerrada localmente', message);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Contenido principal scrolleable */}
    
    <ScrollView 
          className="flex-1"
          contentContainerStyle={{ 
            paddingHorizontal: 16, 
            paddingTop: 60, // <--- Esta es la clave para esquivar la Dynamic Island/Notch
            paddingBottom: 40 
          }}
        >
    <Text className="text-3xl font-bold text-gray-900 mb-6">{activeTab}</Text>

        {/* Pestaña: AVISOS */}
        {activeTab === 'Avisos' && (
          <View>
            <TouchableOpacity
              className="mb-5 self-start rounded-lg bg-blue-600 px-4 py-3"
              onPress={openCreateForm}
              accessibilityRole="button"
            >
              <Text className="font-bold text-white">Crear reporte</Text>
            </TouchableOpacity>

            {isLoadingReports ? (
              <ActivityIndicator className="my-8" size="large" color="#2563eb" />
            ) : reportsError ? (
              <View className="rounded-xl border border-red-200 bg-red-50 p-4">
                <Text className="mb-3 text-red-700">{reportsError}</Text>
                <TouchableOpacity onPress={() => void loadReports()} accessibilityRole="button">
                  <Text className="font-bold text-blue-700">Reintentar</Text>
                </TouchableOpacity>
              </View>
            ) : reports.length === 0 ? (
              <Text className="py-8 text-center text-gray-500">
                Todavía no hay reportes publicados.
              </Text>
            ) : (
              <>
                {reportsError && (
                  <View className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
                    <Text className="mb-3 text-red-700">{reportsError}</Text>
                    <TouchableOpacity
                      onPress={() => void loadReports(reportPageNumber + 1, true)}
                      disabled={isLoadingMoreReports}
                      accessibilityRole="button"
                    >
                      <Text className="font-bold text-blue-700">Reintentar</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {reports.map((report) => (
                  <ReportCard
                    key={String(report.id)}
                    report={report}
                    onEdit={openEditForm}
                    onDelete={handleDeleteReport}
                    onChangeStatus={setReportChangingStatus}
                  />
                ))}
                {hasMoreReports && (
                  <TouchableOpacity
                    className="mb-4 items-center rounded-lg border border-blue-200 py-3"
                    onPress={() => void loadReports(reportPageNumber + 1, true)}
                    disabled={isLoadingMoreReports}
                    accessibilityRole="button"
                  >
                    <Text className="font-semibold text-blue-700">
                      {isLoadingMoreReports ? 'Cargando...' : 'Cargar más reportes'}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
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
          <View className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm items-center">
            {/* Avatar genérico */}
            <View className="w-24 h-24 bg-blue-600 rounded-full items-center justify-center mb-4">
              <Text className="text-white text-3xl font-bold">
                {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            
            {/* Información del usuario conectada al Context API */}
            <Text className="text-xl font-bold text-gray-900 mb-1">{currentUser?.email}</Text>
            <Text className="text-blue-600 font-semibold mb-8">Rol de cuenta: {currentUser?.role}</Text>

            <TouchableOpacity 
              className="bg-red-50 border border-red-200 py-3 px-8 rounded-lg w-full items-center"
              onPress={handleLogout}
              accessibilityRole="button"
            >
              <Text className="text-red-600 font-bold text-base">Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Espaciado al final para que el último elemento no quede detrás de la barra inferior */}
        <View className="h-10" />
      </ScrollView>

      {/* Barra de navegación inferior */}
      <View className="flex-row bg-white border-t border-gray-200 pb-5 pt-3">
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

      <ReportFormModal
        visible={isReportFormVisible}
        report={reportBeingEdited}
        onCancel={() => {
          setIsReportFormVisible(false);
          setReportBeingEdited(null);
        }}
        onSubmit={handleSaveReport}
      />
      <ReportStatusModal
        visible={reportChangingStatus !== null}
        currentStatus={reportChangingStatus?.status ?? null}
        onCancel={() => setReportChangingStatus(null)}
        onSelect={(status) => void handleChangeStatus(status)}
      />
    </View>
  );
};