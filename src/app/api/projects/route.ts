import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        client: true,
        consultants: true,
      },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error in GET /api/projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, clientId } = await request.json();
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    const newProject = await prisma.project.create({
      data: {
        title,
        clientId,
      },
      include: {
        client: true,
      },
    });
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { title } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Project id is required' }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: { title },
      include: {
        client: true,
        consultants: true,
      },
    });
    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error in PUT /api/projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Project id is required' }, { status: 400 });
    }

    // Move consultants to "Disponível" project before deleting
    const disponivel = await prisma.project.findFirst({
      where: { title: 'Disponível' },
    });
    
    if (disponivel) {
      await prisma.consultant.updateMany({
        where: { projectId: id },
        data: { projectId: disponivel.id },
      });
    }

    await prisma.project.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE /api/projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
