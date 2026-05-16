console.log('[MODULE] loaded: app/path-detail.tsx')
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, Radius, Shadow } from '../constants/theme';
import { useGuidedPaths } from '../hooks/useGuidedPaths';
import { usePremium } from '../hooks/usePremium';
import PremiumGateModal from '../components/PremiumGateModal';

type PathProgress = {
  currentDay: number;
  completedDays: number[];
  completed: boolean;
} | null;

export default function PathDetailScreen() {
  const { pathId } = useLocalSearchParams<{ pathId: string }>();
  const { getPathById, getPathProgress, startPath } = useGuidedPaths();
  const { isPremium, loading: premiumLoading } = usePremium();

  const path = getPathById(pathId ?? '');
  const [progress, setProgress] = useState<PathProgress>(null);
  const [showPathGate, setShowPathGate] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      if (!pathId) return;
      getPathProgress(pathId).then(p => {
        if (mounted) setProgress(p);
      });
      return () => { mounted = false; };
    }, [pathId])
  );

  if (!path) return null;

  const isCompleted = progress?.completed ?? false;
  const isActive = !!progress && !isCompleted;
  const currentDay = progress?.currentDay ?? 1;

  async function handleCTA() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const p = path!;
    if (isActive) {
      if (!premiumLoading && !isPremium && currentDay > 1) {
        setShowPathGate(true);
        return;
      }
      router.push({ pathname: '/path-day', params: { pathId: p.id, day: String(currentDay) } });
    } else {
      await startPath(p.id);
      router.push({ pathname: '/path-day', params: { pathId: p.id, day: '1' } });
    }
  }

  function dayStatus(dayNum: number): 'completed' | 'current' | 'future' {
    if (progress?.completedDays.includes(dayNum)) return 'completed';
    if (!isCompleted && dayNum === currentDay) return 'current';
    return 'future';
  }

  const ctaLabel = isActive
    ? `Continue — Day ${currentDay}`
    : isCompleted
    ? 'Begin again'
    : 'Begin this path';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.6}
      >
        <Ionicons name="chevron-back" size={28} color={Colors.accent} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>{path.emoji}</Text>
          <Text style={styles.title}>{path.title}</Text>
          <Text style={styles.subtitle}>{path.subtitle}</Text>
          <Text style={styles.description}>{path.description}</Text>
          <View style={styles.divider} />
          <Text style={styles.durationLabel}>{path.duration}-day journey</Text>
        </View>

        <View style={styles.dayList}>
          {path.days.map(dayContent => {
            const status = dayStatus(dayContent.day);
            const prayerPreview = dayContent.prayer.split(/\s+/).slice(0, 10).join(' ') + '…';
            const dayLocked = !premiumLoading && !isPremium && dayContent.day > 1;
            return (
              <TouchableOpacity
                key={dayContent.day}
                style={[
                  styles.dayCard,
                  status === 'current' && styles.dayCardCurrent,
                  status === 'future' && styles.dayCardFuture,
                ]}
                onPress={() => {
                  if (dayLocked) { setShowPathGate(true); return; }
                  router.push({ pathname: '/path-day', params: { pathId: path.id, day: String(dayContent.day) } });
                }}
                activeOpacity={0.7}
              >
                <View style={styles.dayCardLeft}>
                  <Text style={styles.dayNumber}>Day {dayContent.day}</Text>
                  <Text style={styles.dayReference}>{dayContent.verseReference}</Text>
                  <Text style={styles.dayPrayerPreview}>{prayerPreview}</Text>
                </View>
                {status === 'completed' ? (
                  <Text style={styles.completedMark}>✦</Text>
                ) : dayLocked ? (
                  <Text style={styles.plusBadge}>✦ Plus</Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.ctaButton} onPress={handleCTA} activeOpacity={0.8}>
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </TouchableOpacity>
      </ScrollView>

      <PremiumGateModal
        visible={showPathGate}
        heading="Day 1 is your preview"
        body="Selah+ unlocks all days of every Guided Path — structured journeys through scripture."
        ctaLabel="Upgrade to Selah+"
        onUpgrade={() => { setShowPathGate(false); router.push('/paywall'); }}
        onDismiss={() => setShowPathGate(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    marginLeft: 16,
    marginTop: 8,
    padding: 8,
    alignSelf: 'flex-start',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 56,
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: FontSize.headingMd,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    fontFamily: FontFamily.display,
  },
  subtitle: {
    fontSize: FontSize.body,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  description: {
    fontSize: FontSize.body,
    color: Colors.textMuted,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    alignSelf: 'stretch',
    marginVertical: 4,
  },
  durationLabel: {
    fontSize: FontSize.caption,
    color: Colors.accent,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  dayList: {
    gap: 10,
  },
  dayCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    ...Shadow.card,
  },
  dayCardCurrent: {
    borderColor: Colors.accent,
  },
  dayCardFuture: {
    opacity: 0.6,
  },
  dayCardLeft: {
    flex: 1,
    gap: 3,
  },
  dayNumber: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  dayReference: {
    fontSize: FontSize.bodyMd,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  dayPrayerPreview: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 2,
  },
  completedMark: {
    fontSize: FontSize.bodyMd,
    color: Colors.accent,
  },
  plusBadge: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 0.8,
  },
  ctaButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: FontSize.bodyLg,
    fontWeight: '700',
  },
});
