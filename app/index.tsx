console.log('[MODULE] loaded: app/index.tsx')
import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, FontFamily, FontSize, Radius, Shadow } from '../constants/theme';
import { useSelah } from '../hooks/useSelah';
import { useDailyBite } from '../hooks/useDailyBite';
import { useGuidedPaths } from '../hooks/useGuidedPaths';
import { usePremium } from '../hooks/usePremium';
import { todayString, seededIndex } from '../lib/seededDate';
import { APP_TAGLINES, BITE_INVITATIONS } from '../constants/taglines';
import { useStreak } from '../hooks/useStreak';
import { useTraces } from '../hooks/useTraces';
import PremiumGateModal from '../components/PremiumGateModal';
import type { MoodTag, TraceEntry } from '../types/selah';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const ORDERED_MOODS: MoodTag[] = [
  'afraid', 'anxious', 'overwhelmed', 'grateful',
  'weary', 'exhausted', 'grieving', 'worshipful',
  'heartbroken', 'lonely', 'abandoned', 'strong',
  'ashamed', 'despairing', 'restless', 'courageous',
];

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${WEEKDAYS[date.getDay()]}, ${d} ${MONTHS[m - 1]}`;
}

type ActivePathData = { path: { id: string; duration: number }; progress: { currentDay: number } } | null;

export default function HomeScreen() {
  const router = useRouter();
  const { getMoodDisplayLabel, getMoodEmoji, getVerseByReference, getMoodEntryCount, trackMoodEntry } = useSelah();
  const { bite } = useDailyBite();
  const { streak } = useStreak();
  const { loadTraces, getTraceOneYearAgo } = useTraces();
  const { getActivePath } = useGuidedPaths();
  const { isPremium, loading: premiumLoading } = usePremium();
  const { width } = useWindowDimensions();

  const [showMoodGate, setShowMoodGate] = useState(false);

  const cardWidth = (width - 24 * 2 - 10) / 2;

  const [highlightedMood] = useState<MoodTag>(() => {
    const today = todayString();
    return ORDERED_MOODS[seededIndex(today, ORDERED_MOODS.length)];
  });

  const [tagline] = useState(() => {
    const today = todayString();
    return APP_TAGLINES[seededIndex(today, APP_TAGLINES.length)];
  });

  const [invitation] = useState(() => {
    const today = todayString();
    return BITE_INVITATIONS[seededIndex(today + '-inv', BITE_INVITATIONS.length)];
  });

  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [traces, setTraces] = useState<TraceEntry[]>([]);
  const [yearAgoTrace, setYearAgoTrace] = useState<TraceEntry | null>(null);
  const [activePath, setActivePath] = useState<ActivePathData>(null);

  useEffect(() => {
    AsyncStorage.getItem('selah:onboarded').then(val => {
      if (val !== 'true') {
        router.replace('/onboarding');
      } else {
        setOnboardingChecked(true);
      }
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      Promise.all([loadTraces(), getTraceOneYearAgo(), getActivePath()]).then(([all, yearAgo, currentPath]) => {
        if (!mounted) return;
        setTraces(all);
        setYearAgoTrace(yearAgo);
        setActivePath(currentPath);
      });
      return () => { mounted = false; };
    }, [])
  );

  async function handleMoodSelect(mood: MoodTag) {
    if (!premiumLoading && !isPremium) {
      const count = await getMoodEntryCount();
      if (count >= 3) {
        setShowMoodGate(true);
        return;
      }
    }
    await trackMoodEntry();
    router.push({ pathname: '/verse', params: { mood } });
  }

  if (!onboardingChecked) {
    return <View style={styles.container} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <View style={styles.headerWrapper}>
          <TouchableOpacity
            style={styles.gearButton}
            onPress={() => router.push('/settings')}
            activeOpacity={0.6}
          >
            <Ionicons name="settings-outline" size={20} color={Colors.textFaint} />
          </TouchableOpacity>
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Text style={styles.appName}>Selah<Text style={styles.appNameCross}> †</Text></Text>
            </View>
            <Text style={styles.tagline}>{tagline}</Text>
            <Text style={styles.streakText}>✦ {streak} {streak === 1 ? 'day' : 'days'}</Text>
          </View>
        </View>

        <View style={styles.dailyBiteCard}>
          <Text style={styles.dailyBiteLabel}>Today</Text>
          {bite ? (
            <>
              <Text style={styles.dailyBiteVerse}>{bite.verse.text}</Text>
              <Text style={styles.dailyBiteReference}>{bite.verse.reference}</Text>
              <View style={styles.dailyBiteDivider} />
              <Text style={styles.dailyBiteQuestion}>{bite.question}</Text>
              <Text style={styles.dailyBiteInvitation}>{invitation}</Text>
            </>
          ) : (
            <View style={styles.dailyBitePlaceholder} />
          )}
        </View>

        <View style={styles.moodSection}>
          <Text style={styles.moodSectionLabel}>RIGHT NOW</Text>
          <Text style={styles.moodSectionHeading}>How are you feeling?</Text>
          <View style={styles.grid}>
            {ORDERED_MOODS.map((mood) => (
              <TouchableOpacity
                key={mood}
                style={[
                  styles.moodCard,
                  { width: cardWidth },
                  mood === highlightedMood && styles.moodCardHighlighted,
                ]}
                onPress={() => handleMoodSelect(mood)}
                activeOpacity={0.7}
              >
                {mood === highlightedMood && (
                  <Text style={styles.highlightLabel}>is this you today?</Text>
                )}
                <Text style={styles.moodEmoji}>{getMoodEmoji(mood)}</Text>
                <Text style={styles.moodLabel}>{getMoodDisplayLabel(mood)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.exploreSection}>
          <Text style={styles.exploreSectionLabel}>EXPLORE</Text>
          <Text style={styles.exploreSectionHeading}>Go deeper</Text>
          <View style={styles.exploreRow}>
            <TouchableOpacity
              style={styles.exploreCard}
              onPress={() => router.push('/collections')}
              activeOpacity={0.7}
            >
              <Text style={styles.exploreEmoji}>🕊️</Text>
              <View>
                <Text style={styles.exploreCardLabel}>COLLECTIONS</Text>
                <Text style={styles.exploreCardTitle}>Curated verses</Text>
                <Text style={styles.exploreCardSub}>6 themed sets</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.exploreCard}
              onPress={() => router.push('/paths')}
              activeOpacity={0.7}
            >
              {!isPremium && !premiumLoading && (
                <Text style={styles.explorePlusBadge}>✦ Plus</Text>
              )}
              <Text style={styles.exploreEmoji}>✨</Text>
              <View>
                <Text style={styles.exploreCardLabel}>GUIDED PATHS</Text>
                <Text style={styles.exploreCardTitle}>Journey deeper</Text>
                {activePath ? (
                  <Text style={styles.exploreCardProgress}>
                    Day {activePath.progress.currentDay} of {activePath.path.duration} — continue
                  </Text>
                ) : (
                  <Text style={styles.exploreCardSub}>5–7 day paths</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {traces.length > 0 && (
          <View style={styles.reflectionsSection}>
            {yearAgoTrace && (
              <TouchableOpacity
                style={styles.yearAgoCard}
                onPress={() => {
                  const v = getVerseByReference(yearAgoTrace.reference);
                  router.push({
                    pathname: '/verse',
                    params: { mood: v?.mood_tags[0] ?? 'weary', reference: yearAgoTrace.reference },
                  });
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.yearAgoLabel}>ONE YEAR AGO</Text>
                <Text style={styles.yearAgoReference}>{yearAgoTrace.reference}</Text>
                <Text style={styles.yearAgoPhrase}>{yearAgoTrace.phrase}</Text>
                <Text style={styles.yearAgoDate}>{formatDisplayDate(yearAgoTrace.date)}</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.sectionHeading}>Reflections</Text>
            <Text style={styles.sectionSubheading}>
              Last trace — {formatDisplayDate(traces[0].date)}
            </Text>

            <View style={styles.traceList}>
              {traces.map((trace) => (
                <TouchableOpacity
                  key={trace.id}
                  style={styles.traceCard}
                  onPress={() => {
                    const v = getVerseByReference(trace.reference);
                    router.push({
                      pathname: '/verse',
                      params: { mood: v?.mood_tags[0] ?? 'weary', reference: trace.reference },
                    });
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.traceReference}>{trace.reference}</Text>
                  <Text style={styles.tracePhrase}>{trace.phrase}</Text>
                  <View style={styles.traceMeta}>
                    <Text style={styles.traceTone}>{trace.tone.toUpperCase()}</Text>
                    <Text style={styles.traceDate}>{formatDisplayDate(trace.date)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

      </ScrollView>

      <PremiumGateModal
        visible={showMoodGate}
        heading="You've found your rhythm"
        body="Free accounts get 3 scripture moments a day. Upgrade to Selah+ for unlimited access."
        ctaLabel="Upgrade to Selah+"
        onUpgrade={() => { setShowMoodGate(false); router.push('/paywall'); }}
        onDismiss={() => setShowMoodGate(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 24,
    paddingBottom: 56,
  },
  headerWrapper: {
    marginTop: 16,
    position: 'relative',
  },
  header: {
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    fontSize: FontSize.hero,
    fontWeight: '700',
    color: '#6B6355',
    lineHeight: 54,
    fontFamily: FontFamily.display,
    textAlign: 'center',
  },
  appNameCross: {
    fontSize: 14,
    fontWeight: '400',
    color: '#D4839A',
  },
  tagline: {
    fontSize: FontSize.body,
    fontWeight: '400',
    color: Colors.textFaint,
    marginTop: 6,
  },
  gearButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
    zIndex: 1,
  },
  streakText: {
    fontSize: FontSize.caption,
    color: Colors.textFaint,
    marginTop: 10,
  },
  dailyBiteCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    padding: 20,
    marginTop: 28,
    minHeight: 180,
    ...Shadow.cardMd,
  },
  dailyBiteLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  dailyBiteVerse: {
    fontFamily: FontFamily.display,
    fontSize: 18,
    color: Colors.textDark,
    lineHeight: 30,
    marginBottom: 10,
  },
  dailyBiteReference: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  dailyBiteDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 14,
  },
  dailyBiteQuestion: {
    fontSize: FontSize.bodyMd,
    color: Colors.textMuted,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  dailyBiteInvitation: {
    fontSize: FontSize.xs,
    color: Colors.textFaint,
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 8,
  },
  dailyBitePlaceholder: {
    flex: 1,
  },
  moodSection: {
    marginTop: 28,
  },
  moodSectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  moodSectionHeading: {
    fontSize: FontSize.heading,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moodCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    padding: 16,
    height: 88,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.card,
  },
  moodCardHighlighted: {
    backgroundColor: 'rgba(201, 160, 154, 0.10)',
  },
  highlightLabel: {
    fontSize: FontSize.xs,
    color: Colors.accent,
    fontStyle: 'italic',
    marginBottom: 2,
    textAlign: 'center',
  },
  moodEmoji: {
    fontSize: 22,
    marginBottom: 6,
    textAlign: 'center',
  },
  moodLabel: {
    fontSize: FontSize.bodyMd,
    color: Colors.textDark,
    lineHeight: 20,
    textAlign: 'center',
  },
  exploreSection: {
    marginTop: 28,
  },
  exploreSectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  exploreSectionHeading: {
    fontSize: FontSize.heading,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
    marginTop: 2,
  },
  exploreRow: {
    flexDirection: 'row',
    gap: 12,
  },
  exploreCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    minHeight: 120,
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    ...Shadow.card,
  },
  exploreEmoji: {
    fontSize: 32,
  },
  exploreCardLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  exploreCardTitle: {
    fontSize: FontSize.bodyMd,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  exploreCardSub: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  explorePlusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    fontSize: FontSize.xs,
    color: Colors.textThin,
  },
  exploreCardProgress: {
    fontSize: FontSize.xs,
    color: Colors.accent,
    fontStyle: 'italic',
    marginTop: 2,
  },
  reflectionsSection: {
    marginTop: 32,
    gap: 4,
  },
  yearAgoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    padding: 16,
    marginBottom: 20,
    gap: 6,
    ...Shadow.card,
  },
  yearAgoLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1.4,
  },
  yearAgoReference: {
    fontSize: FontSize.bodyLg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  yearAgoPhrase: {
    fontSize: FontSize.bodyMd,
    color: Colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  yearAgoDate: {
    fontSize: FontSize.xs,
    color: Colors.textThin,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: FontSize.headingMd,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  sectionSubheading: {
    fontSize: FontSize.caption,
    color: Colors.textFaint,
    marginBottom: 16,
  },
  traceList: {
    gap: 12,
  },
  traceCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    padding: 16,
    gap: 6,
    ...Shadow.card,
  },
  traceReference: {
    fontSize: FontSize.bodyLg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  tracePhrase: {
    fontSize: FontSize.bodyMd,
    color: Colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  traceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  traceTone: {
    fontSize: FontSize.xs,
    color: Colors.accent,
    fontWeight: '700',
    letterSpacing: 1,
  },
  traceDate: {
    fontSize: FontSize.xs,
    color: Colors.textThin,
  },
});
