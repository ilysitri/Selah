import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, FontFamily, FontSize, Radius } from '../constants/theme';

type Props = {
  visible: boolean;
  heading: string;
  body: string;
  ctaLabel: string;
  onUpgrade: () => void;
  onDismiss: () => void;
};

export default function PremiumGateModal({ visible, heading, body, ctaLabel, onUpgrade, onDismiss }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.symbol}>✦</Text>
          <Text style={styles.heading}>{heading}</Text>
          <Text style={styles.body}>{body}</Text>
          <TouchableOpacity style={styles.ctaButton} onPress={onUpgrade} activeOpacity={0.8}>
            <Text style={styles.ctaText}>{ctaLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dismissButton} onPress={onDismiss} activeOpacity={0.7}>
            <Text style={styles.dismissText}>Not now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 48,
    alignItems: 'center',
    gap: 16,
  },
  symbol: {
    fontFamily: FontFamily.display,
    fontSize: 28,
    color: Colors.accent,
    marginBottom: 4,
  },
  heading: {
    fontSize: FontSize.headingMd,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    fontFamily: FontFamily.display,
  },
  body: {
    fontSize: FontSize.bodyMd,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  ctaButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    paddingVertical: 18,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: 8,
  },
  ctaText: {
    color: '#fff',
    fontSize: FontSize.bodyLg,
    fontWeight: '700',
  },
  dismissButton: {
    paddingVertical: 8,
  },
  dismissText: {
    fontSize: FontSize.bodyMd,
    color: Colors.textFaint,
  },
});
