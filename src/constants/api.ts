// URL base del backend (origen, sin /api).
// En builds EAS se define con la variable EXPO_PUBLIC_API_URL (ver eas.json).
// En desarrollo local cae a localhost:3000.
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
