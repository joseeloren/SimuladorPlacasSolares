import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ejecutarSimulacion, NodoSimulacion, ConexionSimulacion } from '@/lib/solarEngine';

export async function POST(
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

  const nodos: NodoSimulacion[] = simulation.nodes.map((node: { id: string; type: string; data: string }) => ({
    id: node.id,
    type: node.type,
    data: JSON.parse(node.data),
  }));

  const conexiones: ConexionSimulacion[] = simulation.edges.map((edge: { id: string; sourceNodeId: string; targetNodeId: string }) => ({
    source: edge.sourceNodeId,
    target: edge.targetNodeId,
  }));

  const resultado = ejecutarSimulacion(
    nodos,
    conexiones,
    simulation.season,
    simulation.latitude
  );

  return NextResponse.json(resultado);
}
