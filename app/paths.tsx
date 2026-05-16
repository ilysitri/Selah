console.log('[MODULE] loaded: app/paths.tsx')
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Shadow } from '../constants/theme';
import { useGuidedPaths } from '../hooks/useGuidedPaths';
import type { GuidedPath } from '../types/selah';

type ActivePathData = {
  path: GuidedPath;
  progress: { currentDay: number; completedDays: number[]; completed: boolean };
} | null;

export default function PathsScreen() {
  const { getAllPaths, getActivePath, getPathProgress } = useGuidedPaths();
  const paths = getAllPaths();

  const [activePath, setActivePath] = useState<ActivePathData>(null);
  const [progressMap, setProgressMap] = useState<Record<string, { currentDay: number; completed: boolean }>>({});

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      async function load() {
        const active = await getActivePath();
        const map: Record<string, { currentDay: number; completed: boolean }> = {};
        await Promise.all(
          paths.map(async p => {
            const prog = await getPathProgress(p.id);
            if (prog) map[p.id] = { currentDay: prog.currentDay, completed: prog.completed };
          })
        );
        if (!mounted) return;
        setActivePath(active);
        setProgressMap(map);
      }
      load();
      return () => { mounted = false; };
    }, [])
  );

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
          <Text style={styles.title}>Guided Paths</Text>
          <Text style={styles.subtitle}>A structured journey, one day at a time.</Text>
        </View>

        {activePath && (
          <TouchableOpacity
            style={styles.activeBanner}
            onPress={() =>
              router.push({
                pathname: '/path-day',
                params: { pathId: activePath.path.id, day: String(activePath.progress.currentDay) },
              })
            }
            activeOpacity={0.7}
          >
            <Text style={styles.activeBannerLabel}>IN PROGRESS</Text>
            <Text style={styles.activeBannerTitle}>{activePath.path.title}</Text>
            <Text style={styles.activeBannerProgress}>
              Day {activePath.progress.currentDay} of {activePath.path.duration}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.list}>
          {paths.map(path => {
            const prog = progressMap[path.id];
            return (
              <TouchableOpacity
                key={path.id}
                style={styles.card}
                onPress={() =>
                  router.push({ pathname: '/path-detail', params: { pathId: path.id } })
                }
                activeOpacity={0.7}
              >
                <Text style={styles.cardEmoji}>{path.emoji}</Text>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{path.title}</Text>
                  <Text style={styles.cardSubtitle}>{path.subtitle}</Text>
                </View>
                <View style={styles.cardMeta}>
                  {prog?.completed ? (
                    <Text style={styles.completedBadge}>✦ Complete</Text>
                  ) : prog ? (
                    <Text style={styles.progressBadge}>
                      Day {prog.currentDay} of {path.duration}
                    </Text>
                  ) : (
                    <Text style={styles.durationBadge}>{path.duration} days</Text>
                  )}
                </View>
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
    gap: 24,
  },
  heading: {
    gap: 6,
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
  activeBanner: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    gap: 4,
    ...Shadow.card,
  },
  activeBannerLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  activeBannerTitle: {
    fontSize: FontSize.bodyLg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  activeBannerProgress: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    ...Shadow.card,
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardBody: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    fontSize: FontSize.bodyMd,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  cardMeta: {
    alignItems: 'flex-end',
  },
  durationBadge: {
    fontSize: FontSize.xs,
    color: Colors.textFaint,
  },
  completedBadge: {
    fontSize: FontSize.xs,
    color: Colors.textFaint,
  },
  progressBadge: {
    fontSize: FontSize.xs,
    color: Colors.accent,
  },
});
