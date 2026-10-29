import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import type { Experience } from '../constants/experiences';

type Phase = 'none' | 'available' | 'scheduled' | 'checking' | 'paused' | 'expired';
const timestamp = (value?: string | null) => value ? Date.parse(value) : NaN;
export function benefitSchedule(experience: Experience | undefined, localNow: number) {
  let phase: Phase = 'none';
  let remainingMs = 0;
  if (experience?.benefitAction === 'qr') {
    const server = timestamp(experience.couponServerTime);
    const received = experience.couponReceivedAt;
    const now = Number.isFinite(server) && received != null ? server + Math.max(0, localNow - received) : localNow;
    const starts = timestamp(experience.couponStartsAt), ends = timestamp(experience.couponEndsAt);
    phase = experience.couponActive === false ? 'paused'
      : Number.isFinite(ends) && ends <= now ? 'expired'
      : Number.isFinite(starts) && starts > now ? 'scheduled'
      : experience.couponStatus === 'paused' ? (Number.isFinite(starts) ? 'checking' : 'paused')
      : 'available';
    remainingMs = phase === 'scheduled' ? starts - now : 0;
  }
  return { phase, remainingMs, blocked: ['scheduled', 'checking', 'paused', 'expired'].includes(phase) };
}
export function formatBenefitCountdown(remainingMs: number, ui: (source: string) => string) {
  const total = Math.max(1, Math.ceil(remainingMs / 60_000));
  const days = Math.floor(total / 1440), hours = Math.floor((total % 1440) / 60), minutes = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(days)} ${ui(days === 1 ? 'día' : 'días')} · ${pad(hours)} h · ${pad(minutes)} min`;
}
export function useBenefitSchedule(experience: Experience | undefined, refresh: () => void) {
  const [now, setNow] = useState(() => Date.now());
  const state = benefitSchedule(experience, now);
  useEffect(() => {
    if (experience?.benefitAction !== 'qr') return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    const listener = AppState.addEventListener('change', status => {
      if (status === 'active') { setNow(Date.now()); refresh(); }
    });
    return () => { clearInterval(timer); listener.remove(); };
  }, [experience?.id, experience?.benefitAction, refresh]);
  useEffect(() => {
    // Never enable from the device clock alone: confirm availability with the server.
    if (state.phase !== 'scheduled' && state.phase !== 'checking') return;
    if (state.phase === 'checking') refresh();
    const timer = setInterval(refresh, state.phase === 'checking' ? 15_000 : 60_000);
    return () => clearInterval(timer);
  }, [state.phase, refresh]);
  return state;
}
