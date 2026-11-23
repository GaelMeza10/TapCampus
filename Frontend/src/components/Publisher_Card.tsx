import { memo, type ComponentProps } from 'react';
import { ExploreCard } from './explore-ui';

// Existing imports use the same card as Explorar, without a second visual system.
export default memo(function PublisherCard({ now = Date.now(), ...props }: Omit<ComponentProps<typeof ExploreCard>, 'now'> & { now?: number }) {
  return <ExploreCard {...props} now={now} />;
});
