import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, Radius } from '../constants/theme';

type Verdict = 'YES' | 'NO' | 'MAYBE';
type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';

type Props = {
  product_name: string;
  verdict: Verdict;
  net_carbs: number | null;
  confidence: Confidence;
};

const VERDICT_COLOR: Record<Verdict, string> = {
  YES: Colors.statusYes,
  NO: Colors.statusNo,
  MAYBE: Colors.statusMaybe,
};

const CONFIDENCE_LABEL: Record<Confidence, string> = {
  HIGH: 'High confidence',
  MEDIUM: 'Medium confidence',
  LOW: 'Low confidence',
};

export default function VerdictCard({ product_name, verdict, net_carbs, confidence }: Props) {
  const verdictColor = VERDICT_COLOR[verdict];

  return (
    <View style={styles.card}>
      <Text style={styles.productName} numberOfLines={2}>
        {product_name}
      </Text>

      <Text style={[styles.verdict, { color: verdictColor }]}>
        {verdict}
      </Text>

      <Text style={styles.netCarbs}>
        {net_carbs !== null
          ? `${net_carbs}g net carbs per serving`
          : 'Net carbs unavailable'}
      </Text>

      <View style={[styles.confidenceBadge, { borderColor: verdictColor }]}>
        <Text style={[styles.confidenceText, { color: verdictColor }]}>
          {CONFIDENCE_LABEL[confidence]}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderRadius: Radius.xxl,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  productName: {
    fontSize: FontSize.bodyMd,
    fontWeight: '500',
    color: Colors.textWarm,
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  verdict: {
    fontSize: FontSize.verdict,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 76,
    marginBottom: 8,
  },
  netCarbs: {
    fontSize: FontSize.bodyLg,
    fontWeight: '400',
    color: '#4A4540',
    marginBottom: 20,
  },
  confidenceBadge: {
    borderWidth: 1,
    borderRadius: Radius.xxl,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  confidenceText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
});
