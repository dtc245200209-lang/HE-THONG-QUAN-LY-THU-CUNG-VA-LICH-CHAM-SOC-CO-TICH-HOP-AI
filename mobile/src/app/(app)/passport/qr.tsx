import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Colors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QRCodeScreen() {
  const { token, petName } = useLocalSearchParams();
  const router = useRouter();

  // In production, this should be the frontend URL that points to the public view of the pet
  const publicUrl = `https://petcare.com/emergency/${token}`;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <ThemedText type="title" style={styles.title}>Emergency QR Code</ThemedText>
          <ThemedText style={styles.subtitle}>
            Anyone who scans this code will see {petName}'s public emergency profile.
          </ThemedText>

          <View style={styles.qrContainer}>
            {token ? (
              <QRCode
                value={publicUrl}
                size={250}
                color="black"
                backgroundColor="white"
              />
            ) : (
              <ThemedText>No QR token available.</ThemedText>
            )}
          </View>
          
          <ThemedText style={styles.linkText} type="small">{publicUrl}</ThemedText>

          <ThemedText style={styles.note} type="small">
            Ensure this QR code is attached to your pet's collar. If your pet is lost, turning on "Lost Pet Mode" will alert you when someone scans this code.
          </ThemedText>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    padding: Spacing.six,
    alignItems: 'center',
    flex: 1,
  },
  title: {
    marginBottom: Spacing.two,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing.six,
    color: Colors.light.textSecondary,
  },
  qrContainer: {
    padding: Spacing.four,
    backgroundColor: '#fff',
    borderRadius: Spacing.three,
    marginBottom: Spacing.four,
    elevation: 4, // shadow for android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  linkText: {
    color: '#0a7ea4',
    marginBottom: Spacing.six,
  },
  note: {
    textAlign: 'center',
    color: Colors.light.textSecondary,
  }
});
