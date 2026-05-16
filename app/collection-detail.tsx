console.log('[MODULE] loaded: app/collection-detail.tsx')
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Shadow } from '../constants/theme';
import { useSelah } from '../hooks/useSelah';
import { getCollectionMeta } from '../constants/collections';

export default function CollectionDetailScreen() {
  const { collection } = useLocalSearchParams<{ collection: string }>();
  const { getVersesByCollection } = useSelah();

  const meta = getCollectionMeta(collection ?? '');
  const verses = getVersesByCollection(collection ?? '');

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
        <View style={styles.heading}>
          <Text style={styles.title}>{meta?.name ?? collection}</Text>
          {meta?.subtitle && (
            <Text style={styles.subtitle}>{meta.subtitle}</Text>
          )}
        </View>

        <View style={styles.list}>
          {verses.map((verse) => {
            const words = verse.text.split(/\s+/);
            const preview = words.slice(0, 15).join(' ') + (words.length > 15 ? '…' : '');
            return (
              <TouchableOpacity
                key={verse.reference}
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: '/verse',
                    params: {
                      mood: verse.mood_tags[0] ?? 'weary',
                      reference: verse.reference,
                    },
                  })
                }
                activeOpacity={0.7}
              >
                <Text style={styles.cardReference}>{verse.reference}</Text>
                <Text style={styles.cardPreview} numberOfLines={2}>{preview}</Text>
              </TouchableOpacity>
            );
          })}
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
  heading: {
    gap: 8,
  },
  title: {
    fontSize: FontSize.headingXl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.body,
    color: Colors.textMuted,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    padding: 16,
    ...Shadow.card,
  },
  cardReference: {
    fontSize: FontSize.bodyLg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardPreview: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 8,
  },
});
