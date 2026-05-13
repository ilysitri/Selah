import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors, FontSize, Radius } from '../constants/theme';

const PLACEHOLDER_CARD = {
  recipe_name: 'Placeholder Recipe Title',
  why: 'A short italic note about why this recipe is great — one or two sentences.',
  ingredients: [
    '200g main ingredient',
    '2 tbsp supporting ingredient',
    '1 tsp seasoning',
    '100ml liquid',
    'Garnish to taste',
  ],
  method: [
    'Prepare the main ingredient and set aside.',
    'Heat the pan over medium heat. Add the supporting ingredient and cook for 2 minutes.',
    'Combine everything and season to taste.',
    'Serve immediately and garnish.',
  ],
};

export default function RecipeCardScreen() {
  const { title } = useLocalSearchParams<{ title?: string }>();
  const card = { ...PLACEHOLDER_CARD, recipe_name: title ?? PLACEHOLDER_CARD.recipe_name };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.recipeName}>{card.recipe_name}</Text>
          <Text style={styles.why}>{card.why}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionHeading}>Ingredients</Text>
          <View style={styles.list}>
            {card.ingredients.map((item, i) => (
              <View key={i} style={styles.ingredientRow}>
                <View style={styles.bullet} />
                <Text style={styles.ingredientText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionHeading}>Method</Text>
          <View style={styles.list}>
            {card.method.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <Text style={styles.stepNumber}>{i + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => { router.dismissAll(); router.replace('/'); }}
          activeOpacity={0.8}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
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
    paddingBottom: 56,
    gap: 24,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    padding: 28,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  recipeName: {
    fontSize: FontSize.headingLg,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 32,
    marginBottom: 8,
  },
  why: {
    fontSize: FontSize.body,
    color: Colors.accent,
    fontStyle: 'italic',
    lineHeight: 21,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 22,
  },
  sectionHeading: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  list: {
    gap: 10,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    marginTop: 7,
    flexShrink: 0,
  },
  ingredientText: {
    fontSize: FontSize.bodyMd,
    color: '#333',
    lineHeight: 22,
    flex: 1,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  stepNumber: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: Colors.accent,
    width: 18,
    lineHeight: 22,
    flexShrink: 0,
  },
  stepText: {
    fontSize: FontSize.bodyMd,
    color: '#333',
    lineHeight: 22,
    flex: 1,
  },
  doneButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: FontSize.bodyLg,
    fontWeight: '700',
  },
});
