import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { MasonryFlashList } from "@shopify/flash-list";
import ImageCard from './ImageCard';
import { getColoumnCount, wp } from '../helpers/common';

const ImageGrid = ({images,router, onFavoriteToggle, showDeleteButton, onDelete}) => {

    const coloumn = getColoumnCount();
    
    return (
        <View style={styles.container}>
            <MasonryFlashList
                data={images}
                numColumns={coloumn}
                initialNumToRender={1000}
                contentContainerStyle={styles.listcontainerStyle}
                renderItem={({ item, index }) => <ImageCard router={router} item={item} coloumn={coloumn} index={index} onFavoriteToggle={onFavoriteToggle} showDeleteButton={showDeleteButton} onDelete={onDelete} />}
                estimatedItemSize={200}
            />
        </View>
    )
}


const styles = StyleSheet.create({
  container:{
    minHeight: 3,
    width: wp(100),
  },
  listcontainerStyle:{
    paddingHorizontal: wp(4),
    
  }
})

export default ImageGrid
