const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
});

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isYesterday(a: Date, b: Date) {
  const yesterday = new Date(b);
  yesterday.setDate(b.getDate() - 1);
  return isSameDay(a, yesterday);
}

export function formatTime(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

export function formatRelativeKorean(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (isSameDay(date, now)) return `오늘, ${formatTime(iso)}`;
  if (isYesterday(date, now)) return `어제, ${formatTime(iso)}`;
  return `${dateFormatter.format(date)}, ${formatTime(iso)}`;
}

const eventLabels: Record<string, string> = {
  thing_created: "이 Thing이 만들어졌어요",
  thing_referenced: "Workgraph가 대화에서 이 Thing을 참조했어요",
};

export function formatEventLabel(type: string): string {
  return eventLabels[type] ?? type;
}
