import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, ActivityIndicator, Switch, Pressable, Alert, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Colors } from '@/constants/theme';
import { api } from '@/lib/api';

const { width } = Dimensions.get('window');

type Tab = 'HEALTH' | 'CARE' | 'DOCS';

export default function PassportDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('HEALTH');

  const { data, isLoading, error } = useQuery({
    queryKey: ['pet_passport', id],
    queryFn: async () => {
      const response = await api.get(`/pets/${id}/passport`);
      return response.data;
    }
  });

  const toggleLostMode = useMutation({
    mutationFn: async (lostMode: boolean) => {
      const response = await api.put(`/pets/${id}/lost_mode`, { lost_mode: lostMode });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet_passport', id] });
    }
  });

  const scanDocument = useMutation({
    mutationFn: async (imageUri: string) => {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        name: 'document.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await api.post(`/pets/${id}/documents/scan`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      router.push(`/passport/review_document?petId=${id}&docId=${data.id}&data=${encodeURIComponent(JSON.stringify(data.extracted_data))}`);
    },
    onError: (err) => {
      Alert.alert('Scan Failed', 'Could not scan the document.');
    }
  });

  const handleScanDocument = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "You need to allow camera access to scan documents.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      scanDocument.mutate(result.assets[0].uri);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </ThemedView>
    );
  }

  if (error || !data) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText style={styles.errorText}>Failed to load pet passport.</ThemedText>
      </ThemedView>
    );
  }

  const { pet, allergies, conditions, vaccinations, medications, weights, medical_records, care_reports, qr_token } = data;
  const latestWeight = weights?.length > 0 ? weights[0].weight_kg : 'N/A';

  const renderHealthTab = () => (
    <Animated.View entering={FadeInUp.duration(400)}>
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Medical Vitals</ThemedText>
        <View style={styles.row}>
          <ThemedView style={styles.vitalCard}>
            <MaterialCommunityIcons name="weight-kilogram" size={24} color="#0a7ea4" />
            <ThemedText style={styles.vitalValue}>{latestWeight} kg</ThemedText>
            <ThemedText style={styles.vitalLabel}>Weight</ThemedText>
          </ThemedView>
          <ThemedView style={styles.vitalCard}>
            <MaterialCommunityIcons name="needle" size={24} color="#0a7ea4" />
            <ThemedText style={styles.vitalValue}>{vaccinations?.length || 0}</ThemedText>
            <ThemedText style={styles.vitalLabel}>Vaccines</ThemedText>
          </ThemedView>
          <ThemedView style={styles.vitalCard}>
            <MaterialCommunityIcons name="pill" size={24} color="#0a7ea4" />
            <ThemedText style={styles.vitalValue}>{medications?.length || 0}</ThemedText>
            <ThemedText style={styles.vitalLabel}>Meds</ThemedText>
          </ThemedView>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Vaccinations</ThemedText>
        {vaccinations?.length === 0 ? <ThemedText style={styles.emptyText}>No vaccinations recorded.</ThemedText> : null}
        {vaccinations?.map((vax: any, i: number) => (
          <View key={vax.id} style={styles.listItem}>
            <View style={styles.listIcon}>
              <MaterialCommunityIcons name="shield-check" size={20} color="#4CAF50" />
            </View>
            <View style={styles.listContent}>
              <ThemedText style={styles.listTitle}>{vax.vaccine_name}</ThemedText>
              <ThemedText style={styles.listSubtitle}>Date: {vax.date_administered}</ThemedText>
            </View>
            {vax.next_due_date && (
              <View style={styles.listBadge}>
                <ThemedText style={styles.listBadgeText}>Due: {vax.next_due_date}</ThemedText>
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Allergies & Conditions</ThemedText>
        {(allergies?.length === 0 && conditions?.length === 0) ? <ThemedText style={styles.emptyText}>No conditions recorded.</ThemedText> : null}
        {allergies?.map((allergy: any) => (
          <View key={allergy.id} style={styles.listItem}>
            <View style={[styles.listIcon, { backgroundColor: 'rgba(244, 67, 54, 0.1)' }]}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#F44336" />
            </View>
            <View style={styles.listContent}>
              <ThemedText style={styles.listTitle}>{allergy.allergen}</ThemedText>
              <ThemedText style={styles.listSubtitle}>Allergy • Severity: {allergy.severity}</ThemedText>
            </View>
          </View>
        ))}
      </View>
    </Animated.View>
  );

  const renderCareTab = () => (
    <Animated.View entering={FadeInUp.duration(400)}>
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Care History</ThemedText>
        {care_reports?.length === 0 ? <ThemedText style={styles.emptyText}>No care reports recorded.</ThemedText> : null}
        {care_reports?.map((report: any) => (
          <View key={report.id} style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <ThemedText style={styles.reportDate}>{new Date(report.created_at).toLocaleDateString()}</ThemedText>
              <Ionicons name="sparkles" size={16} color="#F7971E" />
            </View>
            <ThemedText style={styles.reportText}>{report.summary}</ThemedText>
            {report.recommendations && (
              <View style={styles.aiRecommendation}>
                <Ionicons name="bulb-outline" size={16} color="#0a7ea4" style={{ marginRight: 4 }} />
                <ThemedText style={styles.aiRecommendationText}>{report.recommendations}</ThemedText>
              </View>
            )}
          </View>
        ))}
      </View>
    </Animated.View>
  );

  const renderDocsTab = () => (
    <Animated.View entering={FadeInUp.duration(400)}>
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Emergency Protection</ThemedText>
        
        <View style={styles.settingCard}>
          <View style={styles.settingContent}>
            <Ionicons name="warning" size={24} color="#F44336" />
            <View style={styles.settingText}>
              <ThemedText style={styles.settingTitle}>Lost Pet Mode</ThemedText>
              <ThemedText style={styles.settingSubtitle}>Activates emergency SOS screen on QR scan</ThemedText>
            </View>
          </View>
          <Switch 
            value={pet.lost_mode} 
            onValueChange={(val) => toggleLostMode.mutate(val)} 
            disabled={toggleLostMode.isPending}
            trackColor={{ false: '#767577', true: '#F44336' }}
          />
        </View>

        <Pressable 
          style={styles.qrButton} 
          onPress={() => router.push(`/passport/qr?token=${qr_token}&petName=${pet.name}`)}
        >
          <LinearGradient colors={['#192f6a', '#3b5998']} style={styles.gradientButton}>
            <Ionicons name="qr-code" size={24} color="white" />
            <ThemedText style={styles.qrButtonText}>View Emergency QR Tag</ThemedText>
          </LinearGradient>
        </Pressable>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>AI Smart Scanner</ThemedText>
        <Pressable onPress={handleScanDocument} disabled={scanDocument.isPending}>
          <LinearGradient colors={['#8E2DE2', '#4A00E0']} style={[styles.gradientButton, { height: 100 }]}>
            {scanDocument.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="scan" size={32} color="white" />
                <View style={{ alignItems: 'center' }}>
                  <ThemedText style={styles.qrButtonText}>Scan Medical Document</ThemedText>
                  <ThemedText style={styles.buttonSubText}>Auto-extract data with AI</ThemedText>
                </View>
              </>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </Animated.View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Card */}
          <Animated.View entering={FadeIn.duration(600)}>
            <LinearGradient
              colors={['#4c669f', '#3b5998', '#192f6a']}
              style={styles.headerCard}
            >
              <View style={styles.headerTopRow}>
                <View style={styles.headerAvatar}>
                  <Ionicons name={pet.species === 'CAT' ? 'logo-octocat' : 'paw'} size={40} color="rgba(255,255,255,0.8)" />
                </View>
                <View style={styles.headerInfo}>
                  <ThemedText style={styles.headerName}>{pet.name}</ThemedText>
                  <ThemedText style={styles.headerBreed}>{pet.breed || 'Unknown'} • {pet.species}</ThemedText>
                  <ThemedText style={styles.headerMeta}>DOB: {pet.date_of_birth || 'N/A'}</ThemedText>
                </View>
              </View>
              
              <View style={styles.headerBottomRow}>
                <View>
                  <ThemedText style={styles.headerLabel}>PASSPORT ID</ThemedText>
                  <ThemedText style={styles.headerValue}>{pet.id.substring(0, 8).toUpperCase()}</ThemedText>
                </View>
                {pet.lost_mode && (
                  <View style={styles.lostBadge}>
                    <ThemedText style={styles.lostBadgeText}>LOST MODE ACTIVE</ThemedText>
                  </View>
                )}
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Custom Tabs */}
          <View style={styles.tabContainer}>
            <Pressable onPress={() => setActiveTab('HEALTH')} style={[styles.tab, activeTab === 'HEALTH' && styles.activeTab]}>
              <ThemedText style={[styles.tabText, activeTab === 'HEALTH' && styles.activeTabText]}>Health</ThemedText>
            </Pressable>
            <Pressable onPress={() => setActiveTab('CARE')} style={[styles.tab, activeTab === 'CARE' && styles.activeTab]}>
              <ThemedText style={[styles.tabText, activeTab === 'CARE' && styles.activeTabText]}>Care</ThemedText>
            </Pressable>
            <Pressable onPress={() => setActiveTab('DOCS')} style={[styles.tab, activeTab === 'DOCS' && styles.activeTab]}>
              <ThemedText style={[styles.tabText, activeTab === 'DOCS' && styles.activeTabText]}>Emergency</ThemedText>
            </Pressable>
          </View>

          {/* Content */}
          <View style={styles.tabContent}>
            {activeTab === 'HEALTH' && renderHealthTab()}
            {activeTab === 'CARE' && renderCareTab()}
            {activeTab === 'DOCS' && renderDocsTab()}
          </View>

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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
    marginTop: Spacing.two,
  },
  headerCard: {
    borderRadius: 24,
    padding: Spacing.five,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    gap: Spacing.four,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  headerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerBreed: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  headerMeta: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  headerBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: Spacing.three,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
  headerValue: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 2,
    marginTop: 2,
  },
  lostBadge: {
    backgroundColor: '#F44336',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 12,
  },
  lostBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    borderRadius: 16,
    padding: 4,
    marginTop: Spacing.two,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#0a7ea4',
    shadowColor: '#0a7ea4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  activeTabText: {
    color: 'white',
  },
  tabContent: {
    minHeight: 400,
  },
  section: {
    marginBottom: Spacing.six,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Spacing.three,
    paddingLeft: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  vitalCard: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: 16,
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: 'rgba(10, 126, 164, 0.05)',
  },
  vitalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  vitalLabel: {
    fontSize: 12,
    color: '#888',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    backgroundColor: 'rgba(150, 150, 150, 0.05)',
    borderRadius: 12,
    marginBottom: Spacing.two,
    gap: Spacing.three,
  },
  listIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  listSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  listBadge: {
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 8,
  },
  listBadgeText: {
    fontSize: 11,
    color: '#0a7ea4',
    fontWeight: '600',
  },
  reportCard: {
    backgroundColor: 'rgba(150, 150, 150, 0.05)',
    padding: Spacing.four,
    borderRadius: 16,
    marginBottom: Spacing.three,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  reportDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  reportText: {
    fontSize: 15,
    lineHeight: 22,
  },
  aiRecommendation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    padding: Spacing.three,
    borderRadius: 8,
    marginTop: Spacing.three,
  },
  aiRecommendationText: {
    flex: 1,
    fontSize: 13,
    color: '#0a7ea4',
    fontStyle: 'italic',
  },
  settingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.four,
    backgroundColor: 'rgba(244, 67, 54, 0.05)',
    borderRadius: 16,
    marginBottom: Spacing.four,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flex: 1,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  qrButton: {
    marginBottom: Spacing.four,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    borderRadius: 16,
    gap: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  qrButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSubText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 4,
  }
});
