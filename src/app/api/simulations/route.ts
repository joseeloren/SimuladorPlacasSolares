import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const simulations = await prisma.simulation.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      latitude: true,
      season: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { nodes: true, edges: true } },
    },
  });

  return NextResponse.json(simulations);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { name } = await req.json();

  const simulation = await prisma.simulation.create({
    data: {
      name: name || 'Nueva simulación',
      userId,
    },
  });

  return NextResponse.json(simulation);
}
