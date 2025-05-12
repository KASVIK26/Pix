import { appendBaseUrl } from 'expo-router/build/fork/getPathFromState';
import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { hp, wp } from '../helpers/common';
import { theme } from '../constants/theme';
import { data } from '../constants/data';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

const Categories = ({activeCategory,handleChangeCategory}) => {
  return (
   <FlatList
   horizontal
   contentContainerStyle={styles.flatlistcontainer}
   showsHorizontalScrollIndicator={false}
   data={data.categories}
   keyExtractor={(item) => item}
   renderItem={({item,index}) => (
    <CategoryItem
  isActive={activeCategory === item}
  handleChangeCategory={handleChangeCategory}
    title={item}
    index={index}
    />
   )} />
  );
};

const CategoryItem = ({title,index, isActive,handleChangeCategory}) => {
let textColor = isActive ? theme.colors.white : theme.colors.neutral(0.8); 
let backgroundColor = isActive ? theme.colors.neutral(0.8) : theme.colors.white;
  return (
    <Animated.View entering={FadeInDown.delay(index*200).duration(1000).springify().damping(14)} >
     <Pressable onPress={() => handleChangeCategory(isActive ? null : title)} 
     style={[styles.category,{backgroundColor}]}>
       <Text style={[styles.title,{color:textColor}]}>{title}</Text>
        </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
flatlistcontainer:{
  paddingHorizontal: wp(4),
  gap: 10,

},
category:{
  padding: 12,
  //backgroundColor: 'white',
  paddingHorizontal: 15,
  borderWidth: 1,
  borderColor:theme.colors.grayBG,
  borderCurve:'continuous',
  
  

  borderRadius: theme.radius.lg,
},
title:{
  fontSize: hp(1.8),
  fontWeight: 'semibold',
  color: 'black',
}
})

export default Categories;