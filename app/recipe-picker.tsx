import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Shadow } from '../constants/theme';

const PLACEHOLDER_IDEAS = [
  {
    title: 'Placeholder Recipe Title One',
    description: 'A brief, appetising description of this recipe. Bold adjectives make this sing.',
  },
  {
    title: 'Placeholder Recipe Title Two',
    description: 'Another description. Keep it to two lines — punchy and descriptive.',
  },
  {
    title: 'Placeholder Recipe Title Three',
    description: 'Third option. One of these three will be marked as recommended.',
  },
];

const RECOMMENDED_INDEX = 0;

export default function RecipePickerScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.6}
      >
        <Ionicons name="chevron-back" size={28} color={Colors.accent} />
      </TouchableOpacity>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Pick your idea</Text>
          <Text style={styles.subtitle}>Three suggestions based on your input</Text>
        </View>

        {PLACEHOLDER_IDEAS.map((idea, index) => {
          const isRecommended = index === RECOMMENDED_INDEX;
          return (
            <TouchableOpacity
              key={idea.title}
              style={[styles.card, isRecommended && styles.cardRecommended]}
              onPress={() =>
                router.push({
                  pathname: '/recipe-card',
                  params: { title: idea.title },
                })
              }
              activeOpacity={0.7}
            >
              {isRecommended && (
                <View style={styles.recommendedPill}>
                  <Text style={styles.recommendedPillText}>RECOMMENDED</Text>
                </View>
              )}
              <View style={[styles.cardContent, isRecommended && styles.cardContentWithPill]}>
                <Text style={styles.cardTitle}>{idea.title}</Text>
                <Text style={styles.cardDescription}>{idea.description}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
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
    padding: 24,
    paddingBottom: 48,
    gap: 18,
  },
  backButton: {
    marginLeft: 16,
    marginTop: 8,
    padding: 8,
    alignSelf: 'flex-start',
  },
  header: {
    marginBottom: 4,
    gap: 6,
  },
  title: {
    fontSize: FontSize.headingXl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.bodyMd,
    fontWeight: '400',
    color: Colors.textFaint,
    lineHeight: 22,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.cardMd,
  },
  cardRecommended: {
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  recommendedPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  recommendedPillText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardContent: {
    gap: 12,
  },
  cardContentWithPill: {
    paddingTop: 28,
  },
  cardTitle: {
    fontSize: FontSize.heading,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  cardDescription: {
    fontSize: FontSize.body,
    color: Colors.textFaint,
    lineHeight: 20,
  },
});
