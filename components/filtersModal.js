import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useMemo } from 'react'
import {
    BottomSheetModal,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import Animated, {  Extrapolation, FadeInDown, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { capitalize, hp, wp } from '../helpers/common';
import { theme } from '../constants/theme';
import { ColorFilter, CommonFilterRow, SectionView } from './filterViews';
import { data } from '../constants/data';
import { useThemedStyles } from '../hooks/useThemedStyles';



const FiltersModal = ({ modalRef,onClose, onApply,onReset,filters,setFilters, colors: propColors }) => {
    const { colors, isDark } = useThemedStyles();
    
    // Use passed colors or fall back to theme colors
    const modalColors = propColors || colors;

    const snapPoints = useMemo(() => ['85%'], []);
    return (
        <BottomSheetModal
            ref={modalRef}
            index={0}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            backdropComponent={CustomBackdrop}
            backgroundStyle={{ backgroundColor: modalColors.surface }}
            handleIndicatorStyle={{ backgroundColor: modalColors.border }}
        // onChange={handleSheetChanges}
        >
            <BottomSheetView style={[styles.contentContainer, { backgroundColor: modalColors.surface }]}>
                <View style={styles.content}>
                <Text style={[styles.filterText, { color: modalColors.text }]}>Filters</Text>
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
                                  colors={modalColors}
                                  content = {sectionView({
                                    data: sectionData,
                                    filters,
                                    setFilters,
                                    filterName: sectionName,
                                    colors: modalColors
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
                <Pressable style={[styles.resetButton, { backgroundColor: modalColors.border, borderColor: modalColors.border }]} onPress={onReset}>
                    <Text style={[styles.buttonText, { color: modalColors.text }]}>Reset</Text>
                </Pressable>
                <Pressable style={[styles.applyButton, { backgroundColor: modalColors.accent }]} onPress={onApply}>
                    <Text style={[styles.buttonText, { color: theme.colors.white }]}>Apply</Text>
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
        paddingHorizontal: wp(4),
        maxWidth: 600, // Max width for larger screens
        alignSelf: 'center',
    },
    filterText: {
        fontSize: hp(4),
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    buttons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 20,
        paddingHorizontal: wp(2),
    },
    resetButton: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderCurve: 'continuous',
        borderRadius: theme.radius.md,
        borderWidth: 2,
        minHeight: 44, // Better touch target
    },
    applyButton: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderCurve: 'continuous',
        borderRadius: theme.radius.md,
        minHeight: 44, // Better touch target
    },
    buttonText: {
        fontSize: hp(2.2),
        fontWeight: '600',
    }
})