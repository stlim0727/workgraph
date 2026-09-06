const TIME_ZONE = "Asia/Seoul";

const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: TIME_ZONE,
  month: "long",
  day: "numeric",
});

const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function dayKey(date: Date): string {
  return dayKeyFormatter.format(date);
}

function daysBetween(fromKey: string, toKey: string): number {
  return Math.round((Date.parse(toKey) - Date.parse(fromKey)) / 86_400_000);
}

export function formatTime(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

/** "오늘" / "어제" / "9월 3일" — always relative to Asia/Seoul's calendar day. */
export function formatDayLabel(iso: string, now: Date = new Date()): string {
  const diff = daysBetween(dayKey(new Date(iso)), dayKey(now));
  if (diff === 0) return "오늘";
  if (diff === 1) return "어제";
  return dateFormatter.format(new Date(iso));
}

export function formatRelativeKorean(iso: string, now: Date = new Date()): string {
  return `${formatDayLabel(iso, now)}, ${formatTime(iso)}`;
}

const eventLabels: Record<string, string> = {
  thing_created: "이 Thing이 만들어졌어요",
  thing_referenced: "Workgraph가 대화에서 이 Thing을 참조했어요",
};

export function formatEventLabel(type: string): string {
  return eventLabels[type] ?? type;
}
