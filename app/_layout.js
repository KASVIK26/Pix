import { Stack } from 'expo-router';
import React from 'react';
import { View, Text } from 'react-native';
import {
  BottomSheetModalProvider
} from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Layout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>

        <Stack>
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }} />
          <Stack.Screen
            name="home/index"
            options={{
              headerShown: false,
            }} />
            <Stack.Screen
            name="home/image"
            options={{
              headerShown: false,
              presentation:'transparentModal',
              animation: 'fade'
            }} />
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

export default Layout;