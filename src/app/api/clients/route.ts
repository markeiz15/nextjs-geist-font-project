import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { pusherServer, CHANNELS, EVENTS } from '../../../lib/pusher';

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      include: { projects: true },
    });
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error in GET /api/clients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const newClient = await prisma.client.create({
      data: { name },
    });

    // Emit event to Pusher
    await pusherServer.trigger(CHANNELS.KANBAN_UPDATES, EVENTS.CLIENT_ADDED, newClient);

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/clients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Client id is required' }, { status: 400 });
    }

    // Update consultants to be available (projectId null) instead of deleting
    await prisma.consultant.updateMany({
      where: {
        project: {
          clientId: id,
        },
      },
      data: {
        projectId: null,
      },
    });
    await prisma.project.deleteMany({
      where: { clientId: id },
    });
    await prisma.client.delete({
      where: { id },
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE /api/clients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
