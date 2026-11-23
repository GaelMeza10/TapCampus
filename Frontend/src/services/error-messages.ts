type HttpFailure = { code?: string; response?: { status?: number; data?: { message?: unknown } } };
const failure = (error: unknown): HttpFailure => error && typeof error === 'object' ? error as HttpFailure : {};

export function apiMessage(error: unknown): string {
  const cause = failure(error);
  if (cause.code === 'ECONNABORTED' || cause.code === 'ETIMEDOUT')
    return 'El servidor tardó demasiado en responder. Revisa tu conexión y vuelve a intentarlo.';
  const status = cause.response?.status;
  if (status && status >= 500) return 'El servidor no está disponible en este momento. Inténtalo de nuevo en unos minutos.';
  const raw = cause.response?.data?.message;
  const parts = (Array.isArray(raw) ? raw : [raw]).filter((part): part is string => typeof part === 'string' && !!part.trim());
  const technical = /\b(?:must|should|property|cannot|internal server error|bad request|forbidden|unauthorized|too many requests|not found|prisma|typeerror|sqlstate|stack|invalid input|too large|payload|entity|json)\b|\bat \S+\s*\(|ECONN|Error:/i;
  if (parts.length && parts.every(part => !technical.test(part)))
    return parts.join('\n').replace(/precio ganga/gi, 'precio de oferta').replace(/\bgangas\b/gi, 'ofertas').replace(/\bganga\b/gi, 'oferta');
  if (status === 401) return 'Tu sesión ya no es válida. Vuelve a iniciar sesión.';
  if (status === 403) return 'No tienes permiso para realizar esta acción.';
  if (status === 404) return 'Esta información ya no está disponible. Actualiza los datos.';
  if (status === 409) return 'La acción ya no está disponible. Actualiza los datos e inténtalo de nuevo.';
  if (status === 413) return 'La foto o el texto son demasiado grandes. Usa una imagen más ligera (máx. 5 MB) o un texto más corto.';
  if (status === 429) return 'Hay demasiados intentos. Espera unos minutos y vuelve a intentarlo.';
  if (status === 400 || status === 422) return 'Revisa los datos indicados e inténtalo de nuevo.';
  return 'No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.';
}

export function authErrorMessage(error: unknown, mode: 'login' | 'register') {
  const status = failure(error).response?.status;
  if (mode === 'login' && status === 401) return 'Correo o contraseña incorrectos.';
  return apiMessage(error);
}
