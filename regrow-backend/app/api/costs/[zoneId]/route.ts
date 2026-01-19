import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { RecoveryCost } from '@/lib/models';
import { z } from 'zod';

const paramsSchema = z.object({
  zoneId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid zone ID format'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { zoneId: string } }
) {
  try {
    // Validate params
    const { zoneId } = paramsSchema.parse(params);

    // Ensure database connection
    await database.connect();

    // Find recovery cost by zone_id
    const cost = await RecoveryCost.findOne({ zone_id: zoneId });

    if (!cost) {
      return NextResponse.json(
        { error: 'Recovery cost not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(cost);
  } catch (error) {
    console.error('Error fetching recovery cost:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST to calculate cost (if not exists, create)
export async function POST(
  request: NextRequest,
  { params }: { params: { zoneId: string } }
) {
  try {
    const { zoneId } = paramsSchema.parse(params);
    const body = await request.json();

    // TODO: Implement cost calculation logic
    // This would integrate with AI engine for NDVI data

    return NextResponse.json({ message: 'Cost calculation not yet implemented' }, { status: 501 });
  } catch (error) {
    console.error('Error calculating recovery cost:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}