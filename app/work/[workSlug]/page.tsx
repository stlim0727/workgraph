import { notFound } from "next/navigation";
import { PageShell } from "@/components/app-shell";
import { Composer } from "@/components/composer";
import { ThingPill } from "@/components/thing-pill";
import { getMessagesForWork, getThingsForWork, getWorkBySlug, type Work } from "@/lib/data";
import { formatDayKey, formatDayLabel, formatTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const statusLabel: Record<Work["status"], string> = {
  active: "Active",
  paused: "Paused",
  done: "Done",
};

export default async function WorkPage({ params }: { params: Promise<{ workSlug: string }> }) {
  const { workSlug } = await params;
  const work = await getWorkBySlug(workSlug);
  if (!work) notFound();

  const [things, messages] = await Promise.all([
    getThingsForWork(work.id),
    getMessagesForWork(work.id),
  ]);

  const dayGroups: { key: string; label: string; messages: typeof messages }[] = [];
  for (const message of messages) {
    const key = formatDayKey(message.createdAt);
    const currentGroup = dayGroups[dayGroups.length - 1];
    if (currentGroup && currentGroup.key === key) {
      currentGroup.messages.push(message);
    } else {
      dayGroups.push({ key, label: formatDayLabel(message.createdAt), messages: [message] });
    }
  }

  return (
    <PageShell backHref="/" context={work.title} className="work-page">
      <section className="work-heading">
        <div>
          <span className={`status status-${work.status}`}><i /> {statusLabel[work.status]}</span>
          <h1>{work.title}</h1><p>{work.summary}</p>
        </div>
        <button className="secondary-button">•••</button>
      </section>

      <div className="work-layout">
        <section className="conversation-panel">
          <div className="panel-heading"><div><span className="live-dot" />Conversation</div><span>{dayGroups.at(-1)?.label ?? "오늘"}</span></div>
          <div className="messages">
            {dayGroups.map((group) => (
              <div key={group.key}>
                <div className="day-divider"><span>{group.label}</span></div>
                {group.messages.map((message) => (
                  <article className={`message ${message.role}`} key={message.id}>
                    <div className="message-avatar">{message.role === "user" ? "나" : <span className="mini-mark">✦</span>}</div>
                    <div><div className="message-meta"><strong>{message.role === "user" ? "나" : "Workgraph"}</strong><time>{formatTime(message.createdAt)}</time></div><p>{message.content}</p></div>
                  </article>
                ))}
              </div>
            ))}
          </div>
          <Composer />
        </section>

        <aside className="things-panel">
          <div className="panel-heading"><div>Things <span className="count">{things.length}</span></div><button aria-label="Thing 추가">＋</button></div>
          <p className="panel-description">계속 기억하고 참조할 것들</p>
          <div className="things-list">{things.map((thing) => <ThingPill key={thing.slug} thing={thing} workSlug={work.slug} />)}</div>
        </aside>
      </div>
    </PageShell>
  );
}
