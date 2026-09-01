import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { fetchArticle, formatDate, type NewsArticle } from '../lib/news';

// Envuelve el HTML del artículo (de WordPress) en un documento con los estilos
// de la app: fondo negro, dorado, tipografía del sistema, imágenes responsivas.
// Así se ve nativo aunque el motor por dentro sea un WebView.
function buildHtml(article: NewsArticle): string {
  const hero = article.image
    ? `<img class="hero" src="${article.image}" alt="" />`
    : '';
  const date = formatDate(article.date);
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #050505; overflow-x: hidden; }
  body {
    color: #E8E8E8;
    font-family: -apple-system, "Segoe UI", Roboto, system-ui, sans-serif;
    font-size: 17px;
    line-height: 1.72;
    padding: 0 20px 60px;
    -webkit-text-size-adjust: 100%;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  img.hero {
    display: block;
    width: calc(100% + 40px);
    margin: 0 -20px 22px;
    max-height: 320px;
    object-fit: cover;
  }
  .kicker { color: #D4AF37; font-size: 12px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase; }
  h1.title { color: #FFFFFF; font-size: 27px; line-height: 1.25; font-weight: 800; margin: 8px 0 6px; }
  .date { color: #8A8A8A; font-size: 13px; font-weight: 700; margin-bottom: 22px; }
  .content img, .content video, .content iframe {
    max-width: 100% !important;
    height: auto;
    border-radius: 12px;
    margin: 16px 0;
  }
  .image-fallback {
    min-height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    margin: 16px 0;
    background: #1A1A1A;
    color: #8A8A8A;
    font-size: 14px;
    font-weight: 700;
  }
  .content iframe { width: 100% !important; aspect-ratio: 16 / 9; }
  .content h1, .content h2, .content h3, .content h4 {
    color: #FFFFFF; line-height: 1.3; font-weight: 800; margin: 28px 0 10px;
  }
  .content h2 { font-size: 22px; }
  .content h3 { font-size: 19px; }
  .content p { margin: 0 0 16px; }
  .content a { color: #D4AF37; text-decoration: none; }
  .content ul, .content ol { padding-left: 22px; margin: 0 0 16px; }
  .content li { margin-bottom: 8px; }
  .content blockquote {
    margin: 18px 0; padding: 4px 0 4px 16px;
    border-left: 3px solid #D4AF37; color: #C7C7C7; font-style: italic;
  }
  .content figure { margin: 16px 0; }
  .content figcaption { color: #7E7E7E; font-size: 13px; text-align: center; margin-top: 6px; }
  .content table { width: 100% !important; display: block; overflow-x: auto; }
  .content strong, .content b { color: #FFFFFF; }
  hr { border: none; border-top: 1px solid #1F1F1F; margin: 26px 0; }
</style>
</head>
<body>
  ${hero}
  <div class="kicker">Insight The City</div>
  <h1 class="title">${escapeHtml(article.title)}</h1>
  ${date ? `<div class="date">${date}</div>` : ''}
  <div class="content">${article.contentHtml}</div>
  <script>
    document.addEventListener('error', function (event) {
      var image = event.target;
      if (!image || image.tagName !== 'IMG') return;
      var fallback = document.createElement('div');
      fallback.className = 'image-fallback';
      fallback.textContent = 'Imagen no disponible';
      image.replaceWith(fallback);
    }, true);
  </script>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default function NewsDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; section?: string }>();
  const id = params.id;
  const section = params.section ?? 'Nota';

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setArticle(null);
    setError(null);
    fetchArticle(id)
      .then((a) => {
        if (alive) setArticle(a);
      })
      .catch((e) => {
        if (alive) setError((e as Error).message);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  const header = (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
        <Ionicons name="arrow-back" size={26} color="#D4AF37" />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {section}
      </Text>
      <View style={{ width: 26 }} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {header}
      {error ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={44} color="#555" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
            <Text style={styles.retryText}>Volver</Text>
          </TouchableOpacity>
        </View>
      ) : !article ? (
        <View style={styles.center}>
          <ActivityIndicator color="#D4AF37" size="large" />
        </View>
      ) : (
        <WebView
          originWhitelist={['*']}
          source={{ html: buildHtml(article) }}
          style={styles.webview}
          showsVerticalScrollIndicator={false}
          setSupportMultipleWindows={false}
          // Los enlaces del artículo se abren en el navegador del sistema,
          // no dentro del WebView (que mostraría páginas sin estilo).
          onShouldStartLoadWithRequest={(req) => {
            if (req.navigationType === 'click' && /^https?:/.test(req.url)) {
              void WebBrowser.openBrowserAsync(req.url);
              return false;
            }
            return true;
          }}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color="#D4AF37" size="large" />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const COLORS = {
  background: '#050505',
  gold: '#D4AF37',
  white: '#FFFFFF',
  secondary: '#A6A6A6',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '800', flex: 1, textAlign: 'center' },
  webview: { flex: 1, backgroundColor: COLORS.background },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 14 },
  errorText: { color: COLORS.secondary, textAlign: 'center', lineHeight: 21 },
  retryBtn: {
    marginTop: 6,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
  },
  retryText: { color: '#000', fontWeight: '800' },
});
