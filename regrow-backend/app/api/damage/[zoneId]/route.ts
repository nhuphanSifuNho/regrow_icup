import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { DamageAssessment } from '@/lib/models';
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

    // Find damage assessment by zone_id
    const assessment = await DamageAssessment.findOne({ zone_id: zoneId });

    if (!assessment) {
      return NextResponse.json(
        { error: 'Damage assessment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Error fetching damage assessment:', error);

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