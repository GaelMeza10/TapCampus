import { Prisma } from '../generated/prisma/client';

// Nunca incluir el User completo en una respuesta pública.
export const publicationSelect = {
  id: true,
  type: true,
  title: true,
  description: true,
  price: true,
  price_before_ganga: true,
  image_url: true,
  status: true,
  created_at: true,
  seller_id: true,
  zone_id: true,
  category_id: true,
  initial_stock: true,
  current_stock: true,
  start_time: true,
  end_time: true,
  is_ganga_active: true,
  ganga_min_price: true,
  ganga_activation_mode: true,
  ganga_minutes_before: true,
  seller: { select: { id: true, name: true } },
} satisfies Prisma.PublicationSelect;

type PublicPublication = Prisma.PublicationGetPayload<{
  select: typeof publicationSelect;
}>;
export function publicationResponse(publication: PublicPublication) {
  return {
    ...publication,
    price: publication.price.toFixed(2),
    price_before_ganga: publication.price_before_ganga?.toFixed(2) ?? null,
    ganga_min_price: publication.ganga_min_price?.toFixed(2) ?? null,
  };
}

export function visiblePublications(now: Date): Prisma.PublicationWhereInput {
  return {
    status: 'ACTIVE',
    OR: [
      { type: 'STATIC' },
      {
        type: 'LIVE',
        start_time: { lte: now },
        end_time: { gt: now },
        current_stock: { gt: 0 },
      },
    ],
  };
}
