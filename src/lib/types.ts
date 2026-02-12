export interface CounterData {
  id: string;
  name: string;
  color: string;
  icon: string;
  goal: number | null;
  increment: number;
  sortOrder: number;
  periodType: string;
  periodStart: string;
  periodTotal: number;
  allTimeTotal: number;
}
