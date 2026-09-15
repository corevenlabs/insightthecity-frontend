import { getCardBenefit } from '@/lib/memberBenefits';
import { StyleSheet, Text } from 'react-native';
import type { Experience } from '@/constants/experiences';

export function MemberBenefitSummary({ experience, color = '#D4AF37' }: {
  experience: Pick<Experience, 'access' | 'showBenefitOnCard' | 'cardBenefit'>;
  color?: string;
}) {
  const benefit = getCardBenefit(experience);
  if (!benefit) return null;
  return <Text style={[styles.benefit, { color }]} numberOfLines={2}>{benefit}</Text>;
}

const styles = StyleSheet.create({
  benefit: { color: '#D4AF37', fontSize: 13, fontWeight: '700', lineHeight: 19, marginTop: 6, marginBottom: 8 },
});
