import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, FontFamily, FontSize, Radius } from '../constants/theme';
import { useGuidedPaths } from '../hooks/useGuidedPaths';
import { useSelah } from '../hooks/useSelah';

export default function PathCompleteScreen() {
  const { pathId } = useLocalSearchParams<{ pathId: string }>();
  const { getPathById } = useGuidedPaths();
  const { getVerseByReference } = useSelah();

  const path = getPathById(pathId ?? '');
  const lastDay = path?.days[path.duration - 1] ?? null;
  const verse = lastDay ? getVerseByReference(lastDay.verseReference) : null;

  if (!path) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.completeLabel}>PATH COMPLETE</Text>
        <Text style={styles.symbol}>✦</Text>
        <Text style={styles.pathTitle}>{path.title}</Text>

        {verse && (
          <View style={styles.verseBlock}>
            <Text style={styles.verseText}>{verse.text}</Text>
            <Text style={styles.verseReference}>{verse.reference}</Text>
          </View>
        )}

        <Text style={styles.completionLine}>
          You showed up every day. That is what faithfulness looks like.
        </Text>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace('/')}
          activeOpacity={0.8}
        >
          <Text style={styles.homeButtonText}>Return home</Text>
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
    paddingHorizontal: 32,
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  completeLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  symbol: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.display,
    color: Colors.accent,
  },
  pathTitle: {
    fontSize: FontSize.headingMd,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    fontFamily: FontFamily.display,
  },
  verseBlock: {
    gap: 10,
    alignItems: 'center',
    paddingVertical: 8,
  },
  verseText: {
    fontFamily: FontFamily.display,
    fontSize: 18,
    color: Colors.textDark,
    lineHeight: 30,
    textAlign: 'center',
  },
  verseReference: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  completionLine: {
    fontSize: FontSize.bodyMd,
    color: Colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  homeButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    paddingVertical: 18,
    paddingHorizontal: 48,
    alignItems: 'center',
    marginTop: 8,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: FontSize.bodyLg,
    fontWeight: '700',
  },
});
