import { Prisma } from '../generated/prisma/client';

// Nunca incluir el User completo en una respuesta pública.
export const publicationSelect = {
  id: true,
  type: true,
  condition: true,
  title: true,
  description: true,
  price: true,
  price_before_ganga: true,
  image_url: true,
  status: true,
  created_at: true,
  seller_id: true,
  zone_id: true,
  pickup_mode: true,
  category_id: true,
  initial_stock: true,
  current_stock: true,
  start_time: true,
  end_time: true,
  is_ganga_active: true,
  seller: { select: { id: true, name: true } },
} satisfies Prisma.PublicationSelect;

export const ownedPublicationSelect = {
  ...publicationSelect,
  // Private scheduling marker; the explicit serializer never returns it.
  availability_announced_for: true,
  ganga_min_price: true,
  ganga_activation_mode: true,
  ganga_minutes_before: true,
} satisfies Prisma.PublicationSelect;

type PublicPublication = Prisma.PublicationGetPayload<{
  select: typeof publicationSelect;
}>;
export function publicationResponse(publication: PublicPublication) {
  return {
    id: publication.id,
    type: publication.type,
    condition: publication.condition,
    title: publication.title,
    description: publication.description,
    price: publication.price.toFixed(2),
    price_before_ganga: publication.price_before_ganga?.toFixed(2) ?? null,
    image_url: publication.image_url,
    status: publication.status,
    created_at: publication.created_at,
    seller_id: publication.seller_id,
    zone_id: publication.zone_id,
    pickup_mode: publication.pickup_mode,
    category_id: publication.category_id,
    initial_stock: publication.initial_stock,
    current_stock: publication.current_stock,
    start_time: publication.start_time,
    end_time: publication.end_time,
    is_ganga_active: publication.is_ganga_active,
    seller: { id: publication.seller.id, name: publication.seller.name },
  };
}

export function ownedPublicationResponse(publication: Prisma.PublicationGetPayload<{
  select: typeof ownedPublicationSelect;
}>) {
  return {
    ...publicationResponse(publication),
    ganga_min_price: publication.ganga_min_price?.toFixed(2) ?? null,
    ganga_activation_mode: publication.ganga_activation_mode,
    ganga_minutes_before: publication.ganga_minutes_before,
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
