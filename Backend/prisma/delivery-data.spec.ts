import { categoryNames, zoneNames } from './catalogs';
import { deliveryPeople, deliveryProducts } from './delivery-data';
import { deliveryRecords } from './seed-delivery';

describe('integridad de los datos de entrega', () => {
  const now = Date.parse('2026-11-22T18:00:00Z');
  const { publications, reservations } = deliveryRecords(now);
  it('cubre todas las categorías, zonas, tipos y condiciones sin duplicar IDs', () => {
    expect(publications).toHaveLength(107); expect(deliveryPeople).toHaveLength(6); expect(reservations).toHaveLength(24);
    expect(new Set(publications.map(p => p.id)).size).toBe(107);
    for (const type of ['LIVE', 'STATIC'] as const) {
      expect(categoryNames[type]).toHaveLength(type === 'LIVE' ? 16 : 10);
      for (const category of categoryNames[type]) expect(deliveryProducts.filter(p => p.category === category && p.type === type)).toHaveLength(type === 'LIVE' && ['Ropa y calzado', 'Mochilas y bolsos', 'Deportes'].includes(category) ? 5 : 4);
    }
    expect(zoneNames).toHaveLength(5);
    for (const item of publications) {
      expect(Number(item.price)).toBeGreaterThan(0);
      if (item.type === 'STATIC') {
        expect(['NEW', 'USED']).toContain(item.condition);
        expect(item.initial_stock).toBeUndefined(); expect(item.end_time).toBeUndefined();
      } else expect(item.condition).toBeNull();
    }
  });
  it('cada reserva conserva precio/plazo e inventario consistente con su estado', () => {
    for (const status of ['ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED']) expect(reservations.filter(r => r.status === status)).toHaveLength(6);
    for (const row of reservations) {
      const product = publications.find(p => p.id === row.publication_id)!;
      expect(product.type).toBe('LIVE'); expect(row.buyer_id).not.toBe(product.seller_id);
      expect(new Date(row.reserved_at!).getTime()).toBeGreaterThanOrEqual(product.start_time!.getTime());
      const deadline = new Date(row.reserved_at!).getTime() + 1200000;
      if (row.status === 'ACTIVE') { expect(deadline).toBeGreaterThan(now); expect(row.resolved_at).toBeNull(); }
      else { expect(new Date(row.resolved_at!).getTime()).toBeLessThanOrEqual(deadline); expect(new Date(row.resolved_at!).getTime()).toBeLessThan(now); }
    }
    for (const product of publications.filter(p => p.type === 'LIVE')) {
      const consumed = reservations.filter(r => r.publication_id === product.id && ['ACTIVE', 'COMPLETED'].includes(r.status!)).length;
      expect(product.current_stock! + consumed).toBe(product.initial_stock);
      expect(product.current_stock).toBeGreaterThanOrEqual(0);
    }
    expect(reservations.find(r => r.status === 'COMPLETED')!.unit_price).not.toBe(publications[0].price);
  });
  it('oferta programada queda en el futuro y las ofertas activas reducen el precio', () => {
    const scheduled = publications.find(p => p.ganga_activation_mode === 'SCHEDULED')!;
    expect(scheduled.end_time!.getTime() - scheduled.ganga_minutes_before! * 60000).toBeGreaterThan(now);
    expect(publications.filter(p => p.is_ganga_active)).toHaveLength(2);
    for (const row of publications.filter(p => p.is_ganga_active)) expect(Number(row.price)).toBeLessThan(Number(row.price_before_ganga));
  });
});
