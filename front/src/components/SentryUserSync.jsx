import { useAuth } from '@clerk/react';
import * as Sentry from '@sentry/react';
import { useEffect } from 'react';

/* keeps sentry user context in sync with clerk (errors and replays show which user) */
const SentryUserSync = () => {
  const { isLoaded, userId } = useAuth();
  useEffect(() => {
    if (!isLoaded) return;
    Sentry.setUser(userId ? { id: userId } : null);
  }, [isLoaded, userId]);

  return null;
};
export default SentryUserSync;
