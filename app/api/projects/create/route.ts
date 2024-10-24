import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { name, description } = await req.json();

  try {
    const newProject = await prisma.project.create({
      data: {
        name,
        description,
      },
    });
    return NextResponse.json(newProject, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}