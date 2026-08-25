import { useState, useEffect, useRef, useCallback } from 'react';
import { subscribeRealtimeUpdate, getCachedData, setCachedData } from '@/utils/realtimeSync';

export function useRealtimeTable({ entity, fetchFn, dependencies = [], pollInterval = 8000 }) {
  const [data, setData] = useState(() => {
    const cacheKey = `${entity}_${JSON.stringify(dependencies)}`;
    return getCachedData(cacheKey);
  });
  const [loading, setLoading] = useState(!data);
  const [refreshing, setRefreshing] = useState(false);
  const isMounted = useRef(true);

  const cacheKey = `${entity}_${JSON.stringify(dependencies)}`;

  const loadData = useCallback(async (isBackground = false) => {
    if (!isBackground && !getCachedData(cacheKey)) {
      setLoading(true);
    } else if (isBackground) {
      setRefreshing(true);
    }

    try {
      const result = await fetchFn();
      if (isMounted.current && result) {
        setData(result);
        setCachedData(cacheKey, result);
      }
    } catch {
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [fetchFn, cacheKey]);

  useEffect(() => {
    isMounted.current = true;
    const cached = getCachedData(cacheKey);
    if (cached) {
      setData(cached);
      setLoading(false);
      loadData(true);
    } else {
      loadData(false);
    }

    const unsubscribe = subscribeRealtimeUpdate(entity, () => {
      loadData(true);
    });

    let intervalId = null;
    if (pollInterval > 0) {
      intervalId = setInterval(() => {
        loadData(true);
      }, pollInterval);
    }

    return () => {
      isMounted.current = false;
      unsubscribe();
      if (intervalId) clearInterval(intervalId);
    };
  }, [cacheKey, entity, loadData, pollInterval]);

  return {
    data,
    setData,
    loading,
    refreshing,
    refetch: () => loadData(false)
  };
}
