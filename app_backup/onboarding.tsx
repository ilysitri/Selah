import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, FontFamily, FontSize, Radius, Shadow } from '../constants/theme';
import { requestPermission, scheduleDaily } from '../lib/notifications';
import { APP_TAGLINES } from '../constants/taglines';

console.log('[MODULE] loaded: app/onboarding.tsx')

const PROXIMITY_OPTIONS = [
  "I'm not sure I ever have",
  "A long time ago",
  "Recently, but it keeps slipping away",
  "I feel close, but I want to go deeper",
  "It's complicated",
];

const BARRIER_OPTIONS = [
  "Life is too loud and busy",
  "I don't know where to start",
  "I feel like I'm not enough",
  "I've been hurt",
  "I just keep forgetting",
];

const LIFE_SEASON_OPTIONS = ["Single", "In a relationship", "Married", "It's complicated"];
const MOTHERHOOD_OPTIONS = ["Not yet for me", "Expecting", "Mum of little ones", "Mum of older children", "Not applicable"];
const CYCLE_OPTIONS = ["Yes please", "Not for me"];

const STORE_URL = Platform.select({
  ios: 'itms-apps://itunes.apple.com/app/idYOUR_APP_ID?action=write-review',
  android: 'market://details?id=YOUR_APP_ID',
  default: 'https://apps.apple.com/app/idYOUR_APP_ID?action=write-review',
});

function getBarrierMilestone(barrier: string): string {
  switch (barrier) {
    case "Life is too loud and busy":
      return "A moment of stillness becomes part of your day. The noise doesn't disappear — but you find you can breathe inside it.";
    case "I don't know where to start":
      return "You have a place to begin. One verse, one prayer, one day at a time — and it starts to feel like yours.";
    case "I feel like I'm not enough":
      return "You begin to encounter a God who meets you exactly as you are. The shame starts to lose its grip.";
    case "I've been hurt":
      return "You find that faith can exist outside the wounds. Scripture becomes a private, safe space again.";
    case "I just keep forgetting":
      return "The daily rhythm takes root. You start reaching for Selah before you reach for anything else.";
    default:
      return "A moment of stillness becomes part of your day. The noise doesn't disappear — but you find you can breathe inside it.";
  }
}

function getMotherhoodMilestone(motherhood: string): string {
  switch (motherhood) {
    case "Expecting":
      return "Mothers-to-be report feeling less alone in the uncertainty. Scripture becomes an anchor through the waiting.";
    case "Mum of little ones":
      return "Mothers of young children report more patience under pressure — not because life gets easier, but because they're less alone in it.";
    case "Mum of older children":
      return "Women in this season report reconnecting with their own identity, beyond the role. A quiet sense of being known.";
    default:
      return "Women report a quieter inner life — less reactivity, more groundedness. Prayer becomes a reflex, not a task.";
  }
}

