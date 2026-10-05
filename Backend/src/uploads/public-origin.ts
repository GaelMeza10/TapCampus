import type { Request } from 'express';

export function publicOrigin(request: Request) {
  return (
    process.env.PUBLIC_BASE_URL ??
    `${request.protocol}://${request.get('host')}`
  ).replace(/\/$/, '');
}
