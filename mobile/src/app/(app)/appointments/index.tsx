import React from 'react';
import { StyleSheet, ScrollView, View, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { api } from '@/lib/api';

export default function AppointmentsScreen() {
  const router = useRouter();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const response = await api.get('/appointments/');
      return response.data;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#f39c12';
      case 'CONFIRMED': return '#2980b9';
      case 'CHECKED_IN': return '#8e44ad';
      case 'IN_PROGRESS': return '#d35400';
      case 'COMPLETED': return '#27ae60';
      case 'CANCELLED': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <ThemedText style={styles.header}>Appointments</ThemedText>
          <Pressable 
            style={styles.bookButton}
            onPress={() => router.push('/appointments/book')}
          >
            <ThemedText style={styles.bookButtonText}>+ Book</ThemedText>
          </Pressable>
        </View>
        
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <View style={styles.list}>
            {appointments?.length === 0 ? (
              <ThemedText style={styles.emptyText}>No appointments found.</ThemedText>
            ) : (
              appointments?.map((appt: any) => (
                <Pressable 
                  key={appt.id}
                  style={styles.card}
                  onPress={() => router.push(`/appointments/${appt.id}`)}
                >
                  <View style={styles.cardHeader}>
                    <ThemedText style={styles.cardTitle}>{new Date(appt.scheduled_time).toLocaleString()}</ThemedText>
                    <View style={[styles.badge, { backgroundColor: getStatusColor(appt.status) }]}>
                      <ThemedText style={styles.badgeText}>{appt.status}</ThemedText>
                    </View>
                  </View>
                  <ThemedText style={styles.cardSubtitle}>Service: {appt.service_type || 'Custom'}</ThemedText>
                  {appt.notes && <ThemedText style={styles.cardNote}>Note: {appt.notes}</ThemedText>}
                </Pressable>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  bookButton: {
    backgroundColor: '#2e78b7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#555',
  },
  cardNote: {
    marginTop: 8,
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  }
});
