console.log('[MODULE] loaded: app/questionnaire-response.tsx')
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, FontSize, Radius } from '../constants/theme';

export default function QuestionnaireResponseScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.sentence}>You're all set. Let's get started.</Text>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.replace('/')}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>Let's start</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 48,
  },
  sentence: {
    fontSize: FontSize.headingLg,
    fontWeight: '500',
    color: Colors.textDark,
    lineHeight: 34,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    paddingVertical: 18,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  ctaText: {
    color: '#fff',
    fontSize: FontSize.bodyLg,
    fontWeight: '700',
  },
});
