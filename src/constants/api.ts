// URL base del backend (origen, sin /api).
// En builds EAS se define con la variable EXPO_PUBLIC_API_URL (ver eas.json).
// Si EAS no inyecta la variable, usamos el backend productivo. Esto evita que
// una OTA publicada sin variables intente conectarse al localhost del iPhone.
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  'https://itc-backend-1031252664334.us-east1.run.app';
