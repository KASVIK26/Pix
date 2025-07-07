import { Pressable, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Image } from 'expo-image'
import { getImagesize, wp, hp } from '../helpers/common'
import { theme } from '../constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { storageManager } from '../helpers/storage'
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate,
  runOnJS
} from 'react-native-reanimated'
import { useThemedStyles } from '../hooks/useThemedStyles'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const ImageCard = ({ item, index, coloumns, router, onFavoriteToggle, showDeleteButton, onDelete }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { colors, isDark } = useThemedStyles();
  
  // Animation values
  const scale = useSharedValue(1);
  const elevation = useSharedValue(5);
  const opacity = useSharedValue(1);

  useEffect(() => {
    checkFavoriteStatus();
  }, [item.id]);

  const checkFavoriteStatus = async () => {
    try {
      const favorite = await storageManager.isFavorite(item.id.toString());
      setIsFavorite(favorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    setIsLoading(true);
    try {
      if (isFavorite) {
        await storageManager.removeFromFavorites(item.id.toString());
        setIsFavorite(false);
        // Notify parent component about the change
        if (onFavoriteToggle) {
          onFavoriteToggle(item.id.toString(), false);
        }
      } else {
        await storageManager.addToFavorites(item);
        setIsFavorite(true);
        // Notify parent component about the change
        if (onFavoriteToggle) {
          onFavoriteToggle(item.id.toString(), true);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isLastInRow = () => {
    return (index + 1) % coloumns === 0;
  }

  const getImageHeight = () => {
    let { imageHeight: height, imageWidth: width } = item;
    return {
      height: getImagesize(height, width),
    }
  }

  const onPressIn = () => {
    scale.value = withSpring(0.92, {
      damping: 12,
      stiffness: 120,
    });
    elevation.value = withTiming(20, { duration: 200 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 120,
    });
    elevation.value = withTiming(5, { duration: 250 });
  };

  const onPress = () => {
    router.push({ pathname: 'home/image', params: { ...item } });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: interpolate(elevation.value, [5, 20], [isDark ? 0.3 : 0.15, isDark ? 0.6 : 0.4]),
    shadowRadius: interpolate(elevation.value, [5, 20], [8, 16]),
    elevation: elevation.value,
  }));

  const cardBackgroundColor = isDark ? '#444444' : colors.background; // Use #444444 for dark mode cards
  const textColor = isDark ? '#E0E0E0' : colors.text; // Light gray text in dark mode
  const secondaryTextColor = isDark ? '#B0B0B0' : colors.textSecondary; // Medium gray for secondary text

  return (
    <AnimatedPressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      style={[
        styles.imageWrapper,
        !isLastInRow() && styles.spacing,
        animatedStyle,
        {
          backgroundColor: cardBackgroundColor,
          shadowColor: isDark ? '#000000' : '#000000',
        }
      ]}
    >
      <View style={styles.imageContainer}>
        <Image
          style={[styles.image, getImageHeight()]}
          source={{ uri: item?.webformatURL }}
          transition={200}
          contentFit="cover"
        />
        
        {/* Gradient overlay for better text readability */}
        <View style={[styles.gradientOverlay, { opacity: isDark ? 0.8 : 0.6 }]} />
        
        {/* Favorite Button */}
        <TouchableOpacity 
          style={[
            styles.favoriteButton,
            { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)' }
          ]}
          onPress={toggleFavorite}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={18}
            color={isFavorite ? "#ff4757" : (isDark ? "#E0E0E0" : "#666666")}
          />
        </TouchableOpacity>

        {/* Delete Button (only shown when showDeleteButton is true) */}
        {showDeleteButton && onDelete && (
          <TouchableOpacity 
            style={[
              styles.deleteButton,
              { backgroundColor: isDark ? 'rgba(244, 67, 54, 0.9)' : 'rgba(244, 67, 54, 0.95)' }
            ]}
            onPress={() => onDelete(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color="#ffffff"
            />
          </TouchableOpacity>
        )}

        {/* Image Stats Overlay */}
        <View style={styles.statsOverlay}>
          <View style={[styles.statItem, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.7)' }]}>
            <Ionicons name="heart" size={12} color="#ffffff" />
            <Text style={styles.statText}>{item.likes}</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.7)' }]}>
            <Ionicons name="download" size={12} color="#ffffff" />
            <Text style={styles.statText}>{item.downloads}</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.tags, { color: textColor }]} numberOfLines={2}>
          {item.tags}
        </Text>
        <Text style={[styles.user, { color: secondaryTextColor }]}>by {item.user}</Text>
      </View>
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  imageContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
  },
  image: {
    height: 300,
    width: '100%',
  },
  imageWrapper: {
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    overflow: 'hidden',
    marginBottom: wp(2),
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  spacing: {
    marginRight: wp(2),
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  infoContainer: {
    padding: wp(3),
  },
  tags: {
    fontSize: hp(1.6),
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: hp(2),
  },
  user: {
    fontSize: hp(1.3),
    fontWeight: '500',
  },
})

export default ImageCard
