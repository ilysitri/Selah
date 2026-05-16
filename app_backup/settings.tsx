import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Colors, FontFamily, FontSize, Radius, Shadow } from '../constants/theme';
import { requestPermission, scheduleDaily, cancelAll } from '../lib/notifications';
import { usePremium } from '../hooks/usePremium';

console.log('[MODULE] loaded: app/settings.tsx')

// set false before launch
const SHOW_DEV_OPTIONS = false // set true for local dev

const LIFE_SEASON_OPTIONS = ['Single', 'In a relationship', 'Married', "It's complicated"];

function formatTime(raw: string): string {
  const [hStr, mStr] = raw.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const period = h < 12 ? 'AM' : 'PM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { isPremium, setDevPremium } = usePremium();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  // stored values
  const [userName, setUserName] = useState<string | null>(null);
  const [lifeSeason, setLifeSeason] = useState<string | null>(null);
  const [reminderTime, setReminderTime] = useState<string | null>(null);

  // edit profile modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editLifeSeason, setEditLifeSeason] = useState('');

  // reminder modal
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderHour, setReminderHour] = useState(8);
  const [reminderMinute, setReminderMinute] = useState(0);

  useEffect(() => {
    async function load() {
      const [name, season, time] = await Promise.all([
        AsyncStorage.getItem('selah:userName'),
        AsyncStorage.getItem('selah:lifeSeason'),
        AsyncStorage.getItem('selah:reminderTime'),
      ]);
      setUserName(name);
      setLifeSeason(season);
      setReminderTime(time);
    }
    load();
  }, []);

  const displayName = userName && userName.trim() ? userName.trim() : null;
  const headingText = displayName ? `Hi, ${displayName}` : 'Welcome back';

  function openEditModal() {
    setEditName(displayName ?? '');
    setEditLifeSeason(lifeSeason ?? '');
    setShowEditModal(true);
  }

  async function handleSaveProfile() {
    const name = editName.trim();
    await AsyncStorage.multiSet([
      ['selah:userName', name],
      ['selah:lifeSeason', editLifeSeason],
    ]);
    setUserName(name || null);
    setLifeSeason(editLifeSeason || null);
    setShowEditModal(false);
  }

  function openReminderModal() {
    if (reminderTime) {
      const [h, m] = reminderTime.split(':').map(Number);
      setReminderHour(h);
      setReminderMinute(m);
    } else {
      setReminderHour(8);
      setReminderMinute(0);
    }
    setShowReminderModal(true);
  }

  async function handleSaveReminder() {
    const time = `${String(reminderHour).padStart(2, '0')}:${String(reminderMinute).padStart(2, '0')}`;
    const granted = await requestPermission();
    if (granted) {
      await scheduleDaily(time);
    }
    await AsyncStorage.setItem('selah:reminderTime', time);
    setReminderTime(time);
    setShowReminderModal(false);
  }

  async function handleTurnOffReminder() {
    await cancelAll();
    await AsyncStorage.removeItem('selah:reminderTime');
    setReminderTime(null);
    setShowReminderModal(false);
  }

  function handleClearData() {
    Alert.alert(
      'Clear all data',
      'Resets the app to a fresh install state. Use for testing only.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            router.replace('/');
          },
        },
      ]
    );
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

        <View style={styles.header}>
          <Text style={styles.headerName}>{headingText}</Text>
          <Text style={styles.headerTagline}>Your Selah</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PROFILE</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Name</Text>
              <Text style={styles.rowValue}>{displayName ?? 'Not set'}</Text>
            </View>
            <View style={styles.hairline} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Life season</Text>
              <Text style={styles.rowValue}>{lifeSeason ?? 'Not set'}</Text>
            </View>
            <View style={styles.hairline} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Reminder</Text>
              <Text style={styles.rowValue}>
                {reminderTime ? formatTime(reminderTime) : 'Not set'}
              </Text>
            </View>
            <View style={styles.hairline} />
            <TouchableOpacity
              style={styles.editLinkRow}
              onPress={openEditModal}
              activeOpacity={0.7}
            >
              <Text style={styles.editLinkText}>Edit preferences</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <TouchableOpacity
            style={[styles.card, styles.accountCard]}
            onPress={() => router.push('/paywall')}
            activeOpacity={0.7}
          >
            <View style={styles.row}>
              <Text style={styles.accountLabel}>Selah Plus</Text>
              <Text style={styles.upgradeText}>Upgrade ›</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>REMINDERS</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.row}
              onPress={openReminderModal}
              activeOpacity={0.7}
            >
              <Text style={styles.rowLabel}>Daily verse</Text>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>
                  {reminderTime ? formatTime(reminderTime) : 'Off'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textFaint} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LEGAL</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => Linking.openURL('https://ilysitri.github.io/Ketra/terms.html')}
              activeOpacity={0.7}
            >
              <Text style={styles.rowLabel}>Terms of Service</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textFaint} />
            </TouchableOpacity>
            <View style={styles.hairline} />
            <TouchableOpacity
              style={styles.row}
              onPress={() => Linking.openURL('https://ilysitri.github.io/Ketra/privacy.html')}
              activeOpacity={0.7}
            >
              <Text style={styles.rowLabel}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textFaint} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ABOUT</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Version</Text>
              <Text style={styles.rowValue}>{version}</Text>
            </View>
            <View style={styles.hairline} />
            <TouchableOpacity
              style={styles.row}
              onPress={() => Linking.openURL('mailto:hello@selahapp.co')}
              activeOpacity={0.7}
            >
              <Text style={styles.rowLabel}>Contact</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textFaint} />
            </TouchableOpacity>
          </View>
        </View>

        {SHOW_DEV_OPTIONS && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DEVELOPER</Text>
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Premium override</Text>
                <Switch
                  value={isPremium}
                  onValueChange={setDevPremium}
                  trackColor={{ false: Colors.border, true: Colors.accent }}
                  thumbColor="#fff"
                />
              </View>
              <View style={styles.hairline} />
              <TouchableOpacity style={styles.row} onPress={handleClearData} activeOpacity={0.7}>
                <Text style={[styles.rowLabel, styles.destructiveLabel]}>Clear all data</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>

      {/* ── Edit Profile Modal ─────────────────────────────────── */}
      <Modal visible={showEditModal} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)} activeOpacity={0.6}>
                <Ionicons name="close" size={24} color={Colors.textFaint} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.textInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Your name"
              placeholderTextColor={Colors.textFaint}
              autoCapitalize="words"
              returnKeyType="done"
            />

            <Text style={styles.fieldLabel}>Life season</Text>
            <View style={styles.pillGrid}>
              {LIFE_SEASON_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.pill, editLifeSeason === opt && styles.pillSelected]}
                  onPress={() => setEditLifeSeason(editLifeSeason === opt ? '' : opt)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, editLifeSeason === opt && styles.pillTextSelected]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile} activeOpacity={0.8}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Reminder Modal ─────────────────────────────────────── */}
      <Modal visible={showReminderModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Daily Reminder</Text>
              <TouchableOpacity onPress={() => setShowReminderModal(false)} activeOpacity={0.6}>
                <Ionicons name="close" size={24} color={Colors.textFaint} />
              </TouchableOpacity>
            </View>

            <Text style={styles.reminderHint}>Choose a time for your daily verse.</Text>

            <View style={styles.timePicker}>
              <View style={styles.timeUnit}>
                <TouchableOpacity
                  onPress={() => setReminderHour(h => (h + 1) % 24)}
                  style={styles.timeBtn}
                  activeOpacity={0.6}
                >
                  <Ionicons name="chevron-up" size={28} color={Colors.accent} />
                </TouchableOpacity>
                <Text style={styles.timeValue}>{String(reminderHour).padStart(2, '0')}</Text>
                <TouchableOpacity
                  onPress={() => setReminderHour(h => (h - 1 + 24) % 24)}
                  style={styles.timeBtn}
                  activeOpacity={0.6}
                >
                  <Ionicons name="chevron-down" size={28} color={Colors.accent} />
                </TouchableOpacity>
              </View>
              <Text style={styles.timeSeparator}>:</Text>
              <View style={styles.timeUnit}>
                <TouchableOpacity
                  onPress={() => setReminderMinute(m => (m + 5) % 60)}
                  style={styles.timeBtn}
                  activeOpacity={0.6}
                >
                  <Ionicons name="chevron-up" size={28} color={Colors.accent} />
                </TouchableOpacity>
                <Text style={styles.timeValue}>{String(reminderMinute).padStart(2, '0')}</Text>
                <TouchableOpacity
                  onPress={() => setReminderMinute(m => (m - 5 + 60) % 60)}
                  style={styles.timeBtn}
                  activeOpacity={0.6}
                >
                  <Ionicons name="chevron-down" size={28} color={Colors.accent} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveReminder} activeOpacity={0.8}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>

            {reminderTime && (
              <TouchableOpacity
                style={styles.turnOffButton}
                onPress={handleTurnOffReminder}
                activeOpacity={0.7}
              >
                <Text style={styles.turnOffText}>Turn off reminder</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

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
    paddingTop: 8,
    paddingBottom: 56,
  },
  header: {
    paddingBottom: 24,
  },
  headerName: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.headingXl,
    fontWeight: '700',
    color: '#6B6355',
    lineHeight: 34,
  },
  headerTagline: {
    fontSize: FontSize.body,
    fontWeight: '400',
    color: Colors.textFaint,
    marginTop: 6,
  },
  section: {
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    ...Shadow.card,
  },
  accountCard: {
    borderLeftWidth: 2,
    borderLeftColor: Colors.accent,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowLabel: {
    fontSize: FontSize.bodyMd,
    color: Colors.textPrimary,
    flex: 1,
  },
  rowValue: {
    fontSize: FontSize.bodyMd,
    color: Colors.textFaint,
  },
  accountLabel: {
    fontSize: FontSize.bodyMd,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  upgradeText: {
    fontSize: FontSize.bodyMd,
    fontWeight: '600',
    color: Colors.accent,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  editLinkRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  editLinkText: {
    fontSize: FontSize.bodyMd,
    color: Colors.accent,
  },
  destructiveLabel: {
    color: Colors.statusNo,
  },

  // ── modals ────────────────────────────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: FontSize.heading,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  fieldLabel: {
    fontSize: FontSize.caption,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: -8,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: FontSize.bodyMd,
    color: Colors.textPrimary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    borderRadius: Radius.xl,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  pillText: {
    fontSize: FontSize.bodyMd,
    color: Colors.textMuted,
  },
  pillTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: FontSize.bodyLg,
    fontWeight: '700',
  },

  // ── reminder time picker ──────────────────────────────────────
  reminderHint: {
    fontSize: FontSize.bodyMd,
    color: Colors.textMuted,
    marginBottom: -4,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  timeUnit: {
    alignItems: 'center',
    gap: 4,
  },
  timeBtn: {
    padding: 8,
  },
  timeValue: {
    fontSize: FontSize.display,
    fontWeight: '300',
    color: Colors.textPrimary,
    fontFamily: FontFamily.display,
    width: 72,
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: FontSize.display,
    fontWeight: '300',
    color: Colors.textMuted,
    marginTop: -8,
  },
  turnOffButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  turnOffText: {
    fontSize: FontSize.bodyMd,
    color: Colors.textFaint,
  },
});
