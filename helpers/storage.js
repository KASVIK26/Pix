import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

class StorageManager {
  // Favorites Management
  async getFavorites() {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  async addToFavorites(image) {
    try {
      const favorites = await this.getFavorites();
      const savedImage = {
        ...image,
        savedAt: new Date().toISOString()
      };
      
      const updatedFavorites = [...favorites, savedImage];
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      return true;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return false;
    }
  }

  async removeFromFavorites(imageId) {
    try {
      const favorites = await this.getFavorites();
      const updatedFavorites = favorites.filter(img => img.id.toString() !== imageId.toString());
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  }

  async isFavorite(imageId) {
    try {
      const favorites = await this.getFavorites();
      return favorites.some(img => img.id.toString() === imageId.toString());
    } catch (error) {
      return false;
    }
  }

  // Collections Management
  async getCollections() {
    try {
      const collections = await AsyncStorage.getItem('collections');
      return collections ? JSON.parse(collections) : [];
    } catch (error) {
      console.error('Error getting collections:', error);
      return [];
    }
  }

  async createCollection(name) {
    try {
      const collections = await this.getCollections();
      const newCollection = {
        id: Date.now().toString(),
        name,
        imageIds: [],
        createdAt: new Date().toISOString()
      };
      
      const updatedCollections = [...collections, newCollection];
      await AsyncStorage.setItem('collections', JSON.stringify(updatedCollections));
      return newCollection.id;
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  }

  async addToCollection(collectionId, imageId) {
    try {
      const collections = await this.getCollections();
      const updatedCollections = collections.map(collection => {
        if (collection.id === collectionId) {
          return {
            ...collection,
            imageIds: [...collection.imageIds, imageId]
          };
        }
        return collection;
      });
      
      await AsyncStorage.setItem('collections', JSON.stringify(updatedCollections));
      return true;
    } catch (error) {
      console.error('Error adding to collection:', error);
      return false;
    }
  }

  async deleteCollection(collectionId) {
    console.log('StorageManager: deleteCollection called with ID:', collectionId);
    try {
      const collections = await this.getCollections();
      console.log('StorageManager: Current collections:', collections.length);
      const updatedCollections = collections.filter(collection => collection.id !== collectionId);
      console.log('StorageManager: Updated collections:', updatedCollections.length);
      await AsyncStorage.setItem('collections', JSON.stringify(updatedCollections));
      console.log('StorageManager: Collections saved to storage');
      return true;
    } catch (error) {
      console.error('Error deleting collection:', error);
      return false;
    }
  }

  // Settings Management
  async getSettings() {
    try {
      const settings = await AsyncStorage.getItem('settings');
      const defaultSettings = {
        highQualityImages: true,
        autoDownload: false,
        safeSearch: true,
        darkMode: true, // Changed to true for default dark theme
        showImageInfo: true,
        cacheImages: true,
        downloadQuality: 'large',
        gridColumns: 2
      };
      
      return settings ? { ...defaultSettings, ...JSON.parse(settings) } : defaultSettings;
    } catch (error) {
      console.error('Error getting settings:', error);
      return {
        highQualityImages: true,
        autoDownload: false,
        safeSearch: true,
        darkMode: false,
        showImageInfo: true,
        cacheImages: true,
        downloadQuality: 'large',
        gridColumns: 2
      };
    }
  }

  async updateSettings(newSettings) {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...newSettings };
      await AsyncStorage.setItem('settings', JSON.stringify(updatedSettings));
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  }

  // Download History
  async addToDownloadHistory(image) {
    try {
      const history = await AsyncStorage.getItem('downloadHistory');
      const downloads = history ? JSON.parse(history) : [];
      const downloadEntry = {
        ...image,
        downloadedAt: new Date().toISOString()
      };
      
      const updatedHistory = [downloadEntry, ...downloads].slice(0, 100); // Keep last 100
      await AsyncStorage.setItem('downloadHistory', JSON.stringify(updatedHistory));
      return true;
    } catch (error) {
      console.error('Error adding to download history:', error);
      return false;
    }
  }

  async getDownloadHistory() {
    try {
      const history = await AsyncStorage.getItem('downloadHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      return [];
    }
  }

  // Cache Management
  async cacheImage(imageUrl, imageId) {
    try {
      const fileUri = `${FileSystem.documentDirectory}cached_${imageId}.jpg`;
      const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);
      return downloadResult.uri;
    } catch (error) {
      console.error('Error caching image:', error);
      return null;
    }
  }

  async getCachedImagePath(imageId) {
    try {
      const fileUri = `${FileSystem.documentDirectory}cached_${imageId}.jpg`;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      return fileInfo.exists ? fileUri : null;
    } catch (error) {
      return null;
    }
  }

  async clearCache() {
    try {
      const cacheDir = FileSystem.documentDirectory;
      const files = await FileSystem.readDirectoryAsync(cacheDir);
      const cacheFiles = files.filter(file => file.startsWith('cached_'));
      
      for (const file of cacheFiles) {
        await FileSystem.deleteAsync(`${cacheDir}${file}`);
      }
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }
}

export const storageManager = new StorageManager();
export default storageManager;
