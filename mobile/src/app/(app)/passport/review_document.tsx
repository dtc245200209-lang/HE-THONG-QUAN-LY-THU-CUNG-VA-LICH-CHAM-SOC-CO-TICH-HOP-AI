import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, TextInput, Alert, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { api } from '@/lib/api';

export default function ReviewDocumentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const petId = params.petId as string;
  const docId = params.docId as string;
  const dataString = params.data as string;
  
  const queryClient = useQueryClient();
  
  let extractedData: any = {};
  try {
    if (dataString) {
      extractedData = JSON.parse(decodeURIComponent(dataString));
    }
  } catch (e) {
    console.error("Failed to parse extracted data");
  }

  const [form, setForm] = useState({
    title: extractedData.document_type ? `${extractedData.document_type} Document` : 'Scanned Document',
    document_type: extractedData.document_type || 'UNKNOWN',
    vaccine_name: extractedData.vaccine_name || '',
    vaccination_date: extractedData.vaccination_date || '',
    next_due_date: extractedData.next_due_date || '',
    veterinarian: extractedData.veterinarian || '',
    clinic: extractedData.clinic || '',
    diagnosis: extractedData.diagnosis || '',
  });

  const confirmMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put(`/pets/${petId}/documents/${docId}/confirm`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet_passport', petId] });
      Alert.alert('Success', 'Document confirmed and saved to passport!');
      router.back();
    },
    onError: (err) => {
      Alert.alert('Error', 'Failed to confirm document');
    }
  });

  const handleConfirm = () => {
    confirmMutation.mutate(form);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.header}>Review AI Extraction</ThemedText>
        <ThemedText style={styles.subtext}>
          Please verify the information extracted by our AI scanner. Edit any incorrect fields before confirming.
        </ThemedText>

        <ThemedView style={styles.formContainer}>
          <ThemedText style={styles.label}>Title</ThemedText>
          <TextInput
            style={styles.input}
            value={form.title}
            onChangeText={(text) => setForm({ ...form, title: text })}
          />

          <ThemedText style={styles.label}>Document Type</ThemedText>
          <TextInput
            style={styles.input}
            value={form.document_type}
            onChangeText={(text) => setForm({ ...form, document_type: text })}
            placeholder="e.g. VACCINATION, PRESCRIPTION, MEDICAL_REPORT"
          />

          <ThemedText style={styles.label}>Vaccine Name (If Vaccination)</ThemedText>
          <TextInput
            style={styles.input}
            value={form.vaccine_name}
            onChangeText={(text) => setForm({ ...form, vaccine_name: text })}
            placeholder="Rabies, DHPP, etc."
          />

          <ThemedText style={styles.label}>Date (YYYY-MM-DD)</ThemedText>
          <TextInput
            style={styles.input}
            value={form.vaccination_date}
            onChangeText={(text) => setForm({ ...form, vaccination_date: text })}
            placeholder="2023-10-15"
          />

          <ThemedText style={styles.label}>Next Due Date (YYYY-MM-DD)</ThemedText>
          <TextInput
            style={styles.input}
            value={form.next_due_date}
            onChangeText={(text) => setForm({ ...form, next_due_date: text })}
            placeholder="2024-10-15"
          />

          <ThemedText style={styles.label}>Clinic / Hospital</ThemedText>
          <TextInput
            style={styles.input}
            value={form.clinic}
            onChangeText={(text) => setForm({ ...form, clinic: text })}
          />

          <ThemedText style={styles.label}>Veterinarian</ThemedText>
          <TextInput
            style={styles.input}
            value={form.veterinarian}
            onChangeText={(text) => setForm({ ...form, veterinarian: text })}
          />

          <ThemedText style={styles.label}>Diagnosis (If Medical Report)</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.diagnosis}
            onChangeText={(text) => setForm({ ...form, diagnosis: text })}
            multiline
            numberOfLines={3}
          />
        </ThemedView>

        <Pressable 
          style={styles.confirmButton} 
          onPress={handleConfirm}
          disabled={confirmMutation.isPending}
        >
          {confirmMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemedText style={styles.confirmButtonText}>Confirm & Save</ThemedText>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  formContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  confirmButton: {
    backgroundColor: '#2e78b7',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
