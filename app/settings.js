import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp } from '../helpers/common';
import { theme } from '../constants/theme';
import { storageManager } from '../helpers/storage';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { useTheme } from '../contexts/ThemeContext';

const SettingsScreen = () => {
  const router = useRouter();
  const { colors, isDark } = useThemedStyles();
  const { toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    highQualityImages: true,
    autoDownload: false,
    safeSearch: true,
    darkMode: true, // Changed to true for default dark theme
    showImageInfo: true,
    cacheImages: true,
    downloadQuality: 'large',
    gridColumns: 2
  });

  const [cacheSize, setCacheSize] = useState('0 MB');
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [collectionsCount, setCollectionsCount] = useState(0);
  const [confirmModal, setConfirmModal] = useState({ visible: false, title: '', message: '', action: null });

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await storageManager.getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadStats = async () => {
    try {
      const favorites = await storageManager.getFavorites();
      const collections = await storageManager.getCollections();
      setFavoritesCount(favorites.length);
      setCollectionsCount(collections.length);
      
      // Simplified cache size calculation
      setCacheSize('~5 MB');
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await storageManager.updateSettings({ [key]: value });
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const showConfirmation = (title, message, action) => {
    setConfirmModal({ visible: true, title, message, action });
  };

  const hideConfirmation = () => {
    setConfirmModal({ visible: false, title: '', message: '', action: null });
  };

  const handleConfirm = () => {
    if (confirmModal.action) {
      confirmModal.action();
    }
    hideConfirmation();
  };

  const clearCache = () => {
    showConfirmation(
      'Clear Cache',
      'This will delete all cached images. Are you sure you want to continue?',
      async () => {
        try {
          await storageManager.clearCache();
          setCacheSize('0 MB');
          Alert.alert('Success', 'Cache cleared successfully');
        } catch (error) {
          Alert.alert('Error', 'Failed to clear cache');
        }
      }
    );
  };

  const clearAllData = () => {
    showConfirmation(
      'Clear All Data',
      'This will delete all favorites, collections, and settings. This action cannot be undone.',
      async () => {
        try {
          await storageManager.clearCache();
          const defaultSettings = {
            highQualityImages: true,
            autoDownload: false,
            safeSearch: true,
            darkMode: false,
            showImageInfo: true,
            cacheImages: true,
            downloadQuality: 'large',
            gridColumns: 2
          };
          await storageManager.updateSettings(defaultSettings);
          setSettings(defaultSettings);
          setFavoritesCount(0);
          setCollectionsCount(0);
          setCacheSize('0 MB');
          Alert.alert('Success', 'All data cleared successfully');
        } catch (error) {
          Alert.alert('Error', 'Failed to clear data');
        }
      }
    );
  };

  const SettingsSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : colors.text }]}>{title}</Text>
      {children}
    </View>
  );

  const SettingsItem = ({ title, subtitle, type, value, onValueChange, options }) => {
    const renderControl = () => {
      switch (type) {
        case 'switch':
          return (
            <Switch
              value={value}
              onValueChange={onValueChange}
              trackColor={{ false: colors.border, true: '#888888' }} // Using soft gray accent from palette
              thumbColor={value ? '#E0E0E0' : '#B0B0B0'} // Using light/medium gray from palette
            />
          );
        case 'select':
          return (
            <TouchableOpacity onPress={() => {
              Alert.alert(
                title,
                'Select an option',
                options?.map(option => ({
                  text: option.label,
                  onPress: () => onValueChange?.(option.key)
                }))
              );
            }}>
              <Text style={[styles.selectValue, { color: isDark ? '#FFFFFF' : colors.accent }]}>
                {options?.find(opt => opt.key === value)?.label || value}
              </Text>
            </TouchableOpacity>
          );
        default:
          return null;
      }
    };

    return (
      <View style={[
        styles.settingsItem, 
        { 
          backgroundColor: isDark ? '#444444' : colors.surface,
          borderColor: isDark ? '#888888' : 'transparent',
          borderWidth: isDark ? 1 : 0
        }
      ]}>
        <View style={styles.settingsItemContent}>
          <Text style={[styles.settingsItemTitle, { color: isDark ? '#FFFFFF' : colors.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.settingsItemSubtitle, { color: isDark ? '#E0E0E0' : colors.textSecondary }]}>{subtitle}</Text>}
        </View>
        {renderControl()}
      </View>
    );
  };

  const StatCard = ({ title, value }) => (
    <View style={[
      styles.statCard, 
      { 
        backgroundColor: isDark ? '#444444' : colors.surface, 
        borderColor: isDark ? '#888888' : colors.border,
        borderWidth: isDark ? 1 : 0
      }
    ]}>
      <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : colors.accent }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: isDark ? '#E0E0E0' : colors.textSecondary }]}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={true}
        indicatorStyle={isDark ? 'white' : 'default'}
      >
        {/* Image Quality Settings */}
        <SettingsSection title="Image Quality">
          <SettingsItem
            title="High Quality Images"
            subtitle="Download and display full resolution images"
            type="switch"
            value={settings.highQualityImages}
            onValueChange={(value) => updateSetting('highQualityImages', value)}
          />
          
          <SettingsItem
            title="Download Quality"
            subtitle={`Current: ${settings.downloadQuality}`}
            type="select"
            options={[
              { key: 'preview', label: 'Preview (Fast)' },
              { key: 'webformat', label: 'Web Quality (Balanced)' },
              { key: 'large', label: 'High Quality (Slow)' }
            ]}
            value={settings.downloadQuality}
            onValueChange={(value) => updateSetting('downloadQuality', value)}
          />
        </SettingsSection>

        {/* Display Settings */}
        <SettingsSection title="Display">
          <SettingsItem
            title="Dark Mode"
            subtitle="Use dark theme for better viewing"
            type="switch"
            value={isDark}
            onValueChange={toggleTheme}
          />
          
          <SettingsItem
            title="Grid Columns"
            subtitle={`Current: ${settings.gridColumns} columns`}
            type="select"
            options={[
              { key: 1, label: '1 Column' },
              { key: 2, label: '2 Columns' },
              { key: 3, label: '3 Columns' }
            ]}
            value={settings.gridColumns}
            onValueChange={(value) => updateSetting('gridColumns', value)}
          />
          
          <SettingsItem
            title="Show Image Info"
            subtitle="Display likes, downloads, and tags"
            type="switch"
            value={settings.showImageInfo}
            onValueChange={(value) => updateSetting('showImageInfo', value)}
          />
        </SettingsSection>

        {/* Content Settings */}
        <SettingsSection title="Content">
          <SettingsItem
            title="Safe Search"
            subtitle="Filter inappropriate content"
            type="switch"
            value={settings.safeSearch}
            onValueChange={(value) => updateSetting('safeSearch', value)}
          />
        </SettingsSection>

        {/* Storage Settings */}
        <SettingsSection title="Storage">
          <SettingsItem
            title="Cache Images"
            subtitle="Store images locally for faster loading"
            type="switch"
            value={settings.cacheImages}
            onValueChange={(value) => updateSetting('cacheImages', value)}
          />
          
          <SettingsItem
            title="Auto Download"
            subtitle="Automatically download favorited images"
            type="switch"
            value={settings.autoDownload}
            onValueChange={(value) => updateSetting('autoDownload', value)}
          />
        </SettingsSection>

        {/* Statistics */}
        <SettingsSection title="Statistics">
          <View style={styles.statsGrid}>
            <StatCard title="Favorites" value={favoritesCount.toString()} />
            <StatCard title="Collections" value={collectionsCount.toString()} />
            <StatCard title="Cache Size" value={cacheSize} />
          </View>
        </SettingsSection>

        {/* Data Management */}
        <SettingsSection title="Data">
          <TouchableOpacity style={[
            styles.actionButton,
            {
              backgroundColor: isDark ? colors.background : colors.surface,
              borderColor: isDark ? '#FFFFFF' : colors.border,
              borderWidth: isDark ? 1 : 0
            }
          ]} onPress={() => router.push('/favorites')}>
            <Text style={[styles.actionButtonText, { color: isDark ? '#FFFFFF' : colors.text }]}>Manage Favorites</Text>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#FFFFFF' : colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[
            styles.actionButton,
            {
              backgroundColor: isDark ? colors.background : colors.surface,
              borderColor: isDark ? '#FFFFFF' : colors.border,
              borderWidth: isDark ? 1 : 0
            }
          ]} onPress={() => router.push('/collections')}>
            <Text style={[styles.actionButtonText, { color: isDark ? '#FFFFFF' : colors.text }]}>Manage Collections</Text>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#FFFFFF' : colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[
            styles.actionButton,
            {
              backgroundColor: isDark ? colors.background : colors.surface,
              borderColor: isDark ? '#FFFFFF' : colors.border,
              borderWidth: isDark ? 1 : 0
            }
          ]} onPress={() => router.push('/history')}>
            <Text style={[styles.actionButtonText, { color: isDark ? '#FFFFFF' : colors.text }]}>Download History</Text>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#FFFFFF' : colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[
            styles.actionButton, 
            styles.dangerButton,
            {
              backgroundColor: isDark ? '#2D1B1B' : '#FFF5F5',
              borderColor: isDark ? '#ef4444' : '#ef4444',
              borderWidth: 1
            }
          ]} onPress={clearCache}>
            <Text style={[styles.actionButtonText, styles.dangerText]}>Clear Cache</Text>
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
          
          <TouchableOpacity style={[
            styles.actionButton, 
            styles.dangerButton,
            {
              backgroundColor: isDark ? '#2D1B1B' : '#FFF5F5',
              borderColor: isDark ? '#ef4444' : '#ef4444',
              borderWidth: 1
            }
          ]} onPress={clearAllData}>
            <Text style={[styles.actionButtonText, styles.dangerText]}>Clear All Data</Text>
            <Ionicons name="warning-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </SettingsSection>

        <View style={{ height: hp(10) }} />
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={confirmModal.visible}
        transparent
        animationType="fade"
        onRequestClose={hideConfirmation}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: isDark ? '#FFFFFF' : colors.border }]}>
            <View style={styles.modalHeader}>
              <Ionicons 
                name="warning-outline" 
                size={32} 
                color={isDark ? '#FFFFFF' : colors.error} 
              />
              <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : colors.text }]}>
                {confirmModal.title}
              </Text>
            </View>
            
            <Text style={[styles.modalMessage, { color: isDark ? '#B0B0B0' : colors.textSecondary }]}>
              {confirmModal.message}
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: isDark ? '#444444' : colors.border }]}
                onPress={hideConfirmation}
              >
                <Text style={[styles.cancelButtonText, { color: isDark ? '#B0B0B0' : colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grayBG,
  },
  headerTitle: {
    fontSize: hp(3),
    fontWeight: '700',
    color: theme.colors.neutral(0.9),
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: hp(2),
  },
  sectionTitle: {
    fontSize: hp(2.2),
    fontWeight: '700',
    color: theme.colors.neutral(0.6),
    marginLeft: wp(4),
    marginBottom: hp(2.5), // Increased from 1.5 to 2.5 for more gap
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(4),
    marginHorizontal: wp(4),
    marginBottom: hp(1),
    borderRadius: theme.radius.xl,
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: hp(2.2),
    color: theme.colors.neutral(0.9),
    fontWeight: '600',
  },
  settingsItemSubtitle: {
    fontSize: hp(1.8),
    color: theme.colors.neutral(0.6),
    marginTop: 4,
  },
  selectValue: {
    fontSize: hp(1.8),
    color: theme.colors.neutral(0.7),
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: wp(4),
    gap: wp(3),
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.grayBG,
    padding: wp(4),
    borderRadius: theme.radius.xl,
    alignItems: 'center',
  },
  statValue: {
    fontSize: hp(3),
    fontWeight: 'bold',
    color: theme.colors.neutral(0.9),
  },
  statTitle: {
    fontSize: hp(1.6),
    color: theme.colors.neutral(0.6),
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(4),
    marginHorizontal: wp(4),
    marginBottom: hp(1),
    borderRadius: theme.radius.xl,
  },
  dangerButton: {
    // No default styles here - handled dynamically
  },
  actionButtonText: {
    fontSize: hp(2.2),
    color: theme.colors.neutral(0.7),
    fontWeight: '600',
  },
  dangerText: {
    color: '#ef4444',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(6),
  },
  modalContent: {
    width: '100%',
    maxWidth: wp(85),
    borderRadius: theme.radius.xl,
    padding: wp(6),
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: hp(2),
    gap: hp(1),
  },
  modalTitle: {
    fontSize: hp(3),
    fontWeight: '700',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: hp(2.2),
    lineHeight: hp(2.8),
    textAlign: 'center',
    marginBottom: hp(3),
  },
  modalButtons: {
    flexDirection: 'row',
    gap: wp(3),
  },
  modalButton: {
    flex: 1,
    paddingVertical: hp(1.8),
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  confirmButton: {
    backgroundColor: '#ef4444',
  },
  cancelButtonText: {
    fontSize: hp(2.2),
    fontWeight: '700',
  },
  confirmButtonText: {
    fontSize: hp(2.2),
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default SettingsScreen;
