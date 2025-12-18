import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/auth/useAuth';
import * as ImagePicker from 'expo-image-picker';
import { apiFetch } from '../../src/lib/api';

type RoadCondition = 'paved' | 'gravel' | 'dirt' | 'footpath' | 'no_road';
type Accessibility = 'vehicle' | 'motorcycle' | 'bicycle' | 'walking' | 'boat';
type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

type SavedLocation = {
  id?: string;
  lat: number;
  lng: number;
  altitude?: number;
  accuracy?: number;
  streetAddress?: string;
  landmark?: string;
  nearestTown?: string;
  district?: string;
  county?: string;
  region?: string;
  postalCode?: string;
  what3words?: string;
  photos: string[];
  accessInstructions: string;
  roadCondition: RoadCondition;
  accessibility: Accessibility;
  deliveryZone?: string;
  isDeliverable: boolean;
  deliveryNotes?: string;
  safetyWarnings?: string;
  primaryContact?: string;
  alternativeContact?: string;
  bestContactTime?: string;
  isVerified: boolean;
  verifiedBy?: string;
  lastDeliveryDate?: string;
  deliverySuccessRate?: number;
  capturedBy: string;
  deviceInfo?: string;
  weatherCondition?: string;
  timeOfDay: TimeOfDay;
  savedAt: string;
  updatedAt?: string;
  submittedAt?: string;
};

const roadOptions: RoadCondition[] = ['paved', 'gravel', 'dirt', 'footpath', 'no_road'];
const accessOptions: Accessibility[] = ['vehicle', 'motorcycle', 'bicycle', 'walking', 'boat'];
const timeOptions: TimeOfDay[] = ['morning', 'afternoon', 'evening', 'night'];

