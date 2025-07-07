import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import { storageManager } from '../helpers/storage';
import ImageGrid from '../components/ImageGrid';
import Toast from 'react-native-toast-message';
import { useThemedStyles } from '../hooks/useThemedStyles';

const HistoryScreen = () => {
  const { top } = useSafeAreaInsets();
  const paddingTop = top > 0 ? top + 10 : 30;
  const router = useRouter();
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { colors, isDark } = useThemedStyles();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const historyData = await storageManager.getDownloadHistory();
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading history:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load download history'
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const clearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear your download history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageManager.clearDownloadHistory();
              setHistory([]);
              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Download history cleared'
              });
            } catch (error) {
              console.error('Error clearing history:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to clear history'
              });
            }
          }
        }
      ]
    );
  };

  const removeFromHistory = async (imageId) => {
    try {
      await storageManager.removeFromDownloadHistory(imageId);
      setHistory(prev => prev.filter(item => item.id !== imageId));
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Removed from history'
      });
    } catch (error) {
      console.error('Error removing from history:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to remove from history'
      });
    }
  };

  const groupedHistory = history.reduce((groups, item) => {
    const date = new Date(item.downloadedAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {});

  const renderHistorySection = (date, items) => (
    <View key={date} style={styles.historySection}>
      <Text style={[styles.sectionTitle, { color: colors.text, backgroundColor: colors.surface }]}>{date}</Text>
      <View style={styles.historyItems}>
        {items.map((item) => (
          <View key={item.id} style={[styles.historyItem, { borderBottomColor: colors.border }]}>
            <Pressable
              style={styles.historyImageContainer}
              onPress={() => router.push({
                pathname: '/home/image',
                params: { imageData: JSON.stringify(item) }
              })}
            >
              <ImageGrid images={[item]} router={router} columns={1} />
            </Pressable>
            <View style={styles.historyInfo}>
              <Text style={[styles.historyTitle, { color: colors.text }]} numberOfLines={2}>
                {item.tags || 'Untitled'}
              </Text>
              <Text style={[styles.historyDetails, { color: colors.textSecondary }]}>
                {item.imageWidth}x{item.imageHeight} • {item.user}
              </Text>
              <Text style={[styles.historyTime, { color: colors.textSecondary }]}>
                {new Date(item.downloadedAt).toLocaleTimeString()}
              </Text>
            </View>
            <Pressable
              style={[styles.removeButton, { backgroundColor: colors.surface }]}
              onPress={() => removeFromHistory(item.id)}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { paddingTop, backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading download history...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop, backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.surface }]}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Download History</Text>
        {history.length > 0 && (
          <Pressable onPress={clearHistory} style={[styles.clearButton, { backgroundColor: colors.surface }]}>
            <Ionicons name="trash-outline" size={22} color={colors.text} />
          </Pressable>
        )}
      </View>

      {/* Statistics */}
      {history.length > 0 && (
        <View style={[styles.stats, { borderBottomColor: colors.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.accent }]}>{history.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Downloads</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.accent }]}>{Object.keys(groupedHistory).length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Days Active</Text>
          </View>
        </View>
      )}

      {/* History Content */}
      {history.length > 0 ? (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {Object.entries(groupedHistory)
            .sort(([a], [b]) => new Date(b) - new Date(a))
            .map(([date, items]) => renderHistorySection(date, items))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="download" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No downloads yet</Text>
          <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
            Your download history will appear here when you download images
          </Text>
        </View>
      )}
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
  clearButton: {
    padding: 8,
    borderRadius: theme.radius.sm,
  },
  stats: {
    flexDirection: 'row',
    paddingHorizontal: wp(4),
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: hp(2.5),
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: hp(1.6),
    marginTop: 5,
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  historySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: hp(2),
    fontWeight: '600',
    paddingHorizontal: wp(4),
    paddingVertical: 10,
  },
  historyItems: {
    paddingHorizontal: wp(4),
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 12,
  },
  historyImageContainer: {
    width: 60,
    height: 60,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
  },
  historyInfo: {
    flex: 1,
    gap: 2,
  },
  historyTitle: {
    fontSize: hp(1.8),
    fontWeight: '600',
  },
  historyDetails: {
    fontSize: hp(1.6),
  },
  historyTime: {
    fontSize: hp(1.4),
  },
  removeButton: {
    padding: 8,
    borderRadius: theme.radius.sm,
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

export default HistoryScreen;
