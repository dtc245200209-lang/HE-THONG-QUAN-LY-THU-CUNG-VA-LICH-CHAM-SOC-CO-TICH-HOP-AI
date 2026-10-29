import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ThemedText } from '@/components/themed-text';
import { api } from '@/lib/api';

export default function BookAppointmentScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Fetch pets
  const { data: pets } = useQuery({
    queryKey: ['pets'],
    queryFn: async () => {
      const response = await api.get('/pets/');
      return response.data;
    }
  });

  // Fetch services
  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await api.get('/appointments/services');
      return response.data;
    }
  });

  const bookMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/appointments/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      Alert.alert("Success", "Appointment booked successfully!");
      router.back();
    },
    onError: (error: any) => {
      Alert.alert("Error", error.response?.data?.detail || error.message);
    }
  });

  const toggleService = (id: string) => {
    if (selectedServices.includes(id)) {
      setSelectedServices(prev => prev.filter(s => s !== id));
    } else {
      setSelectedServices(prev => [...prev, id]);
    }
  };

  const handleBook = () => {
    if (!selectedPet) return Alert.alert("Error", "Please select a pet");
    if (selectedServices.length === 0) return Alert.alert("Error", "Please select at least one service");
    if (!scheduledTime) return Alert.alert("Error", "Please enter a scheduled time");

    // Ensure scheduledTime is a valid ISO string. For simplicity, just appending time.
    // E.g. User enters "2023-12-01T10:00:00"
    try {
      const date = new Date(scheduledTime);
      if (isNaN(date.getTime())) {
         return Alert.alert("Error", "Invalid date format. Use YYYY-MM-DDTHH:mm:ss");
      }
      bookMutation.mutate({
        pet_id: selectedPet,
        service_ids: selectedServices,
        scheduled_time: date.toISOString(),
        notes: notes,
      });
    } catch(e) {
      Alert.alert("Error", "Invalid date format");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.header}>Book Appointment</ThemedText>

        <ThemedText style={styles.label}>Select Pet</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
          {pets?.map((pet: any) => (
            <Pressable 
              key={pet.id} 
              style={[styles.chip, selectedPet === pet.id && styles.chipSelected]}
              onPress={() => setSelectedPet(pet.id)}
            >
              <ThemedText style={[styles.chipText, selectedPet === pet.id && styles.chipTextSelected]}>
                {pet.name}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        <ThemedText style={styles.label}>Select Services</ThemedText>
        <View style={styles.servicesGrid}>
          {services?.map((svc: any) => (
            <Pressable 
              key={svc.id} 
              style={[styles.serviceCard, selectedServices.includes(svc.id) && styles.serviceCardSelected]}
              onPress={() => toggleService(svc.id)}
            >
              <ThemedText style={[styles.serviceName, selectedServices.includes(svc.id) && styles.serviceNameSelected]}>{svc.name}</ThemedText>
              <ThemedText style={styles.servicePrice}>${svc.base_price}</ThemedText>
            </Pressable>
          ))}
        </View>

        <ThemedText style={styles.label}>Date & Time (YYYY-MM-DDTHH:mm:ss)</ThemedText>
        <TextInput 
          style={styles.input}
          placeholder="e.g. 2026-10-15T14:30:00"
          value={scheduledTime}
          onChangeText={setScheduledTime}
        />

        <ThemedText style={styles.label}>Notes</ThemedText>
        <TextInput 
          style={[styles.input, styles.textArea]}
          placeholder="Any special requests?"
          multiline
          numberOfLines={4}
          value={notes}
          onChangeText={setNotes}
        />

        <Pressable 
          style={styles.submitButton}
          onPress={handleBook}
          disabled={bookMutation.isPending}
        >
          {bookMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.submitButtonText}>Book Now</ThemedText>
          )}
        </Pressable>

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
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  horizontalList: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#2e78b7',
  },
  chipText: {
    color: '#333',
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#fff',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: '47%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
  },
  serviceCardSelected: {
    borderColor: '#2e78b7',
    backgroundColor: '#e6f2ff',
  },
  serviceName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  serviceNameSelected: {
    color: '#2e78b7',
  },
  servicePrice: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#2e78b7',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
