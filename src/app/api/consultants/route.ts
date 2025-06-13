import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pusherServer, CHANNELS, EVENTS } from '@/lib/pusher';

export async function GET() {
  try {
    const consultants = await prisma.consultant.findMany({
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });
    return NextResponse.json(consultants);
  } catch (error) {
    console.error('Error in GET /api/consultants:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, role, projectId } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const newConsultant = await prisma.consultant.create({
      data: {
        name,
        role,
        projectId,
      },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    // Emit event to Pusher antes de retornar a resposta
    await pusherServer.trigger(CHANNELS.KANBAN_UPDATES, EVENTS.CONSULTANT_ADDED, newConsultant);

    return NextResponse.json(newConsultant);
  } catch (error) {
    console.error('Error in POST /api/consultants:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { projectId } = body;

    if (!id) {
      return NextResponse.json({ error: 'Consultant id is required' }, { status: 400 });
    }

    const updatedConsultant = await prisma.consultant.update({
      where: { id },
      data: { 
        projectId: projectId === null ? null : projectId 
      },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    // Emit event to Pusher
    await pusherServer.trigger(CHANNELS.KANBAN_UPDATES, EVENTS.CONSULTANT_MOVED, updatedConsultant);

    return NextResponse.json(updatedConsultant);
  } catch (error) {
    console.error('Error in PUT /api/consultants:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Consultant id is required' }, { status: 400 });
    }

    const deletedConsultant = await prisma.consultant.delete({
      where: { id },
    });

    // Emit event to Pusher antes de retornar a resposta
    await pusherServer.trigger(CHANNELS.KANBAN_UPDATES, EVENTS.CONSULTANT_DELETED, { id });

    return NextResponse.json(deletedConsultant);
  } catch (error) {
    console.error('Error in DELETE /api/consultants:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
