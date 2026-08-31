import { notFound } from "next/navigation";
import { PageShell } from "@/components/app-shell";
import { Composer } from "@/components/composer";
import { ThingPill } from "@/components/thing-pill";
import { messages, things, work } from "@/lib/mock-data";

export default async function WorkPage({ params }: { params: Promise<{ workSlug: string }> }) {
  const { workSlug } = await params;
  if (workSlug !== work.slug) notFound();

  return (
    <PageShell backHref="/" context={work.title} className="work-page">
      <section className="work-heading">
        <div><span className="status"><i /> Active</span><h1>{work.title}</h1><p>{work.summary}</p></div>
        <button className="secondary-button">•••</button>
      </section>

      <div className="work-layout">
        <section className="conversation-panel">
          <div className="panel-heading"><div><span className="live-dot" />Conversation</div><span>오늘</span></div>
          <div className="messages">
            <div className="day-divider"><span>오늘</span></div>
            {messages.map((message, index) => (
              <article className={`message ${message.role}`} key={index}>
                <div className="message-avatar">{message.role === "user" ? "나" : <span className="mini-mark">✦</span>}</div>
                <div><div className="message-meta"><strong>{message.role === "user" ? "나" : "Workgraph"}</strong><time>{message.time}</time></div><p>{message.content}</p></div>
              </article>
            ))}
          </div>
          <Composer />
        </section>

        <aside className="things-panel">
          <div className="panel-heading"><div>Things <span className="count">{things.length}</span></div><button aria-label="Thing 추가">＋</button></div>
          <p className="panel-description">계속 기억하고 참조할 것들</p>
          <div className="things-list">{things.map((thing) => <ThingPill key={thing.slug} thing={thing} />)}</div>
        </aside>
      </div>
    </PageShell>
  );
}
