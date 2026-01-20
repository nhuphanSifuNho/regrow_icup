import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { DamageAssessment } from '@/lib/models';
import { z } from 'zod';

const querySchema = z.object({
  province: z.string().optional(),
  days: z.string().optional().default('7').transform(val => parseInt(val)),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse({
      province: searchParams.get('province'),
      days: searchParams.get('days'),
    });

    // Ensure database connection
    await database.connect();

    // Calculate date threshold
    const since = new Date();
    since.setDate(since.getDate() - query.days);

    // Find recent damage assessments
    const filter: any = { timestamp: { $gte: since } };
    if (query.province) {
      filter.province = query.province;
    }

    const assessments = await DamageAssessment.find(filter)
      .sort({ timestamp: -1 })
      .limit(100);

    return NextResponse.json(assessments);
  } catch (error) {
    console.error('Error fetching damage updates:', error);

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