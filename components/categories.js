import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { hp, wp } from '../helpers/common';
import { theme } from '../constants/theme';
import { data } from '../constants/data';
import Animated, { 
  FadeInDown, 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate 
} from 'react-native-reanimated';
import { useThemedStyles } from '../hooks/useThemedStyles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Categories = ({ activeCategory, handleChangeCategory }) => {
  return (
    <FlatList
      horizontal
      contentContainerStyle={styles.flatlistcontainer}
      showsHorizontalScrollIndicator={false}
      data={data.categories}
      keyExtractor={(item) => item}
      renderItem={({ item, index }) => (
        <CategoryItem
          isActive={activeCategory === item}
          handleChangeCategory={handleChangeCategory}
          title={item}
          index={index}
        />
      )}
    />
  );
};

const CategoryItem = ({ title, index, isActive, handleChangeCategory }) => {
  const { colors, isDark } = useThemedStyles();
  
  // Animation values
  const scale = useSharedValue(1);
  const elevation = useSharedValue(0);

  const textColor = isActive ? colors.background : colors.text;
  const backgroundColor = isActive ? colors.accent : colors.surface;

  const onPressIn = () => {
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 100,
    });
    elevation.value = withTiming(8, { duration: 150 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 100,
    });
    elevation.value = withTiming(isActive ? 6 : 2, { duration: 150 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: interpolate(elevation.value, [0, 8], [0.1, 0.25]),
    shadowRadius: interpolate(elevation.value, [0, 8], [2, 8]),
    elevation: elevation.value,
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 200).duration(1000).springify().damping(14)}>
      <AnimatedPressable
        onPress={() => handleChangeCategory(isActive ? null : title)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.category,
          {
            backgroundColor,
            borderColor: colors.border,
            shadowColor: isDark ? '#000000' : '#000000',
          },
          animatedStyle,
        ]}
      >
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      </AnimatedPressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  flatlistcontainer: {
    paddingHorizontal: wp(4),
    paddingVertical: 8, // Added vertical padding to prevent shadow clipping
    gap: 12,
  },
  category: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderCurve: 'continuous',
    borderRadius: theme.radius.lg,
    marginVertical: 4, // Added margin to prevent shadow clipping
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: hp(1.8),
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Categories;