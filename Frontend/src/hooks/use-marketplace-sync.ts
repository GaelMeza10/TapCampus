import { useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '@/constants/api.constants';

export function useMarketplaceSync(refresh: () => void | Promise<void>, initial = true) {
  const current = useRef(refresh);
  const focused = useRef(false);
  const initialSync = useRef(initial);
  current.current = refresh;
  useFocusEffect(useCallback(() => {
    let mounted = true;
    const sync = () => { if (mounted) void current.current(); };
    if (initialSync.current || focused.current) sync();
    focused.current = true;
    const socket = io(API_BASE_URL);
    for (const event of ['connect', 'stock_updated', 'publication_expired', 'ganga_activated']) socket.on(event, sync);
    const app = AppState.addEventListener('change', state => { if (state === 'active') sync(); });
    return () => { mounted = false; app.remove(); socket.disconnect(); };
  }, []));
}
