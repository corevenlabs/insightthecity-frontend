import { SubscriptionRenewal } from '../../components/SubscriptionRenewal';
import { LanguagePicker } from '../../components/LanguagePicker';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { requireOptionalNativeModule } from 'expo';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, type AppLanguage } from '../../context/LanguageContext';
import type { LegalSlug } from '../../lib/legal';
import { createBillingPortal, formatDate, formatMoney, openStripePage } from '../../lib/payments';

const GOLD = '#FDDD56';
const BLACK = '#0A0A0A';
const INTERESTS = ['Museos', 'Experiencias', 'Broadway', 'Gastronomía', 'Arte', 'Miradores', 'Música', 'Familia'];
const COPY = {
  es: { title: 'Mi perfil', edit: 'Editar perfil', personal: 'Información personal', preferences: 'Mis preferencias', area: 'Zona habitual', interests: 'Intereses', membership: 'Mi membresía', active: 'Activa', plan: 'Consulta tu plan y tus beneficios', manage: 'Ver mi membresía', help: 'Ayuda y soporte', save: 'Guardar cambios', cancel: 'Cancelar', photo: 'Cambiar foto', empty: 'Sin seleccionar', error: 'No se pudo guardar', photoError: 'No se pudo cambiar la foto', choose: 'Selecciona tus intereses', helpBody: 'Puedes editar tu nombre, idioma y preferencias desde Editar perfil. Tu correo identifica la cuenta. En Club encontrarás los beneficios de tu membresía. Para consultas sobre planes, abre el chat de la app.', chat: 'Abrir chat', size: 'Selecciona una foto de menos de 5 MB.', saving: 'Guardando…' },
  en: { title: 'My profile', edit: 'Edit profile', personal: 'Personal information', preferences: 'My preferences', area: 'Usual area', interests: 'Interests', membership: 'My membership', active: 'Active', plan: 'View your plan and benefits', manage: 'View membership', help: 'Help and support', save: 'Save changes', cancel: 'Cancel', photo: 'Change photo', empty: 'Not selected', error: 'Could not save', photoError: 'Could not change photo', choose: 'Select your interests', helpBody: 'Edit your name, language and preferences from Edit profile. Your email identifies your account. Find your membership benefits in Club. For questions about plans, open the app chat.', chat: 'Open chat', size: 'Choose a photo smaller than 5 MB.', saving: 'Saving…' },
  pt: { title: 'Meu perfil', edit: 'Editar perfil', personal: 'Informações pessoais', preferences: 'Minhas preferências', area: 'Zona habitual', interests: 'Interesses', membership: 'Minha assinatura', active: 'Ativa', plan: 'Consulte seu plano e benefícios', manage: 'Ver assinatura', help: 'Ajuda e suporte', save: 'Salvar alterações', cancel: 'Cancelar', photo: 'Alterar foto', empty: 'Não selecionado', error: 'Não foi possível salvar', photoError: 'Não foi possível alterar a foto', choose: 'Selecione seus interesses', helpBody: 'Edite seu nome, idioma e preferências em Editar perfil. Seu e-mail identifica a conta. Veja os benefícios da assinatura em Club. Para perguntas sobre passeios, abra o chat do app.', chat: 'Abrir chat', size: 'Selecione uma foto com menos de 5 MB.', saving: 'Salvando…' },
};
function initials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : value.slice(0, 2).toUpperCase() || '?';
}
export default function ProfileScreen() {
  const { user, token, isAuthenticated, signOut, refreshUser, updateProfile, uploadAvatar, applyServerUser } = useAuth();
  const { t, ui, language, tagLabel } = useLanguage();
  const c = COPY[language];
  const { membership } = useLocalSearchParams<{ membership?: string }>();
  const [editing, setEditing] = useState(false);
  const [help, setHelp] = useState(false);
  const [membershipDetails, setMembershipDetails] = useState(false);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [membershipLoadError, setMembershipLoadError] = useState(false);
  const [portalBusy, setPortalBusy] = useState(false);
  const [renewalBusy, setRenewalBusy] = useState(false);
  const [portalError, setPortalError] = useState('');
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>('es');
  const [interests, setInterests] = useState<string[]>([]);
  const openMembership = useCallback(async () => {
    setMembershipDetails(true); setMembershipLoading(true); setMembershipLoadError(false);
    try { const current = await refreshUser(); if (!current) setMembershipLoadError(true); }
    catch { setMembershipLoadError(true); }
    finally { setMembershipLoading(false); }
  }, [refreshUser]);
  useFocusEffect(useCallback(() => {
    if (membership === '1' && isAuthenticated) {
      router.setParams({ membership: undefined });
      void openMembership();
    } else { void refreshUser(); }
  }, [membership, isAuthenticated, openMembership, refreshUser]));
  const openLegal = (slug: LegalSlug) => router.push({ pathname: '/legal', params: { slug } });
  // Stripe Customer Portal: cambiar tarjeta, ver facturas o cancelar (cancelación en línea, NY GBL §527-a).
  const manageSubscription = async () => {
    if (!token || portalBusy || renewalBusy) return;
    setPortalBusy(true); setPortalError('');
    try {
      await openStripePage(await createBillingPortal(token));
      await refreshUser();
    } catch (err) { setPortalError(err instanceof Error ? err.message : ui('No se pudo abrir la gestión de la membresía.')); }
    finally { setPortalBusy(false); }
  };
  const openEditor = () => {
    setName(user?.name || ''); setArea(user?.home_area || ''); setInterests(user?.interests || []);
    setSelectedLanguage(user?.language || language); setError(''); setEditing(true);
  };
  const save = async () => {
    if (saving || photoBusy) return;
    setSaving(true); setError('');
    try { await updateProfile({ name, language: selectedLanguage, home_area: area, interests }); setEditing(false); }
    catch (err) { setError(err instanceof Error ? err.message : c.error); }
    finally { setSaving(false); }
  };
  const pickPhoto = async () => {
    if (photoBusy || saving) return;
    setPhotoBusy(true); setError('');
    try {
      if (Platform.OS !== 'web' && !requireOptionalNativeModule('ExponentImagePicker')) {
        throw new Error(language === 'es' ? 'Para cambiar tu foto necesitas la nueva versión de la app. Puedes seguir editando los demás datos.' : language === 'en' ? 'Changing your photo requires the new app version. You can still edit your other information.' : 'Para alterar a foto, instale a nova versão do app. Você pode editar os demais dados.');
      }
      // require diferido a propósito: builds anteriores no incluyen el módulo nativo y un import estático fallaría al abrir el perfil.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const ImagePicker = require('expo-image-picker') as typeof import('expo-image-picker');
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.75, base64: Platform.OS !== 'web' });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (Platform.OS !== 'web' && (!asset.base64 || asset.base64.length > 7 * 1024 * 1024)) throw new Error(c.size);
      if (Platform.OS === 'web' && asset.fileSize && asset.fileSize > 5 * 1024 * 1024) throw new Error(c.size);
      await uploadAvatar(asset);
    } catch (err) { setError(err instanceof Error ? err.message : c.photoError); }
    finally { setPhotoBusy(false); }
  };
  const row = (icon: React.ComponentProps<typeof Ionicons>['name'], label: string, value: string, onPress?: () => void) => (
    <Pressable disabled={!onPress} onPress={onPress} accessibilityRole={onPress ? 'button' : undefined} style={styles.infoRow}>
      <Ionicons name={icon} size={21} color="#A6A6A6" />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
      {onPress && <Ionicons name="chevron-forward" size={17} color="#A6A6A6" />}
    </Pressable>
  );
  if (!isAuthenticated || !user) return (
    <SafeAreaView style={styles.guestContainer} edges={['top', 'left', 'right']}>
      <View style={{ width: '100%', marginBottom: 24 }}><LanguagePicker /></View>
      <View style={styles.guestAvatar}><Ionicons name="person-outline" size={44} color={GOLD} /></View>
      <Text style={styles.guestTitle}>{t('profile.signedOut')}</Text>
      <Text style={styles.guestSubtitle}>{t('profile.signedOutSubtitle')}</Text>
      <TouchableOpacity accessibilityRole="button" style={styles.primaryButton} onPress={() => router.push('/login')}><Text style={styles.primaryText}>{t('welcome.signIn')}</Text></TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" style={styles.secondaryButton} onPress={() => router.push('/register')}><Text style={styles.secondaryText}>{t('welcome.createAccount')}</Text></TouchableOpacity>
    </SafeAreaView>
  );
  const hasBilling = user.has_billing_account === true || !!user.subscription_status;
  const manualMembership = user.is_premium && user.has_billing_account === false && !user.subscription_status;
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.pageHeader}><Text style={styles.pageTitle}>{c.title}</Text><Pressable accessibilityRole="button" accessibilityLabel={c.edit} onPress={openEditor} style={styles.settings}><Ionicons name="settings-outline" size={25} color={GOLD} /></Pressable></View>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32, width: '100%', maxWidth: 680, alignSelf: 'center' }}>
      <View style={styles.header}>
        <Pressable onPress={openEditor} accessibilityRole="button" accessibilityLabel={c.edit} style={styles.avatar}>
          {user.avatar_url ? <Image source={{ uri: user.avatar_url }} style={styles.avatarPhoto} contentFit="cover" /> : <Text style={styles.avatarText}>{initials(user.name || user.email)}</Text>}
        </Pressable>
        <Text style={styles.name}>{user.name || user.email.split('@')[0]}</Text>
        <View style={[styles.badge, user.is_premium ? styles.badgePremium : styles.badgeFree]}><Text style={[styles.badgeText, user.is_premium && styles.badgeTextPremium]}>{user.is_premium ? 'ITC CLUB' : t('profile.freeAccount')}</Text></View>
        <Pressable style={styles.editButton} onPress={openEditor} accessibilityRole="button"><Text style={styles.secondaryText}>{c.edit}</Text></Pressable>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{c.personal}</Text>
        {row('person-outline', t('profile.name'), user.name || '—', openEditor)}
        {row('mail-outline', t('profile.email'), user.email)}
        <LanguagePicker />
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{c.preferences}</Text>
        {row('location-outline', c.area, user.home_area || c.empty, openEditor)}
        <Pressable onPress={openEditor} accessibilityRole="button" style={styles.interestRow}>
          <View style={styles.interestHeading}><Ionicons name="heart-outline" size={21} color="#A6A6A6" /><Text style={styles.rowLabel}>{c.interests}</Text></View>
          <View style={styles.tags}>{user.interests?.length ? user.interests.map((item) => <View style={styles.tag} key={item}><Text style={styles.tagText}>{tagLabel(item)}</Text></View>) : <Text style={styles.rowValue}>{c.empty}</Text>}</View>
        </Pressable>
      </View>
      <View style={[styles.card, styles.membershipCard]}>
        <View style={styles.membershipHeading}><Text style={styles.sectionTitle}>{c.membership}</Text><Text style={styles.status}>{user.is_premium && user.subscription_cancel_at_period_end ? ui('Renovación cancelada') : user.is_premium ? c.active : t('profile.free')}</Text></View>
        <Text style={styles.planTitle}>{user.is_premium ? 'ITC CLUB' : t('profile.freeAccount')}</Text>
        <Text style={styles.planDescription}>{user.is_premium ? c.plan : t('profile.joinClubSubtitle')}</Text>
        <Pressable accessibilityRole="button" style={styles.primaryButton} onPress={() => user.is_premium || hasBilling ? void openMembership() : router.push('/club-form')}><Text style={styles.primaryText}>{user.is_premium || hasBilling ? c.manage : t('profile.joinClub')}</Text></Pressable>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{ui('Legal y privacidad')}</Text>
        {row('document-text-outline', ui('Términos y Condiciones'), '', () => openLegal('terms'))}
        {row('shield-checkmark-outline', ui('Política de Privacidad'), '', () => openLegal('privacy'))}
        {row('card-outline', ui('Términos de la membresía'), '', () => openLegal('subscription'))}
        {row('accessibility-outline', ui('Accesibilidad'), '', () => openLegal('accessibility'))}
      </View>
      <View style={styles.card}>
        {row('help-buoy-outline', c.help, '', () => setHelp(true))}
        <Pressable accessibilityRole="button" onPress={signOut} style={styles.infoRow}><Ionicons name="log-out-outline" size={21} color="#FF8080" /><Text style={styles.logoutText}>{t('profile.signOut')}</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push('/delete-account')} style={styles.infoRow}><Ionicons name="trash-outline" size={21} color="#FF8080" /><Text style={styles.logoutText}>{ui('Eliminar cuenta')}</Text></Pressable>
      </View>
    </ScrollView>
      <Modal visible={editing} animationType="slide" onRequestClose={() => { if (!saving && !photoBusy) setEditing(false); }}>
        <SafeAreaProvider><SafeAreaView style={styles.container}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.pageHeader}><Text style={styles.pageTitle}>{c.edit}</Text><Pressable disabled={saving || photoBusy} onPress={() => setEditing(false)} accessibilityRole="button" accessibilityLabel={c.cancel} style={styles.settings}><Ionicons name="close" size={25} color={GOLD} /></Pressable></View>
          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            <Pressable onPress={pickPhoto} disabled={photoBusy || saving} accessibilityRole="button" style={styles.photoButton}>{photoBusy ? <ActivityIndicator color={GOLD} /> : <Ionicons name="camera-outline" size={22} color={GOLD} />}<Text style={styles.secondaryText}>{c.photo}</Text></Pressable>
            <Text style={styles.photoHint}>{language === 'es' ? 'La foto se guarda al seleccionarla.' : language === 'en' ? 'Your photo is saved when selected.' : 'A foto é salva ao selecionar.'}</Text>
            <Text style={styles.label}>{t('profile.name')}</Text><TextInput value={name} onChangeText={setName} maxLength={100} editable={!saving} style={styles.input} accessibilityLabel={t('profile.name')} autoComplete="name" />
            <Text style={styles.label}>{t('profile.email')}</Text><Text style={styles.value}>{user.email}</Text>
            <Text style={styles.label}>{t('register.language')}</Text><View style={styles.tags}>{(['es', 'en', 'pt'] as const).map((item) => <Pressable key={item} onPress={() => setSelectedLanguage(item)} disabled={saving} accessibilityRole="button" accessibilityState={{ selected: selectedLanguage === item }} style={[styles.tag, selectedLanguage === item && styles.selectedTag]}><Text style={[styles.tagText, selectedLanguage === item && styles.selectedTagText]}>{({ es: 'Español', en: 'English', pt: 'Português' })[item]}</Text></Pressable>)}</View>
            <Text style={styles.label}>{c.area}</Text><TextInput value={area} onChangeText={setArea} maxLength={100} editable={!saving} style={styles.input} accessibilityLabel={c.area} placeholder="Manhattan, Brooklyn, New Jersey…" placeholderTextColor="#8A8A8A" />
            <Text style={styles.label}>{c.choose}</Text><View style={styles.tags}>{[...new Set([...INTERESTS, ...interests])].map((item) => <Pressable key={item} disabled={saving} onPress={() => setInterests((current) => current.includes(item) ? current.filter((value) => value !== item) : current.length < 12 ? [...current, item] : current)} accessibilityRole="button" accessibilityState={{ selected: interests.includes(item) }} style={[styles.tag, interests.includes(item) && styles.selectedTag]}><Text style={[styles.tagText, interests.includes(item) && styles.selectedTagText]}>{tagLabel(item)}</Text></Pressable>)}</View>
            {!!error && <Text style={styles.error} accessibilityRole="alert">{error}</Text>}
            <Pressable disabled={saving || photoBusy || !name.trim()} accessibilityRole="button" onPress={save} style={[styles.primaryButton, { marginTop: 24, opacity: saving || photoBusy || !name.trim() ? 0.5 : 1 }]}><Text style={styles.primaryText}>{saving ? c.saving : c.save}</Text></Pressable>
          </ScrollView>
        </KeyboardAvoidingView></SafeAreaView></SafeAreaProvider>
      </Modal>
      <Modal visible={help} transparent animationType="fade" onRequestClose={() => setHelp(false)}>
        <View style={styles.modalBackdrop}><View style={styles.helpCard}><Text style={styles.sectionTitle}>{c.help}</Text><Text style={styles.helpText}>{c.helpBody}</Text><Pressable accessibilityRole="button" style={styles.primaryButton} onPress={() => { setHelp(false); router.push('/chat'); }}><Text style={styles.primaryText}>{c.chat}</Text></Pressable><Pressable accessibilityRole="button" style={styles.photoButton} onPress={() => setHelp(false)}><Text style={styles.secondaryText}>{c.cancel}</Text></Pressable></View></View>
      </Modal>
      <Modal visible={membershipDetails} animationType="slide" onRequestClose={() => { if (!renewalBusy && !portalBusy) setMembershipDetails(false); }}>
        <SafeAreaProvider><SafeAreaView style={styles.container}>
          <View style={styles.pageHeader}>
            <Pressable accessibilityRole="button" accessibilityLabel={language === 'es' ? 'Volver al perfil' : language === 'en' ? 'Back to profile' : 'Voltar ao perfil'} hitSlop={12} disabled={renewalBusy || portalBusy} onPress={() => setMembershipDetails(false)} style={styles.settings}><Ionicons name="arrow-back" size={25} color={GOLD} /></Pressable>
            <Text style={[styles.pageTitle, styles.centeredTitle]}>{c.membership}</Text>
            <View style={styles.settings} />
          </View>
          <ScrollView contentContainerStyle={styles.membershipDetailsContent}>
            <View style={[styles.card, styles.membershipCard, styles.membershipDetailsCard]}>
              <View style={styles.membershipBrand}><Text style={styles.membershipBrandItc}>ITC </Text><Text style={styles.membershipBrandClub}>CLUB</Text></View>
              <Text style={styles.membershipDetailsStatus}>
                {user.subscription_status === 'canceled' ? ui('Finalizada') : user.subscription_cancel_at_period_end ? ui('Renovación cancelada') : user.subscription_status === 'past_due' ? ui('Pago pendiente') : user.is_premium ? c.active : t('profile.free')}
              </Text>
              <Text style={styles.planDescription}>{ui('Tu membresía y sus beneficios')}</Text>
              {!membershipLoading && hasBilling ? [
                [ui('Precio'), user.subscription_amount_cents == null ? ui('No disponible') : `${formatMoney(user.subscription_amount_cents, user.subscription_currency || 'usd', language)} / ${ui(({ day: 'día', week: 'semana', month: 'mes', year: 'año' } as Record<string, string>)[user.subscription_interval || 'month'] ?? 'mes')}`],
                [ui('Renovación'), user.subscription_status === 'canceled' || user.subscription_status === 'unpaid' || user.subscription_status === 'incomplete_expired' || user.subscription_cancel_at_period_end ? ui('Desactivada') : ui('Automática')],
                [user.subscription_status === 'canceled' ? ui('Finalizada') : user.subscription_cancel_at_period_end ? ui('Acceso hasta') : ui('Próxima renovación'), user.subscription_current_period_end ? formatDate(user.subscription_current_period_end, language) : '—'],
              ].map(([label, value]) => <View key={label} style={styles.membershipDetailRow}><Text style={styles.rowLabel}>{label}</Text><Text style={styles.membershipDetailValue}>{value}</Text></View>) : (
                membershipLoading ? <ActivityIndicator color={GOLD} accessibilityLabel={ui('Actualizando membresía')} /> : manualMembership ? <>
                  {[
                    [ui('Tipo de acceso'), ui('Otorgado por ITC Club')],
                    [ui('Renovación automática'), ui('No aplica')],
                    [ui('Suscripción de pago'), ui('No hay una suscripción asociada')],
                  ].map(([label, value]) => <View key={label} style={styles.membershipDetailRow}><Text style={styles.rowLabel}>{label}</Text><Text style={styles.membershipDetailValue}>{value}</Text></View>)}
                  <Text style={styles.membershipNote}>{ui('Tienes acceso a los beneficios del Club. No hay una renovación automática que cancelar en esta cuenta. Si realizaste un pago, contacta con soporte para revisar la vinculación de tu suscripción.')}</Text>
                  <Pressable style={styles.secondaryButton} accessibilityRole="button" onPress={() => { setMembershipDetails(false); router.push('/club'); }}><Text style={styles.secondaryText}>{ui('VER BENEFICIOS')}</Text></Pressable>
                </> : <Text style={styles.membershipNote}>{ui('No se pudieron confirmar los datos de facturación de tu membresía. Actualiza la información o contacta con soporte si ya realizaste un pago.')}</Text>
              )}
            </View>
            {!membershipLoading && hasBilling && (
              <>
                {token && <SubscriptionRenewal user={user} token={token} onUpdate={applyServerUser} onBusy={setRenewalBusy} disabled={portalBusy} />}
                {!!portalError && <Text style={styles.error} accessibilityRole="alert">{portalError}</Text>}
                <Pressable accessibilityRole="button" accessibilityState={{ busy: portalBusy }} disabled={portalBusy || renewalBusy} onPress={manageSubscription} style={styles.primaryButton}>
                  {portalBusy ? <ActivityIndicator color={BLACK} /> : <Text style={styles.primaryText}>{ui('ADMINISTRAR PAGOS')}</Text>}
                </Pressable>
                <Text style={styles.membershipNote}>{ui('Cambia tu tarjeta o consulta tus recibos en el portal seguro de Stripe.')}</Text>
              </>
            )}
            {membershipLoadError && <Text style={styles.error} accessibilityRole="alert">{ui('No se pudo actualizar la membresía. La información mostrada puede estar desactualizada.')}</Text>}
            {!membershipLoading && !renewalBusy && !portalBusy && <Pressable style={styles.photoButton} accessibilityRole="button" onPress={() => void openMembership()}><Ionicons name="refresh-outline" size={20} color={GOLD} /><Text style={styles.secondaryText}>{ui('Actualizar membresía')}</Text></Pressable>}
          </ScrollView>
        </SafeAreaView></SafeAreaProvider>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageHeader: { width: '100%', maxWidth: 680, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, gap: 8 },
  pageTitle: { color: '#FFF', fontSize: 26, fontWeight: '700', flex: 1, flexShrink: 1 },
  centeredTitle: { textAlign: 'center' },
  settings: { width: 48, height: 48, flexShrink: 0, alignItems: 'center', justifyContent: 'center' },
  avatarPhoto: { width: '100%', height: '100%', borderRadius: 55 },
  editButton: { borderWidth: 1, borderColor: GOLD, borderRadius: 24, paddingHorizontal: 24, paddingVertical: 12, marginTop: 18 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 56, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#333' },
  rowLabel: { color: '#A6A6A6', fontSize: 14, flexShrink: 1 },
  rowValue: { color: '#FFF', fontSize: 14, flex: 1, textAlign: 'right', flexWrap: 'wrap' },
  interestRow: { paddingVertical: 14, gap: 12 },
  interestHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  tag: { borderRadius: 20, borderWidth: 1, borderColor: '#74602B', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: 'rgba(253,221,86,0.06)' },
  tagText: { color: GOLD, fontSize: 13 }, selectedTag: { backgroundColor: GOLD }, selectedTagText: { color: BLACK, fontWeight: '700' },
  membershipCard: { borderWidth: 1, borderColor: GOLD }, membershipHeading: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  status: { color: GOLD, fontSize: 12 }, planTitle: { color: '#FFF', fontSize: 22, fontWeight: '700', marginBottom: 6 },
  planDescription: { color: '#A6A6A6', lineHeight: 20, marginBottom: 16 },
  membershipDetailsContent: { width: '100%', maxWidth: 680, alignSelf: 'center', flexGrow: 1, padding: 20, paddingBottom: 32 },
  membershipDetailsCard: { marginHorizontal: 0, padding: 26, minHeight: 350 },
  membershipBrand: { flexDirection: 'row', alignSelf: 'center', alignItems: 'baseline', marginTop: 8 },
  membershipBrandItc: { color: '#FFF', fontSize: 31, fontWeight: '800', letterSpacing: 4 },
  membershipBrandClub: { color: GOLD, fontSize: 31, fontWeight: '800', letterSpacing: 4 },
  membershipDetailsStatus: { color: GOLD, fontSize: 13, textAlign: 'center', marginTop: 8, marginBottom: 20 },
  membershipDetailsSpacer: { flexGrow: 1, minHeight: 40 },
  membershipDetailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingVertical: 15, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#333' },
  membershipDetailValue: { color: '#FFF', fontSize: 14, textAlign: 'right', flexShrink: 1 },
  membershipNote: { color: '#A6A6A6', fontSize: 13, lineHeight: 19, marginTop: 14 },
  cancelMembershipLink: { alignSelf: 'center', minHeight: 48, justifyContent: 'center', paddingHorizontal: 12, marginTop: 22 },
  cancelMembershipText: { color: GOLD, fontSize: 14 },
  form: { width: '100%', maxWidth: 680, alignSelf: 'center', padding: 20, paddingBottom: 40 }, input: { color: '#FFF', backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 14, fontSize: 16, marginTop: 8, marginBottom: 12 },
  photoButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  photoHint: { color: '#A6A6A6', fontSize: 12, textAlign: 'center', marginBottom: 12 },
  error: { color: '#FF8080', marginTop: 16 }, modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 },
  helpCard: { width: '100%', maxWidth: 560, alignSelf: 'center', backgroundColor: '#1A1A1A', borderRadius: 20, padding: 24 }, helpText: { color: '#CCC', lineHeight: 23, marginBottom: 24 },

  container: {
    flex: 1,
    backgroundColor: BLACK,
  },
  header: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 24,
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
    color: '#FFFFFF',
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
