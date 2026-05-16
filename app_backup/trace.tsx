console.log('[MODULE] loaded: app/trace.tsx')
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, Radius } from '../constants/theme';
import { useTraces } from '../hooks/useTraces';
import { todayString } from '../lib/seededDate';
import type { TraceEntry } from '../types/selah';

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function toneQuestion(tone: string): string {
  const t = tone.toLowerCase().trim();
  if (['settling', 'grounding', 'stilling', 'anchoring'].includes(t))
    return 'What were you carrying when you read this?';
  if (['tender', 'accompanying', 'intimate', 'near', 'knowing'].includes(t))
    return 'Where did you feel this today?';
  if (['hopeful', 'renewing', 'restoring', 'transformative', 'uplifting'].includes(t))
    return 'What does this make possible for you?';
  if (['affirming', 'claiming', 'liberating', 'emboldening'].includes(t))
    return 'Which part of this do you most need to believe right now?';
  if (['raw', 'reaching', 'despairing', 'heartbroken', 'rescuing'].includes(t))
    return 'What were you crying out for when this found you?';
  if (['sheltering', 'fortifying', 'sustaining', 'steadying'].includes(t))
    return 'What do you need to be held through right now?';
  if (['encouraging', 'filling', 'permission-giving', 'welcoming', 'warm'].includes(t))
    return 'What did you receive from this?';
  return 'What stays with you from this verse?';
}

export default function TraceScreen() {
  const { reference, verseText, tone } = useLocalSearchParams<{
    reference: string;
    verseText: string;
    tone: string;
  }>();
  const { saveTrace } = useTraces();

  const [phrase, setPhrase] = useState('');

  const question = toneQuestion(tone ?? '');
  const canSave = phrase.trim().length > 0;

  async function handleSave() {
    if (!canSave || !reference || !verseText || !tone) return;
    const date = todayString();
    const entry: TraceEntry = {
      id: `${date}-${slugify(reference)}`,
      date,
      reference,
      verseText,
      tone,
      phrase: phrase.trim(),
    };
    await saveTrace(entry);
    router.back();
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.6}>
        <Ionicons name="chevron-back" size={28} color={Colors.accent} />
      </TouchableOpacity>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.verseBlock}>
            <Text style={styles.verseReference}>{reference}</Text>
            <Text style={styles.verseText}>{verseText}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.question}>{question}</Text>

          <View style={styles.inputBlock}>
            <TextInput
              style={styles.phraseInput}
              placeholder="One word or phrase..."
              placeholderTextColor={Colors.textThin}
              value={phrase}
              onChangeText={setPhrase}
              maxLength={120}
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
            {phrase.length > 0 && (
              <Text style={styles.charCount}>{phrase.length} / 120</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
            onPress={handleSave}
            activeOpacity={canSave ? 0.7 : 1}
            disabled={!canSave}
          >
            <Text style={[styles.saveButtonText, !canSave && styles.saveButtonTextDisabled]}>
              Save trace
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  backButton: {
    marginLeft: 16,
    marginTop: 8,
    padding: 8,
    alignSelf: 'flex-start',
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 56,
    gap: 28,
  },
  verseBlock: {
    gap: 14,
    paddingVertical: 16,
  },
  verseReference: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textFaint,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  verseText: {
    fontFamily: FontFamily.display,
    fontSize: 18,
    color: Colors.textDark,
    lineHeight: 30,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  question: {
    fontSize: FontSize.headingMd,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 32,
    textAlign: 'center',
    paddingVertical: 8,
  },
  inputBlock: {
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  phraseInput: {
    fontSize: FontSize.bodyLg,
    color: Colors.textDark,
    paddingTop: 0,
    paddingBottom: 0,
  },
  charCount: {
    fontSize: FontSize.xs,
    color: Colors.textThin,
    textAlign: 'right',
  },
  saveButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.35,
  },
  saveButtonText: {
    fontSize: FontSize.bodyMd,
    color: Colors.accent,
  },
  saveButtonTextDisabled: {
    color: Colors.textFaint,
  },
});
