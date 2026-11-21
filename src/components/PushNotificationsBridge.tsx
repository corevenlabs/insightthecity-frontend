import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { notificationsModule, safeNotificationRoute, syncPushToken } from '../lib/pushNotifications';

const Notifications = notificationsModule();
// Account notices are also shown while the app is open.
Notifications?.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

// Keeps this device registered for the signed-in account and opens the screen a tapped notification points to.
export function PushNotificationsBridge() {
  const { token, loading } = useAuth();
  const { language } = useLanguage();
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  useEffect(() => {
    if (token) void syncPushToken(token, language);
  }, [token, language]);

  useEffect(() => {
    if (!Notifications) return;
    const take = (response: import('expo-notifications').NotificationResponse | null) => {
      if (!response || response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
      const route = safeNotificationRoute(response.notification.request.content.data?.url);
      if (route) setPendingRoute(route);
    };
    // A tap that launched the app from a closed state.
    try { take(Notifications.getLastNotificationResponse()); Notifications.clearLastNotificationResponse(); } catch { /* not available */ }
    const subscription = Notifications.addNotificationResponseReceivedListener(take);
    return () => subscription.remove();
  }, []);

  // Wait for the saved session to load so protected screens do not bounce to the welcome screen.
  useEffect(() => {
    if (!pendingRoute || loading) return;
    // Let the start screen finish its own redirect first, then open the notice's screen on top.
    const timer = setTimeout(() => {
      setPendingRoute(null);
      router.push(pendingRoute as never);
    }, 300);
    return () => clearTimeout(timer);
  }, [pendingRoute, loading]);

  return null;
}
