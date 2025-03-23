import {
  SafeAreaView,
  StyleSheet,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  View,
  Text,
  TextInput
} from 'react-native';
import { useState } from 'react';
import { ThemedText } from '@/components/ThemedText';

export default function StatusReason() {
  const [statusReason, setStatusReason] = useState('');

  return (
    <SafeAreaView style={[styles.container]}>
      <ThemedText type="title" style={styles.title}>DRT Driver Dashboard</ThemedText>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >

        <TextInput
          multiline
          numberOfLines={12}
          maxLength={2000}
          style={styles.messageBox}
          value={statusReason}
          onChangeText={setStatusReason}
          placeholder="Reason for Status: (optional)"
        />
        <View style={styles.buttonContainer}>
          <Pressable style={styles.dashButton}>
            <Text style={styles.buttonText}>CONFIRM</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  messageBox: {
    height: '80%',
    marginBottom: 16,
    borderWidth: 1,
    padding: 12,
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    textAlignVertical: 'top',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dashButton: {
    width: '100%',
    height: 75,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
