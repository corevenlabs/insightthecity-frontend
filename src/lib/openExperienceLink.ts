import { Linking } from 'react-native';

// A benefit link needs no in-app browser session. Dispatch it to the phone's
// browser so an unfinished Safari/Custom Tab presentation cannot lock it.
export async function openExperienceLink(
  destination: (signal: AbortSignal) => Promise<string | null>,
  isCurrent: () => boolean,
): Promise<void> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error('External link timed out'));
    }, 15000);
  });
  try {
    await Promise.race([
      (async () => {
        const url = await destination(controller.signal);
        // A late response must never open after a timeout, navigation or logout.
        if (controller.signal.aborted || !isCurrent() || !url) return;
        const parsed = new URL(url);
        if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) {
          throw new Error('Invalid external link');
        }
        await Linking.openURL(url);
      })(),
      deadline,
    ]);
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}
