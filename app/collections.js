import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import { storageManager } from '../helpers/storage';
import ImageGrid from '../components/ImageGrid';
import Toast from 'react-native-toast-message';
import { useThemedStyles } from '../hooks/useThemedStyles';

const CollectionsScreen = () => {
  const { top } = useSafeAreaInsets();
  const paddingTop = top > 0 ? top + 10 : 30;
  const router = useRouter();
  
  const [collections, setCollections] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const forceUpdateRef = useRef(0);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { colors, isDark } = useThemedStyles();

  useEffect(() => {
    loadCollections();
  }, []);

  // Debug: Log when collections state changes
  useEffect(() => {
    console.log('Collections state updated. Current count:', collections.length);
    console.log('Collections IDs:', collections.map(c => c.id));
    console.log('Refresh trigger:', refreshTrigger);
  }, [collections, refreshTrigger]);

  // Reload collections when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadCollections();
    }, [])
  );

  const loadCollections = async () => {
    try {
      console.log('loadCollections: Starting to load collections...');
      setLoading(true);
      const collectionsData = await storageManager.getCollections();
      console.log('loadCollections: Loaded collections data:', collectionsData);
      console.log('loadCollections: Number of collections:', collectionsData.length);
      console.log('loadCollections: Collection IDs:', collectionsData.map(c => c.id));
      
      // Force state update by creating a new array and triggering refresh
      setCollections([...collectionsData]);
      setRefreshTrigger(prev => prev + 1);
      console.log('loadCollections: State updated with collections');
    } catch (error) {
      console.error('Error loading collections:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load collections'
      });
    } finally {
      setLoading(false);
      console.log('loadCollections: Loading completed');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCollections();
    setRefreshing(false);
  };

  const createCollection = async () => {
    if (!newCollectionName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a collection name'
      });
      return;
    }

    try {
      const collectionId = await storageManager.createCollection(newCollectionName.trim());
      
      // Reload collections to get the updated list
      await loadCollections();
      
      setNewCollectionName('');
      setShowCreateModal(false);
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Collection created successfully'
      });
    } catch (error) {
      console.error('Error creating collection:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to create collection'
      });
    }
  };

  const deleteCollection = async (collectionId) => {
    console.log('Delete collection called with ID:', collectionId);
    console.log('Current collections before delete:', collections.length);
    
    Alert.alert(
      'Delete Collection',
      'Are you sure you want to delete this collection? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            console.log('User confirmed delete for collection:', collectionId);
            try {
              // Delete from storage first
              const success = await storageManager.deleteCollection(collectionId);
              console.log('Storage delete result:', success);
              
              if (success) {
                // Force state update by creating a completely new array
                const updatedCollections = collections.filter(collection => collection.id !== collectionId);
                console.log('Filtering collections, before:', collections.length, 'after:', updatedCollections.length);
                
                // Force multiple state updates to ensure React detects the change
                setCollections(prevCollections => {
                  const newCollections = prevCollections.filter(collection => collection.id !== collectionId);
                  console.log('Functional update: prev length:', prevCollections.length, 'new length:', newCollections.length);
                  return [...newCollections]; // Force new array reference
                });
                
                // Trigger refresh counter to force re-render
                setRefreshTrigger(prev => prev + 1);
                forceUpdateRef.current += 1;
                
                // Force React to re-render by updating both collections and trigger
                setTimeout(() => {
                  setRefreshTrigger(prev => prev + 1);
                }, 50);
                
                // Also force a reload after a short delay to ensure consistency
                setTimeout(() => {
                  console.log('Delayed reload after delete');
                  loadCollections();
                }, 100);
                
                Toast.show({
                  type: 'success',
                  text1: 'Success',
                  text2: 'Collection deleted successfully'
                });
              } else {
                console.log('Storage delete failed');
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: 'Failed to delete collection'
                });
              }
            } catch (error) {
              console.error('Error deleting collection:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to delete collection'
              });
            }
          }
        }
      ]
    );
  };

  const renderCollectionsList = useCallback(() => (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.collectionsGrid} key={`collections-${refreshTrigger}`}>
        {collections.map((collection) => (
          <Pressable
            key={`${collection.id}-${refreshTrigger}`}
            style={[styles.collectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setSelectedCollection(collection)}
          >
            <View style={styles.collectionHeader}>
              <MaterialIcons name="collections" size={24} color={colors.accent} />
              <Pressable
                onPress={(e) => {
                  console.log('Delete button pressed for collection:', collection.id, collection.name);
                  e.stopPropagation();
                  deleteCollection(collection.id);
                }}
                style={styles.deleteButton}
                hitSlop={15} // Increased hit area for easier tapping
              >
                <Ionicons name="trash-outline" size={20} color="#f44336" />
              </Pressable>
            </View>
            <Text style={[styles.collectionName, { color: colors.text }]} numberOfLines={2}>
              {collection && typeof collection.name === 'string' ? collection.name : 'Untitled Collection'}
            </Text>
            <Text style={[styles.collectionCount, { color: colors.textSecondary }]}>
              {Array.isArray(collection?.imageIds) ? collection.imageIds.length : 0} images
            </Text>
            <Text style={[styles.collectionDate, { color: colors.textSecondary }]}>
              Created {collection?.createdAt ? new Date(collection.createdAt).toLocaleDateString() : 'Unknown'}
            </Text>
          </Pressable>
        ))}
      </View>

      {collections.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <MaterialIcons name="collections" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No collections yet</Text>
          <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
            Create your first collection to organize your favorite images
          </Text>
        </View>
      )}
    </ScrollView>
  ), [collections, refreshTrigger, refreshing, colors, loading]);

  const renderCollectionView = () => (
    <View style={styles.collectionView}>
      <View style={styles.collectionViewHeader}>
        <Pressable
          onPress={() => setSelectedCollection(null)}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.collectionViewTitle, { color: colors.text }]} numberOfLines={1}>
          {String(selectedCollection?.name || 'Collection')}
        </Text>
        <Text style={[styles.collectionViewCount, { color: colors.textSecondary, backgroundColor: colors.border }]}>
          {Number(selectedCollection?.imageIds?.length || 0)}
        </Text>
      </View>

      {selectedCollection?.imageIds?.length > 0 ? (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.scrollContainer}
        >
          {/* Note: ImageGrid expects images array, but we only have imageIds */}
          {/* For now, show placeholder until we implement proper image loading */}
          <View style={styles.emptyCollection}>
            <MaterialIcons name="photo-library" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>Collection Images</Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
              {selectedCollection.imageIds.length} images in this collection
            </Text>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyCollection}>
          <MaterialIcons name="photo-library" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No images in this collection</Text>
          <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
            Add images to this collection from the image viewer
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (    <View style={[styles.container, styles.loadingContainer, { paddingTop, backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading collections...</Text>
    </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.surface }]}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>
          {selectedCollection ? String(selectedCollection?.name || 'Collection') : 'Collections'}
        </Text>
        <Pressable
          onPress={() => setShowCreateModal(true)}
          style={[styles.addButton, { backgroundColor: colors.surface }]}
        >
          <Ionicons name="add" size={24} color={colors.text} />
        </Pressable>
      </View>

      {selectedCollection ? renderCollectionView() : renderCollectionsList()}

      {/* Create Collection Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create New Collection</Text>
            <TextInput
              style={[styles.modalInput, { 
                borderColor: colors.border, 
                backgroundColor: colors.background,
                color: colors.text 
              }]}
              placeholder="Enter collection name"
              placeholderTextColor={colors.textSecondary}
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              autoFocus
              maxLength={50}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.border }]}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewCollectionName('');
                }}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.createButton, { backgroundColor: colors.accent }]}
                onPress={createCollection}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: hp(2),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: theme.radius.sm,
  },
  title: {
    fontSize: hp(2.5),
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  addButton: {
    padding: 8,
    borderRadius: theme.radius.sm,
  },
  scrollContainer: {
    padding: wp(4),
    paddingBottom: 80,
  },
  collectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'space-between',
  },
  collectionCard: {
    width: (wp(100) - wp(8) - 15) / 2,
    borderRadius: theme.radius.lg,
    padding: 15,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteButton: {
    padding: 10, // Increased padding for easier touch
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(244, 67, 54, 0.15)', // More visible background
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  collectionName: {
    fontSize: hp(2),
    fontWeight: '600',
    marginBottom: 5,
  },
  collectionCount: {
    fontSize: hp(1.6),
    marginBottom: 5,
  },
  collectionDate: {
    fontSize: hp(1.4),
  },
  collectionView: {
    flex: 1,
  },
  collectionViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: 15,
    borderBottomWidth: 1,
    gap: 15,
  },
  collectionViewTitle: {
    fontSize: hp(2.2),
    fontWeight: '600',
    flex: 1,
  },
  collectionViewCount: {
    fontSize: hp(1.8),
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(8),
    gap: 15,
  },
  emptyCollection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  emptyStateText: {
    fontSize: hp(2.2),
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: hp(1.8),
    textAlign: 'center',
    paddingHorizontal: wp(8),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: theme.radius.lg,
    padding: 20,
    margin: wp(8),
    minWidth: wp(80),
  },
  modalTitle: {
    fontSize: hp(2.2),
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: 15,
    fontSize: hp(1.8),
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  cancelButton: {
    // backgroundColor will be set dynamically
  },
  createButton: {
    // backgroundColor will be set dynamically
  },
  cancelButtonText: {
    fontSize: hp(1.8),
    fontWeight: '600',
  },
  createButtonText: {
    fontSize: hp(1.8),
    color: 'white',
    fontWeight: '600',
  },
});

export default CollectionsScreen;
