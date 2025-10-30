import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UseOnboardingReturn = {
  /** данные готовы (флаг считан) */
  ready: boolean;
  /** true — уже видели онбординг; false — ещё нет */
  seen: boolean;
  /** отметить как просмотренный и обновить стейт */
  markSeen: () => Promise<void>;
  /** сбросить флаг (для отладки или повторного показа) */
  resetSeen: () => Promise<void>;
  /** последняя ошибка (если была) */
  error: unknown;
};

/**
 * Хук для работы с флагом онбординга в AsyncStorage.
 * По умолчанию использует ключ 'seenOnboarding' и схему '1'|'0'.
 */
export function useOnboarding(key = 'seenOnboarding'): UseOnboardingReturn {
  const [ready, setReady] = useState(false);
  const [seen, setSeen] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const opInFlight = useRef<Promise<any> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const v = await AsyncStorage.getItem(key);
        if (!cancelled) setSeen(v === '1');
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [key]);

  const markSeen = useCallback(async () => {
    if (opInFlight.current) await opInFlight.current;
    const p = (async () => {
      try {
        await AsyncStorage.setItem(key, '1');
        setSeen(true);
      } catch (e) {
        setError(e);
        throw e;
      } finally {
        opInFlight.current = null;
      }
    })();
    opInFlight.current = p;
    return p;
  }, [key]);

  const resetSeen = useCallback(async () => {
    if (opInFlight.current) await opInFlight.current;
    const p = (async () => {
      try {
        await AsyncStorage.removeItem(key);
        setSeen(false);
      } catch (e) {
        setError(e);
        throw e;
      } finally {
        opInFlight.current = null;
      }
    })();
    opInFlight.current = p;
    return p;
  }, [key]);

  return { ready, seen, markSeen, resetSeen, error };
}
