import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Pressable, ActivityIndicator, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ThemedText } from '@/components/themed-text';
import { api } from '@/lib/api';

export default function AppointmentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [eventText, setEventText] = useState('');
  
  // AI Report Form State
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportInput, setReportInput] = useState({
    mood: '', appetite: '', weight: '', skin_condition: '', behavior: '', service_result: '', caregiver_notes: ''
  });
  const [draftReport, setDraftReport] = useState<any>(null);
  const [editedSummary, setEditedSummary] = useState('');
  const [editedRecommendations, setEditedRecommendations] = useState('');

  // Fetch Appointment
  const { data: appointment, isLoading: apptLoading } = useQuery({
    queryKey: ['appointments', id],
    queryFn: async () => {
      // In a real app we might have a specific GET /appointments/{id}, 
      // but for now we'll fetch all and filter.
      const response = await api.get('/appointments/');
      return response.data.find((a: any) => a.id === id);
    }
  });

  // Fetch Care Session if it exists for this appointment
  const { data: careSession, isLoading: sessionLoading } = useQuery({
    queryKey: ['care-sessions', 'appointment', id],
    queryFn: async () => {
      try {
        const response = await api.get(`/care-sessions/appointment/${id}`);
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) return null;
        throw error;
      }
    },
    retry: false
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const response = await api.put(`/appointments/${id}/status`, { status: newStatus });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error: any) => {
      Alert.alert("Error", error.response?.data?.detail || "Failed to update status");
    }
  });

  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/care-sessions/${id}/start`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['care-sessions', 'appointment', id] });
    },
    onError: (error: any) => {
      Alert.alert("Error", error.response?.data?.detail || "Failed to start session");
    }
  });

  const addEventMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post(`/care-sessions/${careSession.id}/events`, data);
      return response.data;
    },
    onSuccess: () => {
      setEventText('');
      queryClient.invalidateQueries({ queryKey: ['care-sessions', 'appointment', id] });
    }
  });

  const generateReportMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post(`/care-sessions/${careSession.id}/report/generate`, data);
      return response.data;
    },
    onSuccess: (data) => {
      setDraftReport(data);
      setEditedSummary(data.summary);
      setEditedRecommendations(data.recommendations);
    },
    onError: (error: any) => {
      Alert.alert("Error", error.response?.data?.detail || "Failed to generate report");
    }
  });

  const confirmReportMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post(`/care-sessions/${careSession.id}/report/confirm`, data);
      return response.data;
    },
    onSuccess: () => {
      // Also complete the appointment
      updateStatusMutation.mutate('COMPLETED');
      setShowReportForm(false);
      setDraftReport(null);
    },
    onError: (error: any) => {
      Alert.alert("Error", error.response?.data?.detail || "Failed to confirm report");
    }
  });

  if (apptLoading || sessionLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={styles.centerContainer}>
        <ThemedText>Appointment not found.</ThemedText>
      </View>
    );
  }

  const handleUpdateStatus = (status: string) => {
    updateStatusMutation.mutate(status);
  };

  const handleStartSession = () => {
    startSessionMutation.mutate();
  };

  const handleAddEvent = () => {
    if (!eventText) return;
    addEventMutation.mutate({
      session_id: careSession.id,
      event_type: 'TEXT',
      content: eventText,
    });
  };

  const handleGenerateReport = () => {
    generateReportMutation.mutate({
      ...reportInput,
      weight: reportInput.weight ? parseFloat(reportInput.weight) : null
    });
  };

  const handleConfirmReport = () => {
    confirmReportMutation.mutate({
      summary: editedSummary,
      recommendations: editedRecommendations,
      health_metrics_json: draftReport.metrics
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.header}>Appointment Details</ThemedText>
        
        <View style={styles.card}>
          <ThemedText style={styles.label}>Scheduled Time:</ThemedText>
          <ThemedText>{new Date(appointment.scheduled_time).toLocaleString()}</ThemedText>
          
          <ThemedText style={[styles.label, { marginTop: 8 }]}>Status:</ThemedText>
          <ThemedText style={styles.statusText}>{appointment.status}</ThemedText>
          
          <ThemedText style={[styles.label, { marginTop: 8 }]}>Total Price:</ThemedText>
          <ThemedText>${appointment.total_price}</ThemedText>
          
          {appointment.notes && (
             <View>
                <ThemedText style={[styles.label, { marginTop: 8 }]}>Notes:</ThemedText>
                <ThemedText>{appointment.notes}</ThemedText>
             </View>
          )}
        </View>

        {/* Status Actions */}
        <ThemedText style={styles.sectionTitle}>Actions (Staff only)</ThemedText>
        <View style={styles.actionRow}>
          {appointment.status === 'PENDING' && (
            <Pressable style={styles.actionButton} onPress={() => handleUpdateStatus('CONFIRMED')}>
              <ThemedText style={styles.actionButtonText}>Confirm Booking</ThemedText>
            </Pressable>
          )}
          {appointment.status === 'CONFIRMED' && (
            <Pressable style={styles.actionButton} onPress={() => handleUpdateStatus('CHECKED_IN')}>
              <ThemedText style={styles.actionButtonText}>Check In Pet</ThemedText>
            </Pressable>
          )}
          {appointment.status === 'CHECKED_IN' && (
            <Pressable style={styles.actionButton} onPress={() => handleUpdateStatus('IN_PROGRESS')}>
              <ThemedText style={styles.actionButtonText}>Start Services</ThemedText>
            </Pressable>
          )}
          {appointment.status === 'IN_PROGRESS' && !showReportForm && (
            <Pressable style={[styles.actionButton, { backgroundColor: '#27ae60' }]} onPress={() => setShowReportForm(true)}>
              <ThemedText style={styles.actionButtonText}>Finalize Session & Generate Report</ThemedText>
            </Pressable>
          )}
        </View>

        {/* AI Report Form */}
        {showReportForm && (
          <View style={styles.card}>
            <ThemedText style={styles.sectionTitle}>Caregiver Assessment</ThemedText>
            
            {!draftReport ? (
              <View>
                <TextInput style={styles.inputField} placeholder="Mood (e.g. Happy, Anxious)" value={reportInput.mood} onChangeText={t => setReportInput({...reportInput, mood: t})} />
                <TextInput style={styles.inputField} placeholder="Appetite" value={reportInput.appetite} onChangeText={t => setReportInput({...reportInput, appetite: t})} />
                <TextInput style={styles.inputField} placeholder="Weight (kg)" keyboardType="numeric" value={reportInput.weight} onChangeText={t => setReportInput({...reportInput, weight: t})} />
                <TextInput style={styles.inputField} placeholder="Skin Condition" value={reportInput.skin_condition} onChangeText={t => setReportInput({...reportInput, skin_condition: t})} />
                <TextInput style={styles.inputField} placeholder="Behavior" value={reportInput.behavior} onChangeText={t => setReportInput({...reportInput, behavior: t})} />
                <TextInput style={styles.inputField} placeholder="Service Result (e.g. Grooming complete, nails trimmed)" value={reportInput.service_result} onChangeText={t => setReportInput({...reportInput, service_result: t})} />
                <TextInput style={[styles.inputField, { height: 80 }]} multiline placeholder="Additional Notes" value={reportInput.caregiver_notes} onChangeText={t => setReportInput({...reportInput, caregiver_notes: t})} />
                
                <Pressable style={[styles.actionButton, { backgroundColor: '#8e44ad', marginTop: 10 }]} onPress={handleGenerateReport}>
                  {generateReportMutation.isPending ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.actionButtonText}>Generate AI Care Report</ThemedText>}
                </Pressable>
                <Pressable style={{ marginTop: 15, alignItems: 'center' }} onPress={() => setShowReportForm(false)}>
                  <ThemedText style={{ color: '#888' }}>Cancel</ThemedText>
                </Pressable>
              </View>
            ) : (
              <View>
                <ThemedText style={[styles.label, { color: '#8e44ad', marginBottom: 10 }]}>✨ AI Draft Generated</ThemedText>
                
                <ThemedText style={styles.label}>Summary</ThemedText>
                <TextInput style={[styles.inputField, { height: 100 }]} multiline value={editedSummary} onChangeText={setEditedSummary} />
                
                <ThemedText style={styles.label}>Recommendations</ThemedText>
                <TextInput style={[styles.inputField, { height: 80 }]} multiline value={editedRecommendations} onChangeText={setEditedRecommendations} />
                
                <Pressable style={[styles.actionButton, { backgroundColor: '#27ae60', marginTop: 10 }]} onPress={handleConfirmReport}>
                  {confirmReportMutation.isPending ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.actionButtonText}>Confirm & Complete Appointment</ThemedText>}
                </Pressable>
                <Pressable style={{ marginTop: 15, alignItems: 'center' }} onPress={() => setDraftReport(null)}>
                  <ThemedText style={{ color: '#888' }}>Discard Draft</ThemedText>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {/* Live Care Tracking */}
        {['IN_PROGRESS', 'COMPLETED'].includes(appointment.status) && (
          <View style={styles.trackingSection}>
            <ThemedText style={styles.sectionTitle}>Live Care Tracking</ThemedText>
            
            {!careSession ? (
              <Pressable style={styles.startSessionButton} onPress={handleStartSession}>
                {startSessionMutation.isPending ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.actionButtonText}>Initialize Care Session</ThemedText>}
              </Pressable>
            ) : (
              <View>
                <View style={styles.timeline}>
                  {careSession.events?.length === 0 ? (
                    <ThemedText style={{ color: '#777', fontStyle: 'italic' }}>No events recorded yet.</ThemedText>
                  ) : (
                    careSession.events?.map((ev: any) => (
                      <View key={ev.id} style={styles.timelineEvent}>
                         <View style={styles.timelineDot} />
                         <View style={styles.timelineContent}>
                            <ThemedText style={styles.timelineTime}>{new Date(ev.timestamp).toLocaleTimeString()}</ThemedText>
                            <ThemedText style={styles.timelineText}>{ev.event_type}: {ev.content}</ThemedText>
                         </View>
                      </View>
                    ))
                  )}
                </View>

                {appointment.status === 'IN_PROGRESS' && (
                  <View style={styles.addEventBox}>
                     <TextInput 
                        style={styles.input}
                        placeholder="Update on pet..."
                        value={eventText}
                        onChangeText={setEventText}
                     />
                     <Pressable style={styles.addEventButton} onPress={handleAddEvent}>
                        {addEventMutation.isPending ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.actionButtonText}>Add Update</ThemedText>}
                     </Pressable>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  card: { padding: 16, backgroundColor: '#f9f9f9', borderRadius: 12, borderWidth: 1, borderColor: '#eee', marginBottom: 20 },
  label: { fontWeight: 'bold', color: '#555' },
  statusText: { fontSize: 16, fontWeight: 'bold', color: '#2e78b7' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 10, marginBottom: 12 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  actionButton: { backgroundColor: '#2e78b7', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  actionButtonText: { color: '#fff', fontWeight: 'bold' },
  trackingSection: { marginTop: 10, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#eee' },
  startSessionButton: { backgroundColor: '#8e44ad', padding: 16, borderRadius: 12, alignItems: 'center' },
  timeline: { paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: '#ddd', marginLeft: 10, marginBottom: 20 },
  timelineEvent: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#2e78b7', position: 'absolute', left: -17, top: 4 },
  timelineContent: { flex: 1, paddingLeft: 10 },
  timelineTime: { fontSize: 12, color: '#888', marginBottom: 4 },
  timelineText: { fontSize: 15 },
  addEventBox: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#fafafa' },
  inputField: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#fafafa', marginBottom: 10 },
  addEventButton: { backgroundColor: '#f39c12', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 },
});
