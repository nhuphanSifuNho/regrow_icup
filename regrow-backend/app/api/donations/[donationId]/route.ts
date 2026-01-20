import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { Donation } from '@/lib/models';
import { z } from 'zod';

const paramsSchema = z.object({
  donationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid donation ID format'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { donationId: string } }
) {
  try {
    // Validate params
    const { donationId } = paramsSchema.parse(params);

    // Ensure database connection
    await database.connect();

    // Find donation by ID
    const donation = await Donation.findById(donationId);

    if (!donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(donation);
  } catch (error) {
    console.error('Error fetching donation:', error);

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