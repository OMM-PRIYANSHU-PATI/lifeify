import { NextRequest, NextResponse } from 'next/server';
import { getFeatureByNumber, getFeatureBySlug } from '@/lib/features/registry';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const num = parseInt(id, 10);

    let feature = !isNaN(num) ? getFeatureByNumber(num) : getFeatureBySlug(id);

    if (!feature) {
      return NextResponse.json(
        { ok: false, error: `Feature not found for '${id}'` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      feature,
    });
  } catch (error: any) {
    console.error(`Error fetching feature:`, error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
