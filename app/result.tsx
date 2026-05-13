import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import VerdictCard from '../components/VerdictCard';
import { Colors, FontSize, Radius } from '../constants/theme';

type PlaceholderResult = {
  product_name: string;
  verdict: 'YES' | 'NO' | 'MAYBE';
  net_carbs: number | null;
  serving_size: string;
  total_carbs: number;
  fiber: number;
  sugar_alcohols: number;
  protein: number;
  fat: number;
  calories: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  commentary: string;
  suggestion: string;
};

const FALLBACK: PlaceholderResult = {
  product_name: 'Sample Product',
  verdict: 'YES',
  net_carbs: 4,
  serving_size: '100g',
  total_carbs: 6,
  fiber: 2,
  sugar_alcohols: 0,
  protein: 8,
  fat: 12,
  calories: 180,
  confidence: 'HIGH',
  commentary: 'Placeholder commentary. The real app would generate this analysis from AI after scanning the product label.',
  suggestion: 'This suggestion would describe how the product fits into a recipe or meal.',
};

export default function ResultScreen() {
  const { scan } = useLocalSearchParams<{ scan: string }>();
  const router = useRouter();

  let result: PlaceholderResult = FALLBACK;
  try {
    if (scan) result = JSON.parse(scan);
  } catch {}

  const nutritionRows = [
    { label: 'Calories', value: result.calories, unit: ' kcal' },
    { label: 'Protein', value: result.protein, unit: 'g' },
    { label: 'Fat', value: result.fat, unit: 'g' },
    { label: 'Total Carbs', value: result.total_carbs, unit: 'g' },
    { label: 'Fiber', value: result.fiber, unit: 'g' },
    { label: 'Net Carbs', value: result.net_carbs, unit: 'g' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.6}>
        <Ionicons name="chevron-back" size={28} color={Colors.accent} />
      </TouchableOpacity>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <VerdictCard
          product_name={result.product_name}
          verdict={result.verdict}
          net_carbs={result.net_carbs}
          confidence={result.confidence}
        />

        <View style={styles.nutritionTable}>
          {nutritionRows.map(({ label, value, unit }) => (
            <View key={label} style={styles.nutritionRow}>
              <Text style={styles.nutritionLabel}>{label}</Text>
              <Text style={styles.nutritionValue}>
                {value !== null && value !== undefined ? `${value}${unit}` : '—'}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.commentary}>{result.commentary}</Text>

        {result.suggestion ? (
          <Text style={styles.suggestion}>{result.suggestion}</Text>
        ) : null}

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/recipe-picker')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get Ideas →</Text>
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
    paddingBottom: 48,
    gap: 24,
  },
  backButton: {
    marginLeft: 16,
    marginTop: 8,
    padding: 8,
    alignSelf: 'flex-start',
  },
  nutritionTable: {
    gap: 10,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: FontSize.bodyMd,
    color: Colors.textMuted,
  },
  nutritionValue: {
    fontSize: FontSize.bodyMd,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  commentary: {
    fontSize: FontSize.bodyMd,
    color: Colors.textSecondary,
    lineHeight: 23,
  },
  suggestion: {
    fontSize: FontSize.bodyMd,
    color: Colors.accentWarm,
    fontStyle: 'italic',
    lineHeight: 23,
  },
  button: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: FontSize.bodyLg,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
