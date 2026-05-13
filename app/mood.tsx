import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, FontSize, Radius, Shadow } from '../constants/theme';
import { useSelah } from '../hooks/useSelah';
import type { MoodTag } from '../types/selah';

export default function MoodEntryScreen() {
  const { getAllMoods, getMoodDisplayLabel } = useSelah();
  const { width } = useWindowDimensions();

  const moods = getAllMoods();
  const PADDING = 24;
  const GAP = 10;
  const cardWidth = (width - PADDING * 2 - GAP) / 2;

  function handleSelect(mood: MoodTag) {
    router.push({ pathname: '/verse', params: { mood } });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.prompt}>How are you{'\n'}right now?</Text>

        <View style={styles.grid}>
          {moods.map((mood) => (
            <TouchableOpacity
              key={mood}
              style={[styles.moodCard, { width: cardWidth }]}
              onPress={() => handleSelect(mood)}
              activeOpacity={0.7}
            >
              <Text style={styles.moodLabel}>{getMoodDisplayLabel(mood)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 48,
    gap: 32,
  },
  prompt: {
    fontSize: FontSize.headingXl,
    fontWeight: '600',
    color: Colors.textDark,
    lineHeight: 34,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moodCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 20,
    minHeight: 74,
    justifyContent: 'center',
    ...Shadow.card,
  },
  moodLabel: {
    fontSize: FontSize.bodyMd,
    color: Colors.textDark,
    lineHeight: 22,
  },
});
