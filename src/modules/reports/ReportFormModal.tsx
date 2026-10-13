import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { Report, ReportFields, ReportPhoto } from '../../api/reports/reportsApi';

interface ReportFormModalProps {
  visible: boolean;
  report: Report | null;
  onCancel: () => void;
  onSubmit: (fields: ReportFields) => Promise<void>;
}

export const ReportFormModal: React.FC<ReportFormModalProps> = ({
  visible,
  report,
  onCancel,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<ReportPhoto | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(report?.name ?? '');
    setCategory(report?.category ?? '');
    setDescription(report?.description ?? '');
    setPhoto(null);
  }, [report, visible]);

  const handlePickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset) {
        Alert.alert('No se pudo seleccionar la imagen', 'Intenta elegir otra foto.');
        return;
      }

      setPhoto({
        uri: asset.uri,
        name: asset.fileName ?? asset.uri.split('/').pop() ?? 'reporte.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      });
    } catch (error) {
      Alert.alert(
        'No se pudo abrir la galería',
        error instanceof Error ? error.message : 'Intenta de nuevo.'
      );
    }
  };

  const handleSubmit = async () => {
    const fields = {
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      ...(photo ? { photo } : {}),
    };

    if (!fields.name || !fields.category || !fields.description) {
      Alert.alert('Completa los campos', 'Nombre, categoría y descripción son obligatorios.');
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit(fields);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 justify-center bg-black/40 px-6">
        <ScrollView
          className="max-h-[85%] rounded-xl bg-white"
          contentContainerClassName="p-5"
          keyboardShouldPersistTaps="handled"
        >
          <Text className="mb-4 text-xl font-bold text-gray-900">
            {report ? 'Editar reporte' : 'Crear reporte'}
          </Text>

          <TextInput
            className="mb-3 rounded-lg border border-gray-300 p-3 text-base"
            placeholder="Nombre"
            value={name}
            onChangeText={setName}
            maxLength={50}
          />
          <TextInput
            className="mb-3 rounded-lg border border-gray-300 p-3 text-base"
            placeholder="Categoría"
            value={category}
            onChangeText={setCategory}
            maxLength={50}
          />
          <TextInput
            className="mb-4 min-h-28 rounded-lg border border-gray-300 p-3 text-base"
            placeholder="Descripción"
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity
            className="mb-3 self-start rounded-lg border border-blue-200 px-4 py-3"
            onPress={() => void handlePickPhoto()}
            accessibilityRole="button"
          >
            <Text className="font-semibold text-blue-700">
              {photo ? 'Cambiar foto' : 'Adjuntar foto'}
            </Text>
          </TouchableOpacity>
          {photo && (
            <View className="mb-4">
              <Image
                source={{ uri: photo.uri }}
                className="mb-2 h-40 w-full rounded-lg"
                resizeMode="cover"
                accessibilityLabel="Vista previa de la foto del reporte"
              />
              <TouchableOpacity
                className="self-start py-1"
                onPress={() => setPhoto(null)}
                accessibilityRole="button"
              >
                <Text className="font-semibold text-red-600">Quitar foto</Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="flex-row justify-end gap-3">
            <TouchableOpacity className="rounded-lg px-4 py-3" onPress={onCancel}>
              <Text className="font-semibold text-gray-600">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`rounded-lg px-4 py-3 ${isSaving ? 'bg-blue-400' : 'bg-blue-600'}`}
              onPress={handleSubmit}
              disabled={isSaving}
              accessibilityRole="button"
            >
              <Text className="font-semibold text-white">
                {isSaving ? 'Guardando...' : 'Guardar'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};
