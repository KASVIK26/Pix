import { BlurView } from 'expo-blur';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator, Pressable, Alert, Dimensions, Modal, ScrollView, TextInput } from 'react-native';
import { hp, wp } from '../../helpers/common';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { theme } from '../../constants/theme';
import { Octicons, Ionicons, MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Toast from 'react-native-toast-message';
import ImageViewer from 'react-native-image-zoom-viewer';
import { storageManager } from '../../helpers/storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ImageScreen = () => {
    const router = useRouter();
    const item = useLocalSearchParams();
    
    // Use higher quality image URLs
    const getImageUrl = (size = 'large') => {
        switch (size) {
            case 'fullHD':
                return item?.fullHDURL || item?.largeImageURL || item?.webformatURL;
            case 'large':
                return item?.largeImageURL || item?.webformatURL;
            case 'web':
                return item?.webformatURL;
            default:
                return item?.webformatURL;
        }
    };

    const [imageQuality, setImageQuality] = useState('large');
    const [showFullscreen, setShowFullscreen] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const [collections, setCollections] = useState([]);
    const [selectedCollections, setSelectedCollections] = useState([]);
    const uri = getImageUrl(imageQuality);

    const fileName = item?.previewURL?.split('/').pop();
    const imageUrl = getImageUrl('fullHD'); // Use highest quality for download
    const filePath = `${FileSystem.documentDirectory}${fileName}`;
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        loadFavoriteStatus();
        loadCollections();
    }, []);

    const loadFavoriteStatus = async () => {
        try {
            const favorites = await storageManager.getFavorites();
            const isImageFavorite = favorites.some(fav => fav.id === item.id);
            setIsFavorite(isImageFavorite);
        } catch (error) {
            console.error('Error loading favorite status:', error);
        }
    };

    const loadCollections = async () => {
        try {
            const collectionsData = await storageManager.getCollections();
            setCollections(collectionsData);
            
            // Check which collections already contain this image
            const imageCollections = collectionsData.filter(collection => 
                collection.images?.some(img => img.id === item.id)
            ).map(col => col.id);
            setSelectedCollections(imageCollections);
        } catch (error) {
            console.error('Error loading collections:', error);
        }
    };

    const toggleFavorite = async () => {
        try {
            if (isFavorite) {
                await storageManager.removeFromFavorites(item.id);
                setIsFavorite(false);
                showToast('Removed from favorites');
            } else {
                await storageManager.addToFavorites(item);
                setIsFavorite(true);
                showToast('Added to favorites');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            showToast('Failed to update favorites');
        }
    };

    const handleCollectionToggle = async (collectionId) => {
        try {
            const collection = collections.find(col => col.id === collectionId);
            if (!collection) return;

            const isSelected = selectedCollections.includes(collectionId);
            
            if (isSelected) {
                await storageManager.removeFromCollection(collectionId, item.id);
                setSelectedCollections(prev => prev.filter(id => id !== collectionId));
                showToast(`Removed from ${collection.name}`);
            } else {
                await storageManager.addToCollection(collectionId, item);
                setSelectedCollections(prev => [...prev, collectionId]);
                showToast(`Added to ${collection.name}`);
            }
        } catch (error) {
            console.error('Error toggling collection:', error);
            showToast('Failed to update collection');
        }
    };
    const onLoad = () => {
        setStatus('');
    }

    const toggleFullscreen = () => {
        setShowFullscreen(!showFullscreen);
    };

    const toggleQuality = () => {
        const qualities = ['web', 'large', 'fullHD'];
        const currentIndex = qualities.indexOf(imageQuality);
        const nextIndex = (currentIndex + 1) % qualities.length;
        setImageQuality(qualities[nextIndex]);
    };
    const handleDownloadImage = async () => {
        if (Platform.OS === 'web') {
            const anchor = document.createElement('a');
            anchor.href = imageUrl;
            anchor.target = "_blank";
            anchor.download = fileName || 'download';
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            
            // Record download in history
            await storageManager.addToDownloadHistory(item);
            showToast('Download started');
        } else {
            setStatus('downloading');
            let uri = await downloadfile();
            if (uri) {
                await storageManager.addToDownloadHistory(item);
                showToast('Downloaded Successfully');
            }
        }
    }
    const handleShareImage = async () => {
        if (Platform.OS === 'web') {
            showToast('Link Copied')
        }else{
            setStatus('sharing');
        let uri = await downloadfile();
        if (uri) {
            await Sharing.shareAsync(uri);
        }

        }
        

    }
    const downloadfile = async () => {
        try {
            const { uri } = await FileSystem.downloadAsync(imageUrl, filePath);
            console.log(uri);
            setStatus('');
            return uri;

        } catch (err) {
            console.log(err.message);
            setStatus('');
            Alert.alert(err.message);
            return null;
        }
    }
    const showToast = (message) => {
        Toast.show({
          type: 'success',
          text1: message,
         position: 'bottom',

        });
      }
      const toastConfig = {
        success: ({text1,props, ...rest }) => (
          
            <View style={styles.toast}>
              <Text style={styles.toastText}>{text1}</Text>
            </View>
          
        )
      }
    const getSize = () => {
        const aspectRatio = item?.imageWidth / item?.imageHeight;
        let maxWidth, maxHeight;
        
        if (Platform.OS === 'web') {
            maxWidth = Math.min(screenWidth * 0.8, 800);
            maxHeight = Math.min(screenHeight * 0.7, 600);
        } else {
            maxWidth = wp(85);
            maxHeight = hp(70);
        }

        let calculatedHeight = maxWidth / aspectRatio;
        let calculatedWidth = maxWidth;

        // If calculated height exceeds max height, adjust width
        if (calculatedHeight > maxHeight) {
            calculatedHeight = maxHeight;
            calculatedWidth = maxHeight * aspectRatio;
        }

        return {
            width: calculatedWidth,
            height: calculatedHeight
        }
    }

    const getQualityLabel = () => {
        switch (imageQuality) {
            case 'fullHD': return 'HD';
            case 'large': return 'HQ';
            case 'web': return 'SD';
            default: return 'SD';
        }
    };

    const images = [{
        url: getImageUrl('fullHD'),
        props: {
            source: { uri: getImageUrl('fullHD') }
        }
    }];

    if (showFullscreen) {
        return (
            <View style={styles.fullscreenContainer}>
                <ImageViewer 
                    imageUrls={images}
                    index={0}
                    onSwipeDown={() => setShowFullscreen(false)}
                    enableSwipeDown={true}
                    backgroundColor="rgba(0,0,0,0.9)"
                    enableImageZoom={true}
                    saveToLocalByLongPress={false}
                    onCancel={() => setShowFullscreen(false)}
                    renderHeader={() => (
                        <View style={styles.fullscreenHeader}>
                            <Pressable style={styles.headerButton} onPress={() => setShowFullscreen(false)}>
                                <Octicons name="x" size={24} color={theme.colors.white} />
                            </Pressable>
                        </View>
                    )}
                    renderFooter={() => (
                        <View style={styles.fullscreenFooter}>
                            <View style={styles.buttons}>
                                <Animated.View entering={FadeInDown.springify()}>
                                    {status == 'downloading' ? (
                                        <View style={styles.button}>
                                            <ActivityIndicator size='small' color={theme.colors.white} />
                                        </View>
                                    ) : (
                                        <Pressable style={styles.button} onPress={handleDownloadImage}>
                                            <Octicons name="download" size={24} color={theme.colors.white} />
                                        </Pressable>
                                    )}
                                </Animated.View>
                                <Animated.View entering={FadeInDown.springify().delay(100)}>
                                    {status == 'sharing' ? (
                                        <View style={styles.button}>
                                            <ActivityIndicator size='small' color={theme.colors.white} />
                                        </View>
                                    ) : (
                                        <Pressable style={styles.button} onPress={handleShareImage}>
                                            <Octicons name="share" size={22} color={theme.colors.white} />
                                        </Pressable>
                                    )}
                                </Animated.View>
                            </View>
                        </View>
                    )}
                />
                <Toast config={toastConfig} visibilityTime={2500}/>
            </View>
        );
    }
    return (
        <BlurView
            style={styles.container}
            tint='dark'
            intensity={60}
        >
            <View style={styles.imageContainer}>
                <View style={[styles.imageWrapper, getSize()]}>
                    <View style={styles.loading}>
                        {status == 'loading' && <ActivityIndicator size='large' color={theme.colors.white} />}
                    </View>
                    <Pressable onPress={toggleFullscreen} style={getSize()}>
                        <Image
                            transition={200}
                            style={[styles.image, getSize()]}
                            source={{ uri }}
                            onLoad={onLoad}
                            contentFit="contain"
                        />
                    </Pressable>
                    
                    {/* Quality badge */}
                    <View style={styles.qualityBadge}>
                        <Text style={styles.qualityText}>{getQualityLabel()}</Text>
                    </View>
                </View>
            </View>

            {/* Control buttons - always visible */}
            <View style={styles.controlsContainer}>
                <View style={styles.topControls}>
                    <Animated.View entering={FadeInDown.springify()}>
                        <Pressable style={styles.button} onPress={() => router.back()}>
                            <Octicons name="x" size={24} color={theme.colors.white} />
                        </Pressable>
                    </Animated.View>
                    <View style={styles.topRightControls}>
                        <Animated.View entering={FadeInDown.springify().delay(25)}>
                            <Pressable 
                                style={[styles.button, isFavorite && styles.favoriteButton]} 
                                onPress={toggleFavorite}
                            >
                                <Ionicons 
                                    name={isFavorite ? "heart" : "heart-outline"} 
                                    size={22} 
                                    color={isFavorite ? theme.colors.rose : theme.colors.white} 
                                />
                            </Pressable>
                        </Animated.View>
                        <Animated.View entering={FadeInDown.springify().delay(50)}>
                            <Pressable style={styles.button} onPress={() => setShowCollectionModal(true)}>
                                <MaterialIcons name="collections" size={20} color={theme.colors.white} />
                            </Pressable>
                        </Animated.View>
                        <Animated.View entering={FadeInDown.springify().delay(75)}>
                            <Pressable style={styles.button} onPress={toggleQuality}>
                                <Octicons name="gear" size={22} color={theme.colors.white} />
                            </Pressable>
                        </Animated.View>
                        <Animated.View entering={FadeInDown.springify().delay(100)}>
                            <Pressable style={styles.button} onPress={toggleFullscreen}>
                                <Octicons name="screen-full" size={20} color={theme.colors.white} />
                            </Pressable>
                        </Animated.View>
                    </View>
                </View>
                
                <View style={styles.bottomControls}>
                    <Animated.View entering={FadeInDown.springify().delay(150)}>
                        {status == 'downloading' ? (
                            <View style={styles.button}>
                                <ActivityIndicator size='small' color={theme.colors.white} />
                            </View>
                        ) : (
                            <Pressable style={styles.button} onPress={handleDownloadImage}>
                                <Octicons name="download" size={24} color={theme.colors.white} />
                            </Pressable>
                        )}
                    </Animated.View>
                    <Animated.View entering={FadeInDown.springify().delay(200)}>
                        {status == 'sharing' ? (
                            <View style={styles.button}>
                                <ActivityIndicator size='small' color={theme.colors.white} />
                            </View>
                        ) : (
                            <Pressable style={styles.button} onPress={handleShareImage}>
                                <Octicons name="share" size={22} color={theme.colors.white} />
                            </Pressable>
                        )}
                    </Animated.View>
                </View>
            </View>

            {/* Collection Modal */}
            <Modal
                visible={showCollectionModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowCollectionModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add to Collections</Text>
                            <Pressable 
                                onPress={() => setShowCollectionModal(false)}
                                style={styles.modalCloseButton}
                            >
                                <Ionicons name="close" size={24} color={theme.colors.neutral(0.7)} />
                            </Pressable>
                        </View>
                        
                        <ScrollView style={styles.collectionsList}>
                            {collections.map((collection) => (
                                <Pressable
                                    key={collection.id}
                                    style={[
                                        styles.collectionItem,
                                        selectedCollections.includes(collection.id) && styles.selectedCollection
                                    ]}
                                    onPress={() => handleCollectionToggle(collection.id)}
                                >
                                    <MaterialIcons 
                                        name="collections" 
                                        size={24} 
                                        color={selectedCollections.includes(collection.id) ? theme.colors.primary : theme.colors.neutral(0.6)} 
                                    />
                                    <View style={styles.collectionInfo}>
                                        <Text style={styles.collectionName}>{collection.name}</Text>
                                        <Text style={styles.collectionCount}>
                                            {collection.images?.length || 0} images
                                        </Text>
                                    </View>
                                    <Ionicons 
                                        name={selectedCollections.includes(collection.id) ? "checkmark-circle" : "radio-button-off"} 
                                        size={24} 
                                        color={selectedCollections.includes(collection.id) ? theme.colors.primary : theme.colors.neutral(0.4)} 
                                    />
                                </Pressable>
                            ))}
                            
                            {collections.length === 0 && (
                                <View style={styles.emptyCollections}>
                                    <MaterialIcons name="collections" size={48} color={theme.colors.neutral(0.3)} />
                                    <Text style={styles.emptyCollectionsText}>No collections yet</Text>
                                    <Text style={styles.emptyCollectionsSubtext}>
                                        Create collections in the Collections screen
                                    </Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Toast config={toastConfig} visibilityTime={2500}/>
        </BlurView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    fullscreenContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
    },
    imageContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: wp(4),
    },
    imageWrapper: {
        position: 'relative',
    },
    image: {
        borderWidth: 2,
        borderRadius: theme.radius.xl,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    loading: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    controlsContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'space-between',
        paddingVertical: hp(6),
        paddingHorizontal: wp(4),
        pointerEvents: 'box-none',
    },
    topControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    topRightControls: {
        flexDirection: 'row',
        gap: 10,
    },
    favoriteButton: {
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
        borderColor: 'rgba(244, 67, 54, 0.5)',
    },
    bottomControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 50,
    },
    buttons: {
        flexDirection: 'row',
        gap: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        height: hp(6),
        width: hp(6),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 5,
    },
    qualityBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: theme.radius.sm,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    qualityText: {
        color: theme.colors.white,
        fontSize: hp(1.4),
        fontWeight: 'bold',
    },
    fullscreenHeader: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30,
        right: 20,
        zIndex: 1000,
    },
    fullscreenFooter: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 50 : 30,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 1000,
    },
    headerButton: {
        height: hp(5),
        width: hp(5),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    toast: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: theme.radius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        paddingHorizontal: 30,
    },
    toastText: {
        fontSize: hp(1.8),
        fontWeight: 'bold',
        color: theme.colors.white,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: theme.radius.xl,
        borderTopRightRadius: theme.radius.xl,
        maxHeight: '70%',
        minHeight: '30%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.neutral(0.1),
    },
    modalTitle: {
        fontSize: hp(2.2),
        fontWeight: 'bold',
        color: theme.colors.neutral(0.9),
    },
    modalCloseButton: {
        padding: 8,
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.neutral(0.05),
    },
    collectionsList: {
        maxHeight: hp(40),
    },
    collectionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.neutral(0.1),
        gap: 15,
    },
    selectedCollection: {
        backgroundColor: theme.colors.neutral(0.05),
    },
    collectionInfo: {
        flex: 1,
    },
    collectionName: {
        fontSize: hp(1.8),
        fontWeight: '600',
        color: theme.colors.neutral(0.9),
        marginBottom: 2,
    },
    collectionCount: {
        fontSize: hp(1.5),
        color: theme.colors.neutral(0.6),
    },
    emptyCollections: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: hp(5),
        gap: 10,
    },
    emptyCollectionsText: {
        fontSize: hp(2),
        fontWeight: '600',
        color: theme.colors.neutral(0.6),
    },
    emptyCollectionsSubtext: {
        fontSize: hp(1.6),
        color: theme.colors.neutral(0.5),
        textAlign: 'center',
        paddingHorizontal: wp(8),
    },
})
export default ImageScreen;