import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const userId = (session.user as { id: string }).id;

  const simulation = await prisma.simulation.findFirst({
    where: { id, userId },
    include: { nodes: true, edges: true },
  });

  if (!simulation) {
    return NextResponse.json({ error: 'Simulación no encontrada' }, { status: 404 });
  }

  return NextResponse.json(simulation);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const userId = (session.user as { id: string }).id;
  const body = await req.json();

  const simulation = await prisma.simulation.findFirst({
    where: { id, userId },
  });

  if (!simulation) {
    return NextResponse.json({ error: 'Simulación no encontrada' }, { status: 404 });
  }

  // Update simulation metadata
  if (body.name || body.latitude !== undefined || body.season) {
    await prisma.simulation.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.latitude !== undefined && { latitude: body.latitude }),
        ...(body.season && { season: body.season }),
      },
    });
  }

  // Update nodes and edges if provided
  if (body.nodes !== undefined) {
    await prisma.simulationNode.deleteMany({ where: { simulationId: id } });
    if (body.nodes.length > 0) {
      await prisma.simulationNode.createMany({
        data: body.nodes.map((node: { id: string; type: string; position: { x: number; y: number }; data: Record<string, unknown> }) => ({
          id: node.id,
          simulationId: id,
          type: node.type,
          positionX: node.position.x,
          positionY: node.position.y,
          data: JSON.stringify(node.data),
        })),
      });
    }
  }

  if (body.edges !== undefined) {
    await prisma.simulationEdge.deleteMany({ where: { simulationId: id } });
    if (body.edges.length > 0) {
      await prisma.simulationEdge.createMany({
        data: body.edges.map((edge: { id: string; source: string; target: string }) => ({
          id: edge.id,
          simulationId: id,
          sourceNodeId: edge.source,
          targetNodeId: edge.target,
        })),
      });
    }
  }

  const updated = await prisma.simulation.findFirst({
    where: { id },
    include: { nodes: true, edges: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const userId = (session.user as { id: string }).id;

  const simulation = await prisma.simulation.findFirst({
    where: { id, userId },
  });

  if (!simulation) {
    return NextResponse.json({ error: 'Simulación no encontrada' }, { status: 404 });
  }

  await prisma.simulation.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
