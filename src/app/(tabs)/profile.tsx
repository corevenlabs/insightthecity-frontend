import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const GOLD = '#D4AF37';
const BLACK = '#0A0A0A';

// Iniciales para el avatar (JP, R, …) a partir del nombre o el correo.
function initials(nameOrEmail: string) {
  const source = nameOrEmail.trim();
  if (!source) return '?';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export default function ProfileScreen() {
  const { user, isAuthenticated, signOut } = useAuth();
  const { t } = useLanguage();

  // Estado invitado: sin sesión iniciada.
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.guestContainer}>
        <View style={styles.guestAvatar}>
          <Ionicons name="person-outline" size={44} color={GOLD} />
        </View>
        <Text style={styles.guestTitle}>{t('profile.signedOut')}</Text>
        <Text style={styles.guestSubtitle}>
          {t('profile.signedOutSubtitle')}
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/login' as any)}
        >
          <Text style={styles.primaryText}>{t('welcome.signIn')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/register' as any)}
        >
          <Text style={styles.secondaryText}>{t('welcome.createAccount')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayName = user.name || user.email.split('@')[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(user.name || user.email)}</Text>
        </View>

        <Text style={styles.name}>{displayName}</Text>
        <View style={[styles.badge, user.is_premium ? styles.badgePremium : styles.badgeFree]}>
          <Ionicons
            name={user.is_premium ? 'star' : 'person'}
            size={13}
            color={user.is_premium ? BLACK : GOLD}
          />
          <Text style={[styles.badgeText, user.is_premium && styles.badgeTextPremium]}>
            {user.is_premium ? t('profile.member') : t('profile.freeAccount')}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('profile.information')}</Text>

        <Text style={styles.label}>{t('profile.name')}</Text>
        <Text style={styles.value}>{user.name || '—'}</Text>

        <Text style={styles.label}>{t('profile.email')}</Text>
        <Text style={styles.value}>{user.email}</Text>

        <Text style={styles.label}>{t('profile.membership')}</Text>
        <Text style={styles.value}>
          {user.is_premium ? 'ITC CLUB' : t('profile.free')}
        </Text>
      </View>

      {!user.is_premium && (
        <TouchableOpacity
          style={styles.upgradeCard}
          onPress={() => router.push('/club-form' as any)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.upgradeTitle}>{t('profile.joinClub')}</Text>
            <Text style={styles.upgradeSubtitle}>
              {t('profile.joinClubSubtitle')}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={BLACK} />
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Ionicons name="log-out-outline" size={18} color="#FF6B6B" />
        <Text style={styles.logoutText}>{t('profile.signOut')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLACK,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 15,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: GOLD,
    fontSize: 38,
    fontWeight: '900',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeFree: {
    borderWidth: 1,
    borderColor: GOLD,
  },
  badgePremium: {
    backgroundColor: GOLD,
  },
  badgeText: {
    color: GOLD,
    fontSize: 13,
    fontWeight: '700',
  },
  badgeTextPremium: {
    color: BLACK,
  },
  card: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    color: GOLD,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  label: {
    color: '#888',
    marginTop: 10,
    fontSize: 13,
  },
  value: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 4,
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GOLD,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  upgradeTitle: {
    color: BLACK,
    fontSize: 17,
    fontWeight: '900',
  },
  upgradeSubtitle: {
    color: '#3A2F00',
    fontSize: 13,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3A1A1A',
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 15,
    fontWeight: '700',
  },
  // Estado invitado
  guestContainer: {
    flex: 1,
    backgroundColor: BLACK,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  guestAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  guestTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  guestSubtitle: {
    color: '#A7A7A7',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 28,
  },
  primaryButton: {
    backgroundColor: GOLD,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  primaryText: {
    color: BLACK,
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: 12,
  },
  secondaryText: {
    color: GOLD,
    fontSize: 15,
    fontWeight: '900',
  },
});
