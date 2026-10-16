import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../AuthContext';
import {
  objectsApi,
  type ObjectItem,
  type ObjectItemFields,
  type ObjectItemKind,
} from '../../api/objects/objectsApi';
import { ObjectItemFormModal } from './ObjectItemFormModal';
import { FoundItemCard } from './foundItems/FoundItemCard';
import { LostItemCard } from './lostItems/LostItemCard';

interface ObjectItemsScreenProps {
  kind: ObjectItemKind;
}

export const ObjectItemsScreen: React.FC<ObjectItemsScreenProps> = ({ kind }) => {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<ObjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [itemBeingEdited, setItemBeingEdited] = useState<ObjectItem | null>(null);

  const isLost = kind === 'lost';
  const itemType = isLost ? 'perdido' : 'encontrado';
  const title = isLost ? 'Objetos perdidos' : 'Objetos encontrados';

  const loadItems = useCallback(async (requestedPage = 1, append = false) => {
    if (!accessToken) {
      setItems([]);
      setIsLoading(false);
      setIsLoadingMore(false);
      setHasMore(false);
      return;
    }

    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const page = await objectsApi.list(kind, accessToken, requestedPage);
      setItems((current) => (append ? [...current, ...page.items] : page.items));
      setPageNumber(page.pageNumber);
      setHasMore(page.pageNumber < page.totalPages);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudieron cargar los objetos.'
      );
    } finally {
      if (append) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [accessToken, kind]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const showRequestError = (error: unknown) => {
    Alert.alert(
      'No se pudo completar la operación',
      error instanceof Error ? error.message : 'Inténtalo de nuevo.'
    );
  };

  const handleSave = async (fields: ObjectItemFields) => {
    if (!accessToken) {
      showRequestError(new Error('Inicia sesión para administrar objetos.'));
      return;
    }

    try {
      if (itemBeingEdited) {
        await objectsApi.update(kind, itemBeingEdited.id, fields, accessToken);
      } else {
        await objectsApi.create(kind, fields, accessToken);
      }
      setIsFormVisible(false);
      setItemBeingEdited(null);
      await loadItems();
    } catch (error) {
      showRequestError(error);
    }
  };

  const handleDelete = (item: ObjectItem) => {
    Alert.alert('Eliminar objeto', `¿Deseas eliminar "${item.article}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            if (!accessToken) {
              showRequestError(new Error('Inicia sesión para administrar objetos.'));
              return;
            }
            try {
              await objectsApi.delete(kind, item.id, accessToken);
              await loadItems();
            } catch (error) {
              showRequestError(error);
            }
          })();
        },
      },
    ]);
  };

  const openCreateForm = () => {
    setItemBeingEdited(null);
    setIsFormVisible(true);
  };

  const openEditForm = (item: ObjectItem) => {
    setItemBeingEdited(item);
    setIsFormVisible(true);
  };

  return (
    <View>
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-gray-900">{title}</Text>
        <TouchableOpacity
          className="rounded-lg bg-blue-600 px-4 py-3"
          onPress={openCreateForm}
          accessibilityRole="button"
        >
          <Text className="font-bold text-white">Publicar</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator className="my-8" size="large" color="#2563eb" />
      ) : errorMessage && items.length === 0 ? (
        <View className="rounded-xl border border-red-200 bg-red-50 p-4">
          <Text className="mb-3 text-red-700">{errorMessage}</Text>
          <TouchableOpacity onPress={() => void loadItems()} accessibilityRole="button">
            <Text className="font-bold text-blue-700">Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : items.length === 0 ? (
        <Text className="py-8 text-center text-gray-500">
          Todavía no hay objetos {itemType === 'perdido' ? 'perdidos' : 'encontrados'}.
        </Text>
      ) : (
        <>
          {errorMessage && (
            <View className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <Text className="mb-3 text-red-700">{errorMessage}</Text>
              <TouchableOpacity
                onPress={() => void loadItems(pageNumber + 1, true)}
                disabled={isLoadingMore}
                accessibilityRole="button"
              >
                <Text className="font-bold text-blue-700">Reintentar</Text>
              </TouchableOpacity>
            </View>
          )}
          {items.map((item) =>
            isLost ? (
              <LostItemCard
                key={String(item.id)}
                item={item}
                onEdit={openEditForm}
                onDelete={handleDelete}
              />
            ) : (
              <FoundItemCard
                key={String(item.id)}
                item={item}
                onEdit={openEditForm}
                onDelete={handleDelete}
              />
            )
          )}
          {hasMore && (
            <TouchableOpacity
              className="mb-4 items-center rounded-lg border border-blue-200 py-3"
              onPress={() => void loadItems(pageNumber + 1, true)}
              disabled={isLoadingMore}
              accessibilityRole="button"
            >
              <Text className="font-semibold text-blue-700">
                {isLoadingMore ? 'Cargando...' : 'Cargar más objetos'}
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}

      <ObjectItemFormModal
        visible={isFormVisible}
        item={itemBeingEdited}
        itemType={itemType}
        onCancel={() => {
          setIsFormVisible(false);
          setItemBeingEdited(null);
        }}
        onSubmit={handleSave}
      />
    </View>
  );
};
