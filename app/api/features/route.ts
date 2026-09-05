import { NextRequest, NextResponse } from 'next/server';
import { getAllFeatures, getFeatureStats } from '@/lib/features/registry';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const version = searchParams.get('version'); // V1, V2, V3
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.toLowerCase();
    const status = searchParams.get('status');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

    let features = getAllFeatures();

    if (version) {
      features = features.filter((f) => f.version === version);
    }
    if (category) {
      features = features.filter((f) => f.category === category);
    }
    if (status) {
      features = features.filter((f) => f.mapping.status === status);
    }
    if (search) {
      features = features.filter(
        (f) =>
          f.name.toLowerCase().includes(search) ||
          f.slug.toLowerCase().includes(search) ||
          f.category.toLowerCase().includes(search) ||
          f.number.toString() === search
      );
    }

    const totalMatching = features.length;
    const startIndex = (page - 1) * limit;
    const paginatedFeatures = features.slice(startIndex, startIndex + limit);

    const stats = getFeatureStats();

    return NextResponse.json({
      ok: true,
      stats,
      pagination: {
        page,
        limit,
        totalMatching,
        totalPages: Math.ceil(totalMatching / limit),
      },
      features: paginatedFeatures,
    });
  } catch (error: any) {
    console.error('Error fetching features:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to fetch features' },
      { status: 500 }
    );
  }
}
