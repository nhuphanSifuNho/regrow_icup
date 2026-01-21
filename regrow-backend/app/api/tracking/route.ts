import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { RecoveryTracking } from '@/lib/models';
import { z } from 'zod';

const querySchema = z.object({
  zoneId: z.string().optional(),
  province: z.string().optional(),
  limit: z.string().optional().default('50').transform(val => parseInt(val)),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse({
      zoneId: searchParams.get('zoneId'),
      province: searchParams.get('province'),
      limit: searchParams.get('limit'),
    });

    // Ensure database connection
    await database.connect();

    // Build filter
    const filter: any = {};
    if (query.zoneId) {
      filter.zone_id = query.zoneId;
    }
    if (query.province) {
      filter.province = query.province;
    }

    // Find recovery tracking records
    const tracking = await RecoveryTracking.find(filter)
      .sort({ timestamp: -1 })
      .limit(query.limit);

    return NextResponse.json(tracking);
  } catch (error) {
    console.error('Error fetching recovery tracking:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST to create new tracking record (after NDVI update)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Implement tracking creation logic
    // This would be called after AI engine processes new imagery

    return NextResponse.json({ message: 'Tracking creation not yet implemented' }, { status: 501 });
  } catch (error) {
    console.error('Error creating recovery tracking:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}