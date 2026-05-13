import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, FontSize, Radius } from '../constants/theme';

const TIMELINE = [
  { day: 'Day 1', description: 'Your first action' },
  { day: 'Day 7', description: 'Your first saved item in rotation' },
  { day: 'Day 14', description: "You'll know your top favourites" },
  { day: 'Day 30', description: 'It becomes a habit, not a search' },
];

export default function ThankYouScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>✦</Text>
        </View>

        <View style={styles.headerBlock}>
          <Text style={styles.headline}>Welcome to unlimited.</Text>
          <Text style={styles.subheadline}>Here's what's ahead.</Text>
        </View>

        <View style={styles.timeline}>
          {TIMELINE.map((entry) => (
            <View key={entry.day} style={styles.timelineRow}>
              <Text style={styles.timelineDay}>{entry.day}</Text>
              <Text style={styles.timelineDesc}>{entry.description}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.replace('/')}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>Get started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 48,
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 40,
    color: Colors.accent,
  },
  headerBlock: {
    alignItems: 'center',
    gap: 8,
  },
  headline: {
    fontSize: FontSize.headingXl,
    fontWeight: '600',
    color: Colors.textDark,
    textAlign: 'center',
  },
  subheadline: {
    fontSize: FontSize.bodyLg,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  timeline: {
    alignSelf: 'stretch',
    gap: 24,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineDay: {
    fontSize: FontSize.caption,
    fontWeight: '600',
    color: Colors.accent,
    letterSpacing: 1,
    textTransform: 'uppercase',
    width: 60,
    lineHeight: 22,
  },
  timelineDesc: {
    fontSize: FontSize.bodyMd,
    color: Colors.textDark,
    lineHeight: 22,
    flex: 1,
  },
  ctaButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    paddingVertical: 18,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  ctaText: {
    color: '#fff',
    fontSize: FontSize.bodyLg,
    fontWeight: '700',
  },
});
