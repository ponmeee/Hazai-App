import { useEffect, useState } from 'react';

export function useTransientMessage(durationMs = 2500) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (message === null) return;
    const timer = setTimeout(() => setMessage(null), durationMs);
    return () => clearTimeout(timer);
  }, [message, durationMs]);

  return [message, setMessage] as const;
}
