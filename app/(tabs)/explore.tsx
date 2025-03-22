import { StyleSheet, Image, Platform, SafeAreaView, View } from 'react-native';
import { Collapsible } from '@/components/Collapsible';
import { ThemedText } from '@/components/ThemedText';

export default function TabTwoScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ThemedText type="title">Explore</ThemedText>
      <ThemedText>Test Subtitle.</ThemedText>
      <Collapsible title="DD1">
        <ThemedText>Test 1.</ThemedText>
        <ThemedText>Test 2.</ThemedText>
      </Collapsible>
      <Collapsible title="DD2">
          <ThemedText>Test 3.</ThemedText>
          <ThemedText>Test 4.</ThemedText>
       </Collapsible>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? 100 : 0,
    paddingLeft: Platform.OS === 'android' ? 25 : 0,
    paddingRight: Platform.OS === 'android' ? 25 : 0,
  },
});
