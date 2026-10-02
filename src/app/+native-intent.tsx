import { CHECKOUT_RETURN_PATH } from '../lib/payments';

// El regreso desde Stripe (itcclub://checkout-return?...) lo consume
// WebBrowser.openAuthSessionAsync. En Android el sistema también entrega ese link
// al router; lo ignoramos para no navegar dos veces. Si la app arrancó desde el
// link (se cerró durante el pago) sí se abre la pantalla checkout-return.
export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  try {
    if (!initial && path.includes(CHECKOUT_RETURN_PATH)) return null;
    return path;
  } catch {
    return path;
  }
}
