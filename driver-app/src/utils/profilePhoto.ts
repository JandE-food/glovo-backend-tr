import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';

const persistImage = async (uri: string) => {
  const documentDirectory = FileSystem.documentDirectory;
  if (!documentDirectory) {
    return uri;
  }

  if (uri.startsWith(documentDirectory)) {
    return uri;
  }

  const fileExtensionMatch = uri.match(/\.(\w+)(\?.*)?$/);
  const extension = fileExtensionMatch?.[1] ? `.${fileExtensionMatch[1]}` : '.jpg';
  const destination = `${documentDirectory}cabuk_driver_avatar_${Date.now()}${extension}`;

  await FileSystem.copyAsync({ from: uri, to: destination });
  return destination;
};

const getImageUri = async (result: ImagePicker.ImagePickerResult) => {
  if (result.canceled) {
    return null;
  }

  const uri = result.assets?.[0]?.uri;
  if (!uri) {
    return null;
  }

  return persistImage(uri);
};

export const pickProfilePhotoFromLibrary = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Photo library permission is required to upload a profile photo.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8
  });

  return getImageUri(result);
};

export const pickProfilePhotoFromCamera = async () => {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Camera permission is required to take a profile photo.');
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8
  });

  return getImageUri(result);
};
