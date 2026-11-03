export function uabcEmail(value: string) {
  const email = value.trim().toLowerCase();
  return /^[^\s@]+@uabc\.edu\.mx$/.test(email) ? email : null;
}

export function mexicanPhone(value: string) {
  const compact = value.replace(/[\s()-]/g, '');
  if (/^\d{10}$/.test(compact)) return `+52${compact}`;
  return /^\+52\d{10}$/.test(compact) ? compact : null;
}
