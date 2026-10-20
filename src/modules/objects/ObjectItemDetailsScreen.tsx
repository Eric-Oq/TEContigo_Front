import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../AuthContext';
import { contactRequestsApi } from '../../api/contactRequests/contactRequestsApi';
import { matchesApi } from '../../api/matches/matchesApi';
import type { ContactRequest, Match } from '../../api/types';
import type { ObjectItem, ObjectItemKind } from '../../api/objects/objectsApi';

interface ObjectItemDetailsScreenProps {
  item: ObjectItem;
  kind: ObjectItemKind;
  onBack: () => void;
  onOpenRequests: () => void;
}

export const ObjectItemDetailsScreen: React.FC<ObjectItemDetailsScreenProps> = ({
  item,
  kind,
  onBack,
  onOpenRequests,
}) => {
  const { accessToken, currentUser } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = toNumber(currentUser?.id);
  const itemId = toNumber(item.id);
  const owner = userId !== null && userId === toNumber(item.userId);
  const found = kind === 'found';
  const pendingRequest = requests.find((request) =>
    request.requesterId === userId &&
    request.foundItem.id === itemId &&
    request.status === 'Pendiente'
  );
  const receivedRequests = requests.filter((request) =>
    request.foundItem.id === itemId &&
    request.foundItem.userId === userId &&
    request.status === 'Pendiente'
  );
  const active = normalizeStatus(item.status) === 'ACTIVO';
  const canRequestContact =
    found && !owner && active && !pendingRequest && currentUser?.role === 'USER';

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const [allMatches, requestList] = await Promise.all([
        loadAllMatches(accessToken),
        found ? contactRequestsApi.getAll(accessToken) : Promise.resolve([]),
      ]);
      setMatches(allMatches.filter((match) =>
        (kind === 'lost' ? match.lostItem.id : match.foundItem.id) === itemId
      ));
      setRequests(requestList);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudieron cargar los detalles.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, found, itemId, kind]);

  useEffect(() => {
    void load();
  }, [load]);

  const createRequest = () => {
    if (!accessToken || itemId === null || acting || !canRequestContact) return;
    Alert.alert(
      'Solicitar contacto',
      `¿Quieres pedir contacto a quien encontró "${item.article}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar solicitud',
          onPress: () => {
            void (async () => {
              setActing(true);
              try {
                await contactRequestsApi.create({ foundItemId: itemId }, accessToken);
                await load();
              } catch (reason) {
                Alert.alert(
                  'No se pudo enviar la solicitud',
                  reason instanceof Error ? reason.message : 'Inténtalo de nuevo.'
                );
              } finally {
                setActing(false);
              }
            })();
          },
        },
      ]
    );
  };

  const cancelRequest = async () => {
    if (!accessToken || !pendingRequest || acting) return;
    setActing(true);
    try {
      await contactRequestsApi.cancel(pendingRequest.id, accessToken);
      await load();
    } catch (reason) {
      Alert.alert(
        'No se pudo cancelar la solicitud',
        reason instanceof Error ? reason.message : 'Inténtalo de nuevo.'
      );
    } finally {
      setActing(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-4 pt-4">
        <TouchableOpacity onPress={onBack} className="mr-3 py-2" accessibilityRole="button">
          <Text className="font-semibold text-blue-600">‹ Atrás</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-blue-900">
          {found ? 'Objeto encontrado' : 'Objeto perdido'}
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator className="my-8" size="large" color="#2563eb" />
      ) : error ? (
        <View className="m-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <Text className="mb-3 text-red-700">{error}</Text>
          <TouchableOpacity onPress={() => void load()} accessibilityRole="button">
            <Text className="font-bold text-blue-700">Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <View className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {item.photoUrl && (
              <Image source={{ uri: item.photoUrl }} className="h-56 w-full bg-gray-100" resizeMode="cover" />
            )}
            <View className="p-4">
              <Text className="text-xl font-bold text-gray-900">{item.article}</Text>
              <Text className="mt-1 font-semibold text-blue-600">{item.category}</Text>
              <Text className="mt-3 text-gray-600">Color: {item.color}</Text>
              <Text className="mt-1 text-gray-600">Lugar: {item.location}</Text>
              <Text className="mt-2 text-gray-600">{item.description}</Text>
              <Text className="mt-3 text-sm text-gray-500">Estado: {item.status}</Text>
            </View>
          </View>

          {found && owner && (
            <TouchableOpacity
              className="mt-4 items-center rounded-lg bg-blue-600 px-4 py-3"
              onPress={onOpenRequests}
              accessibilityRole="button"
            >
              <Text className="font-bold text-white">
                Ver solicitudes recibidas{receivedRequests.length ? ` (${receivedRequests.length})` : ''}
              </Text>
            </TouchableOpacity>
          )}

          {canRequestContact && (
            <TouchableOpacity
              className={`mt-4 items-center rounded-lg px-4 py-3 ${acting ? 'bg-blue-400' : 'bg-blue-600'}`}
              onPress={createRequest}
              disabled={acting}
              accessibilityRole="button"
            >
              <Text className="font-bold text-white">
                {acting ? 'Enviando…' : 'Solicitar contacto'}
              </Text>
            </TouchableOpacity>
          )}

          {found && pendingRequest && (
            <View className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <Text className="mb-3 text-center font-semibold text-blue-800">Solicitud enviada</Text>
              <TouchableOpacity
                className="items-center rounded-lg border border-blue-200 bg-white py-3"
                onPress={() => void cancelRequest()}
                disabled={acting}
                accessibilityRole="button"
              >
                <Text className="font-semibold text-blue-700">
                  {acting ? 'Cancelando…' : 'Cancelar solicitud'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {found && !owner && !active && (
            <Text className="mt-4 text-center text-gray-500">
              Este objeto ya no está activo y no puede recibir solicitudes.
            </Text>
          )}
          {found && owner && receivedRequests.length === 0 && (
            <Text className="mt-3 text-center text-gray-500">
              No hay solicitudes de contacto pendientes para este objeto.
            </Text>
          )}

          <Text className="mb-3 mt-6 text-lg font-bold text-blue-900">Posibles coincidencias</Text>
          {matches.length === 0 ? (
            <Text className="text-center text-gray-500">No hay matches asociados a este objeto.</Text>
          ) : matches.map((match) => (
            <View key={match.id} className="mb-3 rounded-xl border border-gray-200 bg-white p-4">
              <Text className="font-semibold text-gray-900">
                {kind === 'lost' ? match.foundItem.article : match.lostItem.article}
              </Text>
              <Text className="mt-1 text-sm text-gray-500">
                Posible coincidencia del {Math.round(match.matchPercentage)}% · {match.status}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

function toNumber(value: string | number | undefined): number | null {
  if (value === undefined) return null;
  const number = Number(value);
  return Number.isInteger(number) ? number : null;
}

function normalizeStatus(value: string): string {
  return value.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

async function loadAllMatches(token: string): Promise<Match[]> {
  const firstPage = await matchesApi.getAll(token, 1, 50);
  const matches = [...firstPage.items];

  for (let pageNumber = firstPage.pageNumber + 1; pageNumber <= firstPage.totalPages; pageNumber += 1) {
    const page = await matchesApi.getAll(token, pageNumber, firstPage.pageSize);
    matches.push(...page.items);
  }

  return matches;
}
