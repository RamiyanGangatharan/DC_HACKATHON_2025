import { Image, StyleSheet, Platform, SafeAreaView } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
          <ThemedText type="title">Home Screen</ThemedText>
          <ThemedText>Test Subtitle.</ThemedText>
        </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
      paddingTop: Platform.OS === 'android' ? 100 : 0,
      paddingLeft: Platform.OS === 'android' ? 25 : 0,
      paddingRight: Platform.OS === 'android' ? 25 : 0,
    },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
