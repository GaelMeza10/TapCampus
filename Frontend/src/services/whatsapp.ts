import * as Linking from 'expo-linking';

export function whatsappUrl(phone: string, product: string, reserved: boolean) {
  if (!/^\+52\d{10}$/.test(phone)) throw new Error('El teléfono de contacto no es válido.');
  const message = reserved
    ? `Hola, reservé ${product} en TapCampus. ¿Podemos coordinar la entrega?`
    : `Hola, me interesa ${product} en TapCampus. ¿Sigue disponible?`;
  return `https://wa.me/${phone.slice(1)}?text=${encodeURIComponent(message)}`;
}

export async function openWhatsApp(phone: string, product: string, reserved: boolean) {
  const url = whatsappUrl(phone, product, reserved);
  try { await Linking.openURL(url); }
  catch { throw new Error('No se pudo abrir WhatsApp. Revisa si tienes un navegador disponible.'); }
}
