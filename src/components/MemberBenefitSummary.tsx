import { StyleSheet, Text } from 'react-native';
import type { Experience } from '@/constants/experiences';

export function MemberBenefitSummary({ experience }: {
  experience: Pick<Experience, 'access' | 'memberBenefit'>;
}) {
  if (experience.access !== 'premium' || !experience.memberBenefit) return null;
  return <Text style={styles.benefit}>{experience.memberBenefit}</Text>;
}

const styles = StyleSheet.create({
  benefit: { color: '#D4AF37', fontSize: 14, fontWeight: '700', lineHeight: 21, marginTop: 6, marginBottom: 8 },
});
