export const PUBLICATION_COPY = {
  LIVE: {
    label: 'Ahora en el campus',
    badgeLabel: 'AHORA EN EL CAMPUS',
    formTitle: 'Ahora en el campus',
    createAction: 'Publicar en el campus',
    hint: 'Con horario, stock y apartados de 20 minutos.',
  },
  STATIC: {
    label: 'Productos',
    badgeLabel: 'PRODUCTO',
    formTitle: 'Nuevo producto',
    createAction: 'Publicar producto',
    soldAction: 'Marcar vendido',
    hint: 'Compra por WhatsApp y acuerda la entrega. Sin apartados.',
  },
} as const;

export const PUBLICATION_BADGES = { offer: 'GANGA' } as const;
