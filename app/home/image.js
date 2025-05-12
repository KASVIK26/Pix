import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Platform, ActivityIndicator, Pressable, Alert } from 'react-native';
import { hp, wp } from '../../helpers/common';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { theme } from '../../constants/theme';
import { Octicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Toast from 'react-native-toast-message';

const ImageScreen = () => {
    const router = useRouter();
    const item = useLocalSearchParams();
    let uri = item?.webformatURL;

    const fileName = item?.previewURL?.split('/').pop();
    const imageUrl = uri;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;
    const [status, setStatus] = useState('loading');
    const onLoad = () => {
        setStatus('');
    }
    const handleDownloadImage = async () => {
        if (Platform.OS === 'web') {
            const anchor = document.createElement('a');
            anchor.href = imageUrl;
            anchor.target = "_blank";
            anchor.download = fileName || 'download';
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);

        }else{
            setStatus('downloading');

        let uri = await downloadfile();
        if (uri) showToast('Downloaded Successfully');
        
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
        const maxWidth = Platform.OS === 'web' ? wp(50) : wp(92);
        let calculatedHeight = maxWidth / aspectRatio;
        let calculatedWidth = maxWidth;

        if (aspectRatio > 1) {
            calculatedHeight = calculatedHeight * aspectRatio;
        }
        return {
            width: calculatedWidth,
            height: calculatedHeight
        }
    }
    return (
        <BlurView
            style={styles.container}
            tint='dark'
            intensity={60}
        >
            <View style={getSize()}>
                <View style={styles.loading}>
                    {
                        status == 'loading' && <ActivityIndicator size='large' color={theme.colors.white} />
                    }

                </View>
                <Image
                    transition={100}
                    style={[styles.image, getSize()]}
                    source={{ uri }}
                    onLoad={onLoad} />

            </View>
            <View style={styles.buttons}>
                <Animated.View entering={FadeInDown.springify().damping(11)}>
                    <Pressable style={styles.button} onPress={() => router.back()}>
                        <Octicons name="x" size={24} color={theme.colors.white} />

                    </Pressable>
                </Animated.View>
                <Animated.View entering={FadeInDown.springify().damping(11).delay(100)}>
                    {
                        status == 'downloading' ? (
                            <View style={styles.button}>
                                <ActivityIndicator size='small' color={theme.colors.white} />
                            </View>
                        ) : (<Pressable style={styles.button} onPress={ handleDownloadImage }>
                            <Octicons name="download" size={24} color={theme.colors.white} />
                        </Pressable>
                        )
                    }

                </Animated.View>
                <Animated.View entering={FadeInDown.springify().damping(11).delay(200)}>
                    {status == 'sharing' ? (
                        <View style={styles.button}>
                            <ActivityIndicator size='small' color={theme.colors.white} />
                        </View>
                    ) : (<Pressable style={styles.button} onPress={ handleShareImage }>
                    <Octicons name="share" size={22} color={theme.colors.white} />

                </Pressable>
                    )
                    }
                    
                </Animated.View>
            </View>
            <Toast  config={toastConfig} visibilityTime={2500}/>


        </BlurView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: wp(4),
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    },
    buttons: {
        flexDirection: 'row',
        gap: 50,
        marginTop: 40,
        alignItems: 'center',
    },
    button: {
        height: hp(6),
        width: hp(6),
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: theme.radius.lg,
        borderCurve: 'continuous',
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
})
export default ImageScreen;