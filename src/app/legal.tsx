import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '../context/LanguageContext';
import { fetchLegalDocument, LEGAL_SLUGS, type LegalDocument, type LegalSlug } from '../lib/legal';
import { formatDate } from '../lib/payments';

const GOLD = '#FDDD56';

const TITLES: Record<LegalSlug, string> = {
  terms: 'Términos y Condiciones',
  privacy: 'Política de Privacidad',
  subscription: 'Términos de la membresía',
  accessibility: 'Accesibilidad',
};

// Markdown mínimo que usa el panel: "# " títulos, "- " listas, **negrita**.
function Inline({ text, style }: { text: string; style: object }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <Text style={style}>
      {parts.map((part, index) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <Text key={index} style={styles.bold}>{part.slice(2, -2)}</Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
}

function LegalBody({ content }: { content: string }) {
  const blocks: { kind: 'h' | 'p' | 'li'; text: string }[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length) blocks.push({ kind: 'p', text: paragraph.join(' ') });
    paragraph = [];
  };
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    if (/^#{1,3}\s+/.test(line)) { flush(); blocks.push({ kind: 'h', text: line.replace(/^#{1,3}\s+/, '') }); continue; }
    if (/^[-*]\s+/.test(line)) { flush(); blocks.push({ kind: 'li', text: line.replace(/^[-*]\s+/, '') }); continue; }
    paragraph.push(line);
  }
  flush();

  return (
    <View>
      {blocks.map((block, index) => {
        if (block.kind === 'h') {
          return <Text key={index} style={styles.heading} accessibilityRole="header">{block.text}</Text>;
        }
        if (block.kind === 'li') {
          return (
            <View key={index} style={styles.listItem}>
              <Text style={styles.bullet} accessible={false}>•</Text>
              <Inline text={block.text} style={styles.listText} />
            </View>
          );
        }
        return <Inline key={index} text={block.text} style={styles.paragraph} />;
      })}
    </View>
  );
}

export default function LegalScreen() {
  const { language, ui } = useLanguage();
  const params = useLocalSearchParams<{ slug?: string }>();
  const slug = (LEGAL_SLUGS as string[]).includes(String(params.slug)) ? (params.slug as LegalSlug) : 'terms';
  const [attempt, setAttempt] = useState(0);
  // El resultado se guarda con la clave de la petición: si cambia slug/idioma o se
  // reintenta, el resultado anterior deja de aplicar y se muestra la carga.
  const requestKey = `${slug}:${language}:${attempt}`;
  const [loaded, setLoaded] = useState<{ key: string; document?: LegalDocument; error?: string } | null>(null);

  useEffect(() => {
    let alive = true;
    fetchLegalDocument(slug, language)
      .then((doc) => { if (alive) setLoaded({ key: requestKey, document: doc }); })
      .catch(() => {
        if (alive) setLoaded({ key: requestKey, error: ui('No se pudo cargar el documento. Revisa tu conexión e inténtalo de nuevo.') });
      });
    return () => { alive = false; };
  }, [slug, language, requestKey, ui]);

  const current = loaded?.key === requestKey ? loaded : null;
  const document = current?.document ?? null;
  const error = current?.error ?? '';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ui('Volver')}
          hitSlop={10}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={GOLD} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1} accessibilityRole="header">
          {document?.title ?? ui(TITLES[slug])}
        </Text>
        <View style={styles.backButton} />
      </View>

      {error ? (
        <View style={styles.center}>
          <Text style={styles.errorText} accessibilityRole="alert">{error}</Text>
          <Pressable accessibilityRole="button" style={styles.retryButton} onPress={() => setAttempt((n) => n + 1)}>
            <Text style={styles.retryText}>{ui('Reintentar')}</Text>
          </Pressable>
        </View>
      ) : !document ? (
        <View style={styles.center}>
          <ActivityIndicator color={GOLD} size="large" accessibilityLabel={ui('Cargando…')} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.meta}>
            {ui('Última actualización: {date}', { date: formatDate(document.publishedAt, language) })} · v{document.version}
          </Text>
          <LegalBody content={document.content} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, color: '#FFFFFF', fontSize: 17, fontWeight: '800', textAlign: 'center' },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 22, paddingBottom: 48 },
  meta: { color: '#A6A6A6', fontSize: 13, marginTop: 4, marginBottom: 18 },
  heading: { color: '#FFFFFF', fontSize: 19, fontWeight: '800', marginTop: 24, marginBottom: 8, lineHeight: 25 },
  paragraph: { color: '#E2E2E2', fontSize: 16, lineHeight: 25, marginBottom: 14 },
  listItem: { flexDirection: 'row', gap: 10, marginBottom: 10, paddingRight: 8 },
  bullet: { color: GOLD, fontSize: 16, lineHeight: 25 },
  listText: { flex: 1, color: '#E2E2E2', fontSize: 16, lineHeight: 25 },
  bold: { fontWeight: '800', color: '#FFFFFF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  errorText: { color: '#D0D0D0', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  retryButton: { minHeight: 48, paddingHorizontal: 22, borderRadius: 12, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  retryText: { color: '#000', fontWeight: '800' },
});
