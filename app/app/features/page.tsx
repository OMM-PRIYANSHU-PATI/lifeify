import React from 'react';
import { getAllFeatures, getFeatureStats } from '@/lib/features/registry';
import { FeaturesHubClient } from './features-hub-client';

export const metadata = {
  title: 'LIFEIFY 414 Features Hub | Personal Health OS',
  description:
    'Complete interactive registry, architecture specs, and live tracking of all 414 features across V1, V2, and V3.',
};

export default function FeaturesHubPage() {
  const features = getAllFeatures();
  const stats = getFeatureStats();

  return (
    <div className="animate-fadeIn space-y-6">
      <FeaturesHubClient initialFeatures={features} initialStats={stats} />
    </div>
  );
}
