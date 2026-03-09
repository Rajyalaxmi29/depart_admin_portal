import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ContestSettingsRow {
  problems_unlock_at: string | null;
  department_unlocks_at: string | null;
  department_closes_at: string | null;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}

export function useSubmissionWindow() {
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [settings, setSettings] = useState<ContestSettingsRow | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      setIsLoading(true);
      setFetchError(null);

      const { data, error } = await supabase
        .from('contest_settings')
        .select('problems_unlock_at, department_unlocks_at, department_closes_at, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        setFetchError(error.message);
        setSettings(null);
        setIsLoading(false);
        return;
      }

      setSettings((data as ContestSettingsRow | null) ?? null);
      setIsLoading(false);
    };

    void loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  return useMemo(() => {
    const unlockAtIso = settings?.department_unlocks_at ?? settings?.problems_unlock_at ?? null;
    const closeAtIso = settings?.department_closes_at ?? null;

    const unlockAt = unlockAtIso ? new Date(unlockAtIso) : null;
    const closeAt = closeAtIso ? new Date(closeAtIso) : null;

    const hasValidUnlock = unlockAt instanceof Date && !Number.isNaN(unlockAt.getTime());
    const hasValidClose = closeAt instanceof Date && !Number.isNaN(closeAt.getTime());

    const isConfigured = hasValidUnlock && hasValidClose && closeAt.getTime() > unlockAt.getTime();
    const isBeforeWindow = isConfigured && now.getTime() < unlockAt.getTime();
    const isClosed = isConfigured && now.getTime() >= closeAt.getTime();
    const isOpen = isConfigured && !isBeforeWindow && !isClosed;

    const msUntilUnlock = isBeforeWindow ? unlockAt.getTime() - now.getTime() : 0;
    const msUntilClose = isOpen ? closeAt.getTime() - now.getTime() : 0;

    const isNearingClose = isOpen && msUntilClose <= 24 * 60 * 60 * 1000;
    const isCriticalClose = isOpen && msUntilClose <= 3 * 60 * 60 * 1000;

    return {
      isLoading,
      fetchError,
      isConfigured,
      isBeforeWindow,
      isClosed,
      isOpen,
      canSubmit: isOpen,
      unlockAtIso,
      closeAtIso,
      unlockLabel: unlockAt ? unlockAt.toLocaleString() : 'Not configured',
      closeLabel: closeAt ? closeAt.toLocaleString() : 'Not configured',
      unlockCountdown: formatDuration(msUntilUnlock),
      closeCountdown: formatDuration(msUntilClose),
      msUntilClose,
      isNearingClose,
      isCriticalClose,
    };
  }, [fetchError, isLoading, now, settings]);
}
