import { router, useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const INJECTED_JS = `
  (function() {
    var inputs = document.querySelectorAll('input');
    inputs.forEach(function(input) {
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('autocorrect', 'off');
      input.setAttribute('autocapitalize', 'off');
      input.setAttribute('spellcheck', 'false');
    });
    var observer = new MutationObserver(function() {
      var inputs = document.querySelectorAll('input');
      inputs.forEach(function(input) {
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('autocorrect', 'off');
        input.setAttribute('autocapitalize', 'off');
        input.setAttribute('spellcheck', 'false');
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  })();
  true;
`;

export default function Checkout() {
  const { url } = useLocalSearchParams();
  const webViewRef = useRef<WebView>(null);
  const checkoutUrl = Array.isArray(url) ? url[0] : url;

  const handleShouldStartLoad = (request: { url: string }) => {
    if (request.url.includes('success.miapp.com')) {
      router.replace('/success');
      return false; // ✅ Bloquea antes de que intente cargar el dominio
    }
    if (request.url.includes('cancel.miapp.com')) {
      router.back();
      return false;
    }
    return true;
  };

  // ✅ Captura el error 1003 para que no muestre la pantalla fea
  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    if (
      nativeEvent.url.includes('success.miapp.com') ||
      nativeEvent.url.includes('cancel.miapp.com')
    ) {
      return; // Ya fue manejado por handleShouldStartLoad, ignorar
    }
  };

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: checkoutUrl || '' }}
      style={styles.webview}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      textZoom={100}
      injectedJavaScript={INJECTED_JS}
      injectedJavaScriptBeforeContentLoaded={INJECTED_JS}
      onShouldStartLoadWithRequest={handleShouldStartLoad}
      onError={handleError}        // ✅ Captura el error de dominio
      onContentProcessDidTerminate={() => {
        webViewRef.current?.reload();
      }}
    />
  );
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
});