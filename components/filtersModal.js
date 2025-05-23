import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useMemo } from 'react'
import {
    BottomSheetModal,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import Animated, {  Extrapolation, FadeInDown, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { capitalize, hp } from '../helpers/common';
import { theme } from '../constants/theme';
import { ColorFilter, CommonFilterRow, SectionView } from './filterViews';
import { data } from '../constants/data';



const FiltersModal = ({ modalRef,onClose, onApply,onReset,filters,setFilters }) => {



    const snapPoints = useMemo(() => ['85%'], []);
    return (
        <BottomSheetModal
            ref={modalRef}
            index={0}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            backdropComponent={CustomBackdrop}
        // onChange={handleSheetChanges}
        >
            <BottomSheetView style={styles.contentContainer}>
                <View style={styles.content}>
                <Text style={styles.filterText}>Filters</Text>
                {
                    Object.keys(sections).map((sectionName, index) => {
                        let sectionView = sections[sectionName];
                        let sectionData = data.filters[sectionName];
                        let title = capitalize(sectionName);
                        return (
                            <Animated.View 
                            entering={FadeInDown.delay((index*100)+100).springify().damping(11)}
                            key ={sectionName}>
                                <SectionView 
                                  title={title}
                                  content = {sectionView({
                                    data: sectionData,
                                    filters,
                                    setFilters,
                                    filterName: sectionName
                                  })}
                                  />
 
                            </Animated.View>
                        )

                    }) 
                }
                {/*actions*/}
               <Animated.View                            
               
               entering={FadeInDown.delay(500).springify().damping(11)}
               style={styles.buttons}>
                <Pressable style = {styles.resetButton} onPress={onReset}>
                    <Text style = {[styles.buttonText,{color:theme.colors.neutral(0.9)}]}>Reset</Text>
                </Pressable>
                <Pressable style = {styles.applyButton} onPress={onApply}>
                    <Text style = {[styles.buttonText,{color:theme.colors.white}]}>Apply</Text>
                </Pressable>
               </Animated.View>

                </View>
            </BottomSheetView>
        </BottomSheetModal>
    )
}

const sections = {
    "order": (props) => <CommonFilterRow {...props} />,
    "orientation": (props) => <CommonFilterRow {...props} />,
    "type": (props) => <CommonFilterRow {...props} />,
    "colors": (props) => <ColorFilter {...props} />
    
}


const CustomBackdrop = ({ animatedIndex, style }) => {
    const containerAnimationStyle = useAnimatedStyle(() => {
        let opacity = interpolate(
            animatedIndex.value,
            [-1,0],
            [0,1],
            Extrapolation.CLAMP
        )
        return {
            opacity
        };
    })
    const containerStyle = [
        StyleSheet.absoluteFill,
        style,
        styles.overlay,
        containerAnimationStyle
    ]
    return (
        <Animated.View
            style={containerStyle}
        >
            <BlurView
                style={StyleSheet.absoluteFill}
                tint="dark"
                intensity={100} />
        </Animated.View>
    );
};

export default FiltersModal

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        backgroundColor: 'grey',
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    content: {
        flex: 1,
        gap: 15,
        width: '100%',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    filterText: {
        fontSize: hp(4),
        fontWeight: 'bold',
        marginBottom: 10,
        color: theme.colors.neutral(0.8),
        marginBottom: 5,
    },
    buttons: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    resetButton: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderCurve: 'continuous',
        backgroundColor: theme.colors.neutral(0.03),
        borderRadius: theme.radius.md,
        borderColor: theme.colors.grayBG,
        borderWidth: 2,
    },
    applyButton: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderCurve: 'continuous',
        backgroundColor: theme.colors.neutral(0.8),
        borderRadius: theme.radius.md,
    },
    buttonText: {
        fontSize: hp(2.2),
        
    }

})