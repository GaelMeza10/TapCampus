import { useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '@/constants/api.constants';

export function useMarketplaceSync(refresh: () => void | Promise<void>, initial = true, onDepleted?: (id: string) => void, onFocus?: () => void) {
  // Los listeners usan la consulta más reciente, con los filtros o el ID actuales.
  const current = useRef(refresh);
  const focused = useRef(false);
  const initialSync = useRef(initial);
  current.current = refresh;
  const depleted = useRef(onDepleted);
  depleted.current = onDepleted;
  const focus = useRef(onFocus);
  focus.current = onFocus;

  // La conexión se mantiene solo mientras esta pantalla tiene el foco.
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      focus.current?.();
      let timer: ReturnType<typeof setTimeout> | undefined;
      let running = false;
      let queued = false;
      const sync = () => {
        if (!mounted) return;
        if (running) { queued = true; return; }
        running = true;
        Promise.resolve().then(() => current.current()).catch(() => {
          // La pantalla conserva su error recuperable; el socket no reintenta mutaciones.
        }).finally(() => {
          running = false;
          if (queued && mounted) { queued = false; schedule(); }
        });
      };
      const schedule = () => {
        if (timer) return;
        timer = setTimeout(() => { timer = undefined; sync(); }, 100);
      };

      // initial=false omite esta carga inicial; al regresar a la pantalla siempre reconsulta.
      if (initialSync.current || focused.current) sync();
      focused.current = true;
      const socket = io(API_BASE_URL);

      // connect también cubre reconexiones; los otros eventos avisan de stock, cierre y oferta.
      // Cada aviso reconsulta la API: el servidor confirma el estado, no el payload del socket.
      socket.on('connect', schedule);
      socket.on('stock_updated', (payload: { publicationId?: string; newStock?: number }) => {
        if (mounted && payload?.newStock === 0 && typeof payload.publicationId === 'string') depleted.current?.(payload.publicationId);
        schedule();
      });
      for (const event of ['publication_expired', 'ganga_activated', 'publication_created', 'publication_updated', 'publication_available'])
        socket.on(event, schedule);

      // Al volver del fondo recupera cambios que pudieron ocurrir sin conexión.
      const app = AppState.addEventListener('change', state => {
        if (state === 'active') { focus.current?.(); sync(); }
      });

      // Al perder el foco o desmontarse, desconecta el socket y retira el listener de la app.
      return () => {
        mounted = false;
        if (timer) clearTimeout(timer);
        app.remove();
        socket.disconnect();
      };
    }, []),
  );
}
