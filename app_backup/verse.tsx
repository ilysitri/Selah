console.log('[MODULE] loaded: app/verse.tsx')
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize } from '../constants/theme';
import { useSelah } from '../hooks/useSelah';
import { useSaved } from '../hooks/useSaved';
import { useTraces } from '../hooks/useTraces';
import { usePremium } from '../hooks/usePremium';
import { useTracePrompt } from '../hooks/useTracePrompt';
import PremiumGateModal from '../components/PremiumGateModal';
import type { MoodTag, Verse } from '../types/selah';

const MOOD_TAGS: MoodTag[] = [
  'afraid', 'anxious', 'overwhelmed', 'weary', 'exhausted',
  'grieving', 'heartbroken', 'lonely', 'abandoned',
  'ashamed', 'despairing', 'restless',
  'grateful', 'worshipful', 'strong', 'courageous',
];

function asMoodTag(raw: string | undefined): MoodTag {
  const s = raw ?? '';
  return (MOOD_TAGS as string[]).includes(s) ? (s as MoodTag) : 'weary';
}

export default function VerseScreen() {
  const { mood: moodParam, reference: referenceParam } = useLocalSearchParams<{ mood: string; reference?: string }>();
  const { getRandomVerseByMood, getPrayerByMood, getVerseByReference } = useSelah();
  const { isSaved, saveVerse, unsaveVerse, getSaved } = useSaved();
  const { loadTraces } = useTraces();
  const { isPremium, loading: premiumLoading } = usePremium();

  const mood = asMoodTag(moodParam);
  const prayer = getPrayerByMood(mood);
  const pinned = Boolean(referenceParam);

  const [verse, setVerse] = useState<Verse | null>(() => {
    if (referenceParam) return getVerseByReference(referenceParam);
    return getRandomVerseByMood(mood);
  });
  const [bookmarked, setBookmarked] = useState(false);
  const [showSaveGate, setShowSaveGate] = useState(false);
  const [showTraceGate, setShowTraceGate] = useState(false);

  const { tracePromptVisible, tracedToday, traceOpacity } = useTracePrompt(verse?.reference);

  useEffect(() => {
    if (verse) {
      isSaved(verse.reference).then(setBookmarked);
    }
  }, [verse?.reference]);

  async function handleBookmarkToggle() {
    if (!verse) return;
    if (bookmarked) {
      await unsaveVerse(verse.reference);
      setBookmarked(false);
      return;
    }
    if (!premiumLoading && !isPremium) {
      const saved = await getSaved();
      if (saved.length >= 3) {
        setShowSaveGate(true);
        return;
      }
    }
    await saveVerse(verse.reference);
    setBookmarked(true);
  }

  async function handleTracePress() {
    if (!verse) return;
    if (!premiumLoading && !isPremium) {
      const traces = await loadTraces();
      if (traces.length >= 1) {
        setShowTraceGate(true);
        return;
      }
    }
    router.push({
      pathname: '/trace',
      params: { reference: verse.reference, verseText: verse.text, tone: verse.tone },
    });
  }

  function handleNextVerse() {
    setVerse(getRandomVerseByMood(mood));
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.6}
        >
          <Ionicons name="chevron-back" size={28} color={Colors.accent} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={handleBookmarkToggle}
          activeOpacity={0.6}
        >
          <Ionicons
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={Colors.accent}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {verse ? (
          <View style={styles.verseSection}>
            <Text style={styles.verseText}>{verse.text}</Text>
            <Text style={styles.reference}>{verse.reference}</Text>
          </View>
        ) : (
          <View style={styles.verseSection}>
            <Text style={styles.placeholderText}>More scripture coming soon for this mood.</Text>
          </View>
        )}

        {prayer && (
          <>
            <View style={styles.divider} />

            <View style={styles.prayerSection}>
              <Text style={styles.prayerLabel}>A prayer</Text>
              <Text style={styles.prayerText}>{prayer.prayer}</Text>
            </View>
          </>
        )}

        {!pinned && (
          <TouchableOpacity
            style={styles.nextVerseButton}
            onPress={handleNextVerse}
            activeOpacity={0.7}
          >
            <Text style={styles.nextVerseText}>Show me another</Text>
          </TouchableOpacity>
        )}

        {tracePromptVisible && (
          <Animated.View style={[styles.tracePromptContainer, { opacity: traceOpacity }]}>
            {tracedToday ? (
              <Text style={styles.tracedTodayText}>Traced today</Text>
            ) : verse ? (
              <TouchableOpacity
                style={styles.tracePromptButton}
                onPress={handleTracePress}
                activeOpacity={0.7}
              >
                <Ionicons name="create-outline" size={14} color={Colors.accent} />
                <Text style={styles.tracePromptText}>Trace this verse</Text>
              </TouchableOpacity>
            ) : null}
          </Animated.View>
        )}
      </ScrollView>

      <PremiumGateModal
        visible={showSaveGate}
        heading="You've saved 3 verses"
        body="Free accounts can save up to 3 verses. Upgrade to Selah+ for unlimited saved verses."
        ctaLabel="Upgrade to Selah+"
        onUpgrade={() => { setShowSaveGate(false); router.push('/paywall'); }}
        onDismiss={() => setShowSaveGate(false)}
      />

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
  bookmarkButton: {
    padding: 8,
    marginRight: 8,
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
  reference: {
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
  prayerSection: {
    gap: 14,
  },
  prayerLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  prayerText: {
    fontSize: FontSize.bodyLg,
    color: Colors.textSecondary,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  nextVerseButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  nextVerseText: {
    fontSize: FontSize.bodyMd,
    color: Colors.accent,
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
  placeholderText: {
    fontFamily: FontFamily.display,
    fontSize: 18,
    color: Colors.textFaint,
    lineHeight: 30,
    fontStyle: 'italic',
  },
});
