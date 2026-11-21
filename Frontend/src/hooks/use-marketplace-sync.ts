import { useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '@/constants/api.constants';

export function useMarketplaceSync(refresh: () => void | Promise<void>, initial = true) {
  // Los listeners usan la consulta más reciente, con los filtros o el ID actuales.
  const current = useRef(refresh);
  const focused = useRef(false);
  const initialSync = useRef(initial);
  current.current = refresh;

  // La conexión se mantiene solo mientras esta pantalla tiene el foco.
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      const sync = () => {
        if (mounted) void current.current();
      };

      // initial=false omite esta carga inicial; al regresar a la pantalla siempre reconsulta.
      if (initialSync.current || focused.current) sync();
      focused.current = true;
      const socket = io(API_BASE_URL);

      // connect también cubre reconexiones; los otros eventos avisan de stock, cierre y oferta.
      // Cada aviso reconsulta la API: el servidor confirma el estado, no el payload del socket.
      for (const event of ['connect', 'stock_updated', 'publication_expired', 'ganga_activated'])
        socket.on(event, sync);

      // Al volver del fondo recupera cambios que pudieron ocurrir sin conexión.
      const app = AppState.addEventListener('change', state => {
        if (state === 'active') sync();
      });

      // Al perder el foco o desmontarse, desconecta el socket y retira el listener de la app.
      return () => {
        mounted = false;
        app.remove();
        socket.disconnect();
      };
    }, []),
  );
}
