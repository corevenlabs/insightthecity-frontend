import { getCardBenefit } from '@/lib/memberBenefits';
import { StyleSheet, Text, View } from 'react-native';
import type { Experience } from '@/constants/experiences';

export function MemberBenefitSummary({ experience, color = '#D4AF37' }: {
  experience: Pick<Experience, 'access' | 'showBenefitOnCard' | 'cardBenefit'>;
  color?: string;
}) {
  const benefit = getCardBenefit(experience);
  if (!benefit) return null;
  return (
    <View style={styles.label}>
      <Text style={[styles.benefit, { color }]} numberOfLines={2}>{benefit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { alignSelf: 'flex-start', maxWidth: '100%', backgroundColor: 'rgba(212,175,55,0.12)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginTop: 6, marginBottom: 4 },
  benefit: { color: '#D4AF37', fontSize: 13, fontWeight: '700', lineHeight: 18 },
});
