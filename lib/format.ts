const applicationTimeZone = "Asia/Seoul";

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: applicationTimeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function conversationDateKey(value: string | Date) {
  return dateKeyFormatter.format(new Date(value));
}

export function formatConversationDay(value: string | Date, now = new Date()) {
  const date = new Date(value);
  const key = conversationDateKey(date);
  const today = conversationDateKey(now);
  const yesterday = conversationDateKey(new Date(now.getTime() - 24 * 60 * 60 * 1000));

  if (key === today) return "오늘";
  if (key === yesterday) return "어제";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: applicationTimeZone,
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatMessageTime(value: string | Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: applicationTimeZone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
