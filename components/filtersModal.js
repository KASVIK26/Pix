import { Pressable, StyleSheet, Text, View, Platform } from 'react-native'
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
import { Ionicons } from '@expo/vector-icons';



const FiltersModal = ({ modalRef,onClose, onApply,onReset,filters,setFilters, colors: propColors }) => {
    const { colors, isDark } = useThemedStyles();
    
    // Use passed colors or fall back to theme colors
    const modalColors = propColors || colors;

    // Custom handle indicator that closes modal on press
    const CustomHandle = () => (
        <Pressable
            onPress={() => modalRef.current?.close()}
            style={{ alignItems: 'center', paddingVertical: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Close filter modal"
        >
            <View style={{
                width: 60,
                height: 6,
                borderRadius: 3,
                backgroundColor: modalColors.border,
                marginBottom: 4,
            }} />
        </Pressable>
    );

    // Fix scroll lock on web when modal closes (for all close types)
    const unlockScroll = () => {
        if (Platform.OS === 'web' && typeof document !== 'undefined') {
            document.body.style.overflow = '';
        }
    };

    // Called when modal is dismissed (programmatically or by backdrop)
    const handleClose = () => {
        if (typeof onClose === 'function') onClose();
        unlockScroll();
    };

    // Called on any modal state change (including drag down)
    const handleSheetChange = (index) => {
        if (index === -1) {
            // Delay to ensure BottomSheet has finished closing before unlocking scroll
            setTimeout(unlockScroll, 100);
        }
    };

    // Use a larger snap point for mobile devices so the modal opens fully
    const isMobile = Platform.OS !== 'web' && Platform.OS !== 'windows' && Platform.OS !== 'macos';
    const snapPoints = useMemo(() => [isMobile ? '99%' : '85%'], [isMobile]);
    return (
        <BottomSheetModal
            ref={modalRef}
            index={0}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            backdropComponent={CustomBackdrop}
            backgroundStyle={{ backgroundColor: modalColors.surface }}
            handleIndicatorStyle={{ backgroundColor: modalColors.border }}
            handleComponent={CustomHandle}
            onDismiss={handleClose}
            onChange={handleSheetChange}
        >
            <BottomSheetView style={[styles.contentContainer, { backgroundColor: modalColors.surface }]}> 
                <View style={styles.headerRow}>
                    <Text style={[styles.filterText, { color: modalColors.text }]}>Filters</Text>
                    <Pressable
                        onPress={() => modalRef.current?.close()}
                        style={styles.closeIcon}
                        accessibilityRole="button"
                        accessibilityLabel="Close filter modal"
                    >
                        <Ionicons name="close" size={28} color={modalColors.text} />
                    </Pressable>
                </View>
                <View style={styles.content}>
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
        justifyContent: 'flex-start',
        width: '100%',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    content: {
        flexGrow: 1,
        gap: 15,
        width: '100%',
        paddingVertical: 10,
        paddingHorizontal: wp(4),
        maxWidth: 600, // Max width for larger screens
        alignSelf: 'center',
        justifyContent: 'flex-start',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Center content horizontally
        width: '100%',
        marginBottom: 10,
        position: 'relative',
        minHeight: 48, // Ensure enough height for icon
    },
    filterText: {
        fontSize: hp(4),
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
    },
    closeIcon: {
        position: 'absolute',
        right: 0,
        top: '50%',
        transform: [{ translateY: -14 }], // Center vertically (icon is 28px)
        paddingVertical: 8,
        paddingHorizontal: wp(3), // Dynamic horizontal padding
        zIndex: 2,
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
    },
})