export default function LocationMapper() {
  const router = useRouter();
  const { user } = useAuth();

  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [altitude, setAltitude] = useState('');
  const [accuracy, setAccuracy] = useState('');

  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [nearestTown, setNearestTown] = useState('');
  const [district, setDistrict] = useState('');
  const [county, setCounty] = useState('');
  const [region, setRegion] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [what3Words, setWhat3Words] = useState('');

  const [photos, setPhotos] = useState<string[]>(['']);

  const [accessInstructions, setAccessInstructions] = useState('');
  const [roadCondition, setRoadCondition] = useState<RoadCondition>('paved');
  const [accessibility, setAccessibility] = useState<Accessibility>('vehicle');

  const [deliveryZone, setDeliveryZone] = useState('');
  const [isDeliverable, setIsDeliverable] = useState(true);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [safetyWarnings, setSafetyWarnings] = useState('');

  const [primaryContact, setPrimaryContact] = useState('');
  const [alternativeContact, setAlternativeContact] = useState('');
  const [bestContactTime, setBestContactTime] = useState('');

  const [weatherCondition, setWeatherCondition] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');

  const [submitting, setSubmitting] = useState(false);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentError, setRecentError] = useState<string | null>(null);
  const [recentLocations, setRecentLocations] = useState<SavedLocation[]>([]);

  const normalizedPhotos = useMemo(() => photos.filter((p) => p.trim().length), [photos]);

  const useCurrentLocation = () => {
    if (typeof navigator === 'undefined' || !(navigator as any).geolocation) {
      Alert.alert('Location services', 'Geolocation is not available. Enter GPS coordinates manually.');
      return;
    }

    (navigator as any).geolocation.getCurrentPosition(
      (pos: any) => {
        setLat(String(pos.coords.latitude?.toFixed(6)));
        setLng(String(pos.coords.longitude?.toFixed(6)));
        if (pos.coords.altitude) setAltitude(String(pos.coords.altitude?.toFixed(2)));
        if (pos.coords.accuracy) setAccuracy(String(pos.coords.accuracy?.toFixed(2)));

        const hour = new Date().getHours();
        if (hour < 12) setTimeOfDay('morning');
        else if (hour < 17) setTimeOfDay('afternoon');
        else if (hour < 20) setTimeOfDay('evening');
        else setTimeOfDay('night');
      },
      () => Alert.alert('Location services', 'Unable to fetch current position. Enter coordinates manually.'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const addPhotoField = () => setPhotos((prev) => [...prev, '']);
  const removePhotoField = (index: number) => setPhotos((prev) => prev.filter((_, idx) => idx !== index));
  const updatePhoto = (index: number, value: string) =>
    setPhotos((prev) => prev.map((item, idx) => (idx === index ? value : item)));

  const pickPhotoFromDevice = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'Allow photo access to upload delivery point images.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        base64: true,
        quality: 0.65,
      });
      if (!result.canceled && result.assets?.length) {
        const asset = result.assets[0];
        const value = asset.base64
          ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
          : asset.uri;
        if (value) {
          setPhotos((prev) => [...prev.filter((p) => p.trim().length), value]);
        }
      }
    } catch (err) {
      Alert.alert('Upload failed', 'Could not open the photo picker.');
    }
  };

  const loadRecentLocations = async () => {
    setRecentLoading(true);
    try {
      const response = await apiFetch('/api/locations?limit=3');
      setRecentLocations(Array.isArray(response?.locations) ? response.locations : []);
      setRecentError(null);
    } catch (err) {
      setRecentError(err instanceof Error ? err.message : 'Unable to load submitted locations.');
    } finally {
      setRecentLoading(false);
    }
  };

  useEffect(() => {
    loadRecentLocations();
  }, []);

  const save = async () => {
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      Alert.alert('Check coordinates', 'Latitude and longitude are required numeric values.');
      return;
    }
    if (!accessInstructions.trim()) {
      Alert.alert('Access instructions', 'Describe how a driver can reach this location.');
      return;
    }

    const payload: SavedLocation = {
      lat: latNum,
      lng: lngNum,
      altitude: altitude ? Number(altitude) : undefined,
      accuracy: accuracy ? Number(accuracy) : undefined,
      streetAddress: streetAddress.trim() || undefined,
      landmark: landmark.trim() || undefined,
      nearestTown: nearestTown.trim() || undefined,
      district: district.trim() || undefined,
      county: county.trim() || undefined,
      region: region.trim() || undefined,
      postalCode: postalCode.trim() || undefined,
      what3words: what3Words.trim() || undefined,
      photos: normalizedPhotos.slice(0, 6),
      accessInstructions: accessInstructions.trim(),
      roadCondition,
      accessibility,
      deliveryZone: deliveryZone.trim() || undefined,
      isDeliverable,
      deliveryNotes: deliveryNotes.trim() || undefined,
      safetyWarnings: safetyWarnings.trim() || undefined,
      primaryContact: primaryContact.trim() || undefined,
      alternativeContact: alternativeContact.trim() || undefined,
      bestContactTime: bestContactTime.trim() || undefined,
      isVerified: false,
      capturedBy: user?.email || user?.name || 'anonymous',
      deviceInfo: 'GoMarket App',
      weatherCondition: weatherCondition.trim() || undefined,
      timeOfDay,
      savedAt: new Date().toISOString(),
    };

    try {
      setSubmitting(true);
      const response = await apiFetch('/api/locations', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await AsyncStorage.setItem('MY_LOCATION_DATA', JSON.stringify(payload));
      Alert.alert(
        'Location saved',
        `Coordinates submitted successfully${response?.location?.id ? ` (ID: ${response.location.id})` : ''}.`
      );
      loadRecentLocations();
      router.back();
    } catch (err) {
      Alert.alert('Save failed', err instanceof Error ? err.message : 'Could not save location.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Comprehensive Location Mapping</Text>
      <Text style={styles.subtitle}>Capture GPS, directions, and photos for hard-to-find rural spots.</Text>

      {recentLoading ? (
        <View style={[styles.section, { alignItems: 'center' }]}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8, color: '#555' }}>Loading recent submissions…</Text>
        </View>
      ) : recentError ? (
        <View style={styles.section}>
          <Text style={[styles.label, { color: '#c0392b' }]}>Recent submissions unavailable.</Text>
          <Text style={{ color: '#666', marginBottom: 8 }}>{recentError}</Text>
          <TouchableOpacity style={styles.smallBtn} onPress={loadRecentLocations}>
            <Text style={styles.smallBtnText}>Reload</Text>
          </TouchableOpacity>
        </View>
      ) : recentLocations.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Rural Pins</Text>
          {recentLocations.map((loc) => (
            <View key={loc.id || loc.savedAt} style={{ marginBottom: 12 }}>
              <Text style={{ fontWeight: '700', color: '#222' }}>
                {loc.nearestTown || loc.landmark || 'Unlabeled location'}
              </Text>
              <Text style={{ color: '#555', fontSize: 12 }}>
                {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)} • {loc.accessInstructions}
              </Text>
              {loc.photos?.length ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                  {loc.photos.slice(0, 3).map((uri, idx) => (
                    <Image key={idx} source={{ uri }} style={[styles.preview, { marginRight: 8 }]} />
                  ))}
                </ScrollView>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GPS Coordinates</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Latitude *</Text>
            <TextInput style={styles.input} value={lat} onChangeText={setLat} keyboardType="numeric" placeholder="-1.2921" />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Longitude *</Text>
            <TextInput style={styles.input} value={lng} onChangeText={setLng} keyboardType="numeric" placeholder="36.8219" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Altitude (m)</Text>
            <TextInput style={styles.input} value={altitude} onChangeText={setAltitude} keyboardType="numeric" placeholder="1200" />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Accuracy (m)</Text>
            <TextInput style={styles.input} value={accuracy} onChangeText={setAccuracy} keyboardType="numeric" placeholder="5" />
          </View>
        </View>
        <TouchableOpacity style={styles.btn} onPress={useCurrentLocation}>
          <Text style={styles.btnText}>Use Current Location</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Address Details</Text>
        <Text style={styles.label}>Street Address / House Number</Text>
        <TextInput style={styles.input} value={streetAddress} onChangeText={setStreetAddress} placeholder="House 12, River Road" />
        <Text style={styles.label}>Nearest Landmark</Text>
        <TextInput style={styles.input} value={landmark} onChangeText={setLandmark} placeholder="Opposite St. Mary Church" />
        <Text style={styles.label}>Nearest Town / Trading Centre</Text>
        <TextInput style={styles.input} value={nearestTown} onChangeText={setNearestTown} placeholder="Nyeri, Kasoa, etc." />
        <Text style={styles.label}>District / County / Region</Text>
        <TextInput style={styles.input} value={district} onChangeText={setDistrict} placeholder="District" />
        <TextInput style={styles.input} value={county} onChangeText={setCounty} placeholder="County" />
        <TextInput style={styles.input} value={region} onChangeText={setRegion} placeholder="Region / State" />
        <Text style={styles.label}>Postal / Rural Code</Text>
        <TextInput style={styles.input} value={postalCode} onChangeText={setPostalCode} placeholder="R3A-024" />
        <Text style={styles.label}>what3words</Text>
        <TextInput style={styles.input} value={what3Words} onChangeText={setWhat3Words} placeholder="street.village.market" autoCapitalize="none" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Access & Road Conditions</Text>
        <Text style={styles.label}>How can a driver reach this location?</Text>
        <TextInput
          style={[styles.input, { minHeight: 60 }]}
          value={accessInstructions}
          onChangeText={setAccessInstructions}
          placeholder="After the bridge turn left onto the dirt path, blue gate on the right."
          multiline
        />
        <Text style={styles.label}>Road Condition</Text>
        <View style={styles.pickerContainer}>
          {roadOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.pickerOption, roadCondition === option && styles.pickerOptionSelected]}
              onPress={() => setRoadCondition(option)}
            >
              <Text style={[styles.pickerText, roadCondition === option && styles.pickerTextSelected]}>{option.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Access Method</Text>
        <View style={styles.pickerContainer}>
          {accessOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.pickerOption, accessibility === option && styles.pickerOptionSelected]}
              onPress={() => setAccessibility(option)}
            >
              <Text style={[styles.pickerText, accessibility === option && styles.pickerTextSelected]}>{option.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Details</Text>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Location is deliverable</Text>
          <Switch value={isDeliverable} onValueChange={setIsDeliverable} />
        </View>
        <Text style={styles.label}>Delivery Zone</Text>
        <TextInput style={styles.input} value={deliveryZone} onChangeText={setDeliveryZone} placeholder="Rural North, Zone A" />
        <Text style={styles.label}>Delivery Notes</Text>
        <TextInput
          style={[styles.input, { minHeight: 60 }]}
          value={deliveryNotes}
          onChangeText={setDeliveryNotes}
          placeholder="Keep packages away from goats, call before arrival, etc."
          multiline
        />
        <Text style={styles.label}>Safety Warnings</Text>
        <TextInput
          style={[styles.input, { minHeight: 60 }]}
          value={safetyWarnings}
          onChangeText={setSafetyWarnings}
          placeholder="Loose dogs, river crossing floods, slippery slope…"
          multiline
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <Text style={styles.label}>Primary Contact</Text>
        <TextInput style={styles.input} value={primaryContact} onChangeText={setPrimaryContact} placeholder="+254712..." keyboardType="phone-pad" />
        <Text style={styles.label}>Alternative Contact</Text>
        <TextInput style={styles.input} value={alternativeContact} onChangeText={setAlternativeContact} placeholder="Neighbour, spouse, etc." />
        <Text style={styles.label}>Best Contact Time</Text>
        <TextInput style={styles.input} value={bestContactTime} onChangeText={setBestContactTime} placeholder="Weekdays 8am-6pm" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Visual Documentation</Text>
        <Text style={styles.subtitle}>Upload pictures of the homestead, gate, or delivery point.</Text>
        {photos.map((value, index) => (
          <View key={index} style={styles.photoRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={value}
              onChangeText={(text) => updatePhoto(index, text)}
              placeholder="https:// or data:image/... base64"
              autoCapitalize="none"
            />
            <TouchableOpacity style={[styles.smallBtn, { backgroundColor: '#eee' }]} onPress={() => removePhotoField(index)}>
              <Text style={[styles.smallBtnText, { color: '#444' }]}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.smallBtn} onPress={addPhotoField}>
            <Text style={styles.smallBtnText}>Add Photo Field</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallBtn} onPress={pickPhotoFromDevice}>
            <Text style={styles.smallBtnText}>Upload From Device</Text>
          </TouchableOpacity>
        </View>
        {normalizedPhotos.length ? (
          <View style={styles.previewRow}>
            {normalizedPhotos.slice(0, 4).map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={styles.preview} />
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Environmental Context</Text>
        <Text style={styles.label}>Weather Condition</Text>
        <TextInput style={styles.input} value={weatherCondition} onChangeText={setWeatherCondition} placeholder="Sunny, rainy, foggy…" />
        <Text style={styles.label}>Time of Day</Text>
        <View style={styles.pickerContainer}>
          {timeOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.pickerOption, timeOfDay === option && styles.pickerOptionSelected]}
              onPress={() => setTimeOfDay(option)}
            >
              <Text style={[styles.pickerText, timeOfDay === option && styles.pickerTextSelected]}>{option.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        onPress={save}
        disabled={submitting}
        style={[
          styles.btn,
          {
            backgroundColor: submitting ? '#a86e77' : '#B30F1F',
            marginTop: 16,
            marginBottom: 32,
            opacity: submitting ? 0.7 : 1,
          },
        ]}
      >
        <Text style={styles.btnText}>{submitting ? 'Saving...' : 'Save Location for Delivery'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', color: '#222' },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginVertical: 6 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 6,
  },
  row: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  label: { fontWeight: '600', fontSize: 14, color: '#444', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 14,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: '#B30F1F',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: 'rgba(179, 15, 31, 0.35)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  smallBtn: {
    backgroundColor: '#B30F1F',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  smallBtnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  previewRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  preview: { width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#eee' },
  pickerContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  pickerOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#f0f2f5' },
  pickerOptionSelected: { backgroundColor: '#B30F1F', borderColor: '#B30F1F' },
  pickerText: { color: '#555', fontWeight: '600', fontSize: 12 },
  pickerTextSelected: { color: '#fff' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
});
