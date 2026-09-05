import React from 'react';
import { getAllFeatures, getFeatureStats } from '@/lib/features/registry';
import { FeaturesHubClient } from '@/app/app/features/features-hub-client';
import Link from 'next/link';

export const metadata = {
  title: 'LIFEIFY Features Directory | All 414 Specifications',
  description:
    'Complete master directory and clinical architecture matrix for all 414 features across V1, V2, and V3.',
};

export default function PublicFeaturesPage() {
  const features = getAllFeatures();
  const stats = getFeatureStats();

  return (
    <div className="min-h-screen bg-background text-ink p-4 sm:p-6 lg:p-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-line">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <span className="font-bold text-lg tracking-tight text-ink">LIFEIFY</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary-dark font-semibold">
              OS Matrix
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/app/dashboard" className="lif-btn-primary px-3.5 py-1.5 text-xs font-semibold">
              Open Dashboard 🏠
            </Link>
          </div>
        </div>

        <FeaturesHubClient initialFeatures={features} initialStats={stats} />
      </div>
    </div>
  );
}
