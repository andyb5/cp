export const POLL_INTERVAL_MS = 30_000;
export const CELEBRATION_DURATION_MS = 4_500;
export const TRIAL_DAYS = 14;
export const SUBSCRIPTION_PRICE = '$5.55';
export const SUBSCRIPTION_PERIOD = 'year';
export const APP_VERSION = '1.0.0';

export const COLORS = [
  '#007AFF', '#5856D6', '#AF52DE', '#FF2D55', '#FF3B30',
  '#FF9500', '#FFCC00', '#34C759', '#00C7BE', '#30B0C7',
  '#5AC8FA', '#64D2FF', '#A2845E', '#8E8E93',
] as const;

export const PERIOD_TYPES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'alltime', label: 'All Time' },
] as const;

export const WEEKDAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
] as const;

export const PERIOD_LABELS: Record<string, string> = {
  daily: 'Today',
  weekly: 'This Week',
  monthly: 'This Month',
  yearly: 'This Year',
  alltime: 'All Time',
};

export const CHEESY_MESSAGES = [
  { text: "You're on FIRE!", emoji: "🔥" },
  { text: "GOAL CRUSHED!", emoji: "💪" },
  { text: "Unstoppable!", emoji: "🚀" },
  { text: "Legend status!", emoji: "👑" },
  { text: "You did THAT!", emoji: "✨" },
  { text: "Absolute unit!", emoji: "💯" },
  { text: "Built different!", emoji: "🏆" },
  { text: "Main character energy!", emoji: "🌟" },
  { text: "Nailed it!", emoji: "🎉" },
  { text: "Peak performance!", emoji: "⚡" },
  { text: "Chef's kiss!", emoji: "😘" },
  { text: "Winner winner!", emoji: "🥇" },
] as const;

export const COUNTER_TEMPLATES = [
  { name: 'Push-ups', color: '#FF3B30', goal: 100, increment: 1, periodType: 'daily', icon: 'fitness' },
  { name: 'Glasses of Water', color: '#5AC8FA', goal: 8, increment: 1, periodType: 'daily', icon: 'water' },
  { name: 'Steps', color: '#34C759', goal: 10000, increment: 100, periodType: 'daily', icon: 'walking' },
  { name: 'Pages Read', color: '#AF52DE', goal: 30, increment: 1, periodType: 'daily', icon: 'book' },
  { name: 'Meditation Minutes', color: '#FF9500', goal: 20, increment: 5, periodType: 'daily', icon: 'zen' },
  { name: 'Savings ($)', color: '#34C759', goal: 500, increment: 10, periodType: 'monthly', icon: 'money' },
] as const;
