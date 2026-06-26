import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';

const persistImage = async (uri: string): Promise<string> => {
  try {
    console.log('Persisting image from URI:', uri);
    
    // Check if URI is already in document directory
    if (uri.startsWith(FileSystem.documentDirectory || '')) {
      console.log('URI is already in document directory:', uri);
      return uri;
    }

    // Extract file extension
    const fileExtensionMatch = uri.match(/\.(\w+)(\?.*)?$/);
    const extension = fileExtensionMatch?.[1] ? `.${fileExtensionMatch[1]}` : '.jpg';
    
    // Create unique filename
    const timestamp = Date.now();
    const destination = `${FileSystem.documentDirectory}cabuk_driver_avatar_${timestamp}${extension}`;
    
    console.log('Copying image to:', destination);
    
    // Copy the file
    await FileSystem.copyAsync({ 
      from: uri, 
      to: destination 
    });
    
    // Verify the file was copied
    const fileInfo = await FileSystem.getInfoAsync(destination);
    if (!fileInfo.exists) {
      throw new Error('Failed to copy image file');
    }
    
    console.log('Image persisted successfully:', destination);
    return destination;
  } catch (error) {
    console.error('Error persisting image:', error);
    throw new Error(`Failed to save profile photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const getImageUri = async (result: ImagePicker.ImagePickerResult): Promise<string | null> => {
  if (result.canceled) {
    console.log('Image picker was canceled');
    return null;
  }

  const uri = result.assets?.[0]?.uri;
  if (!uri) {
    console.warn('No URI found in image picker result');
    return null;
  }

  console.log('Got image URI from picker:', uri);
  return persistImage(uri);
};

export const pickProfilePhotoFromLibrary = async (): Promise<string | null> => {
  try {
    console.log('Requesting media library permissions...');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permission.granted) {
      throw new Error('Photo library permission is required to upload a profile photo.');
    }

    console.log('Launching image library...');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    });

    return getImageUri(result);
  } catch (error) {
    console.error('Error picking photo from library:', error);
    throw error;
  }
};

export const pickProfilePhotoFromCamera = async (): Promise<string | null> => {
  try {
    console.log('Requesting camera permissions...');
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    
    if (!permission.granted) {
      throw new Error('Camera permission is required to take a profile photo.');
    }

    console.log('Launching camera...');
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    });

    return getImageUri(result);
  } catch (error) {
    console.error('Error picking photo from camera:', error);
    throw error;
  }
};

/**
 * Checks if a profile photo file exists at the given URI
 */
export const checkProfilePhotoExists = async (uri: string): Promise<boolean> => {
  try {
    if (!uri || !uri.trim()) {
      return false;
    }
    
    const fileInfo = await FileSystem.getInfoAsync(uri);
    return fileInfo.exists;
  } catch (error) {
    console.error('Error checking profile photo:', error);
    return false;
  }
};

/**
 * Cleans up old profile photos from the document directory
 * Keeps only the most recent N photos
 */
export const cleanupOldProfilePhotos = async (keepRecentCount: number = 5): Promise<void> => {
  try {
    console.log('Cleaning up old profile photos...');
    
    // List files in document directory
    const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory || '');
    
    // Filter for profile photo files
    const profilePhotos = files
      .filter(file => file.startsWith('cabuk_driver_avatar_'))
      .map(file => ({
        name: file,
        path: `${FileSystem.documentDirectory}${file}`,
        timestamp: parseInt(file.match(/cabuk_driver_avatar_(\d+)/)?.[1] || '0')
      }))
      .sort((a, b) => b.timestamp - a.timestamp); // Sort by timestamp descending
    
    // Delete old photos (keep only the most recent ones)
    const photosToDelete = profilePhotos.slice(keepRecentCount);
    
    for (const photo of photosToDelete) {
      try {
        await FileSystem.deleteAsync(photo.path);
        console.log('Deleted old profile photo:', photo.name);
      } catch (deleteError) {
        console.error('Error deleting photo:', photo.name, deleteError);
      }
    }
    
    console.log(`Cleanup complete. Kept ${Math.min(keepRecentCount, profilePhotos.length)} photos.`);
  } catch (error) {
    console.error('Error during profile photo cleanup:', error);
  }
};
