import {  Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Image } from 'expo-image'
import { getImagesize, wp } from '../helpers/common'
import { theme } from '../constants/theme'


const ImageCard = ({item,index,coloumns, router}) => {

  const isLastInRow = () =>{
    return (index+1) % coloumns ===0;
  }

  const getImageHeight = () => {
    let {imageHeight : height, imageWidth : width} = item;
    return {
      height : getImagesize(height, width),
    }
  }
  return (
    
    <Pressable onPress = {() => router.push({pathname: 'home/image',params: {...item}})} style= {[styles.imageWrapper,!isLastInRow() && styles.spacing]}>
      <Image
      style={[styles.image, getImageHeight()]}
      source={{uri: item?.webformatURL}}
      transition={100}

      />
     {/*<Image style={styles.image} source={{uri: item?.webformatURL}}/>*/}
    </Pressable>
  )
}


const styles = StyleSheet.create({

  image: {
    height: 300,
    width: '100%',
    
  },
  imageWrapper:{
    backgroundColor: theme.colors.grayBG,
    borderRadius: theme.radius.xl,
    borderCurve:'continuous',
    overflow: 'hidden',
    marginBottom: wp(2),


  },
  spacing :{
    marginRight: wp(2),
  }
})

export default ImageCard
