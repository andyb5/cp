import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const counter = await prisma.counter.findFirst({
      where: { id, userId: user.id },
    });

    if (!counter) {
      return NextResponse.json({ error: 'Counter not found' }, { status: 404 });
    }

    const data = await request.json();
    const updated = await prisma.counter.update({
      where: { id },
      data: {
        name: data.name ?? counter.name,
        color: data.color ?? counter.color,
        icon: data.icon ?? counter.icon,
        goal: data.goal !== undefined ? data.goal : counter.goal,
        increment: data.increment ?? counter.increment,
        sortOrder: data.sortOrder ?? counter.sortOrder,
        periodType: data.periodType ?? counter.periodType,
        periodStart: data.periodStart ?? counter.periodStart,
      },
    });

    return NextResponse.json({ counter: updated });
  } catch (error) {
    console.error('Update counter error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const counter = await prisma.counter.findFirst({
      where: { id, userId: user.id },
    });

    if (!counter) {
      return NextResponse.json({ error: 'Counter not found' }, { status: 404 });
    }

    await prisma.counter.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete counter error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
