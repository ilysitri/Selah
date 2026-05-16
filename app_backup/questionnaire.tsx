console.log('[MODULE] loaded: app/questionnaire.tsx')
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, FontSize, Radius, Shadow } from '../constants/theme';

const OPTIONS = [
  { label: 'Option A — describe the first user goal or motivation here', key: 'a' },
  { label: 'Option B — describe the second user goal or motivation here', key: 'b' },
  { label: 'Option C — describe the third user goal or motivation here', key: 'c' },
];

export default function QuestionnaireScreen() {
  function handleSelect(_key: string) {
    router.replace('/questionnaire-response');
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => handleSelect('skipped')}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content} scrollEnabled={false}>
        <Text style={styles.headline}>What brings you here?</Text>

        <View style={styles.cards}>
          {OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={styles.card}
              onPress={() => handleSelect(opt.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.cardText}>{opt.label}</Text>
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
  skipButton: {
    alignSelf: 'flex-end',
    padding: 12,
    marginRight: 4,
  },
  skipText: {
    fontSize: FontSize.body,
    color: Colors.textThin,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  headline: {
    fontSize: FontSize.headingXl,
    fontWeight: '600',
    color: Colors.textDark,
  },
  cards: {
    marginTop: 32,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 20,
    ...Shadow.card,
  },
  cardText: {
    fontSize: FontSize.bodyLg,
    color: Colors.textDark,
    lineHeight: 22,
  },
});
