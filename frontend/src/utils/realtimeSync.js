const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('wandersync_live_sync') : null;

export const broadcastRealtimeUpdate = (entity = 'all') => {
  const payload = { entity, timestamp: Date.now() };
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('wandersync_data_changed', { detail: payload }));
  }
  if (channel) {
    try {
      channel.postMessage(payload);
    } catch {}
  }
};

export const subscribeRealtimeUpdate = (entity, callback) => {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e) => {
    if (!entity || entity === 'all' || e.detail?.entity === entity || e.detail?.entity === 'all') {
      callback(e.detail);
    }
  };

  const handleBroadcast = (e) => {
    if (!entity || entity === 'all' || e.data?.entity === entity || e.data?.entity === 'all') {
      callback(e.data);
    }
  };

  const handleFocus = () => {
    callback({ entity, type: 'focus', timestamp: Date.now() });
  };

  window.addEventListener('wandersync_data_changed', handleCustomEvent);
  window.addEventListener('focus', handleFocus);
  if (channel) {
    channel.addEventListener('message', handleBroadcast);
  }

  return () => {
    window.removeEventListener('wandersync_data_changed', handleCustomEvent);
    window.removeEventListener('focus', handleFocus);
    if (channel) {
      channel.removeEventListener('message', handleBroadcast);
    }
  };
};

const cacheStore = new Map();

export const getCachedData = (key) => {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > 60000) {
    cacheStore.delete(key);
    return null;
  }
  return entry.data;
};

export const setCachedData = (key, data) => {
  cacheStore.set(key, { data, timestamp: Date.now() });
};

export const clearDataCache = (keyPrefix) => {
  if (!keyPrefix) {
    cacheStore.clear();
    return;
  }
  for (const k of cacheStore.keys()) {
    if (k.startsWith(keyPrefix)) {
      cacheStore.delete(k);
    }
  }
};
