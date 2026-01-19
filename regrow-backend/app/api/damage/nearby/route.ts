import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { DamageAssessment } from '@/lib/models';
import { z } from 'zod';

const querySchema = z.object({
  lng: z.string().transform(val => parseFloat(val)),
  lat: z.string().transform(val => parseFloat(val)),
  maxDistance: z.string().optional().default('10').transform(val => parseFloat(val)),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse({
      lng: searchParams.get('lng'),
      lat: searchParams.get('lat'),
      maxDistance: searchParams.get('maxDistance'),
    });

    // Ensure database connection
    await database.connect();

    // Find nearby damage assessments
    const assessments = await DamageAssessment.findNearby(
      query.lng,
      query.lat,
      query.maxDistance
    );

    return NextResponse.json(assessments);
  } catch (error) {
    console.error('Error fetching nearby damage assessments:', error);

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