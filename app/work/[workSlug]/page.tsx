import { notFound } from "next/navigation";
import { PageShell } from "@/components/app-shell";
import { Composer } from "@/components/composer";
import { ThingPill } from "@/components/thing-pill";
import { NextMoves } from "@/components/next-moves";
import { createThing } from "@/app/actions";
import { getWorkBySlug, listMessages, listRelations, listThings } from "@/lib/data";
import { deriveNextMoves } from "@/lib/semantic-next-moves";
import { isSupabaseConfigured } from "@/lib/supabase";

export default async function WorkPage({ params }: { params: Promise<{ workSlug: string }> }) {
  const { workSlug } = await params;
  const work = await getWorkBySlug(workSlug);
  if (!work) notFound();
  const [things, messages, relations] = await Promise.all([listThings(work.id), listMessages(work.id), listRelations(work.id)]);
  const nextMoves = deriveNextMoves({ work, things, relations });

  return (
    <PageShell backHref="/" context={work.title} className="work-page">
      <section className="work-heading">
        <div><span className="status"><i /> Active</span><h1>{work.title}</h1><p>{work.summary}</p></div>
        <button className="secondary-button">•••</button>
      </section>

      <NextMoves result={nextMoves} things={things} />

      <div className="work-layout">
        <section className="conversation-panel">
          <div className="panel-heading"><div><span className="live-dot" />Conversation</div><span>오늘</span></div>
          <div className="messages">
            <div className="day-divider"><span>오늘</span></div>
            {messages.map((message, index) => (
              <article className={`message ${message.role}`} key={index}>
                <div className="message-avatar">{message.role === "user" ? "나" : <span className="mini-mark">✦</span>}</div>
                <div><div className="message-meta"><strong>{message.role === "user" ? "나" : "Workgraph"}</strong><time>{new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit" }).format(new Date(message.createdAt))}</time></div><p>{message.content}</p></div>
              </article>
            ))}
          </div>
          <Composer />
        </section>

        <aside className="things-panel">
          <div className="panel-heading"><div>Things <span className="count">{things.length}</span></div></div>
          <p className="panel-description">계속 기억하고 참조할 것들</p>
          <div className="things-list">{things.map((thing) => <ThingPill key={thing.id} thing={thing} workSlug={work.slug} />)}</div>
          {isSupabaseConfigured() ? <details className="inline-create"><summary>＋ Add Thing</summary><form action={createThing} className="mutation-form">
            <input type="hidden" name="workId" value={work.id} /><input type="hidden" name="workSlug" value={work.slug} />
            <label>Name<input name="name" required maxLength={80} placeholder="prototype" /></label>
            <label>Type<input name="type" required maxLength={40} placeholder="concept" /></label>
            <label>Description<textarea name="description" maxLength={500} rows={3} /></label>
            <button className="primary-button" type="submit">Create Thing</button>
          </form></details> : null}
        </aside>
      </div>
    </PageShell>
  );
}
