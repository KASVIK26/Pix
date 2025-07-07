import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { wp, hp } from '../helpers/common';
import { theme } from '../constants/theme';
import { storageManager } from '../helpers/storage';
import ImageGrid from '../components/ImageGrid';
import { useThemedStyles } from '../hooks/useThemedStyles';

const FavoritesScreen = () => {
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteButtons, setShowDeleteButtons] = useState(false);
  const { colors, isDark } = useThemedStyles();

  useEffect(() => {
    loadFavorites();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const favoriteImages = await storageManager.getFavorites();
      setFavorites(favoriteImages);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const handleFavoriteToggle = (imageId, isFavorited) => {
    if (!isFavorited) {
      // Remove the image from favorites list instantly
      setFavorites(prev => prev.filter(img => img.id.toString() !== imageId));
    }
  };

  const deleteFavorite = async (imageId) => {
    try {
      await storageManager.removeFromFavorites(imageId.toString());
      setFavorites(prev => prev.filter(img => img.id.toString() !== imageId.toString()));
    } catch (error) {
      console.error('Error deleting favorite:', error);
    }
  };

  const clearAllFavorites = () => {
    Alert.alert(
      'Clear All Favorites',
      'Are you sure you want to remove all favorite images?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageManager.clearFavorites();
              setFavorites([]);
            } catch (error) {
              console.error('Error clearing favorites:', error);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading favorites...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={[styles.backButton, { backgroundColor: colors.surface }]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.title, { color: colors.text }]}>Favorites</Text>
        
        {favorites.length > 0 && (
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              onPress={() => setShowDeleteButtons(!showDeleteButtons)}
              style={[styles.editButton, { backgroundColor: colors.surface }]}
            >
              <Ionicons name={showDeleteButtons ? "checkmark" : "create-outline"} size={22} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={clearAllFavorites}
              style={[styles.clearButton, { backgroundColor: colors.surface }]}
            >
              <Ionicons name="trash-outline" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content */}
      {favorites.length > 0 ? (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {favorites.length} favorite image{favorites.length !== 1 ? 's' : ''}
          </Text>
          <ImageGrid 
            images={favorites} 
            router={router} 
            onFavoriteToggle={handleFavoriteToggle}
            showDeleteButton={showDeleteButtons}
            onDelete={deleteFavorite}
            key={favorites.length} 
          />
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="favorite-border" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyStateText, { color: colors.text }]}>No favorites yet</Text>
          <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
            Tap the heart icon on any image to add it to your favorites
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
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
    paddingVertical: 15,
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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: theme.radius.sm,
  },
  clearButton: {
    padding: 8,
    borderRadius: theme.radius.sm,
  },
  scrollContainer: {
    padding: wp(4),
    paddingBottom: 80,
  },
  subtitle: {
    fontSize: hp(1.8),
    marginBottom: 15,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    paddingHorizontal: wp(8),
  },
  emptyStateText: {
    fontSize: hp(2.2),
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: hp(1.8),
    textAlign: 'center',
  },
});

export default FavoritesScreen;
