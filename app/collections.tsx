import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Shadow } from '../constants/theme';
import { COLLECTIONS } from '../constants/collections';
import { usePremium } from '../hooks/usePremium';
import PremiumGateModal from '../components/PremiumGateModal';

const FREE_COLLECTION = 'rest-and-peace';

export default function CollectionsScreen() {
  const { isPremium, loading: premiumLoading } = usePremium();
  const [showGate, setShowGate] = useState(false);

  function handleCollectionPress(key: string) {
    const locked = !premiumLoading && !isPremium && key !== FREE_COLLECTION;
    if (locked) {
      setShowGate(true);
      return;
    }
    router.push({ pathname: '/collection-detail', params: { collection: key } });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.6}
      >
        <Ionicons name="chevron-back" size={28} color={Colors.accent} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Collections</Text>

        <View style={styles.list}>
          {COLLECTIONS.map((col) => {
            const locked = !premiumLoading && !isPremium && col.key !== FREE_COLLECTION;
            return (
              <TouchableOpacity
                key={col.key}
                style={styles.card}
                onPress={() => handleCollectionPress(col.key)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardName}>{col.name}</Text>
                  {locked && <Text style={styles.plusBadge}>✦ Plus</Text>}
                </View>
                <Text style={styles.cardSubtitle}>{col.subtitle}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <PremiumGateModal
        visible={showGate}
        heading="This collection is for Plus members"
        body="Upgrade to Selah+ to access all 6 curated scripture collections."
        ctaLabel="Upgrade to Selah+"
        onUpgrade={() => { setShowGate(false); router.push('/paywall'); }}
        onDismiss={() => setShowGate(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    marginLeft: 16,
    marginTop: 8,
    padding: 8,
    alignSelf: 'flex-start',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 48,
    gap: 32,
  },
  title: {
    fontSize: FontSize.headingXl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    padding: 20,
    ...Shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardName: {
    fontSize: FontSize.bodyLg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  plusBadge: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 0.8,
  },
  cardSubtitle: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
    lineHeight: 18,
  },
});
