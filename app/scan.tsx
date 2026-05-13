import { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius } from '../constants/theme';

const PLACEHOLDER_RESULT = {
  product_name: 'Sample Product',
  verdict: 'YES' as const,
  net_carbs: 4,
  serving_size: '100g',
  total_carbs: 6,
  fiber: 2,
  sugar_alcohols: 0,
  protein: 8,
  fat: 12,
  calories: 180,
  confidence: 'HIGH' as const,
  commentary: 'This is placeholder commentary about the scanned product. In the real app, an AI model would generate this analysis.',
  suggestion: 'Would pair well with a side of roasted vegetables.',
};

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [analysing, setAnalysing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  function handleCapture() {
    if (analysing) return;
    setAnalysing(true);
    setTimeout(() => {
      setAnalysing(false);
      router.push({
        pathname: '/result',
        params: { scan: JSON.stringify(PLACEHOLDER_RESULT) },
      });
    }, 1200);
  }

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.permissionContainer]}>
        <Text style={styles.permissionText}>
          Camera access is needed to scan items
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
          activeOpacity={0.8}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace('/')}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={28} color="#fff" />
      </TouchableOpacity>

      {analysing && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.analysingText}>Analysing...</Text>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.captureButton, analysing && styles.disabled]}
          onPress={handleCapture}
          activeOpacity={0.85}
          disabled={analysing}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.libraryButton, analysing && styles.disabled]}
          onPress={handleCapture}
          activeOpacity={0.7}
          disabled={analysing}
        >
          <Ionicons name="images-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    padding: 32,
  },
  permissionText: {
    fontSize: FontSize.bodyLg,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: FontSize.bodyLg,
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  analysingText: {
    color: '#fff',
    fontSize: FontSize.heading,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  captureButtonInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  libraryButton: {
    position: 'absolute',
    right: 36,
    bottom: 52,
  },
  disabled: {
    opacity: 0.4,
  },
  backButton: {
    position: 'absolute',
    top: 56,
    left: 16,
    padding: 8,
  },
});
