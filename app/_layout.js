import { Stack } from 'expo-router';
import React from 'react';
import { View, Text } from 'react-native';
import {
  BottomSheetModalProvider
} from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { ThemeProvider } from '../contexts/ThemeContext';

const Layout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
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
            <Stack.Screen
              name="favorites"
              options={{
                headerShown: false,
              }} />
            <Stack.Screen
              name="settings"
              options={{
                headerShown: false,
              }} />
            <Stack.Screen
              name="collections"
              options={{
                headerShown: false,
              }} />
            <Stack.Screen
              name="history"
              options={{
                headerShown: false,
              }} />
          </Stack>
          <Toast />
        </BottomSheetModalProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
};

export default Layout;