export default function OnboardingScreen() {
  const [dailyTagline] = useState(() => APP_TAGLINES[Math.floor(Date.now() / 86400000) % APP_TAGLINES.length]);
  const [step, setStep] = useState(1);
  const [proximityAnswer, setProximityAnswer] = useState('');
  const [barrierAnswer, setBarrierAnswer] = useState('');
  const [userName, setUserName] = useState('');
  const [lifeSeasonAnswer, setLifeSeasonAnswer] = useState('');
  const [motherhoodAnswer, setMotherhoodAnswer] = useState('');
  const [cycleAnswer, setCycleAnswer] = useState('');
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [isFading, setIsFading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  function advanceStep(nextStep: number) {
    if (isFading) return;
    setIsFading(true);
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setStep(nextStep);
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start(() => {
        setIsFading(false);
      });
    });
  }

  function handleProximitySelect(answer: string) {
    if (isFading) return;
    setIsFading(true);
    setProximityAnswer(answer);
    setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setStep(2);
        Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start(() => {
          setIsFading(false);
        });
      });
    }, 400);
  }

  function handleBarrierSelect(answer: string) {
    if (isFading) return;
    setIsFading(true);
    setBarrierAnswer(answer);
    setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setStep(3);
        Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start(() => {
          setIsFading(false);
        });
      });
    }, 400);
  }

  async function handleRateSelah() {
    if (isFading) return;
    setIsFading(true);
    try {
      await Linking.openURL(STORE_URL ?? '');
    } catch (_) {}
    setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setStep(5);
        Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start(() => {
          setIsFading(false);
        });
      });
    }, 600);
  }

  async function handleBegin() {
    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    const granted = await requestPermission();
    if (granted) {
      await scheduleDaily(time);
    }
    await AsyncStorage.multiSet([
      ['selah:onboarded', 'true'],
      ['selah:reminderTime', time],
      ['selah:userName', userName.trim()],
      ['selah:lifeSeason', lifeSeasonAnswer],
      ['selah:motherhood', motherhoodAnswer],
      ['selah:cycleTracking', cycleAnswer === 'Yes please' ? 'true' : 'false'],
    ]);
    router.replace('/');
  }

  function adjustHour(delta: number) { setHour(h => (h + delta + 24) % 24); }
  function adjustMinute(delta: number) { setMinute(m => (m + delta + 60) % 60); }

  const showBack = step >= 2 && step <= 8;

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>

        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => advanceStep(step - 1)}
            activeOpacity={0.6}
            disabled={isFading}
          >
            <Ionicons name="chevron-back" size={28} color={Colors.accent} />
          </TouchableOpacity>
        )}

        {/* Step 1 — Mirror: Proximity */}
        {step === 1 && (
          <ScrollView contentContainerStyle={styles.step1ScrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.appName}>Selah<Text style={styles.appNameCross}> †</Text></Text>
            <Text style={styles.tagline}>{dailyTagline}</Text>
            <Text style={styles.questionHeading}>{"When did you last feel\ntruly close to God?"}</Text>
            <View style={styles.optionList}>
              {PROXIMITY_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.optionCard, proximityAnswer === opt && styles.optionCardSelected]}
                  onPress={() => handleProximitySelect(opt)}
                  activeOpacity={0.7}
                  disabled={isFading}
                >
                  <Text style={[styles.optionText, proximityAnswer === opt && styles.optionTextSelected]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {/* Step 2 — Mirror: Barrier */}
        {step === 2 && (
          <ScrollView contentContainerStyle={styles.step2ScrollContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.questionHeading, { marginBottom: 48 }]}>{"What gets\nin the way?"}</Text>
            <View style={styles.optionList}>
              {BARRIER_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.optionCard, barrierAnswer === opt && styles.optionCardSelected]}
                  onPress={() => handleBarrierSelect(opt)}
                  activeOpacity={0.7}
                  disabled={isFading}
                >
                  <Text style={[styles.optionText, barrierAnswer === opt && styles.optionTextSelected]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {/* Step 3 — Reframe */}
        {step === 3 && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.heading}>You're not behind.</Text>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>5.5 million</Text>
              <Text style={styles.statBody}>
                More women attend church on a given Sunday than men. Women have always been the backbone of faith — and that isn't changing.
              </Text>
              <Text style={styles.statSource}>Barna Research / U.S. Congregational Life Survey</Text>
            </View>
            <View style={[styles.statCard, styles.statCardSpacing]}>
              <Text style={styles.statNumber}>85%</Text>
              <Text style={styles.statBody}>
                of doctors now recognise that spiritual practice supports psychological resilience — and research shows even brief, repeated moments of prayer reduce anxiety and depression.
              </Text>
              <Text style={styles.statSource}>Journal of Clinical Psychology, 2024 physician survey</Text>
            </View>
            <Text style={styles.warmParagraph}>
              Selah isn't a programme or a checklist. It's a place to pause for 60 seconds when you need it. That's enough.
            </Text>
            <TouchableOpacity style={styles.continueButton} onPress={() => advanceStep(4)} activeOpacity={0.7}>
              <Text style={styles.continueText}>I'm ready</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Step 4 — Rate & Continue */}
        {step === 4 && (
          <View style={styles.centeredStep}>
            <View style={styles.centeredContent}>
              <Text style={[styles.accentLabel, styles.textCenter]}>A MOMENT</Text>
              <Text style={[styles.heading, styles.textCenter, { marginBottom: 32 }]}>Support the mission</Text>
              <Text style={styles.rateBody}>
                Selah is built by one woman, for women. If what you've read so far resonates, a quick rating in the App Store helps other women find this space.
              </Text>
              <Text style={styles.rateSoftLine}>
                It takes 10 seconds and it means everything to a solo, female-led Christian app.
              </Text>
            </View>
            <View style={styles.rateButtons}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleRateSelah} activeOpacity={0.7} disabled={isFading}>
                <Text style={styles.primaryButtonText}>Rate Selah ✦</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.skipLink} onPress={() => advanceStep(5)} activeOpacity={0.7}>
                <Text style={styles.skipLinkText}>Continue without rating</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 5 — Be Known pt.1 */}
        {step === 5 && (
          <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.heading}>A little about you</Text>
              <Text style={styles.stepSubtitle}>So Selah can show up in the right way.</Text>
              <TextInput
                style={styles.nameInput}
                placeholder="Your name (optional)"
                placeholderTextColor={Colors.textThin}
                value={userName}
                onChangeText={setUserName}
                returnKeyType="done"
              />
              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>I am...</Text>
                <View style={styles.pillRow}>
                  {LIFE_SEASON_OPTIONS.map(opt => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.pill, lifeSeasonAnswer === opt && styles.pillSelected]}
                      onPress={() => setLifeSeasonAnswer(lifeSeasonAnswer === opt ? '' : opt)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.pillText, lifeSeasonAnswer === opt && styles.pillTextSelected]}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>Motherhood...</Text>
                <View style={styles.pillRow}>
                  {MOTHERHOOD_OPTIONS.map(opt => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.pill, motherhoodAnswer === opt && styles.pillSelected]}
                      onPress={() => setMotherhoodAnswer(motherhoodAnswer === opt ? '' : opt)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.pillText, motherhoodAnswer === opt && styles.pillTextSelected]}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <TouchableOpacity style={styles.continueButton} onPress={() => advanceStep(6)} activeOpacity={0.7}>
                <Text style={styles.continueText}>Next</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        )}

        {/* Step 6 — Be Known pt.2 */}
        {step === 6 && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.questionBlock}>
              <Text style={styles.questionLabel}>Would you like cycle-aware scripture?</Text>
              <Text style={styles.questionSubtitle}>
                Selah can suggest verses and prayers tuned to different seasons of your cycle.
              </Text>
              <View style={styles.pillRow}>
                {CYCLE_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.pill, cycleAnswer === opt && styles.pillSelected]}
                    onPress={() => setCycleAnswer(opt)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pillText, cycleAnswer === opt && styles.pillTextSelected]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.questionBlock}>
              <Text style={styles.questionLabel}>Daily reminder</Text>
              <View style={styles.timePicker}>
                <View style={styles.timeUnit}>
                  <TouchableOpacity onPress={() => adjustHour(1)} style={styles.timeBtn} activeOpacity={0.6}>
                    <Ionicons name="chevron-up" size={20} color={Colors.accent} />
                  </TouchableOpacity>
                  <Text style={styles.timeValue}>{String(hour).padStart(2, '0')}</Text>
                  <TouchableOpacity onPress={() => adjustHour(-1)} style={styles.timeBtn} activeOpacity={0.6}>
                    <Ionicons name="chevron-down" size={20} color={Colors.accent} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.timeSeparator}>:</Text>
                <View style={styles.timeUnit}>
                  <TouchableOpacity onPress={() => adjustMinute(5)} style={styles.timeBtn} activeOpacity={0.6}>
                    <Ionicons name="chevron-up" size={20} color={Colors.accent} />
                  </TouchableOpacity>
                  <Text style={styles.timeValue}>{String(minute).padStart(2, '0')}</Text>
                  <TouchableOpacity onPress={() => adjustMinute(-5)} style={styles.timeBtn} activeOpacity={0.6}>
                    <Ionicons name="chevron-down" size={20} color={Colors.accent} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <Text style={styles.encouragingStat}>
              Worldwide, women report the importance of faith at nearly double the rate of men — and the global Christian community is on track to surpass 3 billion people before 2050. You are joining something ancient and alive.
            </Text>
            <Text style={styles.encouragingSource}>Pew Research Center, REACHRIGHT Church Statistics 2025</Text>
            <TouchableOpacity style={styles.continueButton} onPress={() => advanceStep(7)} activeOpacity={0.7}>
              <Text style={styles.continueText}>Next</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Step 7 — Projected Growth */}
        {step === 7 && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.accentLabel}>YOUR JOURNEY</Text>
            <Text style={styles.heading}>
              {userName.trim()
                ? `Here's what women like you experience, ${userName.trim()}`
                : "Here's what women like you experience with Selah"}
            </Text>
            <View style={styles.milestoneCard}>
              <Text style={styles.milestonePeriod}>30 days</Text>
              <Text style={styles.milestoneBody}>{getBarrierMilestone(barrierAnswer)}</Text>
            </View>
            <View style={[styles.milestoneCard, styles.milestoneCardSpacing]}>
              <Text style={styles.milestonePeriod}>90 days</Text>
              <Text style={styles.milestoneBody}>{getMotherhoodMilestone(motherhoodAnswer)}</Text>
            </View>
            <View style={[styles.milestoneCard, styles.milestoneCardSpacing]}>
              <Text style={styles.milestonePeriod}>1 year</Text>
              <Text style={styles.milestoneBody}>
                Your spiritual life has its own texture and rhythm. You have a record of where you've been, what held you, and what you were feeling when it did. That record is yours.
              </Text>
            </View>
            <Text style={styles.milestoneAttribution}>
              Based on reported experiences of women using daily scripture and prayer practice.
            </Text>
            <TouchableOpacity style={styles.continueButton} onPress={() => advanceStep(8)} activeOpacity={0.7}>
              <Text style={styles.continueText}>This is what I want</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Step 8 — Paywall */}
        {step === 8 && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.accentLabel}>SELAH PLUS</Text>
            <Text style={styles.heading}>For the woman who wants to go deeper.</Text>
            <Text style={styles.stepSubtitle}>Start free. Cancel anytime.</Text>

            <View style={styles.benefitsList}>
              {[
                'Unlimited traces — your reflections, always yours',
                'All collections, including cycle-aware scripture',
                'Unlimited saved verses',
                'Daily verse at your chosen time',
              ].map((benefit) => (
                <View key={benefit} style={styles.benefitRow}>
                  <Text style={styles.benefitIcon}>✦</Text>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.planOption, selectedPlan === 'annual' && styles.planOptionSelected]}
              onPress={() => setSelectedPlan('annual')}
              activeOpacity={0.7}
            >
              <View style={styles.planRow}>
                <View style={styles.planLeft}>
                  <View style={[styles.planRadio, selectedPlan === 'annual' && styles.planRadioSelected]} />
                  <View style={styles.planDetails}>
                    <Text style={styles.planTitle}>Annual</Text>
                    <Text style={styles.planDetail}>First 7 days free</Text>
                    <Text style={styles.planDetail}>Then $29.99/yr — just $2.50/month</Text>
                  </View>
                </View>
                <View style={styles.bestValueBadge}>
                  <Text style={styles.bestValueText}>BEST VALUE</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.planOption, styles.planOptionSpacing, selectedPlan === 'monthly' && styles.planOptionSelected]}
              onPress={() => setSelectedPlan('monthly')}
              activeOpacity={0.7}
            >
              <View style={styles.planLeft}>
                <View style={[styles.planRadio, selectedPlan === 'monthly' && styles.planRadioSelected]} />
                <View style={styles.planDetails}>
                  <Text style={styles.planTitle}>Monthly</Text>
                  <Text style={styles.planDetail}>First 7 days free</Text>
                  <Text style={styles.planDetail}>Then $4.99/month</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryButton, styles.primaryButtonSpacing]}
              onPress={() => { console.log('Selected plan:', selectedPlan); advanceStep(9); }}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryButtonText}>Begin my free week</Text>
            </TouchableOpacity>

            <Text style={styles.paywallNote}>Cancel anytime. No charge for 7 days.</Text>
            <TouchableOpacity onPress={() => console.log('Restore purchase tapped')} activeOpacity={0.7}>
              <Text style={[styles.paywallNote, styles.restoreLink]}>Restore purchase</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.maybeLater} onPress={() => advanceStep(9)} activeOpacity={0.7}>
              <Text style={styles.skipLinkText}>Maybe later</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Step 9 — Welcome */}
        {step === 9 && (
          <View style={styles.step9Container}>
            <View style={styles.step9Content}>
              <Text style={styles.verseText}>
                "Fear not: for I have redeemed thee, I have called thee by thy name; thou art mine."
              </Text>
              <Text style={styles.verseReference}>Isaiah 43:1</Text>
              <View style={styles.divider} />
              <Text style={styles.welcomeGreeting}>
                {userName.trim()
                  ? `${userName.trim()}, you are not alone in this.`
                  : 'You are not alone in this.'}
              </Text>
              <Text style={styles.welcomeSubtitle}>Selah is here whenever you need to pause.</Text>
            </View>
            <TouchableOpacity style={styles.beginButton} onPress={handleBegin} activeOpacity={0.7}>
              <Text style={styles.continueText}>Begin</Text>
            </TouchableOpacity>
          </View>
        )}

      </Animated.View>
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
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 64,
    paddingBottom: 48,
  },
  step1ScrollContent: {
    paddingHorizontal: 28,
    paddingTop: 72,
    paddingBottom: 48,
  },
  step2ScrollContent: {
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 48,
  },
  appName: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.verdict,
    fontWeight: '700',
    color: '#6B6355',
    textAlign: 'center',
    marginBottom: 8,
  },
  appNameCross: {
    fontSize: 14,
    fontWeight: '400',
    color: '#D4839A',
  },
  tagline: {
    textAlign: 'center',
    fontSize: FontSize.sm,
    color: Colors.textFaint,
    fontStyle: 'italic',
    marginBottom: 56,
  },
  questionHeading: {
    fontFamily: FontFamily.display,
    fontWeight: '300',
    fontSize: FontSize.headingXl,
    lineHeight: Math.round(FontSize.headingXl * 1.3),
    color: Colors.textPrimary,
    marginBottom: 40,
  },
  backButton: {
    marginLeft: 16,
    marginTop: 8,
    padding: 8,
    alignSelf: 'flex-start',
  },
  heading: {
    fontSize: FontSize.headingLg,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 34,
    marginBottom: 24,
  },
  stepSubtitle: {
    fontSize: FontSize.bodyLg,
    color: Colors.textMuted,
    lineHeight: 24,
    marginTop: -16,
    marginBottom: 24,
  },
  accentLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  textCenter: {
    textAlign: 'center',
  },
  optionList: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    minHeight: 64,
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderLeftWidth: 3,
    borderLeftColor: Colors.border,
    justifyContent: 'center',
    ...Shadow.card,
  },
  optionCardSelected: {
    borderLeftColor: Colors.accent,
    backgroundColor: 'rgba(201, 160, 154, 0.08)',
  },
  optionText: {
    fontSize: FontSize.body,
    fontWeight: '400',
    color: Colors.textPrimary,
    lineHeight: Math.round(FontSize.body * 1.6),
    paddingLeft: 4,
  },
  optionTextSelected: {},
  statCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    padding: 20,
    ...Shadow.card,
  },
  statCardSpacing: {
    marginTop: 24,
  },
  statNumber: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.hero,
    fontWeight: '700',
    color: Colors.accent,
    marginBottom: 8,
  },
  statBody: {
    fontSize: FontSize.bodyMd,
    color: Colors.textMuted,
    lineHeight: Math.round(FontSize.bodyMd * 1.6),
    marginBottom: 8,
  },
  statSource: {
    fontSize: FontSize.xs,
    color: Colors.textThin,
  },
  warmParagraph: {
    fontSize: FontSize.bodyLg,
    color: Colors.textMuted,
    lineHeight: Math.round(FontSize.bodyLg * 1.6),
    fontStyle: 'italic',
    marginTop: 24,
    marginBottom: 32,
  },
  continueButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  continueText: {
    fontSize: FontSize.bodyMd,
    color: Colors.accent,
  },
  centeredStep: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 96,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
  },
  rateBody: {
    fontSize: FontSize.bodyLg,
    color: Colors.textMuted,
    lineHeight: Math.round(FontSize.bodyLg * 1.6),
    textAlign: 'center',
    marginBottom: 20,
  },
  rateSoftLine: {
    fontSize: FontSize.bodyMd,
    color: Colors.textThin,
    lineHeight: Math.round(FontSize.bodyMd * 1.6),
    textAlign: 'center',
    fontStyle: 'italic',
  },
  rateButtons: {
    gap: 12,
    marginTop: 48,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.xxl,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonSpacing: {
    marginTop: 20,
  },
  primaryButtonText: {
    fontSize: FontSize.bodyMd,
    fontWeight: '600',
    color: Colors.surface,
  },
  skipLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipLinkText: {
    fontSize: FontSize.bodyMd,
    color: Colors.textThin,
  },
  nameInput: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: FontSize.bodyMd,
    color: Colors.textPrimary,
    marginBottom: 28,
    ...Shadow.card,
  },
  questionBlock: {
    marginBottom: 24,
    gap: 10,
  },
  questionLabel: {
    fontSize: FontSize.bodyMd,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  questionSubtitle: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: -4,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillSelected: {
    borderColor: Colors.accent,
  },
  pillText: {
    fontSize: FontSize.bodyMd,
    color: Colors.textMuted,
  },
  pillTextSelected: {
    color: Colors.accent,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeUnit: {
    alignItems: 'center',
    gap: 4,
  },
  timeBtn: {
    padding: 8,
  },
  timeValue: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.headingXl,
    color: Colors.textDark,
    minWidth: 52,
    textAlign: 'center',
  },
  timeSeparator: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.headingXl,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  encouragingStat: {
    fontSize: FontSize.bodyMd,
    color: Colors.textMuted,
    lineHeight: Math.round(FontSize.bodyMd * 1.6),
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  encouragingSource: {
    fontSize: FontSize.xs,
    color: Colors.textThin,
    textAlign: 'center',
    marginBottom: 32,
  },
  milestoneCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
    ...Shadow.card,
  },
  milestoneCardSpacing: {
    marginTop: 16,
  },
  milestonePeriod: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.headingMd,
    color: Colors.accent,
    marginBottom: 8,
  },
  milestoneBody: {
    fontSize: FontSize.bodyMd,
    color: Colors.textMuted,
    lineHeight: Math.round(FontSize.bodyMd * 1.6),
  },
  milestoneAttribution: {
    fontSize: FontSize.xs,
    color: Colors.textThin,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
    marginBottom: 8,
  },
  benefitsList: {
    gap: 14,
    marginBottom: 28,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  benefitIcon: {
    fontSize: FontSize.bodyMd,
    color: Colors.accent,
    marginTop: 2,
  },
  benefitText: {
    fontSize: FontSize.bodyMd,
    color: Colors.textPrimary,
    lineHeight: Math.round(FontSize.bodyMd * 1.6),
    flex: 1,
  },
  planOption: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  planOptionSelected: {
    borderColor: Colors.accent,
  },
  planOptionSpacing: {
    marginTop: 10,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  planDetails: {
    flex: 1,
  },
  planRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  planRadioSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent,
  },
  planTitle: {
    fontSize: FontSize.bodyMd,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  planDetail: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  bestValueBadge: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bestValueText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.surface,
    letterSpacing: 0.8,
  },
  paywallNote: {
    fontSize: FontSize.caption,
    color: Colors.textThin,
    textAlign: 'center',
    marginTop: 12,
  },
  restoreLink: {
    textDecorationLine: 'underline',
  },
  maybeLater: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  step9Container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingBottom: 40,
    paddingTop: 120,
    justifyContent: 'space-between',
  },
  step9Content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseText: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.headingMd,
    color: Colors.textDark,
    lineHeight: Math.round(FontSize.headingMd * 1.7),
    textAlign: 'center',
    marginBottom: 12,
  },
  verseReference: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    width: '60%',
    backgroundColor: Colors.borderLight,
  },
  welcomeGreeting: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.hero,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: Math.round(FontSize.hero * 1.2),
    letterSpacing: 0.5,
    marginTop: 40,
    marginBottom: 40,
  },
  welcomeSubtitle: {
    fontSize: FontSize.body,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: Math.round(FontSize.body * 1.6),
  },
  beginButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});
