const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export function getPeriodRange(
  periodType: string,
  periodStart: string,
  referenceDate: Date = new Date()
): { start: Date; end: Date } {
  const now = new Date(referenceDate);

  switch (periodType) {
    case 'daily': {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      return { start, end };
    }
    case 'weekly': {
      const startDayIndex = DAYS.indexOf(periodStart.toLowerCase());
      const currentDay = now.getDay();
      let diff = currentDay - startDayIndex;
      if (diff < 0) diff += 7;
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      return { start, end };
    }
    case 'monthly': {
      const startDay = parseInt(periodStart) || 1;
      let start: Date;
      if (now.getDate() >= startDay) {
        start = new Date(now.getFullYear(), now.getMonth(), startDay);
      } else {
        start = new Date(now.getFullYear(), now.getMonth() - 1, startDay);
      }
      const end = new Date(start.getFullYear(), start.getMonth() + 1, startDay);
      return { start, end };
    }
    case 'yearly': {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear() + 1, 0, 1);
      return { start, end };
    }
    case 'alltime':
    default: {
      const start = new Date(2020, 0, 1);
      const end = new Date(2100, 0, 1);
      return { start, end };
    }
  }
}

export function getPreviousPeriodRange(
  periodType: string,
  periodStart: string,
  periodsBack: number = 1,
  referenceDate: Date = new Date()
): { start: Date; end: Date } {
  const current = getPeriodRange(periodType, periodStart, referenceDate);

  switch (periodType) {
    case 'daily': {
      const start = new Date(current.start);
      start.setDate(start.getDate() - periodsBack);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      return { start, end };
    }
    case 'weekly': {
      const start = new Date(current.start);
      start.setDate(start.getDate() - 7 * periodsBack);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      return { start, end };
    }
    case 'monthly': {
      const start = new Date(current.start);
      start.setMonth(start.getMonth() - periodsBack);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      return { start, end };
    }
    case 'yearly': {
      const start = new Date(current.start);
      start.setFullYear(start.getFullYear() - periodsBack);
      const end = new Date(start);
      end.setFullYear(end.getFullYear() + 1);
      return { start, end };
    }
    default:
      return current;
  }
}

export function formatPeriodLabel(
  periodType: string,
  start: Date,
): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  switch (periodType) {
    case 'daily':
      return start.toLocaleDateString('en-US', { ...opts, weekday: 'short' });
    case 'weekly': {
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}`;
    }
    case 'monthly':
      return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    case 'yearly':
      return start.getFullYear().toString();
    default:
      return 'All Time';
  }
}
