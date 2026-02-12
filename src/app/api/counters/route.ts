import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getPeriodRange } from '@/lib/periods';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const counters = await prisma.counter.findMany({
      where: { userId: user.id },
      orderBy: { sortOrder: 'asc' },
      include: {
        tallyEvents: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    const countersWithTotals = counters.map((counter) => {
      const { start, end } = getPeriodRange(counter.periodType, counter.periodStart);
      const periodEvents = counter.tallyEvents.filter(
        (e) => e.timestamp >= start && e.timestamp < end
      );
      const periodTotal = periodEvents.reduce((sum, e) => sum + e.value, 0);
      const allTimeTotal = counter.tallyEvents.reduce((sum, e) => sum + e.value, 0);

      return {
        id: counter.id,
        name: counter.name,
        color: counter.color,
        icon: counter.icon,
        goal: counter.goal,
        increment: counter.increment,
        sortOrder: counter.sortOrder,
        periodType: counter.periodType,
        periodStart: counter.periodStart,
        periodTotal,
        allTimeTotal,
        createdAt: counter.createdAt,
      };
    });

    return NextResponse.json({ counters: countersWithTotals });
  } catch (error) {
    console.error('Get counters error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, color, icon, goal, increment, periodType, periodStart } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const count = await prisma.counter.count({ where: { userId: user.id } });

    const counter = await prisma.counter.create({
      data: {
        userId: user.id,
        name,
        color: color || '#007AFF',
        icon: icon || 'circle',
        goal: goal || null,
        increment: increment || 1,
        sortOrder: count,
        periodType: periodType || 'daily',
        periodStart: periodStart || 'monday',
      },
    });

    return NextResponse.json({ counter }, { status: 201 });
  } catch (error) {
    console.error('Create counter error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
