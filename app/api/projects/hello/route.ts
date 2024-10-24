import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Ensure this path is correct

export async function GET() {
  try {
    // Attempt a simple query to check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({ message: 'Success: Database is connected!' });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ message: 'Failure: Database connection error', error: error.message }, { status: 500 });
  }
}