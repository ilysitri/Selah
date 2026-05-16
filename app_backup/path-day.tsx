console.log('[MODULE] loaded: app/path-day.tsx')
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, Radius, Shadow } from '../constants/theme';
import { useSelah } from '../hooks/useSelah';
import { useGuidedPaths } from '../hooks/useGuidedPaths';
import { usePremium } from '../hooks/usePremium';
import { useTraces } from '../hooks/useTraces';
import { useTracePrompt } from '../hooks/useTracePrompt';
import PremiumGateModal from '../components/PremiumGateModal';

export default function PathDayScreen() {
  const { pathId, day } = useLocalSearchParams<{ pathId: string; day: string }>();
  const { getVerseByReference } = useSelah();
  const { getPathById, getPathProgress, completeDay } = useGuidedPaths();
  const { isPremium, loading: premiumLoading } = usePremium();
  const { loadTraces } = useTraces();

  const dayNum = parseInt(day ?? '1', 10);
  const path = getPathById(pathId ?? '');
  const dayContent = path?.days[dayNum - 1] ?? null;
  const verse = dayContent ? getVerseByReference(dayContent.verseReference) : null;

  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [showPathGate, setShowPathGate] = useState(false);
  const [showTraceGate, setShowTraceGate] = useState(false);

  const confirmOpacity = useRef(new Animated.Value(0)).current;

  const { tracePromptVisible, tracedToday, traceOpacity } = useTracePrompt(verse?.reference);

  useEffect(() => {
    if (!pathId) return;
    getPathProgress(pathId).then(prog => {
      if (prog?.completedDays.includes(dayNum)) {
        setAlreadyCompleted(true);
      }
    });
  }, [pathId, dayNum]);

  async function handleComplete() {
    if (!path || !dayContent) return;
    await completeDay(path.id, dayNum);
    if (dayNum >= path.duration) {
      router.replace({ pathname: '/path-complete', params: { pathId: path.id } });
      return;
    }
    setJustCompleted(true);
    Animated.sequence([
      Animated.timing(confirmOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(confirmOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }

  if (!path || !dayContent) return null;

  const isCompleted = alreadyCompleted || justCompleted;
  const dayLocked = !premiumLoading && !isPremium && dayNum > 1;

  if (dayLocked) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.6}>
            <Ionicons name="chevron-back" size={28} color={Colors.accent} />
          </TouchableOpacity>
          <Text style={styles.dayLabel}>DAY {dayNum} OF {path.duration}</Text>
          <View style={styles.navSpacer} />
        </View>
        <PremiumGateModal
          visible={true}
          heading="Day 1 is your preview"
          body="Selah+ unlocks all days of every Guided Path — structured journeys through scripture."
          ctaLabel="Upgrade to Selah+"
          onUpgrade={() => router.push('/paywall')}
          onDismiss={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.6}>
          <Ionicons name="chevron-back" size={28} color={Colors.accent} />
        </TouchableOpacity>
        <Text style={styles.dayLabel}>DAY {dayNum} OF {path.duration}</Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.verseSection}>
          {verse ? (
            <>
              <Text style={styles.verseText}>{verse.text}</Text>
              <Text style={styles.verseReference}>{verse.reference}</Text>
            </>
          ) : (
            <Text style={styles.verseText}>{dayContent.verseReference}</Text>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.prayerSection}>
          <Text style={styles.sectionLabel}>TODAY'S PRAYER</Text>
          <Text style={styles.prayerText}>{dayContent.prayer}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.practiceSection}>
          <Text style={styles.sectionLabel}>TODAY'S PRACTICE</Text>
          <View style={styles.practiceCard}>
            <Text style={styles.practiceText}>{dayContent.practice}</Text>
          </View>
        </View>

        {isCompleted ? (
          <View style={styles.completedButton}>
            <Text style={styles.completedButtonText}>Completed ✦</Text>
          </View>
        ) : (
          <View style={styles.completeArea}>
            <TouchableOpacity style={styles.ctaButton} onPress={handleComplete} activeOpacity={0.8}>
              <Text style={styles.ctaText}>I did this today</Text>
            </TouchableOpacity>
            <Animated.Text style={[styles.confirmText, { opacity: confirmOpacity }]}>
              Day {dayNum} complete ✦
            </Animated.Text>
          </View>
        )}

        {tracePromptVisible && verse && (
          <Animated.View style={[styles.tracePromptContainer, { opacity: traceOpacity }]}>
            {tracedToday ? (
              <Text style={styles.tracedTodayText}>Traced today</Text>
            ) : (
              <TouchableOpacity
                style={styles.tracePromptButton}
                onPress={async () => {
                  if (!premiumLoading && !isPremium) {
                    const traces = await loadTraces();
                    if (traces.length >= 1) { setShowTraceGate(true); return; }
                  }
                  router.push({
                    pathname: '/trace',
                    params: { reference: verse.reference, verseText: verse.text, tone: verse.tone },
                  });
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="create-outline" size={14} color={Colors.accent} />
                <Text style={styles.tracePromptText}>Trace this verse</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}
      </ScrollView>

      <PremiumGateModal
        visible={showTraceGate}
        heading="Your first trace is free"
        body="Selah+ unlocks unlimited verse traces — your reflections, always yours."
        ctaLabel="Upgrade to Selah+"
        onUpgrade={() => { setShowTraceGate(false); router.push('/paywall'); }}
        onDismiss={() => setShowTraceGate(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  navSpacer: {
    width: 44,
  },
  dayLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 56,
    gap: 28,
  },
  verseSection: {
    gap: 14,
  },
  verseText: {
    fontFamily: FontFamily.display,
    fontSize: 18,
    color: Colors.textDark,
    lineHeight: 30,
  },
  verseReference: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  prayerSection: {},
  prayerText: {
    fontSize: FontSize.bodyMd,
    color: Colors.textSecondary,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  practiceSection: {},
  practiceCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 18,
    ...Shadow.card,
  },
  practiceText: {
    fontSize: FontSize.bodyMd,
    color: Colors.textDark,
    lineHeight: 26,
  },
  completeArea: {
    gap: 16,
    alignItems: 'center',
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
  confirmText: {
    fontSize: FontSize.bodyMd,
    color: Colors.accent,
  },
  completedButton: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  completedButtonText: {
    fontSize: FontSize.bodyLg,
    color: Colors.textFaint,
  },
  tracePromptContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  tracePromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  tracePromptText: {
    fontSize: FontSize.bodyMd,
    color: Colors.accent,
  },
  tracedTodayText: {
    fontSize: FontSize.bodyMd,
    color: Colors.textFaint,
    paddingVertical: 8,
  },
});
