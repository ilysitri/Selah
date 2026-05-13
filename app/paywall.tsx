import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, Radius } from '../constants/theme';
import { getOfferings, type PurchasesPackage } from '../lib/purchases';
import { usePremium } from '../hooks/usePremium';

type Plan = 'annual' | 'monthly';

const VALUE_PROPS = [
  'Guided Paths — structured multi-day journeys through scripture',
  'Unlimited verse traces — your reflections, always yours',
  'All 6 collections, including cycle-aware scripture',
  'Unlimited saved verses',
  'Support a solo, female-led Christian app  ✦',
];

const FALLBACK_ANNUAL = '$39.99/year';
const FALLBACK_MONTHLY = '$9.99/month';

export default function PaywallScreen() {
  const router = useRouter();
  const { purchase, restore } = usePremium();

  const [selectedPlan, setSelectedPlan] = useState<Plan>('annual');
  const [annualPkg, setAnnualPkg] = useState<PurchasesPackage | null>(null);
  const [monthlyPkg, setMonthlyPkg] = useState<PurchasesPackage | null>(null);
  const [annualPrice, setAnnualPrice] = useState(FALLBACK_ANNUAL);
  const [monthlyPrice, setMonthlyPrice] = useState(FALLBACK_MONTHLY);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOfferings().then(offerings => {
      if (!offerings?.current) return;
      const annual = offerings.current.annual;
      const monthly = offerings.current.monthly;
      if (annual) {
        setAnnualPkg(annual);
        setAnnualPrice(annual.product.priceString + '/year');
      }
      if (monthly) {
        setMonthlyPkg(monthly);
        setMonthlyPrice(monthly.product.priceString + '/month');
      }
    });
  }, []);

  async function handlePurchase() {
    const pkg = selectedPlan === 'annual' ? annualPkg : monthlyPkg;
    if (!pkg) {
      // No offerings loaded — show error
      setError('Could not load pricing. Please check your connection and try again.');
      return;
    }
    setError(null);
    setPurchasing(true);
    const { success, cancelled } = await purchase(pkg);
    setPurchasing(false);
    if (success) {
      router.replace('/thank-you');
    } else if (!cancelled) {
      setError('Purchase failed. Please try again.');
    }
  }

  async function handleRestore() {
    setError(null);
    setRestoring(true);
    const restored = await restore();
    setRestoring(false);
    if (restored) {
      router.replace('/thank-you');
    } else {
      setError('No active subscription found.');
    }
  }

  const ctaLabel = purchasing ? '' : selectedPlan === 'monthly' ? 'Begin my free week' : 'Upgrade to Selah+';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={28} color={Colors.textFaint} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.title}>
            Selah<Text style={styles.titlePlus}>+</Text>
          </Text>
          <Text style={styles.subtitle}>For the woman who wants to go deeper.</Text>
        </View>

        <View style={styles.valueProps}>
          {VALUE_PROPS.map((prop) => (
            <View key={prop} style={styles.valuePropRow}>
              <Ionicons name="checkmark" size={18} color={Colors.accent} />
              <Text style={styles.valuePropText}>{prop}</Text>
            </View>
          ))}
        </View>

        <View style={styles.plans}>
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'annual' ? styles.planCardSelected : styles.planCardUnselected,
            ]}
            onPress={() => setSelectedPlan('annual')}
            activeOpacity={0.7}
          >
            <View style={styles.planTopRow}>
              <Text style={styles.planName}>Annual</Text>
              <View style={styles.savePill}>
                <Text style={styles.savePillText}>SAVE 67%</Text>
              </View>
            </View>
            <Text style={styles.planPrice}>{annualPrice}</Text>
            <Text style={styles.planDetail}>Just $3.33/month, billed annually</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'monthly' ? styles.planCardSelected : styles.planCardUnselected,
            ]}
            onPress={() => setSelectedPlan('monthly')}
            activeOpacity={0.7}
          >
            <View style={styles.planTopRow}>
              <Text style={styles.planName}>Monthly</Text>
            </View>
            <Text style={styles.planPrice}>{monthlyPrice}</Text>
            <Text style={styles.planDetail}>First 7 days free, then billed monthly</Text>
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.ctaButton, purchasing && styles.ctaButtonDisabled]}
          onPress={handlePurchase}
          activeOpacity={0.8}
          disabled={purchasing}
        >
          {purchasing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.ctaText}>{ctaLabel}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          activeOpacity={0.7}
          disabled={restoring}
        >
          {restoring ? (
            <ActivityIndicator color={Colors.textFaint} size="small" />
          ) : (
            <Text style={styles.restoreText}>Restore purchases</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.legalText}>
          Subscriptions auto-renew unless cancelled at least 24 hours before renewal. Manage in your account settings.
        </Text>

        <TouchableOpacity
          style={styles.maybeLater}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.maybeLaterText}>Maybe later</Text>
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
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 12,
    zIndex: 10,
  },
  content: {
    paddingTop: 80,
    paddingBottom: 24,
    paddingHorizontal: 24,
    gap: 32,
  },
  header: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: FontSize.display,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: FontFamily.display,
    textAlign: 'center',
  },
  titlePlus: {
    color: Colors.accent,
  },
  subtitle: {
    fontSize: FontSize.bodyLg,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  valueProps: {
    gap: 14,
  },
  valuePropRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  valuePropText: {
    fontSize: FontSize.bodyMd,
    color: Colors.textDark,
    lineHeight: 22,
    flex: 1,
  },
  plans: {
    gap: 12,
  },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 18,
    gap: 2,
  },
  planCardSelected: {
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  planCardUnselected: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  planTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  planName: {
    fontSize: FontSize.subheading,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  savePill: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  savePillText: {
    color: '#fff',
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
  planPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  planDetail: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  errorText: {
    fontSize: FontSize.bodyMd,
    color: Colors.statusNo,
    textAlign: 'center',
    marginTop: -16,
  },
  ctaButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    color: '#fff',
    fontSize: FontSize.bodyLg,
    fontWeight: '700',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 4,
    marginTop: -16,
  },
  restoreText: {
    fontSize: FontSize.bodyMd,
    color: Colors.textFaint,
  },
  legalText: {
    fontSize: FontSize.xs,
    color: Colors.textFaint,
    lineHeight: 16,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  maybeLater: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  maybeLaterText: {
    fontSize: FontSize.body,
    color: Colors.textThin,
  },
});
