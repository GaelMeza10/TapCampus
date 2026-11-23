import { useEffect, useState } from 'react';

/**
 * true cuando `active` lleva más de `afterMs` encendido.
 * Sirve para avisar que el servidor (p. ej. Render gratuito al despertar) puede tardar.
 */
export function useSlowHint(active: boolean, afterMs = 5000) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!active) {
      setSlow(false);
      return;
    }
    const timer = setTimeout(() => setSlow(true), afterMs);
    return () => clearTimeout(timer);
  }, [active, afterMs]);
  return slow;
}
