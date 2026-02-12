import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getPeriodRange, getPreviousPeriodRange, formatPeriodLabel } from '@/lib/periods';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const counterId = searchParams.get('counterId');
    const periods = parseInt(searchParams.get('periods') || '7');

    if (!counterId) {
      return NextResponse.json({ error: 'counterId is required' }, { status: 400 });
    }

    const counter = await prisma.counter.findFirst({
      where: { id: counterId, userId: user.id },
    });

    if (!counter) {
      return NextResponse.json({ error: 'Counter not found' }, { status: 404 });
    }

    // Get current period
    const currentPeriod = getPeriodRange(counter.periodType, counter.periodStart);

    // Build period ranges for the report
    const reportPeriods = [];

    // Current period first
    const currentEvents = await prisma.tallyEvent.findMany({
      where: {
        counterId,
        timestamp: { gte: currentPeriod.start, lt: currentPeriod.end },
      },
    });
    reportPeriods.push({
      label: formatPeriodLabel(counter.periodType, currentPeriod.start),
      start: currentPeriod.start,
      end: currentPeriod.end,
      total: currentEvents.reduce((sum, e) => sum + e.value, 0),
      isCurrent: true,
    });

    // Previous periods
    for (let i = 1; i < periods; i++) {
      const prev = getPreviousPeriodRange(counter.periodType, counter.periodStart, i);
      const events = await prisma.tallyEvent.findMany({
        where: {
          counterId,
          timestamp: { gte: prev.start, lt: prev.end },
        },
      });
      reportPeriods.push({
        label: formatPeriodLabel(counter.periodType, prev.start),
        start: prev.start,
        end: prev.end,
        total: events.reduce((sum, e) => sum + e.value, 0),
        isCurrent: false,
      });
    }

    // All-time total
    const allTime = await prisma.tallyEvent.aggregate({
      where: { counterId },
      _sum: { value: true },
    });

    return NextResponse.json({
      counter: {
        id: counter.id,
        name: counter.name,
        color: counter.color,
        goal: counter.goal,
        periodType: counter.periodType,
        periodStart: counter.periodStart,
      },
      periods: reportPeriods,
      allTimeTotal: allTime._sum.value || 0,
    });
  } catch (error) {
    console.error('Reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
