import React from 'react';
import { StyleSheet, ScrollView, View, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Colors } from '@/constants/theme';
import { api } from '@/lib/api';

const { width } = Dimensions.get('window');

// Generate a random gradient for each pet based on their ID string length or just alternating
const GRADIENTS: readonly [string, string, ...string[]][] = [
  ['#4c669f', '#3b5998', '#192f6a'], // Blue
  ['#FF7E5F', '#FEB47B'], // Peach
  ['#8E2DE2', '#4A00E0'], // Purple
  ['#00C9FF', '#92FE9D'], // Mint
  ['#F7971E', '#FFD200'], // Yellow
];

export default function PassportListScreen() {
  const router = useRouter();

  const { data: pets, isLoading, error } = useQuery({
    queryKey: ['pets'],
    queryFn: async () => {
      const response = await api.get('/pets/');
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText style={styles.errorText}>Failed to load pets.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ThemedText type="title" style={styles.headerTitle}>Digital Pet Passport</ThemedText>
            <ThemedText type="default" style={styles.headerSubtitle}>Tap a card to view health details</ThemedText>
          </View>

          {pets?.length === 0 ? (
            <ThemedText style={styles.emptyText}>You haven't added any pets yet.</ThemedText>
          ) : (
            <View style={styles.cardsContainer}>
              {pets?.map((pet: any, index: number) => {
                const colors = GRADIENTS[index % GRADIENTS.length];
                return (
                  <Animated.View 
                    key={pet.id} 
                    entering={FadeInDown.delay(index * 100).springify()}
                  >
                    <Pressable 
                      onPress={() => router.push(`/passport/${pet.id}`)}
                      style={({ pressed }) => [
                        styles.cardWrapper,
                        { transform: [{ scale: pressed ? 0.98 : 1 }] }
                      ]}
                    >
                      <LinearGradient
                        colors={colors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.cardGradient}
                      >
                        <View style={styles.cardHeader}>
                          <View>
                            <ThemedText style={styles.petName}>{pet.name}</ThemedText>
                            <ThemedText style={styles.petBreed}>{pet.breed || 'Unknown breed'}</ThemedText>
                          </View>
                          <View style={styles.iconContainer}>
                            <Ionicons name={pet.species === 'CAT' ? 'logo-octocat' : 'paw'} size={24} color="rgba(255,255,255,0.8)" />
                          </View>
                        </View>
                        
                        <View style={styles.cardFooter}>
                          <View>
                            <ThemedText style={styles.footerLabel}>PASSPORT ID</ThemedText>
                            <ThemedText style={styles.footerValue}>
                              {pet.id.substring(0, 8).toUpperCase()}
                            </ThemedText>
                          </View>
                          <Ionicons name="finger-print" size={32} color="rgba(255,255,255,0.4)" />
                        </View>
                      </LinearGradient>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          )}
        </ScrollView>
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
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: Spacing.eight,
  },
  header: {
    marginBottom: Spacing.two,
  },
  headerTitle: {
    fontSize: 28,
  },
  headerSubtitle: {
    color: '#888',
    marginTop: Spacing.one,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: Spacing.six,
    color: '#888',
  },
  cardsContainer: {
    gap: -80, // Negative gap to make them stack like Apple Wallet
    paddingTop: Spacing.two,
  },
  cardWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  cardGradient: {
    height: 200,
    borderRadius: 20,
    padding: Spacing.five,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  petName: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  petBreed: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  iconContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footerValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 2,
  }
});
