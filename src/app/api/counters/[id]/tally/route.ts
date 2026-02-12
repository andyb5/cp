import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getPeriodRange } from '@/lib/periods';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { value } = await request.json().catch(() => ({ value: undefined }));

    const counter = await prisma.counter.findFirst({
      where: { id, userId: user.id },
    });

    if (!counter) {
      return NextResponse.json({ error: 'Counter not found' }, { status: 404 });
    }

    const tallyValue = value !== undefined ? value : counter.increment;

    const event = await prisma.tallyEvent.create({
      data: {
        counterId: id,
        value: tallyValue,
      },
    });

    // Calculate new period total
    const { start, end } = getPeriodRange(counter.periodType, counter.periodStart);
    const periodEvents = await prisma.tallyEvent.findMany({
      where: {
        counterId: id,
        timestamp: { gte: start, lt: end },
      },
    });
    const periodTotal = periodEvents.reduce((sum: number, e: { value: number }) => sum + e.value, 0);

    const allEvents = await prisma.tallyEvent.aggregate({
      where: { counterId: id },
      _sum: { value: true },
    });
    const allTimeTotal = allEvents._sum.value || 0;

    const goalReached = counter.goal ? periodTotal >= counter.goal : false;
    const justReachedGoal = counter.goal
      ? periodTotal >= counter.goal && periodTotal - tallyValue < counter.goal
      : false;

    return NextResponse.json({
      event,
      periodTotal,
      allTimeTotal,
      goalReached,
      justReachedGoal,
    });
  } catch (error) {
    console.error('Tally error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
