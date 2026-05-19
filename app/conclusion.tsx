console.log('[MODULE] loaded: app/conclusion.tsx')
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius } from '../constants/theme';

export default function ConclusionScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={28} color={Colors.textFaint} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.headline}>You've been busy.</Text>
        <Text style={[styles.headline, styles.subline]}>You've found your rhythm.</Text>

        <Text style={styles.body}>
          The free tier gives you a taste. Upgrade to unlock everything — no limits, no friction.
        </Text>

        <Text style={styles.body}>
          Unlimited removes the caps — use it as much as you want.
        </Text>

        <Text style={styles.pricing}>$39.99/year or $4.99/month</Text>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>Continue free</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 12,
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  headline: {
    fontSize: FontSize.display,
    fontWeight: '600',
    color: Colors.textDark,
    lineHeight: 38,
  },
  subline: {
    marginTop: -16,
  },
  body: {
    fontSize: FontSize.bodyLg,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  pricing: {
    fontSize: FontSize.body,
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
  },
  buttons: {
    marginTop: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: FontSize.bodyLg,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  secondaryButtonText: {
    fontSize: FontSize.bodyMd,
    color: Colors.textFaint,
  },
});
